import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  label: string;
  score: number; // 0-100
  delay?: number;
  duration?: number;
}

export const ScoreBar: React.FC<Props> = ({
  label,
  score,
  delay = 0,
  duration = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay, delay + duration],
    [0, score],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const barColor =
    score >= 80 ? colors.scoreHigh : score >= 60 ? colors.scoreMid : colors.scoreLow;

  return (
    <div style={{ marginBottom: 20, width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textPrimary,
        }}
      >
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontWeight: 700,
            color: barColor,
          }}
        >
          {Math.round(progress)}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 14,
          backgroundColor: colors.border,
          borderRadius: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: 7,
            boxShadow: `0 0 16px ${barColor}66`,
          }}
        />
      </div>
    </div>
  );
};
