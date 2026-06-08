"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProgressChartsProps = {
  history: Array<{
    date: string;
    confidence: number;
    fluency: number;
    overall: number;
  }>;
};

export default function ProgressCharts({ history }: ProgressChartsProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
        Complete more assessments to unlock confidence and fluency trend graphs.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="confidence" stroke="#0ea5e9" strokeWidth={2} dot />
          <Line type="monotone" dataKey="fluency" stroke="#10b981" strokeWidth={2} dot />
          <Line type="monotone" dataKey="overall" stroke="#0f172a" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
