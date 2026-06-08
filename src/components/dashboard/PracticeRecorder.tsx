"use client";

import { fetchAiStatus, submitAssessment } from "@/lib/client/submit-assessment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PracticeRecorderProps = {
  topic: string;
  prompt: string;
  minSeconds?: number;
  maxSeconds?: number;
  submitLabel?: string;
};

type RecordingState = "idle" | "recording" | "processing" | "error";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getSupportedMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function mimeToExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

export default function PracticeRecorder({
  topic,
  prompt,
  minSeconds = 15,
  maxSeconds = 180,
  submitLabel = "Stop & analyze",
}: PracticeRecorderProps) {
  const router = useRouter();
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);
  const elapsedRef = useRef(0);
  const mimeTypeRef = useRef<string>("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    );
    fetchAiStatus().then((status) => {
      if (mountedRef.current) setAiEnabled(status.configured);
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    setTranscript("");
    setManualTranscript("");
    transcriptPartsRef.current = [];
    chunksRef.current = [];
    elapsedRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      // Request data every second so chunks are populated even on short recordings
      mediaRecorder.start(1000);

      if (speechSupported) {
        const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        if (SpeechRecognitionCtor) {
          const recognition = new SpeechRecognitionCtor();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";
          recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const piece = event.results[i][0].transcript.trim();
              if (event.results[i].isFinal && piece) transcriptPartsRef.current.push(piece);
            }
            if (mountedRef.current) setTranscript(transcriptPartsRef.current.join(" "));
          };
          // BUG FIX: handle recognition errors — was missing entirely in PracticeRecorder
          recognition.onerror = (event) => {
            if (event.error !== "no-speech" && event.error !== "aborted") {
              setSpeechSupported(false);
            }
          };
          recognitionRef.current = recognition;
          recognition.start();
        }
      }

      setState("recording");
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        if (mountedRef.current) setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      setState("error");
      setError("Microphone access is required.");
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const finalElapsed = elapsedRef.current;

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((track) => track.stop());
      await submitAssessmentRecording(finalElapsed);
    };
    if (recorder.state !== "inactive") recorder.stop();
  }

  async function submitAssessmentRecording(finalElapsed: number) {
    if (!mountedRef.current) return;
    setState("processing");

    // Read from ref — avoids stale closure on transcript state
    const finalTranscript = transcriptPartsRef.current.join(" ").trim() || manualTranscript.trim();

    const mimeType = mimeTypeRef.current || "audio/webm";
    const ext = mimeToExtension(mimeType);
    const audioBlob =
      chunksRef.current.length > 0
        ? new Blob(chunksRef.current, { type: mimeType })
        : null;

    if (!audioBlob && finalTranscript.length < 20) {
      setState("error");
      setError("Please capture at least 20 characters of speech.");
      return;
    }
    if (finalElapsed < minSeconds) {
      setState("error");
      setError(`Please record for at least ${minSeconds} seconds.`);
      return;
    }

    try {
      const data = await submitAssessment({
        topic,
        durationSeconds: finalElapsed,
        transcript: finalTranscript || undefined,
        audioBlob,
        audioFilename: `recording.${ext}`,
      });
      if (mountedRef.current) {
        router.push(`/dashboard/assessment/${data.id}`);
        router.refresh();
      }
    } catch (submitError) {
      if (mountedRef.current) {
        setState("error");
        setError(submitError instanceof Error ? submitError.message : "Analysis failed.");
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-medium text-slate-300">Prompt</p>
        <p className="mt-2 text-lg text-white">{prompt}</p>
        {aiEnabled ? (
          <p className="mt-2 text-xs text-sky-200">AI stack: Whisper transcription + GPT coaching</p>
        ) : null}
      </div>

      {state === "recording" ? (
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-5">
          <div>
            <p className="text-sm text-slate-300">Recording</p>
            <p className="font-display text-4xl font-semibold text-white">{formatTimer(elapsed)}</p>
          </div>
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
            Live
          </span>
        </div>
      ) : null}

      {(state === "recording" || transcript) && (
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Transcript</p>
          <p className="mt-2 min-h-16 text-sm leading-6 text-slate-100">
            {transcript || "Listening..."}
          </p>
        </div>
      )}

      {!speechSupported && (state === "idle" || state === "error") ? (
        <textarea
          value={manualTranscript}
          onChange={(event) => setManualTranscript(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
          placeholder="Type what you said..."
        />
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        {state === "idle" || state === "error" ? (
          <button
            type="button"
            onClick={startRecording}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Start recording
          </button>
        ) : null}
        {state === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            disabled={elapsed > maxSeconds}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            {submitLabel}
          </button>
        ) : null}
        {state === "processing" ? (
          <button type="button" disabled className="rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-slate-950">
            Analyzing...
          </button>
        ) : null}
      </div>
    </div>
  );
}
