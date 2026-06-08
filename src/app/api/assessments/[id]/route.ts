import { parseAssessmentScores } from "@/lib/speech-analysis";
import { getAuthenticatedUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const assessment = await prisma.assessment.findFirst({
    where: { id, userId: user.id },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  return NextResponse.json({
    assessment: {
      id: assessment.id,
      topic: assessment.topic,
      transcript: assessment.transcript,
      durationSeconds: assessment.durationSeconds,
      rootCause: assessment.rootCause,
      scores: parseAssessmentScores(assessment.scores),
      createdAt: assessment.createdAt.toISOString(),
    },
  });
}
