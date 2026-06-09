import { analyzeSpeech } from "@/lib/speech-analysis";
import type { SpeechAnalysis } from "@/lib/types";
import { isOpenAIConfigured } from "./config";
import { runSpeechAnalysis } from "./speech-coach";
import { transcribeWithWhisper } from "./whisper";
import { analyzeVoice, mergeVoiceAnalysis } from "./voice-analysis";

export async function processSpeechAssessment(input: {
  topic: string;
  durationSeconds: number;
  clientTranscript?: string;
  audio?: File | Blob | null;
}): Promise<{ transcript: string; analysis: SpeechAnalysis; usedWhisper: boolean; usedGPT: boolean; usedVoiceAnalysis: boolean }> {
  let transcript = input.clientTranscript?.trim() ?? "";
  let usedWhisper = false;
  let usedVoiceAnalysis = false;

  // Run transcription and voice analysis in parallel if audio is available
  const [transcriptResult, voiceResult] = await Promise.all([
    // Transcription
    (async () => {
      if (isOpenAIConfigured() && input.audio && input.audio.size > 0) {
        try {
          const t = await transcribeWithWhisper(input.audio);
          return { transcript: t, used: true };
        } catch (error) {
          console.error("Whisper transcription failed, using client transcript:", error);
          if (!transcript) {
            const message =
              error instanceof Error && error.message?.includes("401")
                ? "OpenAI API key is invalid. Please check your Vercel environment variables."
                : error instanceof Error && error.message?.includes("429")
                ? "OpenAI quota exceeded. Please check your billing at platform.openai.com."
                : "Audio transcription failed. Please try recording again.";
            throw new Error(message);
          }
          return { transcript, used: false };
        }
      }
      return { transcript, used: false };
    })(),

    // FEATURE 1: Real voice analysis (runs in parallel, never blocks)
    input.audio && input.audio.size > 0
      ? analyzeVoice(input.audio).catch(() => null)
      : Promise.resolve(null),
  ]);

  transcript = transcriptResult.transcript;
  usedWhisper = transcriptResult.used;

  if (!transcript || transcript.length < 20) {
    throw new Error("Not enough speech was captured. Please speak clearly for at least 15 seconds and try again.");
  }

  // Get text-based analysis (from GPT if available, else local formula)
  let analysis: SpeechAnalysis;
  let usedGPT = false;

  if (isOpenAIConfigured()) {
    try {
      analysis = await runSpeechAnalysis(transcript, input.durationSeconds, input.topic);
      usedGPT = Boolean(analysis.aiPowered);
    } catch (error) {
      console.error("GPT analysis failed, using local analysis:", error);
      analysis = analyzeSpeech(transcript, input.durationSeconds);
    }
  } else {
    analysis = analyzeSpeech(transcript, input.durationSeconds);
  }

  // FEATURE 1: Merge real voice scores if available
  if (voiceResult) {
    analysis = mergeVoiceAnalysis(analysis, voiceResult);
    usedVoiceAnalysis = true;
  }

  return { transcript, analysis, usedWhisper, usedGPT, usedVoiceAnalysis };
}
