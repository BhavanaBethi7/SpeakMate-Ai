import Link from "next/link";

const assessmentTopics = [
  "Tell me about yourself",
  "Describe your dream career",
  "Explain a favorite hobby",
  "Introduce yourself to a new team",
];

const coreFeatures = [
  {
    title: "Speech analysis engine",
    description:
      "Measures clarity, fluency, filler words, pacing, vocabulary richness, and speech structure in one baseline recording.",
  },
  {
    title: "Confidence detection",
    description:
      "Estimates confidence, nervousness, and improvement potential using voice stability, hesitation patterns, and tone variation.",
  },
  {
    title: "Emotion and delivery analysis",
    description:
      "Detects nervousness, excitement, stress, and monotone delivery so the AI can coach emotional expression, not just word choice.",
  },
  {
    title: "Root cause identification",
    description:
      "Explains whether the real blocker is fear of judgment, language gaps, structure issues, or anxiety-based pauses.",
  },
  {
    title: "Personal growth roadmap",
    description:
      "Builds an adaptive 6-week plan that evolves from confidence building to real-world practice.",
  },
  {
    title: "Daily AI coach",
    description:
      "Delivers speaking challenges, reflection prompts, and confidence drills to build consistent communication habits.",
  },
];

const audienceCards = [
  {
    label: "School students",
    detail: "Classroom presentations, storytelling, speech competitions",
  },
  {
    label: "College students",
    detail: "Seminars, group discussions, campus placements, interviews",
  },
  {
    label: "Job seekers",
    detail: "HR interviews, technical interviews, professional communication",
  },
  {
    label: "Professionals",
    detail: "Client presentations, team meetings, leadership communication",
  },
];

const roadmap = [
  ["Week 1", "Confidence building"],
  ["Week 2", "Communication structure"],
  ["Week 3", "Conversation skills"],
  ["Week 4", "Presentation skills"],
  ["Week 5", "Advanced communication"],
  ["Week 6", "Real-world practice"],
];

const rootCauses = [
  {
    title: "Fear of judgment",
    copy: "Good speaking ability, but low confidence and high self-monitoring.",
  },
  {
    title: "Language barrier",
    copy: "Hesitation caused by limited vocabulary and difficulty forming precise sentences.",
  },
  {
    title: "Structure issues",
    copy: "Ideas exist, but the speech lacks a clear opening, flow, or conclusion.",
  },
  {
    title: "Anxiety-based pauses",
    copy: "Frequent interruptions caused by pressure, overthinking, or a rushed delivery pattern.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              SpeakMate AI
            </p>
            <p className="text-sm text-slate-600">
              AI-powered communication confidence companion
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Personalized coaching for stage fear, interviews, and presentations
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Build speaking confidence with an AI companion that understands the
                <span className="text-sky-600"> real reason </span>
                you hesitate.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                SpeakMate AI records a baseline speech, analyzes delivery, detects root causes,
                and generates a coaching roadmap that adapts from first presentation to real-world
                communication practice.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#features"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore features
              </a>
              <a
                href="#roadmap"
                className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                View roadmap
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Confidence", "+ personalized feedback"],
                ["Clarity", "+ speech structure"],
                ["Consistency", "+ daily speaking habits"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="assessment" className="relative">
            <div className="absolute -left-8 top-10 h-20 w-20 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -right-6 bottom-16 h-28 w-28 rounded-full bg-amber-400/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                    Baseline assessment
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    1 to 2 minute speech recording
                  </h2>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus</p>
                  <p className="mt-1 text-sm font-semibold text-white">Confidence + clarity</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-sm font-medium text-slate-300">Sample prompts</p>
                  <div className="mt-4 space-y-3">
                    {assessmentTopics.map((topic) => (
                      <div key={topic} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl bg-gradient-to-br from-sky-400/20 to-emerald-400/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Confidence score</p>
                    <div className="mt-3 flex items-end gap-3">
                      <p className="font-display text-5xl font-semibold">78</p>
                      <p className="pb-1 text-sm text-emerald-300">+12 this week</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Nervousness</span>
                      <span>Moderate</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-3/5 rounded-full bg-amber-400" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>Improvement potential</span>
                      <span className="text-emerald-300">High</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-sm font-medium text-slate-300">AI diagnosis preview</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  Your delivery is clear, but hesitation increases when speaking without a fixed structure.
                  The main blocker appears to be anxiety-based pauses rather than vocabulary gaps.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-8 sm:grid-cols-2 xl:grid-cols-4">
          {audienceCards.map((card) => (
            <article key={card.label} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur">
              <p className="font-display text-xl font-semibold text-slate-950">{card.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </section>

        <section id="features" className="py-8 sm:py-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Core features
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
              The platform focuses on diagnosis, coaching, and habit building.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {coreFeatures.map((feature) => (
              <article key={feature.title} className="rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur">
                <h3 className="font-display text-2xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Root causes
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">
              SpeakMate AI explains why the user struggles, not just how they scored.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {rootCauses.map((cause) => (
                <div key={cause.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{cause.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{cause.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="roadmap" className="rounded-[2rem] border border-slate-950/10 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
              Growth roadmap
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              A 6-week coaching path that adapts as the learner improves.
            </h2>

            <div className="mt-6 space-y-3">
              {roadmap.map(([week, focus], index) => (
                <div key={week} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{week}</p>
                    <p className="text-lg font-semibold text-white">{focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 pb-16">
          <div className="rounded-[2rem] border border-white/80 bg-gradient-to-r from-sky-600 to-emerald-500 p-8 text-white shadow-[0_24px_70px_rgba(14,165,233,0.24)]">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                  Daily AI coach
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  A companion that keeps users practicing after the first assessment.
                </h2>
                <p className="mt-4 max-w-2xl text-white/90">
                  Each day can include a short challenge, a reflection question, a speaking drill, or a real-world
                  practice task tailored to the user’s confidence level and current bottleneck.
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-white/12 p-5 backdrop-blur">
                <p className="text-sm font-medium text-white/80">Today’s prompt</p>
                <p className="mt-2 text-xl font-semibold text-white">Introduce your work in 45 seconds, then remove five filler words.</p>
                <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Generate challenge
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
