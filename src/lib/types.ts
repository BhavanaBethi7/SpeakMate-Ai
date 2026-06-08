import type { RootCauseKey } from "./constants";

export type SpeechAnalysis = {
  clarity: {
    score: number;
    pronunciation: number;
    articulation: number;
    speechQuality: number;
  };
  fluency: {
    score: number;
    continuity: number;
    pauseFrequency: number;
    hesitation: number;
  };
  fillerWords: {
    score: number;
    count: number;
    words: Record<string, number>;
  };
  speakingSpeed: {
    score: number;
    wordsPerMinute: number;
    optimal: boolean;
  };
  vocabulary: {
    score: number;
    uniqueWords: number;
    richness: number;
  };
  structure: {
    score: number;
    introduction: number;
    organization: number;
    conclusion: number;
  };
  confidence: {
    score: number;
    nervousness: number;
    improvementPotential: number;
  };
  emotions: {
    nervousness: number;
    confidence: number;
    excitement: number;
    stress: number;
    monotone: number;
  };
  rootCause: {
    key: RootCauseKey;
    title: string;
    description: string;
  };
  overallScore: number;
  diagnosis: string;
  aiPowered?: boolean;
  motivationalFeedback?: string;
  coachingTips?: string[];
};

export type AssessmentRecord = {
  id: string;
  topic: string | null;
  transcript: string | null;
  durationSeconds: number | null;
  rootCause: string | null;
  scores: SpeechAnalysis | null;
  createdAt: string;
};

export type DailyChallengeRecord = {
  id: string;
  prompt: string;
  challengeType: string;
  completed: boolean;
  date: string;
};
