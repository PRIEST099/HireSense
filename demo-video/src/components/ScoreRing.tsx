import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  delay?: number;
  duration?: number;
}

function scoreColor(s: number) {
  if (s >= 85) return colors.paperGreen;
  if (s >= 70) return colors.paperAmber;
  return colors.paperRed;
}

export const ScoreRing: React.FC<Props> = ({
  score,
  size = 90,
  stroke = 7,
  delay = 0,
  duration = 36,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  const progress = interpolate(
    frame,
    [delay, delay + duration],
    [0, score],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const offset = circ * (1 - progress / 100);
  const c = scoreColor(score);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.radarGrid}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size / 2.8,
          fontWeight: 700,
          color: c,
          fontFamily: fonts.caveat,
        }}
      >
        {Math.round(progress)}
      </div>
    </div>
  );
};
