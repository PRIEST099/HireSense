import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { AppShell } from "../components/AppShell";

const COLUMNS = [
  {
    key: "pending",
    label: "Pending Review",
    color: colors.paperText3,
    candidates: [
      { name: "Diane Uwineza", initials: "DU", score: 78, rank: 6 },
      { name: "Eric Ndayisaba", initials: "EN", score: 72, rank: 9 },
    ],
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    color: colors.paperGreen,
    candidates: [
      { name: "Emmanuel N.", initials: "EN", score: 94, rank: 1 },
      { name: "Amina Uwimana", initials: "AU", score: 89, rank: 2 },
      { name: "Patrick N.", initials: "PN", score: 85, rank: 3 },
    ],
  },
  {
    key: "interview",
    label: "Interview",
    color: colors.paperAccent,
    candidates: [
      { name: "Jean-Baptiste M.", initials: "JM", score: 87, rank: 4 },
      { name: "Grace Iradukunda", initials: "GI", score: 83, rank: 5 },
    ],
  },
  {
    key: "rejected",
    label: "Rejected",
    color: colors.paperRed,
    candidates: [
      { name: "Olivier Manzi", initials: "OM", score: 42, rank: 14 },
      { name: "Sarah Mugisha", initials: "SM", score: 38, rank: 15 },
    ],
  },
];

function scoreColor(s: number) {
  return s >= 85 ? colors.paperGreen : s >= 70 ? colors.paperAmber : colors.paperRed;
}

export const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <PaperBackground>
      <AppShell activePath="/jobs/[id]/pipeline">
        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontFamily: fonts.caveat,
                fontSize: 38,
                fontWeight: 700,
                color: colors.paperText1,
                letterSpacing: -0.5,
                lineHeight: 1.1,
              }}
            >
              Hiring Pipeline
            </h1>
            <p
              style={{
                fontFamily: fonts.caveat,
                fontSize: 19,
                color: colors.paperText3,
                marginTop: 4,
              }}
            >
              Senior Software Engineer · Move candidates through your funnel
            </p>
          </div>
        </div>

        {/* Kanban */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {COLUMNS.map((col, i) => (
            <div key={col.key}>
              {/* Column header */}
              <div
                style={{
                  background: colors.paperCard,
                  border: `1.5px solid ${colors.paperInk}`,
                  borderBottom: `4px solid ${col.color}`,
                  borderRadius: "6px 6px 0 0",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "1px 2px 0 #171826",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: col.color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: fonts.caveat,
                      fontSize: 18,
                      fontWeight: 700,
                      color: colors.paperText1,
                    }}
                  >
                    {col.label}
                  </span>
                </div>
                <div
                  style={{
                    background: colors.paperBg,
                    border: `1.5px solid ${colors.paperBorder}`,
                    fontFamily: fonts.caveat,
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.paperText3,
                    padding: "2px 10px",
                    borderRadius: 12,
                  }}
                >
                  {col.candidates.length}
                </div>
              </div>

              {/* Cards */}
              <div
                style={{
                  background: "rgba(80, 110, 200, 0.04)",
                  border: `1.5px solid ${colors.paperInk}`,
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  padding: 12,
                  minHeight: 420,
                }}
              >
                {col.candidates.map((cand, j) => (
                  <div key={cand.name} style={{ marginBottom: 10 }}>
                    <PaperCard delay={i * 6 + j * 8} padding={14}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            background: col.color,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: fonts.caveat,
                            fontSize: 14,
                            fontWeight: 700,
                            flexShrink: 0,
                            border: `1.5px solid ${colors.paperInk}`,
                          }}
                        >
                          {cand.initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: fonts.caveat,
                              fontSize: 17,
                              fontWeight: 700,
                              color: colors.paperText1,
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cand.name}
                          </div>
                          <div
                            style={{
                              fontFamily: fonts.caveat,
                              fontSize: 14,
                              color: colors.paperText4,
                            }}
                          >
                            Rank #{cand.rank}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: fonts.caveat,
                            fontSize: 22,
                            fontWeight: 700,
                            color: scoreColor(cand.score),
                          }}
                        >
                          {cand.score}
                        </div>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: "rgba(80, 110, 200, 0.12)",
                          borderRadius: 2,
                        }}
                      >
                        <div
                          style={{
                            width: `${cand.score}%`,
                            height: "100%",
                            background: scoreColor(cand.score),
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </PaperCard>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    </PaperBackground>
  );
};
