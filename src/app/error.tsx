"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  const isAiError = error.message?.toLowerCase().includes("groq") ||
    error.message?.toLowerCase().includes("transcri") ||
    error.message?.toLowerCase().includes("api") ||
    error.message?.toLowerCase().includes("quota");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.10),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(249,250,251,1))]" />
      <div className="relative w-full max-w-md space-y-6 rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-rose-500">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-950">
            {isAiError ? "Analysis failed" : "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isAiError
              ? "The AI analysis service ran into an issue. This is usually temporary — try again in a moment."
              : "An unexpected error occurred. Your data is safe."}
          </p>
          {error.message && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{error.message}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
          <a href="/dashboard" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
