import OpenAI from "openai";
import { getApiCredentials, isOpenAIConfigured } from "./config";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    throw new Error("No AI API key configured. Set GROQ_API_KEY in your environment variables.");
  }

  if (!client) {
    const { apiKey, baseURL } = getApiCredentials();
    client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  }

  return client;
}
