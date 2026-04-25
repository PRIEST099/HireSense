import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEnter = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.5 },
  });

  const taglineEnter = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const logoScale = interpolate(logoEnter, [0, 1], [0.6, 1]);
  const taglineY = interpolate(taglineEnter, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Gradient backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgElevated} 100%)`,
        }}
      />

      {/* Animated grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border}33 1px, transparent 1px),
                            linear-gradient(90deg, ${colors.border}33 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.4,
        }}
      />

      {/* Logo + brand */}
      <div
        style={{
          opacity: logoEnter,
          transform: `scale(${logoScale})`,
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentBright} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 800,
            color: "#fff",
            boxShadow: `0 20px 60px ${colors.accent}66`,
          }}
        >
          H
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 96,
            fontWeight: 800,
            color: colors.textPrimary,
            letterSpacing: -2,
          }}
        >
          HireSense<span style={{ color: colors.accentBright }}>.AI</span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineEnter,
          transform: `translateY(${taglineY}px)`,
          fontFamily: fonts.body,
          fontSize: 32,
          color: colors.textSecondary,
          maxWidth: 1100,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        AI-powered talent screening built on Gemini.
        <br />
        Designed for Umurava's ecosystem. Ready to ship today.
      </div>

      <Caption text="hire-sense-omega.vercel.app" position="bottom" delay={150} size="md" />
    </AbsoluteFill>
  );
};
