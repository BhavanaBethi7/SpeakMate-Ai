import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardInteractive from "@/components/dashboard/DashboardInteractive";
import { pickDailyChallenge, todayKey } from "@/lib/daily-challenges";
import { authOptions } from "@/lib/auth";
import { buildProgressHistory, getConfidenceGrowth, getFluencyGrowth } from "@/lib/progress-stats";
import { parseAssessmentScores } from "@/lib/speech-analysis";
import { ensureUserProgress } from "@/lib/session-user";
import { getUserGamificationStats } from "@/lib/user-progress";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// FIX 9: truncate roll-number / very long Google account names
function formatDisplayName(raw: string | null | undefined, email: string | null | undefined): string {
  const name = raw?.trim() ?? email?.split("@")[0] ?? "there";
  const parts = name.split(/\s+/);
  const first = parts[0];
  // Looks like a roll number (e.g. 23R11A6256) — just use it alone
  if (/^[A-Z0-9]{6,}$/.test(first)) return first;
  // More than 2 words — use first + last only
  if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return name;
}

export default async function DashboardPage() {
  // FIX 3: use proper typed session, not `as any` cast at usage site
  const session = await getServerSession(authOptions);
  const typedSession = session as { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;

  if (!typedSession?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: typedSession.user.email },
    include: {
      assessments: { orderBy: { createdAt: "desc" } },
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
      data: { userId: user.id, date, prompt: picked.prompt, challengeType: picked.type },
    });
  }

  const assessments = user.assessments.map((a) => ({
    id: a.id,
    topic: a.topic,
    transcript: a.transcript,
    durationSeconds: a.durationSeconds,
    rootCause: a.rootCause,
    createdAt: a.createdAt.toISOString(),
  }));

  const latestScores = user.assessments[0] ? parseAssessmentScores(user.assessments[0].scores) : null;
  const gamification = await getUserGamificationStats(user.id);
  const progressHistory = buildProgressHistory(
    user.assessments.map((a) => ({
      createdAt: a.createdAt.toISOString(),
      topic: a.topic,
      scores: parseAssessmentScores(a.scores),
    })),
  );

  const hasAssessments = assessments.length > 0;
  const displayName = formatDisplayName(typedSession.user.name, typedSession.user.email);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-8 sm:py-6 lg:px-12">
        <DashboardHeader user={typedSession.user} />

        <section className="space-y-4 pt-2 sm:space-y-6 sm:pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {hasAssessments ? "Keep your momentum going" : "Ready for your first baseline"}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {hasAssessments
                ? "Review your progress, continue your coaching plan, and take on today's speaking challenge."
                : "Start with a 1–2 minute baseline recording. SpeakMate will analyze your delivery and build a personalized growth plan."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="#start-assessment" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:py-3">
              {hasAssessments ? "New assessment" : "Start baseline assessment"}
            </Link>
            <Link href="#daily-coach" className="rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:px-6 sm:py-3">
              Today&apos;s challenge
            </Link>
            <Link href="#emergency-booster" className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 sm:px-6 sm:py-3">
              Emergency booster
            </Link>
            <Link href="/dashboard/interview" className="rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:px-6 sm:py-3">
              Mock interview
            </Link>
          </div>
        </section>

        <DashboardInteractive
          assessments={assessments}
          dailyChallenge={{ id: dailyChallenge.id, prompt: dailyChallenge.prompt, challengeType: dailyChallenge.challengeType, completed: dailyChallenge.completed, date: dailyChallenge.date }}
          currentWeek={progress.currentWeek}
          challengesCompleted={progress.challengesCompleted}
          latestScore={latestScores?.overallScore ?? null}
          progressHistory={progressHistory}
          confidenceGrowth={getConfidenceGrowth(progressHistory)}
          fluencyGrowth={getFluencyGrowth(progressHistory)}
          gamification={{ levelLabel: gamification.level.label, levelPoints: gamification.levelPoints, speakingStreak: gamification.speakingStreak, unlockedAchievementIds: gamification.achievements.map((i) => i.id) }}
        />
      </div>
    </main>
  );
}
