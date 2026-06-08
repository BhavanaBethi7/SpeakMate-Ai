export const SPEAKER_LEVELS = [
  { id: "shy_speaker", label: "Shy Speaker", minPoints: 0 },
  { id: "emerging_speaker", label: "Emerging Speaker", minPoints: 3 },
  { id: "confident_speaker", label: "Confident Speaker", minPoints: 8 },
  { id: "advanced_communicator", label: "Advanced Communicator", minPoints: 15 },
  { id: "master_speaker", label: "Master Speaker", minPoints: 25 },
] as const;

export const ACHIEVEMENTS = [
  {
    id: "first_speech",
    label: "First Speech",
    description: "Complete your first baseline assessment.",
    check: (stats: UserStats) => stats.assessmentCount >= 1,
  },
  {
    id: "seven_day_streak",
    label: "7-Day Streak",
    description: "Practice for 7 days in a row.",
    check: (stats: UserStats) => stats.speakingStreak >= 7,
  },
  {
    id: "thirty_day_streak",
    label: "30-Day Streak",
    description: "Practice for 30 days in a row.",
    check: (stats: UserStats) => stats.speakingStreak >= 30,
  },
  {
    id: "interview_ready",
    label: "Interview Ready",
    description: "Complete a mock interview session.",
    check: (stats: UserStats) => stats.interviewCount >= 1,
  },
  {
    id: "presentation_champion",
    label: "Presentation Champion",
    description: "Reach Confident Speaker level or higher.",
    check: (stats: UserStats) => stats.levelPoints >= 8,
  },
] as const;

export type UserStats = {
  assessmentCount: number;
  challengesCompleted: number;
  interviewCount: number;
  discussionCount: number;
  speakingStreak: number;
  levelPoints: number;
};

export function calculateLevelPoints(stats: Omit<UserStats, "levelPoints">) {
  return (
    stats.assessmentCount * 2 +
    stats.challengesCompleted +
    stats.interviewCount * 2 +
    stats.discussionCount * 2
  );
}

export function getSpeakerLevel(points: number) {
  const levels = [...SPEAKER_LEVELS].reverse();
  return levels.find((level) => points >= level.minPoints) ?? SPEAKER_LEVELS[0];
}

export function getUnlockedAchievements(stats: UserStats) {
  return ACHIEVEMENTS.filter((achievement) => achievement.check(stats));
}

export function updateSpeakingStreak(currentStreak: number, lastPracticeDate: string | null) {
  const today = new Intl.DateTimeFormat("en-CA").format(new Date());
  if (lastPracticeDate === today) return { streak: currentStreak, date: today };

  if (!lastPracticeDate) return { streak: 1, date: today };

  const yesterday = new Intl.DateTimeFormat("en-CA").format(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  if (lastPracticeDate === yesterday) {
    return { streak: currentStreak + 1, date: today };
  }

  return { streak: 1, date: today };
}
