export const ROADMAP = [
  { week: 1, label: "Week 1", focus: "Confidence building" },
  { week: 2, label: "Week 2", focus: "Communication structure" },
  { week: 3, label: "Week 3", focus: "Conversation skills" },
  { week: 4, label: "Week 4", focus: "Presentation skills" },
  { week: 5, label: "Week 5", focus: "Advanced communication" },
  { week: 6, label: "Week 6", focus: "Real-world practice" },
] as const;

export const ASSESSMENT_TOPICS = [
  "Tell me about yourself",
  "Describe your dream career",
  "Explain your favorite hobby",
  "Introduce yourself to a new team",
] as const;

export type AssessmentTopic = (typeof ASSESSMENT_TOPICS)[number];

export const ROOT_CAUSES = {
  fear_of_judgment: {
    title: "Fear of judgment",
    copy: "Good speaking ability, but low confidence and high self-monitoring.",
  },
  language_barrier: {
    title: "Language barrier",
    copy: "Hesitation caused by limited vocabulary and difficulty forming precise sentences.",
  },
  structure_issues: {
    title: "Communication structure issues",
    copy: "Ideas exist, but the speech lacks a clear opening, flow, or conclusion.",
  },
  anxiety_pauses: {
    title: "Anxiety-based pauses",
    copy: "Frequent interruptions caused by pressure, overthinking, or a rushed delivery pattern.",
  },
} as const;

export type RootCauseKey = keyof typeof ROOT_CAUSES;
