"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillRadarChartProps {
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    cultureFitMatch: number;
  };
  candidateName?: string;
}

export function SkillRadarChart({ breakdown, candidateName }: SkillRadarChartProps) {
  const data = [
    { dimension: "Skills", score: breakdown.skillsMatch },
    { dimension: "Experience", score: breakdown.experienceMatch },
    { dimension: "Education", score: breakdown.educationMatch },
    { dimension: "Culture Fit", score: breakdown.cultureFitMatch },
  ];

  return (
    <div>
      {candidateName && <h4 className="text-sm font-bold text-gray-700 mb-2 text-center">{candidateName}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13, fill: "#6b7280" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} />
          <Tooltip
            formatter={(value) => [`${value}`, "Score"]}
            contentStyle={{ fontSize: 14, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
