import { ROOT_CAUSES, type RootCauseKey } from "@/lib/constants";
import { analyzeSpeech } from "@/lib/speech-analysis";
import type { SpeechAnalysis } from "@/lib/types";
import { AI_CONFIG } from "./config";
import { getOpenAIClient } from "./openai-client";

const VALID_ROOT_CAUSES = Object.keys(ROOT_CAUSES) as RootCauseKey[];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeRootCause(key: string | undefined, fallback: SpeechAnalysis["rootCause"]) {
  if (key && VALID_ROOT_CAUSES.includes(key as RootCauseKey)) {
    const cause = ROOT_CAUSES[key as RootCauseKey];
    return { key: key as RootCauseKey, title: cause.title, description: cause.copy };
  }
  return fallback;
}

type AiCoachPayload = {
  diagnosis?: string;
  motivationalFeedback?: string;
  coachingTips?: string[];
  rootCauseKey?: RootCauseKey;
  scoreAdjustments?: {
    clarity?: number;
    fluency?: number;
    confidence?: number;
    overall?: number;
  };
};

export async function enhanceSpeechAnalysisWithGPT(
  transcript: string,
  durationSeconds: number,
  topic: string,
  baseline: SpeechAnalysis,
): Promise<SpeechAnalysis> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.chatModel,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are SpeakMate AI, a supportive communication coach.
Analyze the user's speech transcript and return JSON only with this shape:
{
  "diagnosis": "2-4 sentence personalized diagnosis",
  "motivationalFeedback": "1-2 encouraging sentences",
  "coachingTips": ["tip 1", "tip 2", "tip 3"],
  "rootCauseKey": "fear_of_judgment|language_barrier|structure_issues|anxiety_pauses",
  "scoreAdjustments": { "clarity": 0-100, "fluency": 0-100, "confidence": 0-100, "overall": 0-100 }
}
Be specific, empathetic, and practical. Score adjustments should reflect transcript quality.`,
      },
      {
        role: "user",
        content: `Topic: ${topic}
Duration seconds: ${durationSeconds}
Transcript:
${transcript}

Baseline metrics for reference:
- Overall: ${baseline.overallScore}
- Confidence: ${baseline.confidence.score}
- Fluency: ${baseline.fluency.score}
- Root cause guess: ${baseline.rootCause.key}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return { ...baseline, aiPowered: true };

  let parsed: AiCoachPayload;
  try {
    parsed = JSON.parse(content) as AiCoachPayload;
  } catch {
    return { ...baseline, aiPowered: true };
  }

  const rootCause = normalizeRootCause(parsed.rootCauseKey, baseline.rootCause);
  const clarityScore = clamp(parsed.scoreAdjustments?.clarity ?? baseline.clarity.score);
  const fluencyScore = clamp(parsed.scoreAdjustments?.fluency ?? baseline.fluency.score);
  const confidenceScore = clamp(parsed.scoreAdjustments?.confidence ?? baseline.confidence.score);
  const overallScore = clamp(parsed.scoreAdjustments?.overall ?? baseline.overallScore);

  return {
    ...baseline,
    clarity: { ...baseline.clarity, score: clarityScore },
    fluency: { ...baseline.fluency, score: fluencyScore },
    confidence: {
      ...baseline.confidence,
      score: confidenceScore,
      nervousness: clamp(100 - confidenceScore + baseline.confidence.nervousness * 0.2),
    },
    overallScore,
    rootCause,
    diagnosis: parsed.diagnosis?.trim() || baseline.diagnosis,
    motivationalFeedback:
      parsed.motivationalFeedback?.trim() ||
      "Strong effort today — consistent practice will keep building your confidence.",
    coachingTips:
      parsed.coachingTips?.filter(Boolean).slice(0, 4) ?? [
        "Practice with a clear opening and closing sentence.",
        "Pause briefly instead of using filler words.",
        "Record a second take and compare your pacing.",
      ],
    aiPowered: true,
  };
}

export async function runSpeechAnalysis(
  transcript: string,
  durationSeconds: number,
  topic: string,
): Promise<SpeechAnalysis> {
  const baseline = analyzeSpeech(transcript, durationSeconds);

  try {
    return await enhanceSpeechAnalysisWithGPT(transcript, durationSeconds, topic, baseline);
  } catch (error) {
    console.error("GPT analysis failed, using baseline analysis:", error);
    return baseline;
  }
}

export async function generateDailyChallengeWithGPT(input: {
  currentWeek: number;
  weekFocus: string;
  latestRootCause?: string | null;
  recentScore?: number | null;
}) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.chatModel,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate one daily speaking challenge for SpeakMate AI.
Return JSON: { "prompt": "...", "challengeType": "speaking|confidence|structure|fluency|conversation|presentation|reflection|drill|real_world" }`,
      },
      {
        role: "user",
        content: `Roadmap week: ${input.currentWeek}
Focus: ${input.weekFocus}
Latest root cause: ${input.latestRootCause ?? "unknown"}
Recent score: ${input.recentScore ?? "none"}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No challenge generated");

  const parsed = JSON.parse(content) as { prompt?: string; challengeType?: string };
  if (!parsed.prompt?.trim()) throw new Error("Invalid challenge response");

  return {
    prompt: parsed.prompt.trim(),
    challengeType: parsed.challengeType?.trim() || "speaking",
  };
}

export async function generateMotivationalFeedback(input: {
  userName: string;
  streak: number;
  levelLabel: string;
}) {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.chatModel,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Write one short motivational coaching message (max 2 sentences) for a public speaking learner.",
      },
      {
        role: "user",
        content: `Name: ${input.userName}
Streak: ${input.streak} days
Level: ${input.levelLabel}`,
      },
    ],
  });

  return (
    response.choices[0]?.message?.content?.trim() ||
    "Keep showing up — every practice session makes your voice stronger."
  );
}
