"use client";

import { EMERGENCY_EXERCISES } from "@/lib/practice-modes";
import { useState } from "react";

export default function EmergencyBooster() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeExercise = EMERGENCY_EXERCISES.find((item) => item.id === activeId);

  return (
    <div
      id="emergency-booster"
      className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-[0_20px_60px_rgba(245,158,11,0.12)]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
        Emergency confidence booster
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">
        Quick help before a presentation or interview
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Use these short exercises for breathing, posture, and last-minute speaking prep.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {EMERGENCY_EXERCISES.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => setActiveId(exercise.id)}
            className={`rounded-3xl border px-4 py-4 text-left transition ${
              activeId === exercise.id
                ? "border-amber-400 bg-white shadow-sm"
                : "border-amber-200 bg-white/70 hover:border-amber-300"
            }`}
          >
            <p className="font-semibold text-slate-950">{exercise.title}</p>
            <p className="mt-1 text-sm text-slate-600">{exercise.duration}</p>
          </button>
        ))}
      </div>

      {activeExercise ? (
        <div className="mt-5 rounded-3xl border border-amber-200 bg-white p-5">
          <p className="font-semibold text-slate-950">{activeExercise.title}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
            {activeExercise.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Done — I feel ready
          </button>
        </div>
      ) : null}
    </div>
  );
}
