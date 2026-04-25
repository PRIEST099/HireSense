import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";
import { AppShell } from "../components/AppShell";

const STATS = [
  { label: "Total Jobs", value: 12, color: colors.statBlue, icon: "📋" },
  { label: "Active Jobs", value: 5, color: colors.statTeal, icon: "📈" },
  { label: "Screenings Run", value: 28, color: colors.statPurple, icon: "🧠" },
  { label: "Total Candidates", value: 73, color: colors.statAmber, icon: "👥" },
];

const JOBS = [
  { title: "Senior Software Engineer", company: "Apex Consulting Group", location: "Kigali, Rwanda", skills: 9, status: "open" as const },
  { title: "Product Manager", company: "Irembo", location: "Kigali, Rwanda", skills: 7, status: "screening" as const },
  { title: "Data Engineer", company: "Bank of Kigali", location: "Kigali, Rwanda", skills: 8, status: "open" as const },
  { title: "Frontend Developer", company: "MTN Rwanda", location: "Kigali, Rwanda", skills: 6, status: "draft" as const },
  { title: "DevOps Engineer", company: "CloudScale Africa", location: "Remote", skills: 10, status: "screening" as const },
  { title: "ML Engineer", company: "AfriMarket", location: "Nairobi, Kenya", skills: 8, status: "open" as const },
];

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PaperBackground>
      <AppShell activePath="/dashboard">
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: fonts.caveat,
              fontSize: 48,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontFamily: fonts.caveat,
              fontSize: 22,
              color: colors.paperText3,
              marginTop: 4,
            }}
          >
            Overview of your recruitment activity.
          </p>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {STATS.map((stat, i) => {
            const value = Math.floor(
              interpolate(frame, [10 + i * 6, 50 + i * 6], [0, stat.value], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            );
            return (
              <PaperCard key={stat.label} delay={i * 6} padding={20}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      border: `1.5px solid ${stat.color}33`,
                      background: `${stat.color}14`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: fonts.caveat,
                        fontSize: 38,
                        fontWeight: 700,
                        color: colors.paperText1,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontFamily: fonts.caveat,
                        fontSize: 18,
                        color: colors.paperText3,
                        marginTop: 2,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              </PaperCard>
            );
          })}
        </div>

        {/* Recent jobs heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: fonts.caveat,
              fontSize: 28,
              fontWeight: 700,
              color: colors.paperText1,
            }}
          >
            Recent Jobs
          </h2>
        </div>

        {/* Recent jobs grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {JOBS.map((job, i) => (
            <PaperCard key={job.title} delay={50 + i * 8} padding={20}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.paperText1,
                    lineHeight: 1.2,
                    flex: 1,
                  }}
                >
                  {job.title}
                </h3>
                <PaperBadge
                  variant={
                    job.status === "open"
                      ? "success"
                      : job.status === "screening"
                      ? "accent"
                      : "default"
                  }
                  delay={70 + i * 8}
                >
                  {job.status === "open" ? "Open" : job.status === "screening" ? "Screening" : "Draft"}
                </PaperBadge>
              </div>
              <p
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 18,
                  color: colors.paperText3,
                  marginBottom: 8,
                }}
              >
                {job.company} · {job.location}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: fonts.caveat,
                  fontSize: 17,
                  color: colors.paperText4,
                }}
              >
                <span>{job.skills} required skills</span>
                <span>·</span>
                <span>Apr 2026</span>
              </div>
            </PaperCard>
          ))}
        </div>
      </AppShell>
    </PaperBackground>
  );
};
