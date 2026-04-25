import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  skills: number;
  experience: number;
  education: number;
  culture: number;
  size?: number;
  delay?: number;
}

/**
 * Faithful port of src/components/paper/RadarChart.tsx
 * Animates: grid rings → spokes → polygon trace → labels
 */
export const RadarChart: React.FC<Props> = ({
  skills,
  experience,
  education,
  culture,
  size = 220,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const dims = [skills, experience, education, culture];
  const labels = ["Skills", "Exp", "Edu", "Culture"];

  function pt(i: number, v: number): [number, number] {
    const a = (i / dims.length) * 2 * Math.PI - Math.PI / 2;
    const r = (v / 100) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  const polyPoints = dims.map((v, i) => pt(i, v));

  // Polygon draw progress (frames after delay+15)
  const polyProgress = interpolate(
    frame,
    [delay + 15, delay + 50],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f, idx) => {
        const ringOpacity = interpolate(
          frame,
          [delay + idx * 2, delay + 6 + idx * 2],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const pts = dims
          .map((_, i) => {
            const a = (i / dims.length) * 2 * Math.PI - Math.PI / 2;
            const r = R * f;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          })
          .join(" ");
        return (
          <polygon
            key={f}
            points={pts}
            fill="none"
            stroke={colors.radarGrid}
            strokeWidth={1}
            opacity={ringOpacity}
          />
        );
      })}

      {/* Spokes */}
      {dims.map((_, i) => {
        const [x, y] = pt(i, 100);
        const spokeOpacity = interpolate(
          frame,
          [delay + 8 + i * 1.5, delay + 14 + i * 1.5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={colors.radarGrid}
            strokeWidth={1}
            opacity={spokeOpacity}
          />
        );
      })}

      {/* Value polygon */}
      <polygon
        points={polyPoints
          .map(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return `${cx + dx * polyProgress},${cy + dy * polyProgress}`;
          })
          .join(" ")}
        fill={colors.paperAccentSoft}
        stroke={colors.paperAccent}
        strokeWidth={2}
        opacity={polyProgress}
      />

      {/* Labels */}
      {dims.map((_, i) => {
        const [x, y] = pt(i, 100);
        const lx = cx + (x - cx) * 1.3;
        const ly = cy + (y - cy) * 1.3;
        const labelOpacity = interpolate(
          frame,
          [delay + 50 + i * 3, delay + 56 + i * 3],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fill={colors.paperText3}
            fontSize={16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fonts.caveat}
            fontWeight={700}
            opacity={labelOpacity}
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
};
