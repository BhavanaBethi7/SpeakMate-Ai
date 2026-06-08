import { AI_CONFIG } from "./config";
import { getOpenAIClient } from "./openai-client";

export async function transcribeWithWhisper(audio: File | Blob, filename = "recording.webm") {
  const openai = getOpenAIClient();
  const file =
    audio instanceof File ? audio : new File([audio], filename, { type: audio.type || "audio/webm" });

  const result = await openai.audio.transcriptions.create({
    file,
    model: AI_CONFIG.whisperModel,
    language: "en",
    response_format: "text",
  });

  return typeof result === "string" ? result.trim() : String(result).trim();
}
