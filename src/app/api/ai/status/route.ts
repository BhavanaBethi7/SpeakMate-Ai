import { isOpenAIConfigured } from "@/lib/ai/config";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    configured: isOpenAIConfigured(),
    whisperModel: process.env.OPENAI_WHISPER_MODEL ?? "whisper-1",
    chatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
  });
}
