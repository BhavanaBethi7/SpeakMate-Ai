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
      console.error("Whisper transcription failed:", error);
      if (!transcript) throw new Error("Could not transcribe your recording. Please try again.");
    }
  }

  if (!transcript || transcript.length < 20) {
    throw new Error("Please record at least 20 characters of speech for analysis.");
  }

  if (isOpenAIConfigured()) {
    const analysis = await runSpeechAnalysis(transcript, input.durationSeconds, input.topic);
    return {
      transcript,
      analysis,
      usedWhisper,
      usedGPT: Boolean(analysis.aiPowered),
    };
  }

  return {
    transcript,
    analysis: analyzeSpeech(transcript, input.durationSeconds),
    usedWhisper: false,
    usedGPT: false,
  };
}
