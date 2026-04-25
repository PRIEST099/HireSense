import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  label: string;
  delay?: number;
}

export const LowerThird: React.FC<Props> = ({ label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });

  const translateX = interpolate(enter, [0, 1], [-300, 0]);
  const width = interpolate(enter, [0, 1], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 60,
        display: "flex",
        alignItems: "center",
        opacity: enter,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          width: 6,
          height: 56,
          backgroundColor: colors.accentBright,
          marginRight: 18,
          boxShadow: `0 0 16px ${colors.accentBright}`,
        }}
      />
      <div
        style={{
          width,
          overflow: "hidden",
          background: "rgba(10, 14, 26, 0.85)",
          backdropFilter: "blur(12px)",
          padding: "16px 28px",
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            fontWeight: 600,
            color: colors.textPrimary,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
