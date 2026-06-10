"use client";

import { ASSESSMENT_TOPICS } from "@/lib/constants";
import { fetchAiStatus, submitAssessment } from "@/lib/client/submit-assessment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "processing" | "error";

// FIX 2: Specific mic error messages based on actual error type
function getMicErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Could not access your microphone. Please try again.";
  const name = (error as DOMException).name ?? "";
  const msg = error.message?.toLowerCase() ?? "";
  if (name === "NotAllowedError" || msg.includes("permission"))
    return "Microphone access was denied. Open your browser settings → Site settings → Microphone and allow access, then refresh.";
  if (name === "NotFoundError" || msg.includes("not found") || msg.includes("no device"))
    return "No microphone found. Please connect a microphone or headset and try again.";
  if (name === "NotReadableError" || msg.includes("already in use"))
    return "Your microphone is being used by another app. Close other tabs or apps using the mic and try again.";
  if (name === "SecurityError" || msg.includes("insecure"))
    return "Microphone access requires a secure connection (HTTPS). Please use the live site, not a local HTTP server.";
  return "Could not access your microphone. Please check your browser permissions and try again.";
}

type BrowserSpeechRecognition = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void; stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

function formatTimer(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function getSupportedMimeType() {
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

function mimeToExt(m: string) {
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4")) return "mp4";
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
  // FIX 10: loading state for initial AI status fetch
  const [statusLoading, setStatusLoading] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);
  const elapsedRef = useRef(0);
  const mimeTypeRef = useRef("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setSpeechSupported(typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window));
    fetchAiStatus().then((s) => {
      if (mountedRef.current) { setAiEnabled(s.configured); setStatusLoading(false); }
    }).catch(() => { if (mountedRef.current) setStatusLoading(false); });
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(1000);

      const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (Ctor && speechSupported) {
        const rec = new Ctor();
        rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
        rec.onresult = (ev) => {
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const p = ev.results[i][0].transcript.trim();
            if (ev.results[i].isFinal && p) transcriptPartsRef.current.push(p);
          }
          if (mountedRef.current) setTranscript(transcriptPartsRef.current.join(" "));
        };
        rec.onerror = (ev) => { if (ev.error !== "no-speech" && ev.error !== "aborted") setSpeechSupported(false); };
        recognitionRef.current = rec;
        rec.start();
      }

      setState("recording");
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        if (mountedRef.current) setElapsed(elapsedRef.current);
      }, 1000);
    } catch (err) {
      // FIX 2: specific error message based on error type
      setState("error");
      setError(getMicErrorMessage(err));
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    const finalElapsed = elapsedRef.current;
    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      await submitRecording(finalElapsed);
    };
    if (recorder.state !== "inactive") recorder.stop();
  }

  async function submitRecording(finalElapsed: number) {
    if (!mountedRef.current) return;
    setState("processing");
    const finalTranscript = transcriptPartsRef.current.join(" ").trim() || manualTranscript.trim();
    const mimeType = mimeTypeRef.current || "audio/webm";
    const audioBlob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: mimeType }) : null;

    if (!audioBlob && finalTranscript.length < 20) {
      setState("error");
      setError(speechSupported
        ? "Not enough speech was captured. Try in a quiet space and speak clearly for at least 30 seconds."
        : "Please type what you said before submitting.");
      return;
    }
    if (finalElapsed < 15) {
      setState("error");
      setError("Please record for at least 15 seconds.");
      return;
    }

    try {
      const data = await submitAssessment({ topic, durationSeconds: finalElapsed, transcript: finalTranscript || undefined, audioBlob, audioFilename: `recording.${mimeToExt(mimeType)}` });
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
          {ASSESSMENT_TOPICS.map((p) => (
            <button key={p} type="button" disabled={state === "recording" || state === "processing"}
              onClick={() => setTopic(p)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${topic === p ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-400/20 to-emerald-400/10 p-5 ring-1 ring-white/10">
        {state === "idle" || state === "error" ? (
          <>
            <p className="text-sm text-slate-300">Ready when you are</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Record a 1–2 minute speech. SpeakMate will analyze clarity, fluency, filler words, confidence, and root causes.
            </p>
            {/* FIX 3 / 10: show real status, not fake claim */}
            {!statusLoading && (
              <p className="mt-2 text-xs text-slate-400">
                {aiEnabled
                  ? "✦ AI-powered: Whisper transcription + GPT analysis"
                  : "✦ Scores are text-based estimates — microphone required for best results"}
              </p>
            )}
          </>
        ) : null}

        {state === "recording" ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Recording</p>
                <p className="mt-1 font-mono text-4xl font-semibold text-white">{formatTimer(elapsed)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />Live
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Aim for 60–120 seconds.</p>
          </>
        ) : null}

        {state === "processing" ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-200">
              {aiEnabled ? "Transcribing with Whisper and generating AI coaching..." : "Analyzing your speech..."}
            </p>
            {/* FIX 10: progress bar during processing */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-[progress_40s_linear_forwards] rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                style={{ animation: "shimmer 2s ease-in-out infinite alternate" }} />
            </div>
            <style>{`@keyframes shimmer{0%{opacity:.5;width:30%}100%{opacity:1;width:85%}}`}</style>
          </div>
        ) : null}

        {(state === "recording" || transcript) && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live transcript</p>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-100">{transcript || "Listening..."}</p>
          </div>
        )}

        {!speechSupported && (state === "idle" || state === "error") ? (
          <textarea value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} rows={4}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="Type what you said..." />
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {state === "idle" || state === "error" ? (
            <button type="button" onClick={startRecording}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Start recording
            </button>
          ) : null}
          {state === "recording" ? (
            <button type="button" onClick={stopRecording}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Stop &amp; analyze
            </button>
          ) : null}
          {state === "processing" ? (
            <button type="button" disabled className="rounded-full bg-white/70 px-5 py-3 text-sm font-semibold text-slate-950 cursor-not-allowed">
              Analyzing...
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
