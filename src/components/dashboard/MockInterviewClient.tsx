"use client";

import WaveformVisualizer from "@/components/dashboard/WaveformVisualizer";
import { useEffect, useRef, useState } from "react";

const OPENING_QUESTIONS: Record<string, string> = {
  hr: "Tell me about yourself and why you're interested in this role.",
  behavioral: "Walk me through a time you had to overcome a significant challenge.",
  technical: "Walk me through a project you're most proud of and your specific contributions.",
};

const categories = [
  { id: "hr", label: "HR" },
  { id: "behavioral", label: "Behavioral" },
  { id: "technical", label: "Technical" },
] as const;

type Turn = { role: "interviewer" | "candidate"; content: string };

type AnswerScore = {
  confidence: number;
  relevance: number;
  clarity: number;
  feedback: string;
} | null;

function getSupportedMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

function mimeToExt(m: string) {
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4")) return "mp4";
  return "webm";
}

export default function MockInterviewClient() {
  const [category, setCategory] = useState<"hr" | "behavioral" | "technical">("hr");
  const [history, setHistory] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [lastScore, setLastScore] = useState<AnswerScore>(null);
  const [allScores, setAllScores] = useState<AnswerScore[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const transcriptPartsRef = useRef<string[]>([]);
  const elapsedRef = useRef(0);
  const mimeTypeRef = useRef("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion]);

  function startInterview() {
    const opening = OPENING_QUESTIONS[category];
    setHistory([]);
    setCurrentQuestion(opening);
    setStarted(true);
    setDone(false);
    setAllScores([]);
    setLastScore(null);
    setError(null);
  }

  async function startRecording() {
    setError(null);
    setLiveTranscript("");
    transcriptPartsRef.current = [];
    chunksRef.current = [];
    elapsedRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLiveStream(stream);

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(1000);

      const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (Ctor) {
        const rec = new Ctor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const piece = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal && piece) transcriptPartsRef.current.push(piece);
          }
          if (mountedRef.current) setLiveTranscript(transcriptPartsRef.current.join(" "));
        };
        rec.onerror = () => {};
        recognitionRef.current = rec;
        rec.start();
      }

      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        if (mountedRef.current) setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      setError("Microphone access required.");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    setLiveStream(null);
    setRecording(false);

    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      await submitAnswer();
    };
    if (recorder.state !== "inactive") recorder.stop();
  }

  async function submitAnswer() {
    if (!mountedRef.current) return;
    setProcessing(true);

    const answerText = transcriptPartsRef.current.join(" ").trim();
    const mimeType = mimeTypeRef.current || "audio/webm";
    const ext = mimeToExt(mimeType);
    const audioBlob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: mimeType }) : null;

    const formData = new FormData();
    formData.append("category", category);
    formData.append("history", JSON.stringify([
      ...history,
      { role: "interviewer", content: currentQuestion },
    ]));
    formData.append("textAnswer", answerText);
    if (audioBlob && audioBlob.size > 0) formData.append("audio", audioBlob, `answer.${ext}`);

    try {
      const res = await fetch("/api/interview", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      if (!mountedRef.current) return;

      // Update history
      setHistory((prev) => [
        ...prev,
        { role: "interviewer", content: currentQuestion },
        { role: "candidate", content: data.transcript },
      ]);

      if (data.scores) {
        setLastScore(data.scores);
        setAllScores((prev) => [...prev, data.scores]);
      }

      if (data.done) {
        setDone(true);
        setCurrentQuestion("");
      } else {
        setCurrentQuestion(data.nextQuestion);
      }
      setLiveTranscript("");
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (mountedRef.current) setProcessing(false);
    }
  }

  // Average scores for final report
  const avgScore = allScores.length > 0
    ? {
        confidence: Math.round(allScores.reduce((s, x) => s + (x?.confidence ?? 0), 0) / allScores.length),
        relevance: Math.round(allScores.reduce((s, x) => s + (x?.relevance ?? 0), 0) / allScores.length),
        clarity: Math.round(allScores.reduce((s, x) => s + (x?.clarity ?? 0), 0) / allScores.length),
      }
    : null;

  if (!started) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === c.id ? "bg-slate-950 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Conversational mock interview</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">AI-powered {category.toUpperCase()} interview</h2>
          <p className="mt-3 text-sm text-slate-300">
            The AI will ask you real questions and follow up based on exactly what you say — just like a real interviewer. Each answer is scored for confidence, relevance, and clarity.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Opening question</p>
            <p className="mt-1 text-sm text-white">{OPENING_QUESTIONS[category]}</p>
          </div>
          <button type="button" onClick={startInterview}
            className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Start interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chat history */}
      <div className="max-h-80 space-y-3 overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-5">
        {history.map((turn, i) => (
          <div key={i} className={`flex ${turn.role === "candidate" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              turn.role === "interviewer"
                ? "bg-white/10 text-slate-100"
                : "bg-sky-500/20 text-white ring-1 ring-sky-400/30"
            }`}>
              {turn.role === "interviewer" && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Interviewer</p>
              )}
              {turn.content}
            </div>
          </div>
        ))}

        {/* Per-answer score badge */}
        {lastScore && history.length > 0 && !done && (
          <div className="flex justify-end">
            <div className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs text-slate-300">
              <span>Confidence <strong className="text-white">{lastScore.confidence}</strong></span>
              <span>Relevance <strong className="text-white">{lastScore.relevance}</strong></span>
              <span>Clarity <strong className="text-white">{lastScore.clarity}</strong></span>
            </div>
          </div>
        )}

        {/* Current question bubble */}
        {currentQuestion && !done && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Interviewer</p>
              {currentQuestion}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Done state — final report */}
      {done ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
          <p className="text-sm font-semibold text-emerald-300">Interview complete</p>
          {avgScore && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[["Confidence", avgScore.confidence], ["Relevance", avgScore.relevance], ["Clarity", avgScore.clarity]].map(([label, val]) => (
                <div key={label} className="rounded-2xl bg-white/5 p-3 text-center">
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">
            {allScores.length} questions answered · {allScores.length >= 4 ? "Strong session" : "Try a longer session next time"}
          </p>
          <button type="button" onClick={() => { setStarted(false); setDone(false); setHistory([]); setAllScores([]); }}
            className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10">
            Start new interview
          </button>
        </div>
      ) : null}

      {/* Recording UI */}
      {!done && (
        <div className="rounded-3xl border border-white/10 bg-slate-950 p-5 text-white">
          {recording ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">
                  Recording answer · <span className="font-mono text-white">{elapsed}s</span>
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                  Live
                </span>
              </div>
              <div className="mt-3">
                <WaveformVisualizer stream={liveStream} isRecording={recording} />
              </div>
              {liveTranscript && (
                <p className="mt-3 text-xs leading-5 text-slate-400">{liveTranscript}</p>
              )}
              <button type="button" onClick={stopRecording}
                className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Submit answer
              </button>
            </>
          ) : processing ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Analyzing your answer...</p>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 animate-pulse rounded-full bg-sky-400/60" />
              </div>
            </div>
          ) : (
            <>
              {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}
              <button type="button" onClick={startRecording}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                Record your answer
              </button>
              <p className="mt-2 text-xs text-slate-400">Aim for 30–60 seconds per answer</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
