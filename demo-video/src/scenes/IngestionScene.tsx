import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { PaperCard } from "../components/PaperCard";
import { PaperBadge } from "../components/PaperBadge";
import { PaperButton } from "../components/PaperButton";
import { AppShell } from "../components/AppShell";

const TABS = [
  { key: "manual", label: "Manual Entry", icon: "👤" },
  { key: "upload", label: "Upload File", icon: "📎" },
  { key: "url", label: "Resume URL", icon: "🔗" },
];

const FILE_TYPES = [
  { ext: "CSV", desc: "Spreadsheet with candidate rows" },
  { ext: "XLSX", desc: "Excel workbook" },
  { ext: "PDF", desc: "Resume — auto-parsed by AI" },
];

export const IngestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cycle through tabs to show all 3 ingestion methods
  const activeTab = frame < 130 ? 0 : frame < 260 ? 1 : 2;

  return (
    <PaperBackground>
      <AppShell activePath="/jobs/[id]/applicants">
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: fonts.caveat,
              fontSize: 42,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -1,
              lineHeight: 1.05,
              marginBottom: 4,
            }}
          >
            Add Candidates
          </h1>
          <p
            style={{
              fontFamily: fonts.caveat,
              fontSize: 21,
              color: colors.paperText3,
            }}
          >
            Senior Software Engineer · Apex Consulting Group
          </p>
        </div>

        {/* Tab strip */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            borderBottom: `1.5px solid ${colors.paperBorder}`,
            paddingBottom: 0,
          }}
        >
          {TABS.map((tab, i) => {
            const isActive = i === activeTab;
            return (
              <div
                key={tab.key}
                style={{
                  padding: "12px 20px",
                  fontFamily: fonts.caveat,
                  fontSize: 20,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? colors.paperAccent : colors.paperText3,
                  borderBottom: isActive
                    ? `3px solid ${colors.paperAccent}`
                    : "3px solid transparent",
                  marginBottom: -1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>

        {/* Active tab content */}
        <PaperCard delay={5} padding={36}>
          {activeTab === 0 && (
            <div>
              <h3
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.paperText1,
                  marginBottom: 24,
                }}
              >
                Add a candidate manually
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {[
                  { label: "Full Name", value: "Patrick Niyonzima" },
                  { label: "Email", value: "patrick@example.com" },
                  { label: "Location", value: "Kigali, Rwanda" },
                  { label: "Years of Experience", value: "6" },
                ].map((field, i) => (
                  <div key={field.label}>
                    <label
                      style={{
                        fontFamily: fonts.caveat,
                        fontSize: 19,
                        fontWeight: 600,
                        color: colors.paperText2,
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      {field.label}
                    </label>
                    <div
                      style={{
                        background: "rgba(80, 110, 200, 0.04)",
                        border: `1.5px solid ${
                          i === 0 ? colors.paperAccent : "rgba(80, 110, 200, 0.22)"
                        }`,
                        borderRadius: 5,
                        padding: "10px 14px",
                        fontFamily: fonts.caveat,
                        fontSize: 19,
                        color: colors.paperText1,
                      }}
                    >
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
                <PaperButton variant="primary" size="md">
                  + Add Candidate
                </PaperButton>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h3
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.paperText1,
                  marginBottom: 16,
                }}
              >
                Upload candidates
              </h3>

              {/* Dropzone */}
              <div
                style={{
                  border: `2.5px dashed ${colors.paperBorderAcc}`,
                  borderRadius: 8,
                  padding: 56,
                  textAlign: "center",
                  background: "rgba(80, 110, 200, 0.04)",
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 12 }}>📁</div>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 26,
                    fontWeight: 700,
                    color: colors.paperText1,
                    marginBottom: 6,
                  }}
                >
                  Drop CSV, Excel, or PDF files here
                </div>
                <div
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 18,
                    color: colors.paperText3,
                  }}
                >
                  Or click to browse · 5 MB per file · 10 files max
                </div>
              </div>

              {/* Supported types */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {FILE_TYPES.map((t) => (
                  <div
                    key={t.ext}
                    style={{
                      border: `1.5px solid ${colors.paperBorder}`,
                      borderRadius: 6,
                      padding: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: colors.paperAccentSoft,
                        color: colors.paperAccent,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: fonts.caveat,
                        fontSize: 16,
                        fontWeight: 700,
                        border: `1.5px solid ${colors.paperBorderAcc}`,
                      }}
                    >
                      {t.ext}
                    </div>
                    <div
                      style={{
                        fontFamily: fonts.caveat,
                        fontSize: 17,
                        color: colors.paperText3,
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h3
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.paperText1,
                  marginBottom: 8,
                }}
              >
                Import resume from URL
              </h3>
              <p
                style={{
                  fontFamily: fonts.caveat,
                  fontSize: 19,
                  color: colors.paperText3,
                  marginBottom: 24,
                }}
              >
                Paste a public PDF URL — fetched server-side, validated, then parsed by AI.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 19,
                    fontWeight: 600,
                    color: colors.paperText2,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Resume URL
                </label>
                <div
                  style={{
                    background: "rgba(80, 110, 200, 0.04)",
                    border: `1.5px solid ${colors.paperAccent}`,
                    borderRadius: 5,
                    padding: "12px 16px",
                    fontFamily: fonts.caveat,
                    fontSize: 19,
                    color: colors.paperText1,
                  }}
                >
                  https://example.com/resumes/diane-uwineza.pdf
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  background: colors.paperGreenSoft,
                  border: `1px solid rgba(13, 148, 136, 0.3)`,
                  borderRadius: 6,
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 20 }}>🛡️</span>
                <span
                  style={{
                    fontFamily: fonts.caveat,
                    fontSize: 18,
                    color: colors.paperGreen,
                    fontWeight: 600,
                  }}
                >
                  SSRF-protected · Private IPs blocked · HTTPS required
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <PaperButton variant="primary" size="md">
                  Fetch & Parse
                </PaperButton>
              </div>
            </div>
          )}
        </PaperCard>
      </AppShell>
    </PaperBackground>
  );
};
