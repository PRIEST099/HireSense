import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";
import { PaperButton } from "../components/PaperButton";
import { ScoreRing } from "../components/ScoreRing";
import { RadarChart } from "../components/RadarChart";
import { AppShell } from "../components/AppShell";

const STRENGTHS = [
  "9 years system architecture experience",
  "AWS Certified Solutions Architect — Professional",
  "Led 12-person engineering team at YC startup",
];

const GAPS = ["Limited GraphQL exposure", "No production Kubernetes experience"];

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PaperBackground>
      <AppShell activePath="/jobs/[id]/results">
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontFamily: fonts.caveat,
              fontSize: 38,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Screening Results
          </h1>
          <p
            style={{
              fontFamily: fonts.caveat,
              fontSize: 19,
              color: colors.paperText3,
            }}
          >
            Senior Software Engineer · 15 candidates · Top 10 shortlist
          </p>
        </div>

        {/* Stat strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Screened", value: "15" },
            { label: "Strong Matches", value: "4" },
            { label: "Avg Score", value: "76" },
            { label: "Avg Confidence", value: "84%" },
          ].map((s, i) => (
            <PaperCard key={s.label} delay={i * 4} padding={14}>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  color: colors.paperText3,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.paperText1,
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
            </PaperCard>
          ))}
        </div>

        {/* Top candidate expanded card */}
        <PaperCard delay={20} padding={24} accentBorder>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 18,
              paddingBottom: 16,
              borderBottom: `1.5px dashed ${colors.paperBorder}`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.caveat,
                fontSize: 32,
                fontWeight: 700,
                color: colors.paperAccent,
              }}
            >
              🏆 #1
            </div>
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
                fontSize: 22,
                fontWeight: 700,
                border: `1.5px solid ${colors.paperInk}`,
              }}
            >
              EN
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.paperText1,
                  lineHeight: 1.1,
                }}
              >
                Emmanuel Nsengiyumva
              </div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 17,
                  color: colors.paperText3,
                }}
              >
                Kampala, Uganda · 9 yrs experience
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <PaperBadge variant="info" delay={30}>System Architecture</PaperBadge>
                <PaperBadge variant="info" delay={32}>TypeScript</PaperBadge>
                <PaperBadge variant="info" delay={34}>Kubernetes</PaperBadge>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ScoreRing score={94} size={84} delay={20} duration={40} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <PaperBadge variant="success" size="md" delay={40}>
                  Strong Match
                </PaperBadge>
                <PaperBadge variant="info" delay={45}>
                  Confidence 92%
                </PaperBadge>
              </div>
            </div>
          </div>

          {/* Three-column expanded body */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {/* Left: radar + breakdown */}
            <div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.paperText3,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                SCORE BREAKDOWN
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <RadarChart skills={96} experience={92} education={88} culture={95} size={200} delay={30} />
              </div>
              {[
                { label: "Skills", v: 96 },
                { label: "Experience", v: 92 },
                { label: "Education", v: 88 },
                { label: "Culture Fit", v: 95 },
              ].map((d, i) => {
                const w = interpolate(
                  frame,
                  [60 + i * 5, 90 + i * 5],
                  [0, d.v],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div key={d.label} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: fonts.caveat,
                        fontSize: 16,
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
                        height: 6,
                        background: "rgba(80, 110, 200, 0.12)",
                        borderRadius: 3,
                        marginTop: 2,
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
            </div>

            {/* Middle: strengths + gaps */}
            <div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.paperGreen,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                ✓ STRENGTHS
              </div>
              {STRENGTHS.map((s, i) => (
                <div
                  key={s}
                  style={{
                    background: colors.paperGreenSoft,
                    border: `1px solid rgba(13, 148, 136, 0.3)`,
                    padding: "8px 12px",
                    borderRadius: 6,
                    marginBottom: 6,
                    fontFamily: fonts.caveat,
                    fontSize: 17,
                    color: colors.paperText1,
                    opacity: interpolate(frame, [80 + i * 6, 95 + i * 6], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {s}
                </div>
              ))}

              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.paperAmber,
                  letterSpacing: 1,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                △ GAPS
              </div>
              {GAPS.map((g, i) => (
                <div
                  key={g}
                  style={{
                    background: colors.paperAmberSoft,
                    border: `1px solid rgba(180, 83, 9, 0.25)`,
                    padding: "8px 12px",
                    borderRadius: 6,
                    marginBottom: 6,
                    fontFamily: fonts.caveat,
                    fontSize: 17,
                    color: colors.paperText1,
                    opacity: interpolate(frame, [120 + i * 6, 135 + i * 6], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  {g}
                </div>
              ))}
            </div>

            {/* Right: AI reasoning + decisions */}
            <div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.paperAccent,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                ✦ AI REASONING
              </div>
              <div
                style={{
                  background: colors.paperAccentSoft,
                  border: `1px solid ${colors.paperBorderAcc}`,
                  padding: 14,
                  borderRadius: 6,
                  fontFamily: fonts.caveat,
                  fontSize: 17,
                  color: colors.paperText1,
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                Emmanuel exceeds requirements with deep system architecture
                expertise and proven leadership at scale. Strong cultural alignment
                from his startup background. Minor gaps are easily addressable
                through onboarding.
              </div>
              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 14,
                  color: colors.paperText3,
                  marginBottom: 16,
                }}
              >
                Model: gemini-2.0-flash · Prompt v2.0.0 · 2.4s
              </div>

              <div
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.paperText3,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                RECRUITER DECISION
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <PaperButton variant="primary" size="sm">
                  ✓ Shortlist
                </PaperButton>
                <PaperButton variant="secondary" size="sm">
                  📅 Interview
                </PaperButton>
                <PaperButton variant="ghost" size="sm">
                  ✕ Reject
                </PaperButton>
              </div>
            </div>
          </div>
        </PaperCard>
      </AppShell>
    </PaperBackground>
  );
};
