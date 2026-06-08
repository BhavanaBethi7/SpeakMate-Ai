import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GroupDiscussionClient from "@/components/dashboard/GroupDiscussionClient";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GroupDiscussionPage() {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { name?: string | null; email?: string | null; image?: string | null };
  } | null;
  if (!session?.user?.email) redirect("/signin");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(249,250,251,1))]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-6 sm:px-10 lg:px-12">
        <DashboardHeader user={session.user} />
        <Link href="/dashboard" className="text-sm font-medium text-sky-600 hover:text-sky-700">
          ← Back to dashboard
        </Link>
        <GroupDiscussionClient />
      </div>
    </main>
  );
}
