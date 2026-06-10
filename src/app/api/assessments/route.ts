import { ASSESSMENT_TOPICS } from "@/lib/constants";
import { processSpeechAssessment } from "@/lib/ai/process-assessment";
import { ensureUserProgress, getAuthenticatedUser } from "@/lib/session-user";
import { recordPracticeActivity } from "@/lib/user-progress";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function isValidTopic(topic: string) {
  if (ASSESSMENT_TOPICS.includes(topic as (typeof ASSESSMENT_TOPICS)[number])) return true;
  if (topic.startsWith("Interview:")) return true;
  if (topic.startsWith("Discussion:")) return true;
  return false;
}

async function parseAssessmentRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const audioEntry = formData.get("audio");
    return {
      topic: String(formData.get("topic") ?? "").trim(),
      durationSeconds: Number(formData.get("durationSeconds") ?? 0),
      clientTranscript: String(formData.get("transcript") ?? "").trim(),
      audio:
        audioEntry instanceof File && audioEntry.size > 0 ? audioEntry
        : audioEntry instanceof Blob && audioEntry.size > 0 ? audioEntry
        : null,
    };
  }
  const body = await request.json();
  return {
    topic: String(body.topic ?? "").trim(),
    durationSeconds: Number(body.durationSeconds ?? 0),
    clientTranscript: String(body.transcript ?? "").trim(),
    audio: null as File | Blob | null,
  };
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX 13: Rate limit — max 5 assessments per minute per user
  const { allowed, retryAfterSeconds } = rateLimit(`assessment:${user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const { topic, durationSeconds, clientTranscript, audio } = await parseAssessmentRequest(request);

  if (!isValidTopic(topic)) return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
  if (durationSeconds < 15 || durationSeconds > 180) {
    return NextResponse.json({ error: "Recording must be between 15 seconds and 3 minutes." }, { status: 400 });
  }

  try {
    // FIX 11: Wrap entire AI call in a 50s timeout — prevents infinite spinner
    const analysisPromise = processSpeechAssessment({ topic, durationSeconds, clientTranscript, audio });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Analysis is taking too long. Please try again.")), 50_000),
    );
    const { transcript, analysis, usedWhisper, usedGPT } = await Promise.race([analysisPromise, timeoutPromise]);

    const progress = await ensureUserProgress(user.id);
    const assessmentCount = await prisma.assessment.count({ where: { userId: user.id } });
    const nextWeek = Math.min(assessmentCount + 1, 6);

    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id, topic, transcript, durationSeconds,
        scores: JSON.stringify(analysis),
        rootCause: analysis.rootCause.key,
      },
    });

    await prisma.userProgress.update({
      where: { userId: user.id },
      data: { currentWeek: Math.max(progress.currentWeek, nextWeek), lastAssessmentAt: new Date() },
    });

    await recordPracticeActivity(user.id);

    return NextResponse.json({ id: assessment.id, analysis, meta: { usedWhisper, usedGPT } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    const isTimeout = message.includes("too long");
    return NextResponse.json({ error: message }, { status: isTimeout ? 504 : 400 });
  }
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessments = await prisma.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, topic: true, transcript: true, durationSeconds: true, rootCause: true, scores: true, createdAt: true },
  });

  return NextResponse.json({ assessments });
}

// FIX 14: Delete assessment endpoint
export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Assessment ID required." }, { status: 400 });

  // Ensure the assessment belongs to this user before deleting
  const assessment = await prisma.assessment.findFirst({ where: { id, userId: user.id } });
  if (!assessment) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.assessment.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
