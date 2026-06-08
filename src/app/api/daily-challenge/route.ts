import { isOpenAIConfigured } from "@/lib/ai/config";
import { generateDailyChallengeWithGPT } from "@/lib/ai/speech-coach";
import { ROADMAP } from "@/lib/constants";
import { pickDailyChallenge, todayKey } from "@/lib/daily-challenges";
import { parseAssessmentScores } from "@/lib/speech-analysis";
import { ensureUserProgress, getAuthenticatedUser } from "@/lib/session-user";
import { recordPracticeActivity } from "@/lib/user-progress";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

async function buildChallenge(userId: string, currentWeek: number, seed: string) {
  const latestAssessment = await prisma.assessment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const latestScores = parseAssessmentScores(latestAssessment?.scores ?? null);
  const weekFocus = ROADMAP[Math.min(currentWeek, 6) - 1]?.focus ?? ROADMAP[0].focus;

  if (isOpenAIConfigured()) {
    try {
      return await generateDailyChallengeWithGPT({
        currentWeek,
        weekFocus,
        latestRootCause: latestAssessment?.rootCause,
        recentScore: latestScores?.overallScore ?? null,
      });
    } catch (error) {
      console.error("GPT daily challenge failed, using fallback pool:", error);
    }
  }

  const fallback = pickDailyChallenge(seed, currentWeek);
  return { prompt: fallback.prompt, challengeType: fallback.type };
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await ensureUserProgress(user.id);
  const date = todayKey();

  let challenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  if (!challenge) {
    const picked = await buildChallenge(user.id, progress.currentWeek, `${user.id}-${date}`);
    challenge = await prisma.dailyChallenge.create({
      data: {
        userId: user.id,
        date,
        prompt: picked.prompt,
        challengeType: picked.challengeType,
      },
    });
  }

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      prompt: challenge.prompt,
      challengeType: challenge.challengeType,
      completed: challenge.completed,
      date: challenge.date,
    },
    aiPowered: isOpenAIConfigured(),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as "generate" | "complete";

  const progress = await ensureUserProgress(user.id);
  const date = todayKey();

  if (action === "complete") {
    const challenge = await prisma.dailyChallenge.update({
      where: { userId_date: { userId: user.id, date } },
      data: { completed: true },
    });

    await prisma.userProgress.update({
      where: { userId: user.id },
      data: { challengesCompleted: { increment: 1 } },
    });

    await recordPracticeActivity(user.id);

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        prompt: challenge.prompt,
        challengeType: challenge.challengeType,
        completed: challenge.completed,
        date: challenge.date,
      },
    });
  }

  const picked = await buildChallenge(
    user.id,
    progress.currentWeek,
    `${user.id}-${date}-${Date.now()}`,
  );

  const challenge = await prisma.dailyChallenge.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      prompt: picked.prompt,
      challengeType: picked.challengeType,
      completed: false,
    },
    create: {
      userId: user.id,
      date,
      prompt: picked.prompt,
      challengeType: picked.challengeType,
    },
  });

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      prompt: challenge.prompt,
      challengeType: challenge.challengeType,
      completed: challenge.completed,
      date: challenge.date,
    },
    aiPowered: isOpenAIConfigured(),
  });
}
