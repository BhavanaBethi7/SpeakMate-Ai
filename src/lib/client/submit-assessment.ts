type SubmitAssessmentInput = {
  topic: string;
  durationSeconds: number;
  transcript?: string;
  audioBlob?: Blob | null;
  audioFilename?: string; // BUG FIX: allow caller to pass correct filename/extension
};

export async function submitAssessment(input: SubmitAssessmentInput) {
  const formData = new FormData();
  formData.append("topic", input.topic);
  formData.append("durationSeconds", String(input.durationSeconds));
  if (input.transcript) formData.append("transcript", input.transcript);
  if (input.audioBlob && input.audioBlob.size > 0) {
    // Use the provided filename (with correct extension) or fall back to webm
    const filename = input.audioFilename ?? "recording.webm";
    formData.append("audio", input.audioBlob, filename);
  }

  const response = await fetch("/api/assessments", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to analyze assessment.");
  }

  return data as { id: string };
}

export async function fetchAiStatus() {
  const response = await fetch("/api/ai/status");
  if (!response.ok) return { configured: false };
  return response.json() as Promise<{ configured: boolean; whisperModel: string; chatModel: string }>;
}
