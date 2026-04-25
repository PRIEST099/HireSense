import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";

const STATS = [
  { value: "28", label: "Tests Passing", color: colors.paperGreen },
  { value: "100%", label: "TypeScript", color: colors.paperAccent },
  { value: "v2.0.0", label: "Prompt Version", color: "#7C3AED" },
  { value: "Zod", label: "AI Output Validation", color: colors.paperAmber },
];

const FEATURES = [
  "Umurava Talent Profile Schema integrated",
  "SSRF-protected resume URL fetching",
  "Token-bucket rate limiting (Gemini free tier)",
  "Retry logic with exponential backoff",
  "Documented prompts (docs/ai-prompts.md)",
  "NextAuth.js with bcrypt + JWT sessions",
  "Production-deployed on Vercel + Atlas",
  "Async screening with session tracking",
];

export const TechCredibilityScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <PaperBackground>
      <div style={{ padding: "70px 100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontFamily: fonts.caveat,
              fontSize: 18,
              fontWeight: 700,
              color: colors.paperAccent,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            ✦ ENGINEERING QUALITY
          </div>
          <h1
            style={{
              fontFamily: fonts.caveat,
              fontSize: 60,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -1,
              lineHeight: 1.05,
              marginBottom: 10,
            }}
          >
            Built right. From day one.
          </h1>
          <p
            style={{
              fontFamily: fonts.caveat,
              fontSize: 22,
              color: colors.paperText3,
            }}
          >
            Not a hackathon prototype. Production-grade engineering.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
            marginBottom: 36,
          }}
        >
          {STATS.map((s, i) => (
            <PaperCard key={s.label} delay={i * 6} padding={24}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 56,
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 18,
                    color: colors.paperText3,
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </PaperCard>
          ))}
        </div>

        {/* Feature checklist */}
        <PaperCard delay={36} padding={32}>
          <div
            style={{
              fontFamily: fonts.caveat,
              fontSize: 16,
              fontWeight: 700,
              color: colors.paperText3,
              letterSpacing: 1.5,
              marginBottom: 20,
            }}
          >
            ✓ PRODUCTION FEATURES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FEATURES.map((f, i) => {
              const enter = interpolate(
                frame,
                [56 + i * 4, 76 + i * 4],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={f}
                  style={{
                    opacity: enter,
                    transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
                    fontFamily: fonts.caveat,
                    fontSize: 21,
                    color: colors.paperText1,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: colors.paperGreenSoft,
                    border: `1px solid rgba(13, 148, 136, 0.3)`,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ color: colors.paperGreen, fontWeight: 700, fontSize: 22 }}>✓</span>
                  <span>{f}</span>
                </div>
              );
            })}
          </div>
        </PaperCard>
      </div>
    </PaperBackground>
  );
};
