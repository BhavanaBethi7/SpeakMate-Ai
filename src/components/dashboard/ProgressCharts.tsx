"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

type HistoryPoint = { date: string; confidence: number; fluency: number; overall: number };

type Props = {
  history: HistoryPoint[];
  confidenceGrowth?: number | null;
  fluencyGrowth?: number | null;
};

function GrowthBadge({ value, label }: { value: number | null | undefined; label: string }) {
  if (value === null || value === undefined) return null;
  const positive = value >= 0;
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      <span>{positive ? "▲" : "▼"}</span>
      <span>{Math.abs(value)} pts</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  );
}

// FIX 8: Show actual progress with growth badges, session count, trend annotations
export default function ProgressCharts({ history, confidenceGrowth, fluencyGrowth }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-400">
            <path d="M3 17l6-6 4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No progress data yet</p>
        <p className="mt-1 text-xs text-slate-500">Complete 2+ assessments to see your confidence and fluency trend.</p>
      </div>
    );
  }

  const latest = history[history.length - 1];
  const first = history[0];
  const overallGrowth = history.length >= 2 ? latest.overall - first.overall : null;

  return (
    <div className="space-y-4">
      {/* Growth summary row */}
      {history.length >= 2 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{history.length} sessions</span>
          <span className="text-slate-200">·</span>
          <GrowthBadge value={confidenceGrowth} label="confidence" />
          <GrowthBadge value={fluencyGrowth} label="fluency" />
          <GrowthBadge value={overallGrowth} label="overall" />
        </div>
      )}

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
            {/* Reference line at 70 — "competent speaker" threshold */}
            <ReferenceLine y={70} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: "Target", position: "insideTopRight", fill: "#cbd5e1", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}
              formatter={(value: number, name: string) => [`${value}/100`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="fluency" name="Fluency" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="overall" name="Overall" stroke="#0f172a" strokeWidth={2} dot={{ r: 3, fill: "#0f172a", strokeWidth: 0 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Latest scores row */}
      <div className="grid grid-cols-3 gap-3">
        {[["Confidence", latest.confidence, "#0ea5e9"], ["Fluency", latest.fluency, "#10b981"], ["Overall", latest.overall, "#0f172a"]].map(([label, val, color]) => (
          <div key={label as string} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold" style={{ color: color as string }}>{val}</p>
            <p className="text-[10px] text-slate-400">/ 100</p>
          </div>
        ))}
      </div>
    </div>
  );
}
