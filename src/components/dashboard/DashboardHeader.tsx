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
  const displayName = user.name ?? user.email?.split("@")[0] ?? "User";

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <Link href="/dashboard" className="group">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500 transition group-hover:text-slate-700">
          SpeakMate AI
        </p>
        <p className="text-sm text-slate-600">Your coaching dashboard</p>
      </Link>

      <nav className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard#progress"
          className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          Progress
        </Link>
        <Link
          href="/dashboard/interview"
          className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          Interview
        </Link>
        <Link
          href="/dashboard/discussion"
          className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          Discussion
        </Link>
        <Link
          href="/dashboard#roadmap"
          className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          Roadmap
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
        >
          Home
        </Link>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 py-1.5 pl-1.5 pr-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </nav>
    </header>
  );
}
