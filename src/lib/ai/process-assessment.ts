import { analyzeSpeech } from "@/lib/speech-analysis";
import type { SpeechAnalysis } from "@/lib/types";
import { isOpenAIConfigured } from "./config";
import { runSpeechAnalysis } from "./speech-coach";
import { transcribeWithWhisper } from "./whisper";

export async function processSpeechAssessment(input: {
  topic: string;
  durationSeconds: number;
  clientTranscript?: string;
  audio?: File | Blob | null;
}): Promise<{ transcript: string; analysis: SpeechAnalysis; usedWhisper: boolean; usedGPT: boolean }> {
  let transcript = input.clientTranscript?.trim() ?? "";
  let usedWhisper = false;

  if (isOpenAIConfigured() && input.audio && input.audio.size > 0) {
    try {
      transcript = await transcribeWithWhisper(input.audio);
      usedWhisper = true;
    } catch (error) {
      console.error("Whisper transcription failed, falling back to client transcript:", error);
      // FIX: Don't throw — fall back to client transcript (from SpeechRecognition).
      // Only hard-fail if we also have no client transcript at all.
      if (!transcript) {
        // Give a more helpful error that tells the user what actually went wrong
        const message =
          error instanceof Error && error.message?.includes("401")
            ? "OpenAI API key is invalid. Please check your Vercel environment variables."
            : error instanceof Error && error.message?.includes("429")
            ? "OpenAI quota exceeded. Please check your billing at platform.openai.com."
            : "Audio transcription failed. Please try recording again or check your microphone.";
        throw new Error(message);
      }
      // We have a client transcript — silently continue without Whisper
    }
  }

  if (!transcript || transcript.length < 20) {
    throw new Error(
      "Not enough speech was captured. Please speak clearly for at least 15 seconds and try again.",
    );
  }

  // Try GPT-powered analysis; on failure fall back to local analysis
  if (isOpenAIConfigured()) {
    try {
      const analysis = await runSpeechAnalysis(transcript, input.durationSeconds, input.topic);
      return {
        transcript,
        analysis,
        usedWhisper,
        usedGPT: Boolean(analysis.aiPowered),
      };
    } catch (error) {
      console.error("GPT analysis failed, using local analysis:", error);
      // Fall through to local analysis below
    }
  }

  return {
    transcript,
    analysis: analyzeSpeech(transcript, input.durationSeconds),
    usedWhisper: false,
    usedGPT: false,
  };
}
