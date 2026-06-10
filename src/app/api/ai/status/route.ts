import { isOpenAIConfigured } from "@/lib/ai/config";
import { NextResponse } from "next/server";

// FIX 5: Return only the boolean — never expose model names or provider details
export async function GET() {
  return NextResponse.json({ configured: isOpenAIConfigured() });
}
