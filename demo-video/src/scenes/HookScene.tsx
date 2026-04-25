import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const LINES = [
  "A recruiter receives 200 applications.",
  "Spends 80% of time on candidates who don't qualify.",
  "The strongest profiles get missed.",
];

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Subtle radial glow background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}22 0%, transparent 60%)`,
        }}
      />

      {LINES.map((line, i) => {
        const lineDelay = i * 60; // 2 seconds between lines
        const enter = spring({
          frame: frame - lineDelay,
          fps,
          config: { damping: 20, stiffness: 80, mass: 0.8 },
        });
        const translateY = interpolate(enter, [0, 1], [30, 0]);
        const opacity = enter;

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: i === 2 ? 64 : 52,
              color: i === 2 ? colors.accentBright : colors.textPrimary,
              marginBottom: 32,
              textAlign: "center",
              maxWidth: 1400,
              lineHeight: 1.2,
              letterSpacing: -1,
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
