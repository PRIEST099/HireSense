import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";

const STAGES = [
  {
    num: "1",
    label: "INGEST",
    desc: "Profiles, resumes, spreadsheets",
    model: "Gemini 2.0 Flash",
    detail: "PDF text extraction · Schema validation",
  },
  {
    num: "2",
    label: "SCORE",
    desc: "4 weighted dimensions",
    model: "Gemini 2.0 Flash",
    detail: "Skills · Experience · Education · Culture",
  },
  {
    num: "3",
    label: "RANK",
    desc: "Comparative across cohort",
    model: "Gemini 2.5 Pro",
    detail: "Top 10 / Top 20 shortlist · Reasoning",
  },
];

export const ScreeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PaperBackground>
      {/* Page header */}
      <div style={{ padding: "60px 80px 0", textAlign: "center" }}>
        <div
          style={{
            fontFamily: fonts.caveat,
            fontSize: 18,
            fontWeight: 700,
            color: colors.paperAccent,
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          ✦ THE 3-STAGE AI PIPELINE
        </div>
        <h1
          style={{
            fontFamily: fonts.caveat,
            fontSize: 64,
            fontWeight: 700,
            color: colors.paperText1,
            letterSpacing: -1,
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          Parse. Score. Rank.
        </h1>
        <p
          style={{
            fontFamily: fonts.caveat,
            fontSize: 22,
            color: colors.paperText3,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          Powered by Gemini. Documented prompts (v2.0.0). Reproducible outputs.
        </p>
      </div>

      {/* Stages */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: "80px 60px",
        }}
      >
        {STAGES.map((stage, i) => {
          const arrowOpacity = interpolate(
            frame,
            [40 + i * 25, 60 + i * 25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div key={stage.num} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 340 }}>
                <PaperCard delay={i * 25} padding={28} accentBorder={i === 1}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      background: colors.paperAccent,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: fonts.caveat,
                      fontSize: 30,
                      fontWeight: 700,
                      marginBottom: 18,
                      border: `2px solid ${colors.paperInk}`,
                      boxShadow: "2px 3px 0 #171826",
                    }}
                  >
                    {stage.num}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 32,
                      fontWeight: 700,
                      color: colors.paperText1,
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 20,
                      color: colors.paperText2,
                      marginBottom: 18,
                      lineHeight: 1.4,
                    }}
                  >
                    {stage.desc}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <PaperBadge variant="accent" delay={20 + i * 25}>
                      {stage.model}
                    </PaperBadge>
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 17,
                      color: colors.paperText3,
                      lineHeight: 1.4,
                    }}
                  >
                    {stage.detail}
                  </div>
                </PaperCard>
              </div>

              {i < STAGES.length - 1 && (
                <div
                  style={{
                    opacity: arrowOpacity,
                    fontFamily: fonts.caveat,
                    fontSize: 56,
                    color: colors.paperAccent,
                    fontWeight: 700,
                    margin: "0 4px",
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom annotation */}
      <div
        style={{
          textAlign: "center",
          fontFamily: fonts.caveat,
          fontSize: 19,
          color: colors.paperText3,
          padding: "0 80px",
        }}
      >
        Concurrency: 3 parallel · Retry: 2× exponential backoff · All outputs Zod-validated
      </div>
    </PaperBackground>
  );
};
