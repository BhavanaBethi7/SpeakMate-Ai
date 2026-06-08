import OpenAI from "openai";
import { isOpenAIConfigured } from "./config";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}
