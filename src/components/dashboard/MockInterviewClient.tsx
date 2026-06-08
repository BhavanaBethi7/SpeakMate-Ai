"use client";

import PracticeRecorder from "@/components/dashboard/PracticeRecorder";
import { INTERVIEW_QUESTIONS } from "@/lib/practice-modes";
import { useMemo, useState } from "react";

const categories = [
  { id: "hr", label: "HR questions" },
  { id: "behavioral", label: "Behavioral questions" },
  { id: "technical", label: "Technical questions" },
] as const;

export default function MockInterviewClient() {
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>("hr");
  const [questionIndex, setQuestionIndex] = useState(0);

  const questions = INTERVIEW_QUESTIONS[category];
  const question = questions[questionIndex];
  const topic = useMemo(() => `Interview: ${category} - ${question}`, [category, question]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setCategory(item.id);
              setQuestionIndex(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              category === item.id
                ? "bg-slate-950 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Mock interview</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">{question}</h2>
        <p className="mt-3 text-sm text-slate-300">
          Answer naturally for 30–90 seconds. SpeakMate will evaluate confidence, fluency, and
          communication quality.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setQuestionIndex((value) => (value + 1) % questions.length)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Next question
          </button>
        </div>

        <div className="mt-6">
          <PracticeRecorder topic={topic} prompt={question} minSeconds={20} submitLabel="Submit answer" />
        </div>
      </div>
    </div>
  );
}
