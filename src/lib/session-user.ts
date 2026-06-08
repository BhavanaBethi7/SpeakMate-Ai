import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function getAuthenticatedUser() {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { email?: string | null };
  } | null;
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { progress: true },
  });
}

export async function ensureUserProgress(userId: string) {
  return prisma.userProgress.upsert({
    where: { userId },
    update: {},
    create: { userId, currentWeek: 1 },
  });
}
