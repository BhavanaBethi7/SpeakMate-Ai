import { AI_CONFIG, getApiCredentials } from "./config";
import { getOpenAIClient } from "./openai-client";

export async function transcribeWithWhisper(audio: File | Blob, filename = "recording.webm") {
  const openai = getOpenAIClient();
  const { provider } = getApiCredentials();

  const file =
    audio instanceof File ? audio : new File([audio], filename, { type: audio.type || "audio/webm" });

  // Groq Whisper supports: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
  // response_format "text" works on both Groq and OpenAI
  const result = await openai.audio.transcriptions.create({
    file,
    model: AI_CONFIG.whisperModel,
    language: "en",
    response_format: "text",
    // temperature only supported by OpenAI, not Groq
    ...(provider === "openai" ? { temperature: 0 } : {}),
  });

  return typeof result === "string" ? result.trim() : String(result).trim();
}
