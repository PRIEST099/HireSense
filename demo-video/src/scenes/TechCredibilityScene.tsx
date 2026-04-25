import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const STATS = [
  { value: "28", label: "Tests Passing", color: colors.scoreHigh },
  { value: "100%", label: "TypeScript", color: colors.accentBright },
  { value: "v2.0.0", label: "Prompt Version", color: "#A78BFA" },
  { value: "Zod", label: "AI Output Validation", color: colors.scoreMid },
];

const FEATURES = [
  "✓ Umurava Talent Profile Schema integrated",
  "✓ SSRF-protected resume URL fetching",
  "✓ Token-bucket rate limiting (Gemini free tier)",
  "✓ Retry logic with exponential backoff",
  "✓ Documented prompt engineering (docs/ai-prompts.md)",
  "✓ NextAuth.js with bcrypt + JWT sessions",
];

export const TechCredibilityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, padding: 80, paddingTop: 100 }}>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 44,
          fontWeight: 700,
          color: colors.textPrimary,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Production-Grade Engineering
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textSecondary,
          marginBottom: 56,
          textAlign: "center",
        }}
      >
        Not a hackathon prototype. Built right.
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          marginBottom: 56,
        }}
      >
        {STATS.map((s, i) => {
          const enter = spring({
            frame: frame - i * 10,
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          return (
            <div
              key={s.label}
              style={{
                opacity: enter,
                transform: `scale(${interpolate(enter, [0, 1], [0.8, 1])})`,
                background: colors.bgElevated,
                border: `1px solid ${s.color}`,
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 56,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 16,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature list */}
      <div
        style={{
          background: colors.bgElevated,
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 40,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {FEATURES.map((f, i) => {
            const enter = spring({
              frame: frame - 50 - i * 8,
              fps,
              config: { damping: 18, stiffness: 100 },
            });
            return (
              <div
                key={f}
                style={{
                  opacity: enter,
                  transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
                  fontFamily: fonts.body,
                  fontSize: 20,
                  color: colors.textPrimary,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ color: colors.scoreHigh, fontWeight: 700 }}>{f}</span>
              </div>
            );
          })}
        </div>
      </div>

      <LowerThird label="Engineering Quality" delay={20} />
    </AbsoluteFill>
  );
};
