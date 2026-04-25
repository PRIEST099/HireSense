import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { BrandFunnelIcon } from "../components/BrandFunnelIcon";
import { PaperButton } from "../components/PaperButton";
import { PaperCard } from "../components/PaperCard";

/**
 * Recreates the actual HireSense landing page hero section.
 * Source: src/app/page.tsx
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const navEnter = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const headlineEnter = spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 90 } });
  const subEnter = spring({ frame: frame - 45, fps, config: { damping: 18, stiffness: 100 } });
  const ctaEnter = spring({ frame: frame - 75, fps, config: { damping: 18, stiffness: 100 } });
  const statsEnter = spring({ frame: frame - 110, fps, config: { damping: 16, stiffness: 90 } });

  return (
    <PaperBackground>
      {/* Top nav */}
      <div
        style={{
          opacity: navEnter,
          padding: "24px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1.5px solid ${colors.paperBorder}`,
          background: "rgba(247, 248, 253, 0.7)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandFunnelIcon size={36} color={colors.paperAccent} />
          <span
            style={{
              fontFamily: fonts.caveat,
              fontSize: 32,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -1,
            }}
          >
            HireSense
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            fontFamily: fonts.caveat,
            fontSize: 19,
            fontWeight: 600,
            color: colors.paperText2,
          }}
        >
          <span>How it Works</span>
          <span>Features</span>
          <span>For Recruiters</span>
        </div>
        <PaperButton variant="primary" size="md">
          Get Started
        </PaperButton>
      </div>

      {/* Hero */}
      <div
        style={{
          padding: "100px 100px 60px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left: headline + CTA */}
        <div>
          <div
            style={{
              opacity: headlineEnter,
              transform: `translateY(${interpolate(headlineEnter, [0, 1], [20, 0])}px)`,
              fontFamily: fonts.caveat,
              fontWeight: 700,
              fontSize: 92,
              color: colors.paperText1,
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 24,
            }}
          >
            Hire smarter with{" "}
            <span style={{ color: colors.paperAccent, position: "relative" }}>
              AI-driven insights
              <svg
                width="100%"
                height="14"
                viewBox="0 0 400 14"
                style={{ position: "absolute", bottom: -8, left: 0 }}
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 7 T 200 6 T 300 8 T 398 5"
                  stroke={colors.paperAccent}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="800"
                  strokeDashoffset={interpolate(frame, [30, 70], [800, 0], {
                    extrapolateRight: "clamp",
                  })}
                />
              </svg>
            </span>
            .
          </div>

          <div
            style={{
              opacity: subEnter,
              transform: `translateY(${interpolate(subEnter, [0, 1], [20, 0])}px)`,
              fontFamily: fonts.caveat,
              fontSize: 26,
              fontWeight: 600,
              color: colors.paperText3,
              lineHeight: 1.4,
              maxWidth: 720,
              marginBottom: 36,
            }}
          >
            Screen, score, and shortlist candidates with AI — built on Gemini, designed for Umurava&apos;s
            ecosystem, ready to ship today.
          </div>

          <div
            style={{
              opacity: ctaEnter,
              transform: `translateY(${interpolate(ctaEnter, [0, 1], [20, 0])}px)`,
              display: "flex",
              gap: 16,
              marginBottom: 48,
            }}
          >
            <PaperButton variant="primary" size="lg">
              Start Screening Free
            </PaperButton>
            <PaperButton variant="ghost" size="lg">
              See It in Action →
            </PaperButton>
          </div>

          {/* Stats */}
          <div
            style={{
              opacity: statsEnter,
              display: "flex",
              gap: 32,
              fontFamily: fonts.caveat,
            }}
          >
            {[
              { value: "300+", label: "Active Jobs" },
              { value: "5,000+", label: "Screened" },
              { value: "2×", label: "AI Models" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 36, fontWeight: 700, color: colors.paperAccent, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 18, color: colors.paperText3, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: result preview card */}
        <div style={{ position: "relative" }}>
          <PaperCard delay={90} padding={32} accentBorder>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: colors.paperAccent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.caveat,
                  fontSize: 28,
                  fontWeight: 700,
                  border: `1.5px solid ${colors.paperInk}`,
                }}
              >
                AU
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.paperText1,
                  }}
                >
                  Amina Uwimana
                </div>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 18,
                    color: colors.paperText3,
                  }}
                >
                  Kigali · 7 yrs experience
                </div>
              </div>
              <div
                style={{
                  background: colors.paperGreenSoft,
                  border: `1px solid rgba(13, 148, 136, 0.3)`,
                  color: colors.paperGreen,
                  fontFamily: fonts.caveat,
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 4,
                }}
              >
                Strong Match
              </div>
            </div>

            {[
              { label: "Skills", v: 88 },
              { label: "Experience", v: 96 },
              { label: "Education", v: 90 },
              { label: "Culture Fit", v: 98 },
            ].map((d, i) => {
              const w = interpolate(frame, [120 + i * 8, 150 + i * 8], [0, d.v], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: fonts.caveat,
                      fontSize: 18,
                      color: colors.paperText2,
                      marginBottom: 4,
                    }}
                  >
                    <span>{d.label}</span>
                    <span style={{ fontWeight: 700, color: colors.paperAccent }}>{Math.round(w)}</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "rgba(80, 110, 200, 0.12)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${w}%`,
                        height: "100%",
                        background: colors.paperAccent,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </PaperCard>
        </div>
      </div>
    </PaperBackground>
  );
};
