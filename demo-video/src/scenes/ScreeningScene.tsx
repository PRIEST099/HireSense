import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const STAGES = [
  { num: "1", label: "INGEST", desc: "Profiles, resumes, spreadsheets", model: "Gemini 2.0 Flash" },
  { num: "2", label: "SCORE", desc: "4 dimensions, weighted, validated", model: "Gemini 2.0 Flash" },
  { num: "3", label: "RANK", desc: "Comparative ranking across cohort", model: "Gemini 2.5 Pro" },
];

export const ScreeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <div
        style={{
          padding: 80,
          paddingTop: 120,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
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
          The 3-Stage AI Pipeline
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 22,
            color: colors.textSecondary,
            marginBottom: 80,
            textAlign: "center",
          }}
        >
          Powered by Gemini. Documented. Reproducible.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
          }}
        >
          {STAGES.map((stage, i) => {
            const enter = spring({
              frame: frame - i * 25,
              fps,
              config: { damping: 16, stiffness: 100 },
            });
            const arrowOpacity = interpolate(frame - 25 - i * 25, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div key={stage.num} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    opacity: enter,
                    transform: `scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
                    width: 320,
                    background: colors.bgElevated,
                    border: `2px solid ${colors.accent}`,
                    borderRadius: 20,
                    padding: 32,
                    boxShadow: `0 12px 48px ${colors.accent}33`,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      background: colors.accent,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: fonts.display,
                      fontSize: 28,
                      fontWeight: 800,
                      marginBottom: 20,
                    }}
                  >
                    {stage.num}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 30,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 16,
                      color: colors.textSecondary,
                      marginBottom: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    {stage.desc}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 14,
                      color: colors.accentBright,
                      fontWeight: 600,
                    }}
                  >
                    {stage.model}
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div
                    style={{
                      opacity: arrowOpacity,
                      fontSize: 48,
                      color: colors.accentBright,
                      margin: "0 8px",
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <LowerThird label="3-Stage AI Pipeline" delay={20} />
      <Caption text="Parse. Score. Rank." position="bottom" delay={210} size="md" />
    </AbsoluteFill>
  );
};
