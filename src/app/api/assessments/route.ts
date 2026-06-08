import { ASSESSMENT_TOPICS } from "@/lib/constants";
import { processSpeechAssessment } from "@/lib/ai/process-assessment";
import { ensureUserProgress, getAuthenticatedUser } from "@/lib/session-user";
import { recordPracticeActivity } from "@/lib/user-progress";
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
        audioEntry instanceof File && audioEntry.size > 0
          ? audioEntry
          : audioEntry instanceof Blob && audioEntry.size > 0
            ? audioEntry
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, durationSeconds, clientTranscript, audio } = await parseAssessmentRequest(request);

  if (!isValidTopic(topic)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }

  if (durationSeconds < 15 || durationSeconds > 180) {
    return NextResponse.json(
      { error: "Recording should be between 15 seconds and 3 minutes." },
      { status: 400 },
    );
  }

  try {
    const { transcript, analysis, usedWhisper, usedGPT } = await processSpeechAssessment({
      topic,
      durationSeconds,
      clientTranscript,
      audio,
    });

    const progress = await ensureUserProgress(user.id);
    const assessmentCount = await prisma.assessment.count({ where: { userId: user.id } });
    const nextWeek = Math.min(assessmentCount + 1, 6);

    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        topic,
        transcript,
        durationSeconds,
        scores: JSON.stringify(analysis),
        rootCause: analysis.rootCause.key,
      },
    });

    await prisma.userProgress.update({
      where: { userId: user.id },
      data: {
        currentWeek: Math.max(progress.currentWeek, nextWeek),
        lastAssessmentAt: new Date(),
      },
    });

    await recordPracticeActivity(user.id);

    return NextResponse.json({
      id: assessment.id,
      analysis,
      meta: { usedWhisper, usedGPT },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed." },
      { status: 400 },
    );
  }
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assessments = await prisma.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      topic: true,
      transcript: true,
      durationSeconds: true,
      rootCause: true,
      scores: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ assessments });
}
