"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CandidateScore {
  name: string;
  score: number;
  rank: number;
}

interface ScoreDistributionChartProps {
  candidates: CandidateScore[];
  shortlistSize: number;
}

function getScoreColor(score: number, isShortlisted: boolean): string {
  if (!isShortlisted) return "#d1d5db";
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}

export function ScoreDistributionChart({ candidates, shortlistSize }: ScoreDistributionChartProps) {
  const data = candidates.map((c) => ({
    name: c.name.split(" ")[0],
    score: c.score,
    rank: c.rank,
    isShortlisted: c.rank <= shortlistSize,
  }));

  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 mb-3">Score Distribution</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [`${value}`, "Score"]}
            labelFormatter={(label) => `Candidate: ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={getScoreColor(entry.score, entry.isShortlisted)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Shortlisted</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> Not shortlisted</span>
      </div>
    </div>
  );
}
