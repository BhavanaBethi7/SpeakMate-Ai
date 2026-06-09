"use client";

import { ASSESSMENT_TOPICS } from "@/lib/constants";
import { fetchAiStatus, submitAssessment } from "@/lib/client/submit-assessment";
import WaveformVisualizer from "@/components/dashboard/WaveformVisualizer";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function mimeToExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

export default function AssessmentRecorder() {
  const router = useRouter();
  const [topic, setTopic] = useState<string>(ASSESSMENT_TOPICS[0]);
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

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
    fetchAiStatus().then((status) => { if (mountedRef.current) setAiEnabled(status.configured); });
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
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
      setLiveStream(stream);

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.start(1000);

      if (speechSupported) {
        const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        if (Ctor) {
          const recognition = new Ctor();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";
          recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const piece = event.results[i][0].transcript.trim();
              if (event.results[i].isFinal && piece) transcriptPartsRef.current.push(piece);
            }
            if (mountedRef.current) setTranscript(transcriptPartsRef.current.join(" "));
          };
          recognition.onerror = (event) => {
            if (event.error !== "no-speech" && event.error !== "aborted") setSpeechSupported(false);
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
      setError("Microphone access is required to record your assessment.");
    }
  }

  function stopRecording() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setLiveStream(null);

    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    const finalElapsed = elapsedRef.current;

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      await submitAssessmentRecording(finalElapsed);
    };
    if (recorder.state !== "inactive") recorder.stop();
  }

  async function submitAssessmentRecording(finalElapsed: number) {
    if (!mountedRef.current) return;
    setState("processing");
    const finalTranscript = transcriptPartsRef.current.join(" ").trim() || manualTranscript.trim();
    const mimeType = mimeTypeRef.current || "audio/webm";
    const ext = mimeToExtension(mimeType);
    const audioBlob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: mimeType }) : null;

    if (!audioBlob && finalTranscript.length < 20) {
      setState("error");
      setError(speechSupported
        ? "Not enough speech was captured. Try again in a quiet space and speak for at least 30 seconds."
        : "Please type or paste what you said before submitting.");
      return;
    }
    if (finalElapsed < 15) {
      setState("error");
      setError("Please record for at least 15 seconds before submitting.");
      return;
    }

    try {
      const data = await submitAssessment({ topic, durationSeconds: finalElapsed, transcript: finalTranscript || undefined, audioBlob, audioFilename: `recording.${ext}` });
      if (mountedRef.current) { router.push(`/dashboard/assessment/${data.id}`); router.refresh(); }
    } catch (err) {
      if (mountedRef.current) {
        setState("error");
        setError(err instanceof Error ? err.message : "Failed to analyze assessment.");
      }
    }
  }

  return (
    <div className="relative mt-5 space-y-4">
      <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-sm font-medium text-slate-300">Choose a topic</p>
        <div className="mt-4 grid gap-2">
          {ASSESSMENT_TOPICS.map((prompt) => (
            <button key={prompt} type="button"
              disabled={state === "recording" || state === "processing"}
              onClick={() => setTopic(prompt)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${topic === prompt ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"}`}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-400/20 to-emerald-400/10 p-5 ring-1 ring-white/10">
        {state === "idle" || state === "error" ? (
          <>
            <p className="text-sm text-slate-300">Ready when you are</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Record a 1–2 minute speech about your selected topic. SpeakMate will analyze clarity, fluency, filler words, confidence, and root causes.
            </p>
            {/* FEATURE 3: Scoring honesty label */}
            <p className="mt-2 text-xs text-slate-400">
              {aiEnabled
                ? "✦ Scores powered by Whisper transcription + GPT analysis"
                : "✦ Scores are text-based estimates derived from your transcript — speak clearly for best results"}
            </p>
          </>
        ) : null}

        {state === "recording" ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Recording</p>
                <p className="mt-1 font-display text-4xl font-semibold text-white">{formatTimer(elapsed)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                Live
              </span>
            </div>

            {/* FEATURE 5: Waveform visualizer */}
            <div className="mt-4">
              <WaveformVisualizer stream={liveStream} isRecording={state === "recording"} />
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-200">
              Aim for 60–120 seconds. Stop when you have finished your speech.
            </p>
          </>
        ) : null}

        {state === "processing" ? (
          <div className="space-y-2">
            <p className="text-sm leading-6 text-slate-200">
              {aiEnabled ? "Transcribing with Whisper and generating AI coaching feedback..." : "Analyzing your speech for clarity, fluency, confidence, emotions, and root causes..."}
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-sky-400/60" style={{ width: "60%" }} />
            </div>
          </div>
        ) : null}

        {(state === "recording" || transcript) && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live transcript</p>
            <p className="mt-2 min-h-16 text-sm leading-6 text-slate-100">{transcript || "Listening..."}</p>
          </div>
        )}

        {!speechSupported && (state === "idle" || state === "error") ? (
          <div className="mt-4">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-400">Type what you said</label>
            <textarea value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-sky-400/40 focus:ring-2"
              placeholder="Paste or type your speech transcript here..." />
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {state === "idle" || state === "error" ? (
            <button type="button" onClick={startRecording}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Start recording
            </button>
          ) : null}
          {state === "recording" ? (
            <>
              <button type="button" onClick={stopRecording}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Stop & analyze
              </button>
              {elapsed >= 120 ? (
                <p className="self-center text-xs text-amber-200">Great length — you can stop and analyze now.</p>
              ) : null}
            </>
          ) : null}
          {state === "processing" ? (
            <button type="button" disabled className="rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-slate-950">
              Analyzing...
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
