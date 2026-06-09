import type { SpeechAnalysis } from "@/lib/types";

/**
 * Determines whether a user should advance, repeat, or stay on their current week
 * based on actual performance — not just time elapsed.
 */

type SkillSnapshot = {
  fillerCount: number;
  structureScore: number;
  confidenceScore: number;
  fluencyScore: number;
  overallScore: number;
};

type AdaptiveDecision = {
  nextWeek: number;
  reason: string;
  advancedSkill?: string;
  repeatedSkill?: string;
};

const WEEK_SKILL_MAP: Record<number, { name: string; primaryMetric: keyof SkillSnapshot; threshold: number }> = {
  1: { name: "Confidence building",      primaryMetric: "confidenceScore", threshold: 65 },
  2: { name: "Communication structure",  primaryMetric: "structureScore",  threshold: 65 },
  3: { name: "Conversation skills",      primaryMetric: "fluencyScore",    threshold: 65 },
  4: { name: "Presentation skills",      primaryMetric: "overallScore",    threshold: 68 },
  5: { name: "Advanced communication",   primaryMetric: "overallScore",    threshold: 72 },
  6: { name: "Real-world practice",      primaryMetric: "overallScore",    threshold: 75 },
};

export function extractSkillSnapshot(analysis: SpeechAnalysis): SkillSnapshot {
  return {
    fillerCount: analysis.fillerWords.count,
    structureScore: analysis.structure.score,
    confidenceScore: analysis.confidence.score,
    fluencyScore: analysis.fluency.score,
    overallScore: analysis.overallScore,
  };
}

/**
 * Decide next week based on:
 * - Last 2 sessions' performance on the current week's primary skill
 * - Whether filler words are trending down
 * - Whether the user is stuck (score not improving across 3+ sessions)
 */
export function computeAdaptiveWeek(
  currentWeek: number,
  recentSnapshots: SkillSnapshot[], // Most recent first, up to last 3
): AdaptiveDecision {
  const maxWeek = 6;
  const weekConfig = WEEK_SKILL_MAP[currentWeek] ?? WEEK_SKILL_MAP[6];
  const { name: skillName, primaryMetric, threshold } = weekConfig;

  if (recentSnapshots.length === 0) {
    return { nextWeek: currentWeek, reason: "No data yet — keep practicing." };
  }

  const latest = recentSnapshots[0];
  const prev = recentSnapshots[1] ?? null;
  const older = recentSnapshots[2] ?? null;

  const latestScore = latest[primaryMetric];
  const prevScore = prev?.[primaryMetric] ?? null;

  // ✅ Advance: hit threshold in last session AND improving or consistent
  const hitThreshold = latestScore >= threshold;
  const improving = prevScore === null || latestScore >= prevScore - 5;

  if (hitThreshold && improving && currentWeek < maxWeek) {
    return {
      nextWeek: currentWeek + 1,
      reason: `${skillName} score reached ${latestScore}/100 — advancing to next focus.`,
      advancedSkill: skillName,
    };
  }

  // 🔁 Repeat: stuck — 3+ sessions with no improvement and still below threshold
  if (older !== null && prevScore !== null) {
    const olderScore = older[primaryMetric];
    const stagnant = Math.abs(latestScore - olderScore) < 5 && latestScore < threshold;
    if (stagnant) {
      return {
        nextWeek: currentWeek,
        reason: `${skillName} score (${latestScore}/100) hasn't improved — repeating this week with fresh drills.`,
        repeatedSkill: skillName,
      };
    }
  }

  // 📉 Special rule: filler words — if dropped below 5 in 2 consecutive sessions, reward
  const fillerImproved =
    latest.fillerCount <= 5 && (prev === null || prev.fillerCount <= 5) && currentWeek === 1;
  if (fillerImproved && currentWeek < maxWeek) {
    return {
      nextWeek: currentWeek + 1,
      reason: "Filler word usage is consistently low — advancing to structure work.",
      advancedSkill: "Filler word control",
    };
  }

  // Default: stay on current week, still working toward threshold
  return {
    nextWeek: currentWeek,
    reason: `Keep working on ${skillName} — target ${threshold}/100, currently at ${latestScore}/100.`,
  };
}
