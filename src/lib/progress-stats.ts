import type { SpeechAnalysis } from "./types";

export type ProgressPoint = {
  label: string;
  confidence: number;
  fluency: number;
  overall: number;
};

export function buildProgressHistory(
  assessments: Array<{
    createdAt: string;
    topic: string | null;
    scores: SpeechAnalysis | null;
  }>,
) {
  return [...assessments]
    .reverse()
    .map((assessment, index) => ({
      label: assessment.topic ?? `Session ${index + 1}`,
      confidence: assessment.scores?.confidence.score ?? 0,
      fluency: assessment.scores?.fluency.score ?? 0,
      overall: assessment.scores?.overallScore ?? 0,
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(assessment.createdAt)),
    }))
    .slice(-8);
}

export function getConfidenceGrowth(history: ProgressPoint[]) {
  if (history.length < 2) return null;
  return history[history.length - 1].confidence - history[0].confidence;
}

export function getFluencyGrowth(history: ProgressPoint[]) {
  if (history.length < 2) return null;
  return history[history.length - 1].fluency - history[0].fluency;
}
