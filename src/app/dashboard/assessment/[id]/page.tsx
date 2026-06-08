import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ROOT_CAUSES } from "@/lib/constants";
import { authOptions } from "@/lib/auth";
import { parseAssessmentScores } from "@/lib/speech-analysis";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}/100</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default async function AssessmentResultsPage({ params }: RouteContext) {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { name?: string | null; email?: string | null; image?: string | null };
  } | null;
  if (!session?.user?.email) redirect("/signin");

  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      user: { email: session.user.email },
    },
  });

  if (!assessment) notFound();

  const scores = parseAssessmentScores(assessment.scores);
  if (!scores) notFound();

  const rootCause =
    assessment.rootCause && assessment.rootCause in ROOT_CAUSES
      ? ROOT_CAUSES[assessment.rootCause as keyof typeof ROOT_CAUSES]
      : null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 sm:px-10 lg:px-12">
        <DashboardHeader user={session.user} />

        <section className="space-y-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            ← Back to dashboard
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Assessment results
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-950">
              {assessment.topic ?? "Speech assessment"}
            </h1>
            <p className="mt-2 text-slate-600">
              {assessment.durationSeconds}s recording · Overall score {scores.overallScore}/100
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            ["Confidence", scores.confidence.score],
            ["Nervousness", scores.confidence.nervousness],
            ["Improvement potential", scores.confidence.improvementPotential],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="font-display text-2xl font-semibold text-slate-950">
                Speech analysis
              </h2>
              <div className="mt-6 space-y-5">
                <ScoreBar label="Clarity" value={scores.clarity.score} />
                <ScoreBar label="Fluency" value={scores.fluency.score} />
                <ScoreBar label="Filler word control" value={scores.fillerWords.score} />
                <ScoreBar label="Speaking speed" value={scores.speakingSpeed.score} />
                <ScoreBar label="Vocabulary richness" value={scores.vocabulary.score} />
                <ScoreBar label="Communication structure" value={scores.structure.score} />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Speaking speed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {scores.speakingSpeed.wordsPerMinute} WPM
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {scores.speakingSpeed.optimal ? "Within optimal range" : "Adjust pacing slightly"}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Filler words detected</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {scores.fillerWords.count}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {Object.keys(scores.fillerWords.words).join(", ") || "None detected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="font-display text-2xl font-semibold text-slate-950">Transcript</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{assessment.transcript}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-950/10 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
                AI diagnosis
              </p>
              {scores.aiPowered ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                  Powered by OpenAI GPT
                </p>
              ) : null}
              <p className="mt-4 text-sm leading-7 text-slate-200">{scores.diagnosis}</p>
              {scores.motivationalFeedback ? (
                <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-7 text-emerald-100">
                  {scores.motivationalFeedback}
                </p>
              ) : null}
            </div>

            {scores.coachingTips && scores.coachingTips.length > 0 ? (
              <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  AI coaching tips
                </p>
                <ul className="mt-4 space-y-3">
                  {scores.coachingTips.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Root cause
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">
                {rootCause?.title ?? scores.rootCause.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {rootCause?.copy ?? scores.rootCause.description}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Emotion analysis
              </p>
              <div className="mt-5 space-y-4">
                {Object.entries(scores.emotions).map(([emotion, value]) => (
                  <ScoreBar
                    key={emotion}
                    label={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    value={value}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard#start-assessment"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Take another assessment
              </Link>
              <Link
                href="/dashboard#daily-coach"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Start daily challenge
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
