export const AI_CONFIG = {
  // Groq uses whisper-large-v3-turbo; OpenAI uses whisper-1
  whisperModel: process.env.GROQ_API_KEY
    ? (process.env.GROQ_WHISPER_MODEL ?? "whisper-large-v3-turbo")
    : (process.env.OPENAI_WHISPER_MODEL ?? "whisper-1"),
  chatModel: process.env.GROQ_API_KEY
    ? (process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile")
    : (process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"),
};

export function isOpenAIConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
}

export function getApiCredentials() {
  if (process.env.GROQ_API_KEY?.trim()) {
    return {
      apiKey: process.env.GROQ_API_KEY.trim(),
      baseURL: "https://api.groq.com/openai/v1",
      provider: "groq" as const,
    };
  }
  return {
    apiKey: process.env.OPENAI_API_KEY!.trim(),
    baseURL: undefined,
    provider: "openai" as const,
  };
}
