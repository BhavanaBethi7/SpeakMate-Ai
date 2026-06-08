"use client";

import type { DailyChallengeRecord } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DailyCoachPanelProps = {
  initialChallenge: DailyChallengeRecord;
  currentWeek: number;
};

export default function DailyCoachPanel({
  initialChallenge,
  currentWeek,
}: DailyCoachPanelProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState(initialChallenge);
  const [loading, setLoading] = useState<"start" | "generate" | "complete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [practiceNotes, setPracticeNotes] = useState("");

  useEffect(() => {
    setChallenge(initialChallenge);
  }, [initialChallenge]);

  async function generateChallenge() {
    setLoading("generate");
    setError(null);

    try {
      const response = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not generate a new prompt.");
      setChallenge(data.challenge);
      setShowPractice(false);
      setPracticeNotes("");
      router.refresh();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function completeChallenge() {
    setLoading("complete");
    setError(null);

    try {
      const response = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not complete challenge.");
      setChallenge(data.challenge);
      setShowPractice(false);
      router.refresh();
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div id="daily-coach">
      <div className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-sky-600 to-emerald-500 p-6 text-white shadow-[0_24px_70px_rgba(14,165,233,0.24)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
          Daily AI coach
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold">Today&apos;s prompt</h2>
        <p className="mt-1 text-sm text-white/75">
          Week {currentWeek} focus · {challenge.challengeType.replace("_", " ")}
        </p>
        <p className="mt-4 text-lg leading-8 text-white/90">{challenge.prompt}</p>

        {challenge.completed ? (
          <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
            Completed today
          </p>
        ) : null}

        {error ? <p className="mt-4 text-sm text-rose-100">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {!challenge.completed ? (
            <button
              type="button"
              onClick={() => {
                setLoading("start");
                setShowPractice(true);
                setLoading(null);
              }}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Start challenge
            </button>
          ) : null}
          <button
            type="button"
            disabled={loading === "generate"}
            onClick={generateChallenge}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            {loading === "generate" ? "Generating..." : "Generate new prompt"}
          </button>
        </div>

        {showPractice && !challenge.completed ? (
          <div className="mt-6 rounded-[1.5rem] bg-white/12 p-5 backdrop-blur">
            <p className="text-sm font-medium text-white/80">Practice space</p>
            <p className="mt-2 text-sm leading-7 text-white/85">
              Practice the challenge out loud, then jot a quick reflection on how it felt.
            </p>
            <textarea
              value={practiceNotes}
              onChange={(event) => setPracticeNotes(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-2xl border border-white/20 bg-black/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50"
              placeholder="Optional reflection: What felt hard? What improved?"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading === "complete"}
                onClick={completeChallenge}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
              >
                {loading === "complete" ? "Saving..." : "Mark challenge complete"}
              </button>
              <button
                type="button"
                onClick={() => setShowPractice(false)}
                className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
