"use client";

import { ACHIEVEMENTS, SPEAKER_LEVELS } from "@/lib/gamification";

type GamificationPanelProps = {
  levelLabel: string;
  levelPoints: number;
  speakingStreak: number;
  unlockedAchievementIds: string[];
};

export default function GamificationPanel({
  levelLabel,
  levelPoints,
  speakingStreak,
  unlockedAchievementIds,
}: GamificationPanelProps) {
  const nextLevel = SPEAKER_LEVELS.find((level) => level.minPoints > levelPoints);

  return (
    <div id="progress" className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
        Gamification
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">
        Level: {levelLabel}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {levelPoints} XP · {speakingStreak}-day speaking streak
        {nextLevel ? ` · ${nextLevel.minPoints - levelPoints} XP to ${nextLevel.label}` : " · Max level"}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedAchievementIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`rounded-3xl border px-4 py-4 ${
                unlocked
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 opacity-70"
              }`}
            >
              <p className="font-semibold text-slate-950">{achievement.label}</p>
              <p className="mt-1 text-sm text-slate-600">{achievement.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {unlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
