export const AI_CONFIG = {
  whisperModel: process.env.OPENAI_WHISPER_MODEL ?? "whisper-1",
  chatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
};

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
