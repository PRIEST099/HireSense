import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";
import { ScoreRing } from "../components/ScoreRing";
import { RadarChart } from "../components/RadarChart";

const CANDIDATES = [
  {
    name: "Emmanuel N.",
    location: "Kampala, UG",
    rank: 1,
    score: 94,
    skills: 96,
    exp: 92,
    edu: 88,
    culture: 95,
    rec: "Strong Match" as const,
    variant: "success" as const,
  },
  {
    name: "Amina U.",
    location: "Kigali, RW",
    rank: 2,
    score: 89,
    skills: 91,
    exp: 88,
    edu: 90,
    culture: 87,
    rec: "Strong Match" as const,
    variant: "success" as const,
  },
  {
    name: "Patrick N.",
    location: "Kigali, RW",
    rank: 3,
    score: 85,
    skills: 86,
    exp: 84,
    edu: 87,
    culture: 84,
    rec: "Good Match" as const,
    variant: "accent" as const,
  },
];

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <PaperBackground>
      <div style={{ padding: "60px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
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
            ✦ COMPARE TOP 3
          </div>
          <h1
            style={{
              fontFamily: fonts.caveat,
              fontSize: 52,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -1,
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            Side-by-side comparison
          </h1>
          <p
            style={{
              fontFamily: fonts.caveat,
              fontSize: 22,
              color: colors.paperText3,
            }}
          >
            Trade-offs become instantly clear.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {CANDIDATES.map((c, i) => (
            <PaperCard
              key={c.name}
              delay={i * 12}
              padding={24}
              accentBorder={i === 0}
              style={{ position: "relative" }}
            >
              {/* Rank badge */}
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: 24,
                  background: i === 0 ? colors.paperAccent : colors.paperCard,
                  color: i === 0 ? "#fff" : colors.paperText1,
                  border: `1.5px solid ${colors.paperInk}`,
                  fontFamily: fonts.caveat,
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 4,
                  boxShadow: "1px 2px 0 #171826",
                }}
              >
                #{c.rank}
              </div>

              {/* Avatar + name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: colors.paperAccent,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.caveat,
                    fontSize: 18,
                    fontWeight: 700,
                    border: `1.5px solid ${colors.paperInk}`,
                  }}
                >
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 22,
                      fontWeight: 700,
                      color: colors.paperText1,
                      lineHeight: 1.1,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 16,
                      color: colors.paperText3,
                    }}
                  >
                    {c.location}
                  </div>
                </div>
              </div>

              {/* Score ring */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <ScoreRing score={c.score} size={110} delay={i * 12 + 5} duration={40} />
              </div>

              {/* Recommendation */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <PaperBadge variant={c.variant} size="md" delay={i * 12 + 20}>
                  {c.rec}
                </PaperBadge>
              </div>

              {/* Radar */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <RadarChart
                  skills={c.skills}
                  experience={c.exp}
                  education={c.edu}
                  culture={c.culture}
                  size={180}
                  delay={i * 12 + 15}
                />
              </div>

              {/* Stat lines */}
              {[
                { label: "Skills", v: c.skills },
                { label: "Experience", v: c.exp },
                { label: "Education", v: c.edu },
                { label: "Culture", v: c.culture },
              ].map((d, j) => {
                const w = interpolate(
                  frame,
                  [50 + i * 12 + j * 3, 80 + i * 12 + j * 3],
                  [0, d.v],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div key={d.label} style={{ marginBottom: 6 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: fonts.caveat,
                        fontSize: 15,
                        color: colors.paperText2,
                      }}
                    >
                      <span>{d.label}</span>
                      <span style={{ fontWeight: 700, color: colors.paperAccent }}>
                        {Math.round(w)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "rgba(80, 110, 200, 0.12)",
                        borderRadius: 3,
                      }}
                    >
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          background: colors.paperAccent,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </PaperCard>
          ))}
        </div>
      </div>
    </PaperBackground>
  );
};
