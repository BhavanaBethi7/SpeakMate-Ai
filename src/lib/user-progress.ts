import {
  calculateLevelPoints,
  getSpeakerLevel,
  getUnlockedAchievements,
  updateSpeakingStreak,
} from "@/lib/gamification";
import { ensureUserProgress, getAuthenticatedUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function recordPracticeActivity(userId: string) {
  const progress = await ensureUserProgress(userId);
  const streakUpdate = updateSpeakingStreak(
    progress.speakingStreak,
    progress.lastPracticeDate,
  );
  const assessmentCount = await prisma.assessment.count({ where: { userId } });
  const interviewCount = await prisma.assessment.count({
    where: { userId, topic: { startsWith: "Interview:" } },
  });
  const discussionCount = await prisma.assessment.count({
    where: { userId, topic: { startsWith: "Discussion:" } },
  });

  const stats = {
    assessmentCount,
    challengesCompleted: progress.challengesCompleted,
    interviewCount,
    discussionCount,
    speakingStreak: streakUpdate.streak,
  };

  const levelPoints = calculateLevelPoints(stats);
  const level = getSpeakerLevel(levelPoints);
  const achievements = getUnlockedAchievements({ ...stats, levelPoints }).map(
    (item) => item.id,
  );

  await prisma.userProgress.update({
    where: { userId },
    data: {
      speakingStreak: streakUpdate.streak,
      lastPracticeDate: streakUpdate.date,
      speakerLevel: level.id,
      achievements: JSON.stringify(achievements),
    },
  });
}

export async function getUserGamificationStats(userId: string) {
  const progress = await ensureUserProgress(userId);
  const assessmentCount = await prisma.assessment.count({ where: { userId } });
  const interviewCount = await prisma.assessment.count({
    where: { userId, topic: { startsWith: "Interview:" } },
  });
  const discussionCount = await prisma.assessment.count({
    where: { userId, topic: { startsWith: "Discussion:" } },
  });

  const stats = {
    assessmentCount,
    challengesCompleted: progress.challengesCompleted,
    interviewCount,
    discussionCount,
    speakingStreak: progress.speakingStreak,
    levelPoints: calculateLevelPoints({
      assessmentCount,
      challengesCompleted: progress.challengesCompleted,
      interviewCount,
      discussionCount,
      speakingStreak: progress.speakingStreak,
    }),
  };

  const level = getSpeakerLevel(stats.levelPoints);
  const achievements = getUnlockedAchievements(stats);

  return {
    ...stats,
    level,
    achievements,
    storedAchievements: progress.achievements,
  };
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  return user;
}
