"use client";

import AssessmentRecorder from "@/components/dashboard/AssessmentRecorder";
import DailyCoachPanel from "@/components/dashboard/DailyCoachPanel";
import EmergencyBooster from "@/components/dashboard/EmergencyBooster";
import GamificationPanel from "@/components/dashboard/GamificationPanel";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import { ROADMAP } from "@/lib/constants";
import type { DailyChallengeRecord } from "@/lib/types";
import Link from "next/link";

type DashboardInteractiveProps = {
  assessments: Array<{
    id: string;
    topic: string | null;
    transcript: string | null;
    durationSeconds: number | null;
    rootCause: string | null;
    createdAt: string;
  }>;
  dailyChallenge: DailyChallengeRecord;
  currentWeek: number;
  challengesCompleted: number;
  latestScore: number | null;
  progressHistory: Array<{
    date: string;
    confidence: number;
    fluency: number;
    overall: number;
  }>;
  confidenceGrowth: number | null;
  fluencyGrowth: number | null;
  gamification: {
    levelLabel: string;
    levelPoints: number;
    speakingStreak: number;
    unlockedAchievementIds: string[];
  };
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function DashboardInteractive({
  assessments,
  dailyChallenge,
  currentWeek,
  challengesCompleted,
  latestScore,
  progressHistory,
  confidenceGrowth,
  fluencyGrowth,
  gamification,
}: DashboardInteractiveProps) {
  const hasAssessments = assessments.length > 0;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Assessments",
            value: hasAssessments ? `${assessments.length} completed` : "None yet",
          },
          {
            label: "Current week",
            value: `Week ${currentWeek} · ${ROADMAP[currentWeek - 1].focus}`,
          },
          {
            label: "Speaking streak",
            value: `${gamification.speakingStreak} day${gamification.speakingStreak === 1 ? "" : "s"}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div id="assessments" className="space-y-6">
          <div
            id="start-assessment"
            className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]"
          >
            <div className="absolute -left-8 top-10 h-20 w-20 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -right-6 bottom-16 h-28 w-28 rounded-full bg-amber-400/25 blur-3xl" />

            <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Baseline assessment
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  Record a 1–2 minute speech
                </h2>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus</p>
                <p className="mt-1 text-sm font-semibold text-white">Confidence + clarity</p>
              </div>
            </div>

            <AssessmentRecorder />
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Your assessments
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">
                  {hasAssessments ? "Recent sessions" : "No assessments yet"}
                </h2>
              </div>
              {hasAssessments ? (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {assessments.length} total
                </span>
              ) : null}
            </div>

            {hasAssessments ? (
              <div className="mt-6 space-y-3">
                {assessments.map((assessment, index) => (
                  <div
                    key={assessment.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {assessment.topic ?? `Assessment #${assessments.length - index}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(assessment.createdAt)}
                        {assessment.durationSeconds
                          ? ` · ${assessment.durationSeconds}s`
                          : ""}
                        {assessment.transcript ? " · Analyzed" : " · Pending"}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/assessment/${assessment.id}`}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      View results
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <p className="text-sm leading-7 text-slate-600">
                  Complete your first baseline recording to unlock confidence scores, root-cause
                  insights, and your 6-week coaching plan.
                </p>
                <a
                  href="#start-assessment"
                  className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start your first assessment
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <DailyCoachPanel initialChallenge={dailyChallenge} currentWeek={currentWeek} />

          <div
            id="roadmap"
            className="rounded-[2rem] border border-slate-950/10 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
              Growth roadmap
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              Your 6-week coaching path
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {challengesCompleted} daily challenge{challengesCompleted === 1 ? "" : "s"} completed
            </p>

            <div className="mt-6 space-y-3">
              {ROADMAP.map((item) => {
                const isActive = item.week === currentWeek;
                const isComplete = item.week < currentWeek;

                return (
                  <div
                    key={item.week}
                    className={`flex items-center gap-4 rounded-3xl border px-4 py-4 ${
                      isActive
                        ? "border-sky-400/40 bg-sky-400/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${
                        isComplete
                          ? "bg-emerald-400 text-slate-950"
                          : isActive
                            ? "bg-white text-slate-950"
                            : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {isComplete ? "✓" : item.week}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300">{item.label}</p>
                      <p className="text-lg font-semibold text-white">{item.focus}</p>
                    </div>
                    {isActive ? (
                      <span className="ml-auto rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200">
                        Current
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Quick links
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Practice prompts", "#start-assessment"],
                ["Daily challenge", "#daily-coach"],
                ["Mock interview", "/dashboard/interview"],
                ["Group discussion", "/dashboard/discussion"],
                ["Emergency booster", "#emergency-booster"],
                ["Progress analytics", "#progress"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Progress tracking
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">
            Confidence and fluency over time
          </h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              Latest score: {latestScore !== null ? `${latestScore}/100` : "No data yet"}
            </span>
            {confidenceGrowth !== null ? (
              <span>
                Confidence {confidenceGrowth >= 0 ? "+" : ""}
                {confidenceGrowth} pts
              </span>
            ) : null}
            {fluencyGrowth !== null ? (
              <span>
                Fluency {fluencyGrowth >= 0 ? "+" : ""}
                {fluencyGrowth} pts
              </span>
            ) : null}
          </div>
          <div className="mt-6">
            <ProgressCharts history={progressHistory} />
          </div>
        </div>

        <GamificationPanel
          levelLabel={gamification.levelLabel}
          levelPoints={gamification.levelPoints}
          speakingStreak={gamification.speakingStreak}
          unlockedAchievementIds={gamification.unlockedAchievementIds}
        />
      </section>

      <EmergencyBooster />
    </>
  );
}
