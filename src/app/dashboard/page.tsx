import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardInteractive from "@/components/dashboard/DashboardInteractive";
import { pickDailyChallenge, todayKey } from "@/lib/daily-challenges";
import { authOptions } from "@/lib/auth";
import {
  buildProgressHistory,
  getConfidenceGrowth,
  getFluencyGrowth,
} from "@/lib/progress-stats";
import { parseAssessmentScores } from "@/lib/speech-analysis";
import { ensureUserProgress } from "@/lib/session-user";
import { getUserGamificationStats } from "@/lib/user-progress";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { name?: string | null; email?: string | null; image?: string | null };
  } | null;
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
      },
      progress: true,
    },
  });

  if (!user) redirect("/signin");

  const progress = await ensureUserProgress(user.id);
  const date = todayKey();

  let dailyChallenge = await prisma.dailyChallenge.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  if (!dailyChallenge) {
    const picked = pickDailyChallenge(`${user.id}-${date}`, progress.currentWeek);
    dailyChallenge = await prisma.dailyChallenge.create({
      data: {
        userId: user.id,
        date,
        prompt: picked.prompt,
        challengeType: picked.type,
      },
    });
  }

  const assessments = user.assessments.map((assessment) => ({
    id: assessment.id,
    topic: assessment.topic,
    transcript: assessment.transcript,
    durationSeconds: assessment.durationSeconds,
    rootCause: assessment.rootCause,
    createdAt: assessment.createdAt.toISOString(),
  }));

  const latestScores = user.assessments[0]
    ? parseAssessmentScores(user.assessments[0].scores)
    : null;
  const gamification = await getUserGamificationStats(user.id);
  const progressHistory = buildProgressHistory(
    user.assessments.map((assessment) => ({
      createdAt: assessment.createdAt.toISOString(),
      topic: assessment.topic,
      scores: parseAssessmentScores(assessment.scores),
    })),
  );
  const hasAssessments = assessments.length > 0;
  const displayName = session.user.name ?? session.user.email.split("@")[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 sm:px-10 lg:px-12">
        <DashboardHeader user={session.user} />

        <section className="space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {hasAssessments ? "Keep your momentum going" : "Ready for your first baseline"}
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {hasAssessments
                ? "Review your progress, continue your coaching plan, and take on today's speaking challenge."
                : "Start with a 1–2 minute baseline recording. SpeakMate will analyze your delivery and build a personalized growth plan."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#start-assessment"
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {hasAssessments ? "New assessment" : "Start baseline assessment"}
            </Link>
            <Link
              href="#daily-coach"
              className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Today&apos;s challenge
            </Link>
            <Link
              href="#emergency-booster"
              className="rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Emergency booster
            </Link>
            <Link
              href="/dashboard/interview"
              className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Mock interview
            </Link>
          </div>
        </section>

        <DashboardInteractive
          assessments={assessments}
          dailyChallenge={{
            id: dailyChallenge.id,
            prompt: dailyChallenge.prompt,
            challengeType: dailyChallenge.challengeType,
            completed: dailyChallenge.completed,
            date: dailyChallenge.date,
          }}
          currentWeek={progress.currentWeek}
          challengesCompleted={progress.challengesCompleted}
          latestScore={latestScores?.overallScore ?? null}
          progressHistory={progressHistory}
          confidenceGrowth={getConfidenceGrowth(progressHistory)}
          fluencyGrowth={getFluencyGrowth(progressHistory)}
          gamification={{
            levelLabel: gamification.level.label,
            levelPoints: gamification.levelPoints,
            speakingStreak: gamification.speakingStreak,
            unlockedAchievementIds: gamification.achievements.map((item) => item.id),
          }}
        />
      </div>
    </main>
  );
}
