import { ROOT_CAUSES, type RootCauseKey } from "./constants";
import type { SpeechAnalysis } from "./types";

const FILLER_PATTERNS: Array<[RegExp, string]> = [
  [/\bum+\b/gi, "um"],
  [/\buh+\b/gi, "uh"],
  [/\bah+\b/gi, "ah"],
  [/\blike\b/gi, "like"],
  [/\bbasically\b/gi, "basically"],
  [/\byou know\b/gi, "you know"],
  [/\bkind of\b/gi, "kind of"],
  [/\bsort of\b/gi, "sort of"],
  [/\bactually\b/gi, "actually"],
  [/\bi mean\b/gi, "i mean"],
];

const INTRO_PHRASES = [
  "hello",
  "hi",
  "my name",
  "i am",
  "i'm",
  "today",
  "let me",
  "i would like",
  "good morning",
  "good afternoon",
];

const CONCLUSION_PHRASES = [
  "in conclusion",
  "to summarize",
  "thank you",
  "that's all",
  "finally",
  "in summary",
  "overall",
  "to wrap up",
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function uniqueWords(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return new Set(words);
}

function detectFillers(text: string) {
  const words: Record<string, number> = {};
  let total = 0;

  for (const [pattern, label] of FILLER_PATTERNS) {
    const matches = text.match(pattern);
    if (matches?.length) {
      words[label] = (words[label] ?? 0) + matches.length;
      total += matches.length;
    }
  }

  return { total, words };
}

function scoreStructure(text: string) {
  const lower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const introHit = INTRO_PHRASES.some((phrase) => lower.includes(phrase));
  const conclusionHit = CONCLUSION_PHRASES.some((phrase) => lower.includes(phrase));
  const hasMultipleSections = sentences.length >= 3;

  const introduction = clamp(introHit ? 85 : sentences.length >= 1 ? 55 : 30);
  const organization = clamp(hasMultipleSections ? 78 : sentences.length >= 2 ? 58 : 35);
  const conclusion = clamp(conclusionHit ? 82 : sentences.length >= 2 ? 50 : 28);
  const score = clamp((introduction + organization + conclusion) / 3);

  return { introduction, organization, conclusion, score };
}

function pickRootCause(
  fillerDensity: number,
  vocabRichness: number,
  structureScore: number,
  wpm: number,
  confidenceScore: number,
): SpeechAnalysis["rootCause"] {
  const candidates: Array<{ key: RootCauseKey; weight: number }> = [
    { key: "fear_of_judgment", weight: confidenceScore < 55 ? 90 : 40 },
    {
      key: "language_barrier",
      weight: vocabRichness < 0.45 ? 85 : vocabRichness < 0.6 ? 55 : 20,
    },
    {
      key: "structure_issues",
      weight: structureScore < 55 ? 88 : structureScore < 70 ? 50 : 15,
    },
    {
      key: "anxiety_pauses",
      weight: fillerDensity > 0.08 || wpm > 185 || wpm < 95 ? 82 : 25,
    },
  ];

  candidates.sort((a, b) => b.weight - a.weight);
  const primary = candidates[0].key;
  const cause = ROOT_CAUSES[primary];

  return {
    key: primary,
    title: cause.title,
    description: cause.copy,
  };
}

function buildDiagnosis(analysis: Omit<SpeechAnalysis, "diagnosis">) {
  const parts = [
    `Overall communication score: ${analysis.overallScore}/100.`,
    `Confidence is ${analysis.confidence.score >= 70 ? "strong" : analysis.confidence.score >= 50 ? "developing" : "emerging"} with a nervousness level of ${analysis.confidence.nervousness}/100.`,
    analysis.fillerWords.count > 0
      ? `Detected ${analysis.fillerWords.count} filler word${analysis.fillerWords.count === 1 ? "" : "s"}, which may affect fluency.`
      : "Filler word usage is minimal, supporting smoother delivery.",
    `Primary root cause: ${analysis.rootCause.title.toLowerCase()} — ${analysis.rootCause.description}`,
  ];

  return parts.join(" ");
}

export function analyzeSpeech(transcript: string, durationSeconds: number): SpeechAnalysis {
  const cleaned = transcript.trim();
  const wordCount = countWords(cleaned);
  const unique = uniqueWords(cleaned);
  const durationMinutes = Math.max(durationSeconds / 60, 0.25);
  const wpm = Math.round(wordCount / durationMinutes);
  const fillers = detectFillers(cleaned);
  const fillerDensity = wordCount > 0 ? fillers.total / wordCount : 0;
  const richness = wordCount > 0 ? unique.size / wordCount : 0;
  const structure = scoreStructure(cleaned);

  const clarity = clamp(72 + Math.min(wordCount, 120) * 0.08 - fillerDensity * 120);
  const fluency = clamp(75 - fillerDensity * 140 - (wpm > 180 ? 12 : 0));
  const fillerScore = clamp(100 - fillers.total * 8 - fillerDensity * 200);
  const speedScore = clamp(100 - Math.abs(wpm - 145) * 0.9);
  const vocabScore = clamp(45 + richness * 120);
  const confidenceScore = clamp(
    (clarity + fluency + fillerScore + speedScore + structure.score) / 5,
  );
  const nervousness = clamp(100 - confidenceScore + fillerDensity * 80);
  const improvementPotential = clamp(100 - confidenceScore * 0.55 + (100 - structure.score) * 0.25);

  const emotions = {
    nervousness: clamp(nervousness),
    confidence: confidenceScore,
    excitement: clamp(40 + (wpm > 130 && wpm < 170 ? 25 : 10)),
    stress: clamp(nervousness * 0.85 + fillerDensity * 60),
    monotone: clamp(55 - richness * 40 + (structure.organization < 55 ? 15 : 0)),
  };

  const rootCause = pickRootCause(
    fillerDensity,
    richness,
    structure.score,
    wpm,
    confidenceScore,
  );

  const overallScore = clamp(
    clarity * 0.15 +
      fluency * 0.15 +
      fillerScore * 0.15 +
      speedScore * 0.1 +
      vocabScore * 0.15 +
      structure.score * 0.15 +
      confidenceScore * 0.15,
  );

  const base = {
    clarity: {
      score: clarity,
      pronunciation: clamp(clarity + 4),
      articulation: clamp(clarity - 2),
      speechQuality: clamp(clarity + 2),
    },
    fluency: {
      score: fluency,
      continuity: clamp(fluency + 3),
      pauseFrequency: clamp(100 - fluency),
      hesitation: clamp(100 - fluency + fillerDensity * 50),
    },
    fillerWords: {
      score: fillerScore,
      count: fillers.total,
      words: fillers.words,
    },
    speakingSpeed: {
      score: speedScore,
      wordsPerMinute: wpm,
      optimal: wpm >= 120 && wpm <= 170,
    },
    vocabulary: {
      score: vocabScore,
      uniqueWords: unique.size,
      richness: Math.round(richness * 100) / 100,
    },
    structure,
    confidence: {
      score: confidenceScore,
      nervousness,
      improvementPotential,
    },
    emotions,
    rootCause,
    overallScore,
  };

  return {
    ...base,
    diagnosis: buildDiagnosis(base),
  };
}

export function parseAssessmentScores(scores: string | null) {
  if (!scores) return null;
  try {
    return JSON.parse(scores) as SpeechAnalysis;
  } catch {
    return null;
  }
}
