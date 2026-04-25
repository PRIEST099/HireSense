import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const COLUMNS = [
  {
    key: "pending",
    label: "Pending Review",
    color: colors.textSecondary,
    candidates: ["Diane U.", "Eric N."],
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    color: colors.scoreHigh,
    candidates: ["Emmanuel N.", "Amina U.", "Patrick N."],
  },
  {
    key: "interview",
    label: "Interview",
    color: colors.accentBright,
    candidates: ["Jean-Baptiste M.", "Grace I."],
  },
  {
    key: "rejected",
    label: "Rejected",
    color: colors.scoreLow,
    candidates: ["Olivier M.", "Sarah M."],
  },
];

export const PipelineScene: React.FC = () => {
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
        }}
      >
        Hiring Pipeline (Kanban)
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textSecondary,
          marginBottom: 56,
        }}
      >
        From shortlist to decision — all in one board.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {COLUMNS.map((col, i) => {
          const enter = spring({
            frame: frame - i * 12,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <div
              key={col.key}
              style={{
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
                background: colors.bgElevated,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 24,
                minHeight: 500,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: `2px solid ${col.color}`,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: col.color,
                  }}
                />
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {col.label}
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontFamily: fonts.mono,
                    fontSize: 14,
                    color: colors.textSecondary,
                    background: colors.bg,
                    padding: "4px 10px",
                    borderRadius: 12,
                  }}
                >
                  {col.candidates.length}
                </div>
              </div>

              {col.candidates.map((name, j) => {
                const cardEnter = spring({
                  frame: frame - 60 - i * 12 - j * 8,
                  fps,
                  config: { damping: 16, stiffness: 100 },
                });
                return (
                  <div
                    key={name}
                    style={{
                      opacity: cardEnter,
                      transform: `translateY(${interpolate(cardEnter, [0, 1], [20, 0])}px)`,
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderLeft: `4px solid ${col.color}`,
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 12,
                      fontFamily: fonts.body,
                      fontSize: 16,
                      color: colors.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <LowerThird label="Hiring Pipeline" delay={20} />
      <Caption
        text="No spreadsheets. No SMS chains. No lost applications."
        position="bottom"
        delay={240}
        size="md"
      />
    </AbsoluteFill>
  );
};
