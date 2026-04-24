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
  if (!isShortlisted) return "#9EA2BB";
  if (score >= 80) return "#0D9488";
  if (score >= 60) return "#4F46E5";
  if (score >= 40) return "#B45309";
  return "#B91C1C";
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
      <h4
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--paper-text-1)",
          marginBottom: 12,
        }}
      >
        Score Distribution
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 14, fill: "#6B6F8A", fontFamily: "Caveat, cursive" }}
            axisLine={{ stroke: "rgba(80,110,200,0.18)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 14, fill: "#6B6F8A", fontFamily: "Caveat, cursive" }}
            axisLine={{ stroke: "rgba(80,110,200,0.18)" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value}`, "Score"]}
            labelFormatter={(label) => `Candidate: ${label}`}
            contentStyle={{
              fontSize: 15,
              borderRadius: 5,
              border: "1.5px solid rgba(80,110,200,0.18)",
              fontFamily: "Caveat, cursive",
              background: "#FFFFFF",
              boxShadow: "2px 3px 0 rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)",
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={getScoreColor(entry.score, entry.isShortlisted)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div
        className="flex items-center justify-center gap-4 mt-2"
        style={{ fontSize: 15, color: "var(--paper-text-3)" }}
      >
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#0D9488", display: "inline-block" }} />
          Shortlisted
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#9EA2BB", display: "inline-block" }} />
          Not shortlisted
        </span>
      </div>
    </div>
  );
}
