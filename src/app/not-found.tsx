import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(249,250,251,1))]" />
      <div className="relative w-full max-w-md space-y-6 rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur text-center">
        <p className="font-display text-6xl font-semibold text-slate-200">404</p>
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-950">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">This assessment or page doesn&apos;t exist or you don&apos;t have access to it.</p>
        </div>
        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
