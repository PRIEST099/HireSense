import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const LINES = [
  "A recruiter receives 200 applications.",
  "Spends 80% of their time screening.",
  "The strongest profiles get missed.",
];

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.paperBg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Paper grid background */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.5 }}
      >
        <defs>
          <pattern id="hookGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(90, 120, 210, 0.18)" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hookGrid)" />
      </svg>

      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 0%, transparent 60%)",
        }}
      />

      {LINES.map((line, i) => {
        const lineDelay = i * 60;
        const enter = spring({
          frame: frame - lineDelay,
          fps,
          config: { damping: 22, stiffness: 80, mass: 0.8 },
        });
        const translateY = interpolate(enter, [0, 1], [40, 0]);
        const isAccent = i === 2;

        return (
          <div
            key={i}
            style={{
              opacity: enter,
              transform: `translateY(${translateY}px)`,
              fontFamily: fonts.caveat,
              fontWeight: 700,
              fontSize: isAccent ? 84 : 64,
              color: isAccent ? colors.paperAccent : colors.paperText1,
              marginBottom: 24,
              textAlign: "center",
              maxWidth: 1500,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              textShadow: isAccent ? "2px 3px 0 rgba(23, 24, 38, 0.15)" : "none",
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
