"use client";

import PracticeRecorder from "@/components/dashboard/PracticeRecorder";
import { DISCUSSION_PROMPTS, DISCUSSION_TOPICS } from "@/lib/practice-modes";
import { useMemo, useState } from "react";

export default function GroupDiscussionClient() {
  const [topicIndex, setTopicIndex] = useState(0);
  const [round, setRound] = useState(0);

  const discussion = DISCUSSION_TOPICS[topicIndex];
  const prompt = DISCUSSION_PROMPTS[round];
  const topic = useMemo(
    () => `Discussion: ${discussion.topic} - Round ${round + 1}`,
    [discussion.topic, round],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Group discussion simulator
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-slate-950">{discussion.topic}</h2>
        <p className="mt-3 text-sm text-slate-600">
          Virtual participants: {discussion.participants.join(", ")}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setTopicIndex((value) => (value + 1) % DISCUSSION_TOPICS.length);
              setRound(0);
            }}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            New topic
          </button>
          <button
            type="button"
            onClick={() => setRound((value) => (value + 1) % DISCUSSION_PROMPTS.length)}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Next round
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Round {round + 1} of {DISCUSSION_PROMPTS.length}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold">{prompt}</h3>
        <p className="mt-3 text-sm text-slate-300">
          Participate actively, respond to others, and keep your contribution clear and structured.
        </p>
        <div className="mt-6">
          <PracticeRecorder topic={topic} prompt={prompt} minSeconds={20} submitLabel="Submit contribution" />
        </div>
      </div>
    </div>
  );
}
