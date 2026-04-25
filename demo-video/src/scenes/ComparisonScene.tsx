import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const CANDIDATES = [
  {
    name: "Emmanuel N.",
    score: 94,
    rank: 1,
    color: colors.scoreHigh,
    skills: 96,
    exp: 92,
    edu: 88,
    culture: 95,
  },
  {
    name: "Amina U.",
    score: 89,
    rank: 2,
    color: colors.accentBright,
    skills: 91,
    exp: 88,
    edu: 90,
    culture: 87,
  },
  {
    name: "Patrick N.",
    score: 85,
    rank: 3,
    color: colors.scoreMid,
    skills: 86,
    exp: 84,
    edu: 87,
    culture: 84,
  },
];

export const ComparisonScene: React.FC = () => {
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
        Compare Top Candidates Side-by-Side
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textSecondary,
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        Trade-offs become instantly clear.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {CANDIDATES.map((c, i) => {
          const enter = spring({
            frame: frame - i * 18,
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          const dimensions = [
            { label: "Skills", value: c.skills },
            { label: "Experience", value: c.exp },
            { label: "Education", value: c.edu },
            { label: "Culture", value: c.culture },
          ];

          return (
            <div
              key={c.name}
              style={{
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
                background: colors.bgElevated,
                border: `2px solid ${i === 0 ? colors.accentBright : colors.border}`,
                borderRadius: 20,
                padding: 32,
                position: "relative",
              }}
            >
              {/* Rank badge */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  left: 24,
                  background: c.color,
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontFamily: fonts.display,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                #{c.rank}
              </div>

              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginTop: 12,
                  marginBottom: 24,
                }}
              >
                {c.name}
              </div>

              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 64,
                  fontWeight: 800,
                  color: c.color,
                  textAlign: "center",
                  lineHeight: 1,
                  marginBottom: 32,
                }}
              >
                {Math.floor(
                  interpolate(frame - i * 18, [0, 45], [0, c.score], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                )}
              </div>

              {dimensions.map((d, j) => {
                const w = interpolate(
                  frame - 30 - i * 18 - j * 6,
                  [0, 30],
                  [0, d.value],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div key={d.label} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: fonts.body,
                        fontSize: 16,
                        color: colors.textSecondary,
                        marginBottom: 6,
                      }}
                    >
                      <span>{d.label}</span>
                      <span style={{ fontFamily: fonts.mono, fontWeight: 700 }}>
                        {Math.round(w)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: colors.border,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          background: c.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <LowerThird label="Compare Top 3" delay={20} />
      <Caption text="The best choice becomes obvious." position="bottom" delay={200} size="md" />
    </AbsoluteFill>
  );
};
