import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEnter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const tagEnter = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const linksEnter = spring({
    frame: frame - 90,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}33 0%, transparent 60%)`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          opacity: logoEnter,
          transform: `scale(${interpolate(logoEnter, [0, 1], [0.7, 1])})`,
          display: "flex",
          alignItems: "center",
          gap: 28,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentBright} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 800,
            color: "#fff",
            boxShadow: `0 24px 80px ${colors.accent}66`,
          }}
        >
          H
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 120,
            fontWeight: 800,
            color: colors.textPrimary,
            letterSpacing: -3,
          }}
        >
          HireSense<span style={{ color: colors.accentBright }}>.AI</span>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagEnter,
          transform: `translateY(${interpolate(tagEnter, [0, 1], [20, 0])}px)`,
          fontFamily: fonts.display,
          fontSize: 40,
          fontStyle: "italic",
          color: colors.textPrimary,
          maxWidth: 1300,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        Not a hackathon prototype.
      </div>
      <div
        style={{
          opacity: tagEnter,
          transform: `translateY(${interpolate(tagEnter, [0, 1], [20, 0])}px)`,
          fontFamily: fonts.display,
          fontSize: 40,
          color: colors.accentBright,
          maxWidth: 1300,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 80,
          fontWeight: 700,
        }}
      >
        The screening tool Umurava recruiters will use tomorrow.
      </div>

      {/* Links */}
      <div
        style={{
          opacity: linksEnter,
          transform: `translateY(${interpolate(linksEnter, [0, 1], [20, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 28,
            color: colors.textPrimary,
            background: colors.bgElevated,
            border: `1px solid ${colors.accentBright}`,
            padding: "16px 40px",
            borderRadius: 12,
            letterSpacing: 0.5,
          }}
        >
          🔗 hire-sense-omega.vercel.app
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            color: colors.textSecondary,
            letterSpacing: 0.5,
          }}
        >
          📂 github.com/PRIEST099/HireSense
        </div>
      </div>
    </AbsoluteFill>
  );
};
