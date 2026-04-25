import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";
import { ScoreBar } from "../components/ScoreBar";

const STRENGTHS = [
  "9 years system architecture experience",
  "AWS Solutions Architect Professional certified",
  "Led 12-person engineering team at YC startup",
];

const GAPS = ["Limited GraphQL exposure", "No Kubernetes production experience"];

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <div style={{ padding: 60, paddingTop: 80, height: "100%", display: "flex", gap: 40 }}>
        {/* LEFT: Top candidate card */}
        <div
          style={{
            flex: 1,
            background: colors.bgElevated,
            border: `2px solid ${colors.accentBright}`,
            borderRadius: 24,
            padding: 40,
            boxShadow: `0 0 60px ${colors.accentBright}33`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentBright})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fonts.display,
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              EN
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                Emmanuel Nsengiyumva
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 18,
                  color: colors.textSecondary,
                }}
              >
                Kampala, Uganda · 9 yrs experience
              </div>
            </div>
            <div
              style={{
                background: colors.scoreHigh,
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 12,
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 0.5,
              }}
            >
              STRONG MATCH
            </div>
          </div>

          {/* Overall score ring */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 96,
              fontWeight: 800,
              color: colors.scoreHigh,
              textAlign: "center",
              marginBottom: 8,
              lineHeight: 1,
              textShadow: `0 0 40px ${colors.scoreHigh}44`,
            }}
          >
            94
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: fonts.body,
              fontSize: 16,
              color: colors.textSecondary,
              marginBottom: 32,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Overall Match Score
          </div>

          {/* Score bars */}
          <ScoreBar label="Skills Match" score={96} delay={30} duration={45} />
          <ScoreBar label="Experience" score={92} delay={45} duration={45} />
          <ScoreBar label="Education" score={88} delay={60} duration={45} />
          <ScoreBar label="Culture Fit" score={95} delay={75} duration={45} />
        </div>

        {/* RIGHT: Strengths, gaps, reasoning */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Strengths */}
          <div
            style={{
              background: colors.bgElevated,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: fonts.display,
                fontSize: 20,
                fontWeight: 700,
                color: colors.scoreHigh,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              ✓ Strengths
            </div>
            {STRENGTHS.map((s, i) => {
              const enter = spring({
                frame: frame - 90 - i * 12,
                fps,
                config: { damping: 18, stiffness: 100 },
              });
              return (
                <div
                  key={s}
                  style={{
                    opacity: enter,
                    transform: `translateX(${interpolate(enter, [0, 1], [20, 0])}px)`,
                    fontFamily: fonts.body,
                    fontSize: 18,
                    color: colors.textPrimary,
                    marginBottom: 10,
                    paddingLeft: 16,
                    borderLeft: `3px solid ${colors.scoreHigh}`,
                  }}
                >
                  {s}
                </div>
              );
            })}
          </div>

          {/* Gaps */}
          <div
            style={{
              background: colors.bgElevated,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div
              style={{
                fontFamily: fonts.display,
                fontSize: 20,
                fontWeight: 700,
                color: colors.scoreMid,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              △ Gaps
            </div>
            {GAPS.map((g, i) => {
              const enter = spring({
                frame: frame - 150 - i * 12,
                fps,
                config: { damping: 18, stiffness: 100 },
              });
              return (
                <div
                  key={g}
                  style={{
                    opacity: enter,
                    transform: `translateX(${interpolate(enter, [0, 1], [20, 0])}px)`,
                    fontFamily: fonts.body,
                    fontSize: 18,
                    color: colors.textPrimary,
                    marginBottom: 10,
                    paddingLeft: 16,
                    borderLeft: `3px solid ${colors.scoreMid}`,
                  }}
                >
                  {g}
                </div>
              );
            })}
          </div>

          {/* AI Reasoning */}
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.accent}22 0%, ${colors.accentDark}22 100%)`,
              border: `1px solid ${colors.accentBright}`,
              borderRadius: 16,
              padding: 28,
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: fonts.display,
                fontSize: 20,
                fontWeight: 700,
                color: colors.accentBright,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              ✦ AI Reasoning
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 18,
                color: colors.textPrimary,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              "Emmanuel exceeds requirements with deep system architecture
              expertise and proven leadership at scale. Strong cultural alignment
              with his startup background. Minor gaps in modern infrastructure
              tools are easily addressable through training."
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: fonts.mono,
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Confidence: <span style={{ color: colors.scoreHigh, fontWeight: 700 }}>92%</span>
              {" · "}Model: <span style={{ color: colors.accentBright }}>gemini-2.0-flash</span>
            </div>
          </div>
        </div>
      </div>

      <LowerThird label="Explainable AI Scoring" delay={20} />
      <Caption
        text="Every score broken down. Every decision explained."
        position="bottom"
        delay={300}
        size="md"
      />
    </AbsoluteFill>
  );
};
