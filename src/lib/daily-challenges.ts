export const CHALLENGE_POOL = [
  {
    type: "speaking",
    prompt: "Introduce your work in 45 seconds, then remove five filler words from a second take.",
  },
  {
    type: "speaking",
    prompt: "Describe a recent achievement in 60 seconds using a clear opening, body, and conclusion.",
  },
  {
    type: "confidence",
    prompt: "Stand tall and deliver a 30-second self-introduction while maintaining steady eye contact with the camera.",
  },
  {
    type: "structure",
    prompt: "Explain your favorite hobby using the pattern: hook, three supporting points, and a closing sentence.",
  },
  {
    type: "fluency",
    prompt: "Read a short paragraph aloud, then paraphrase it in your own words without using 'um', 'like', or 'you know'.",
  },
  {
    type: "conversation",
    prompt: "Answer 'Tell me about yourself' as if you are in a campus placement interview. Keep it under 90 seconds.",
  },
  {
    type: "presentation",
    prompt: "Present one idea from your dream career path as if pitching to a team of five people.",
  },
  {
    type: "reflection",
    prompt: "Write and then speak three sentences about what makes you nervous when presenting, and one strategy to reduce it.",
  },
  {
    type: "drill",
    prompt: "Practice a 20-second pause-free introduction, then repeat it 10% slower to improve clarity.",
  },
  {
    type: "real_world",
    prompt: "Record a 1-minute update you would give in a team meeting about progress on a personal goal.",
  },
] as const;

export function pickDailyChallenge(seed: string, week: number) {
  const weekTypes: Record<number, string[]> = {
    1: ["confidence", "speaking", "drill"],
    2: ["structure", "speaking", "presentation"],
    3: ["conversation", "speaking", "fluency"],
    4: ["presentation", "speaking", "structure"],
    5: ["real_world", "conversation", "fluency"],
    6: ["real_world", "presentation", "confidence"],
  };

  const preferred = weekTypes[Math.min(week, 6)] ?? weekTypes[1];
  const filtered = CHALLENGE_POOL.filter((item) => preferred.includes(item.type));
  const pool = filtered.length > 0 ? filtered : CHALLENGE_POOL;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % pool.length;
  }

  return pool[hash];
}

export function todayKey() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}
