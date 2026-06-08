export const EMERGENCY_EXERCISES = [
  {
    id: "box_breathing",
    title: "Box breathing",
    duration: "2 min",
    steps: [
      "Inhale through your nose for 4 seconds.",
      "Hold your breath for 4 seconds.",
      "Exhale slowly for 4 seconds.",
      "Hold empty for 4 seconds and repeat 4 times.",
    ],
  },
  {
    id: "power_posture",
    title: "Power posture reset",
    duration: "1 min",
    steps: [
      "Stand or sit tall with shoulders relaxed.",
      "Take 3 slow breaths while looking forward.",
      "Say one sentence out loud: 'I am prepared and calm.'",
    ],
  },
  {
    id: "sixty_second_pitch",
    title: "60-second pitch drill",
    duration: "1 min",
    steps: [
      "State your name and one key point.",
      "Share one supporting detail.",
      "Close with a confident thank-you line.",
    ],
  },
  {
    id: "filler_reset",
    title: "Filler word reset",
    duration: "90 sec",
    steps: [
      "Speak for 30 seconds about any topic.",
      "Pause for 5 seconds between each sentence.",
      "Repeat the same idea without using um, like, or you know.",
    ],
  },
] as const;

export const INTERVIEW_QUESTIONS = {
  hr: [
    "Tell me about yourself.",
    "Why do you want this role?",
    "Describe a challenge you overcame.",
    "What are your strengths and weaknesses?",
  ],
  behavioral: [
    "Tell me about a time you worked under pressure.",
    "Describe a situation where you showed leadership.",
    "How do you handle constructive criticism?",
    "Give an example of resolving a team conflict.",
  ],
  technical: [
    "Walk me through a project you are proud of.",
    "Explain a complex topic in simple terms.",
    "How do you approach learning a new skill quickly?",
    "Describe how you debug or solve problems.",
  ],
} as const;

export const DISCUSSION_TOPICS = [
  {
    topic: "Should remote work become the default for all companies?",
    participants: ["Alex", "Priya", "Jordan", "Sam"],
  },
  {
    topic: "Is social media more helpful or harmful for students?",
    participants: ["Morgan", "Riya", "Chris", "Taylor"],
  },
  {
    topic: "Should AI tools be allowed in classrooms?",
    participants: ["Dev", "Ananya", "Casey", "Noah"],
  },
] as const;

export const DISCUSSION_PROMPTS = [
  "Share your opening opinion in under 45 seconds.",
  "Respond to one virtual participant and add a new point.",
  "Summarize the discussion and state your final stance.",
];
