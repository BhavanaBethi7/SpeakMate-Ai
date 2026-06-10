"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type DashboardHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Truncate long names (roll numbers etc) to first word or 16 chars
  const rawName = user.name ?? user.email?.split("@")[0] ?? "User";
  const displayName = rawName.length > 16 ? rawName.split(" ")[0] : rawName;

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="relative rounded-3xl border border-white/70 bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        {/* Logo */}
        <Link href="/dashboard" className="group min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition group-hover:text-slate-700 sm:text-sm">
            SpeakMate AI
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">Your coaching dashboard</p>
        </Link>

        <div className="flex items-center gap-2">
          {/* Avatar — always visible */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 py-1 pl-1 pr-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={displayName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="max-w-[96px] truncate text-xs font-semibold text-slate-900 sm:max-w-[140px] sm:text-sm">
              {displayName}
            </p>
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-white md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect y="3" width="16" height="1.5" rx="0.75" fill="currentColor" />
                <rect y="7.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
                <rect y="11.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "/dashboard#progress", label: "Progress" },
              { href: "/dashboard/interview", label: "Interview" },
              { href: "/dashboard/discussion", label: "Discussion" },
              { href: "/dashboard#roadmap", label: "Roadmap" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { href: "/dashboard#progress", label: "Progress" },
              { href: "/dashboard/interview", label: "Interview" },
              { href: "/dashboard/discussion", label: "Discussion" },
              { href: "/dashboard#roadmap", label: "Roadmap" },
              { href: "/", label: "Home" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-1 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
