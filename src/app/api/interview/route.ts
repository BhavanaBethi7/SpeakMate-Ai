import { getAuthenticatedUser } from "@/lib/session-user";
import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/ai/openai-client";
import { AI_CONFIG } from "@/lib/ai/config";
import { transcribeWithWhisper } from "@/lib/ai/whisper";

export const runtime = "nodejs";
export const maxDuration = 60;

type ConversationTurn = {
  role: "interviewer" | "candidate";
  content: string;
};

// Given conversation history + latest candidate answer, generate the next interviewer question
async function generateNextQuestion(
  category: string,
  history: ConversationTurn[],
  latestAnswer: string,
): Promise<string> {
  const openai = getOpenAIClient();

  const systemPrompt = `You are a professional ${category} interviewer conducting a realistic mock interview.
Your job is to ask ONE follow-up question based on the candidate's most recent answer.
Rules:
- Ask exactly ONE question, nothing else
- Make it genuinely relevant to what they just said — reference specific things they mentioned
- Vary question types: dig deeper, ask for examples, challenge assumptions, explore motivation
- Keep it conversational and realistic, not robotic
- If they've answered 5+ questions, wrap up with "That's all for today — thank you for your time."
- Never repeat a question already asked
Return ONLY the question text, no preamble.`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Feed the conversation history
  for (const turn of history) {
    messages.push({
      role: turn.role === "interviewer" ? "assistant" : "user",
      content: turn.content,
    });
  }

  // Add the latest answer
  messages.push({ role: "user", content: latestAnswer });

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.chatModel,
    temperature: 0.7,
    max_tokens: 150,
    messages,
  });

  return response.choices[0]?.message?.content?.trim() ?? "Can you elaborate on that?";
}

// Score a single answer
async function scoreAnswer(
  question: string,
  answer: string,
): Promise<{ confidence: number; relevance: number; clarity: number; feedback: string }> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.chatModel,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Score this interview answer and return JSON only:
{
  "confidence": 0-100,
  "relevance": 0-100,
  "clarity": 0-100,
  "feedback": "one specific actionable sentence"
}`,
      },
      { role: "user", content: `Question: ${question}\nAnswer: ${answer}` },
    ],
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content ?? "{}");
  } catch {
    return { confidence: 70, relevance: 70, clarity: 70, feedback: "Good effort, keep practicing." };
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";

  let category = "HR";
  let history: ConversationTurn[] = [];
  let audioFile: File | Blob | null = null;
  let textAnswer = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    category = String(formData.get("category") ?? "HR");
    history = JSON.parse(String(formData.get("history") ?? "[]"));
    textAnswer = String(formData.get("textAnswer") ?? "").trim();
    const audioEntry = formData.get("audio");
    if (audioEntry instanceof File && audioEntry.size > 0) audioFile = audioEntry;
    else if (audioEntry instanceof Blob && audioEntry.size > 0) audioFile = audioEntry;
  } else {
    const body = await request.json();
    category = body.category ?? "HR";
    history = body.history ?? [];
    textAnswer = body.textAnswer ?? "";
  }

  // Transcribe audio if provided
  let candidateAnswer = textAnswer;
  if (audioFile && audioFile.size > 0) {
    try {
      candidateAnswer = await transcribeWithWhisper(audioFile);
    } catch {
      if (!candidateAnswer) {
        return NextResponse.json({ error: "Could not transcribe your answer. Please try again." }, { status: 400 });
      }
    }
  }

  if (!candidateAnswer || candidateAnswer.length < 5) {
    return NextResponse.json({ error: "No answer detected." }, { status: 400 });
  }

  // Get the current question (last interviewer turn)
  const currentQuestion = [...history].reverse().find((t) => t.role === "interviewer")?.content ?? "";

  // Score the answer and generate next question in parallel
  const [scores, nextQuestion] = await Promise.all([
    currentQuestion ? scoreAnswer(currentQuestion, candidateAnswer) : Promise.resolve(null),
    generateNextQuestion(category, history, candidateAnswer),
  ]);

  return NextResponse.json({
    transcript: candidateAnswer,
    nextQuestion,
    scores,
    done: nextQuestion.toLowerCase().includes("thank you for your time"),
  });
}
