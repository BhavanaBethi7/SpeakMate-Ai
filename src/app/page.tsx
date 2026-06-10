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
    description: "Measures clarity, fluency, filler words, pacing, vocabulary richness, and speech structure in one baseline recording.",
  },
  {
    title: "Confidence detection",
    description: "Estimates confidence, nervousness, and improvement potential using voice stability, hesitation patterns, and tone variation.",
  },
  {
    title: "Emotion and delivery analysis",
    description: "Detects nervousness, excitement, stress, and monotone delivery so the AI can coach emotional expression, not just word choice.",
  },
  {
    title: "Root cause identification",
    description: "Explains whether the real blocker is fear of judgment, language gaps, structure issues, or anxiety-based pauses.",
  },
  {
    title: "Personal growth roadmap",
    description: "Builds an adaptive 6-week plan that evolves from confidence building to real-world practice.",
  },
  {
    title: "Daily AI coach",
    description: "Delivers speaking challenges, reflection prompts, and confidence drills to build consistent communication habits.",
  },
];

const audienceCards = [
  { label: "School students",  detail: "Classroom presentations, storytelling, speech competitions" },
  { label: "College students", detail: "Seminars, group discussions, campus placements, interviews" },
  { label: "Job seekers",      detail: "HR interviews, technical interviews, professional communication" },
  { label: "Professionals",    detail: "Client presentations, team meetings, leadership communication" },
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
  { title: "Fear of judgment",    copy: "Good speaking ability, but low confidence and high self-monitoring." },
  { title: "Language barrier",    copy: "Hesitation caused by limited vocabulary and difficulty forming precise sentences." },
  { title: "Structure issues",    copy: "Ideas exist, but the speech lacks a clear opening, flow, or conclusion." },
  { title: "Anxiety-based pauses", copy: "Frequent interruptions caused by pressure, overthinking, or a rushed delivery pattern." },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-8 lg:px-12">

        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-full sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-sm sm:tracking-[0.35em]">
              SpeakMate AI
            </p>
            <p className="hidden text-xs text-slate-500 sm:block sm:text-sm">
              AI-powered communication confidence companion
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="grid flex-1 items-center gap-8 py-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-16">
          <div className="space-y-5 sm:space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Personalized coaching for stage fear, interviews, and presentations
            </div>

            {/* Headline — responsive sizes */}
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Build speaking confidence with an AI companion that understands the{" "}
              <span className="text-sky-600">real reason</span> you struggle.
            </h1>

            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              SpeakMate identifies root causes of communication anxiety, creates a personalized coaching plan, and guides you every step of the way.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:py-3"
              >
                Start for free
              </Link>
              <a
                href="#features"
                className="rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:px-6 sm:py-3"
              >
                Explore features
              </a>
            </div>

            {/* 3 stats — single row on mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                ["Confidence", "+ personalized feedback"],
                ["Clarity",    "+ speech structure"],
                ["Consistency","+ daily habits"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-3xl sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.3em]">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-900 sm:mt-2 sm:text-base">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment demo card */}
          <div id="assessment" className="relative">
            <div className="absolute -left-8 top-10 h-20 w-20 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -right-6 bottom-16 h-28 w-28 rounded-full bg-amber-400/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-slate-950 p-4 text-white shadow-[0_30px_100px_rgba(15,23,42,0.2)] sm:rounded-[2rem] sm:p-5">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Baseline assessment</p>
                  <h2 className="mt-1 text-xl font-semibold sm:mt-2 sm:text-3xl">
                    Record a 1–2 minute speech
                  </h2>
                </div>
                <div className="shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 text-right sm:rounded-2xl sm:px-3 sm:py-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Focus</p>
                  <p className="mt-0.5 text-xs font-semibold text-white sm:text-sm">Confidence + clarity</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:rounded-3xl sm:p-4">
                  <p className="text-xs font-medium text-slate-300 sm:text-sm">Sample prompts</p>
                  <div className="mt-3 space-y-2">
                    {assessmentTopics.map((topic) => (
                      <div key={topic} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-emerald-400/10 p-3 ring-1 ring-white/10 sm:rounded-3xl sm:p-4">
                    <p className="text-xs text-slate-300 sm:text-sm">Confidence score</p>
                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-4xl font-semibold sm:text-5xl">78</p>
                      <p className="pb-0.5 text-xs text-emerald-300 sm:text-sm">+12 this week</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:rounded-3xl sm:p-4">
                    <div className="flex items-center justify-between text-xs text-slate-300 sm:text-sm">
                      <span>Nervousness</span><span>Moderate</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 sm:mt-3 sm:h-2">
                      <div className="h-full w-3/5 rounded-full bg-amber-400" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300 sm:mt-4 sm:text-sm">
                      <span>Improvement potential</span>
                      <span className="text-emerald-300">High</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:rounded-[1.5rem] sm:p-4">
                <p className="text-xs font-medium text-slate-300 sm:text-sm">AI diagnosis preview</p>
                <p className="mt-1.5 text-xs leading-6 text-slate-200 sm:mt-2 sm:text-sm sm:leading-7">
                  Your delivery is clear, but hesitation increases when speaking without a fixed structure. The main blocker appears to be anxiety-based pauses rather than vocabulary gaps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Audience cards ── */}
        <section className="grid grid-cols-2 gap-3 pb-8 sm:gap-4 xl:grid-cols-4">
          {audienceCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur sm:rounded-[1.75rem] sm:p-5">
              <p className="font-display text-base font-semibold text-slate-950 sm:text-xl">{card.label}</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-7">{card.detail}</p>
            </article>
          ))}
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-8 sm:py-12">
          <div className="max-w-2xl space-y-2 sm:space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-sm sm:tracking-[0.35em]">
              Core features
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl sm:text-4xl">
              The platform focuses on diagnosis, coaching, and habit building.
            </h2>
          </div>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {coreFeatures.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur sm:rounded-[1.75rem] sm:p-6">
                <h3 className="font-display text-lg font-semibold text-slate-950 sm:text-2xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:leading-7">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Root causes + Roadmap ── */}
        <section className="grid gap-4 py-8 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[2rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-sm sm:tracking-[0.35em]">Root causes</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-slate-950 sm:mt-3 sm:text-3xl">
              SpeakMate explains why you struggle, not just how you scored.
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
              {rootCauses.map((cause) => (
                <div key={cause.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:rounded-3xl sm:p-4">
                  <p className="text-sm font-semibold text-slate-950 sm:text-base">{cause.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-7">{cause.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="roadmap" className="rounded-2xl border border-slate-950/10 bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:rounded-[2rem] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-sm sm:tracking-[0.35em]">Growth roadmap</p>
            <h2 className="mt-2 font-display text-xl font-semibold sm:mt-3 sm:text-3xl">
              A 6-week coaching path that adapts as you improve.
            </h2>
            <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
              {roadmap.map(([week, focus], index) => (
                <div key={week} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:gap-4 sm:rounded-3xl sm:px-4 sm:py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-950 sm:h-11 sm:w-11 sm:rounded-2xl">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 sm:text-sm">{week}</p>
                    <p className="truncate text-sm font-semibold text-white sm:text-lg">{focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Daily coach CTA ── */}
        <section className="py-8 pb-16">
          <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-sky-600 to-emerald-500 p-5 text-white shadow-[0_24px_70px_rgba(14,165,233,0.24)] sm:rounded-[2rem] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80 sm:text-sm sm:tracking-[0.35em]">
                  Daily AI coach
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold sm:mt-3 sm:text-3xl sm:text-4xl">
                  A companion that keeps you practicing after the first assessment.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/90 sm:mt-4 sm:text-base sm:leading-7">
                  Each day includes a short challenge, reflection question, or speaking drill tailored to your confidence level and current bottleneck.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-5">
                <p className="text-xs font-medium text-white/80 sm:text-sm">Today's prompt</p>
                <p className="mt-2 text-base font-semibold text-white sm:text-xl">
                  Introduce your work in 45 seconds, then remove five filler words.
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Start free
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
