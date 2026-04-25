"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FunnelScene } from "@/components/paper/FunnelScene";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { BrandFunnelIcon } from "@/components/paper/BrandFunnelIcon";

/** Formats a raw count into a short social-proof string — e.g. 0 → "0",
 *  47 → "47", 312 → "300+", 5400 → "5,000+". Rounds down to the nearest
 *  100 / 1,000 so the displayed number is never higher than the real one. */
function formatStat(n: number): string {
  if (n < 100) return String(n);
  if (n < 1000) return `${Math.floor(n / 100) * 100}+`;
  const thousands = Math.floor(n / 1000);
  return `${thousands.toLocaleString()},000+`;
}

const features = [
  { icon: "◎", title: "AI-Powered Scoring", desc: "Weighted across Skills, Experience, Education, and Culture Fit — recruiter-configurable." },
  { icon: "⬡", title: "Smart Resume Parsing", desc: "PDF, CSV, Excel, or URLs from Google Drive, Dropbox, OneDrive — all parsed automatically." },
  { icon: "↓", title: "Exportable Results", desc: "Download full ranked shortlists with scores, reasoning, and dimensional breakdowns as CSV." },
  { icon: "◈", title: "Human-in-the-Loop", desc: "Recruiters make the final call. Mark as Shortlisted, Interview, Rejected, or Pending." },
  { icon: "⬢", title: "Multiple Formats", desc: "Platform profiles, external resumes, CSVs — one unified pipeline handles every source." },
  { icon: "◉", title: "Explainable AI", desc: "Every score comes with strengths, gaps, confidence rating, and natural-language reasoning." },
];

const steps = [
  { n: "01", title: "Create a Job", desc: "Define the role, set requirements, and configure your AI scoring weights." },
  { n: "02", title: "Add Candidates", desc: "Upload resumes, paste URLs, or connect Umurava platform profiles." },
  { n: "03", title: "AI Reviews & Ranks", desc: "Get a ranked shortlist in seconds — with full explainability for every decision." },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 85 ? "var(--paper-green)" : value >= 70 ? "var(--paper-amber)" : "var(--paper-red)";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 16, color: "var(--paper-text-3)" }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "var(--font-caveat), 'Caveat', cursive" }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "var(--paper-radar-grid)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [hovF, setHovF] = useState<number | null>(null);
  const [stats, setStats] = useState<{ totalJobs: number; totalScreenings: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled || !body?.success) return;
        setStats(body.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="paper-grid landing-page"
      style={{
        backgroundColor: "var(--paper-bg)",
        color: "var(--paper-text-1)",
        minHeight: "100vh",
        /* fontFamily intentionally NOT set here — inherits from <body>.
           In paper mode body is Caveat; in classic mode body is system-ui,
           so the landing page swaps font correctly when toggling. */
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(247,248,253,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1.5px solid var(--paper-border)",
          display: "flex",
          alignItems: "center",
          height: 58,
        }}
        className="px-4 sm:px-8 md:px-12"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 20 }}>
          <div
            className="torn-bg-dramatic"
            style={{
              width: 28,
              height: 28,
              borderRadius: 5,
              border: "2px solid var(--paper-text-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "2px 2px 0 var(--paper-text-1)",
              ["--torn-color" as string]: "var(--paper-accent)",
            } as React.CSSProperties}
          >
            <BrandFunnelIcon size={20} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--paper-text-1)" }}>HireSense AI</span>
        </div>
        <div className="hidden md:flex" style={{ gap: 24, flex: 1 }}>
          {["How it Works", "Features", "Candidates", "Recruiters"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ fontSize: 16, color: "var(--paper-text-3)", textDecoration: "none" }}
            >
              {l}
            </a>
          ))}
        </div>
        <div style={{ flex: 1 }} className="md:hidden" />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/login">
            <PaperButton variant="ghost" size="sm">Log in</PaperButton>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <PaperButton variant="primary" size="sm">Get Started →</PaperButton>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto" style={{ padding: "48px 20px 48px" }}>
        <div className="grid gap-10 lg:gap-12 items-center grid-cols-1 lg:grid-cols-2">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 4,
                border: "1.5px solid var(--paper-border-acc)",
                background: "var(--paper-accent-soft)",
                marginBottom: 20,
              }}
            >
              <div
                className="animate-pulse-dot"
                style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--paper-accent)" }}
              />
              <span style={{ fontSize: 16, color: "var(--paper-accent)", fontWeight: 700, letterSpacing: "0.04em" }}>
                UMURAVA AI HACKATHON 2026
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl wb-write-in"
              style={{
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                marginBottom: 18,
                color: "var(--paper-text-1)",
                ["--wb-delay" as string]: "100ms",
              } as React.CSSProperties}
            >
              Hire smarter with{" "}
              <span
                style={{
                  color: "var(--paper-accent)",
                  textDecoration: "underline",
                  textDecorationStyle: "wavy",
                  textDecorationColor: "var(--paper-accent)",
                  textUnderlineOffset: 4,
                }}
              >
                AI-driven
              </span>{" "}
              insights
            </h1>
            <p
              style={{
                fontSize: 19,
                color: "var(--paper-text-3)",
                lineHeight: 1.65,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              HireSense AI screens your applicants, ranks by fit, and explains every decision — so your team focuses on
              the best candidates, not the noise.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
              <Link href="/register">
                <PaperButton variant="primary" size="lg">Start Screening Free →</PaperButton>
              </Link>
              <Link href="#how-it-works">
                <PaperButton variant="ghost" size="lg">See it in action</PaperButton>
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {[
                [stats ? formatStat(stats.totalJobs) : "—", "Active jobs"],
                [stats ? formatStat(stats.totalScreenings) : "—", "Screenings"],
                ["Gemini AI", "Flash + Pro"],
              ].map(([v, l], idx) => (
                <div
                  key={l}
                  className="wb-fade-in"
                  style={{ ["--wb-delay" as string]: `${900 + idx * 120}ms` } as React.CSSProperties}
                >
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--paper-accent)", lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop (≥lg): the full animated FunnelScene. Needs ≥480px of
              horizontal breathing room to not overflow. */}
          <div
            className="hidden lg:flex"
            style={{
              justifyContent: "center",
              alignItems: "flex-start",
              position: "relative",
              minHeight: 600,
            }}
          >
            <FunnelScene />
          </div>

          {/* Mobile + tablet (<lg): simplified static graphic — the 3
              ranked output cards in a row with a BrandFunnelIcon above.
              Communicates the product concept without the animation cost
              or the 480px-wide layout requirement. */}
          <div className="lg:hidden flex flex-col items-center gap-6" style={{ paddingTop: 8 }}>
            <div
              className="torn-bg-dramatic"
              style={
                {
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  border: "2px solid var(--paper-text-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "3px 4px 0 var(--paper-text-1)",
                  ["--torn-color" as string]: "var(--paper-accent)",
                } as React.CSSProperties
              }
            >
              <BrandFunnelIcon size={48} />
            </div>
            <div
              className="grid grid-cols-3 gap-3 w-full"
              style={{ maxWidth: 360 }}
            >
              {[
                { rank: 1, score: 94, stars: 5 },
                { rank: 2, score: 92, stars: 4 },
                { rank: 3, score: 90, stars: 4 },
              ].map((o) => (
                <div
                  key={o.rank}
                  style={{
                    position: "relative",
                    padding: "10px 8px 12px",
                    background: "var(--paper-card)",
                    border: "1.8px solid var(--paper-accent)",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "2px 3px 0 var(--paper-text-1), 0 6px 18px rgba(79,70,229,0.2)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--paper-accent)",
                      border: "1.5px solid var(--paper-text-1)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "1px 1px 0 var(--paper-text-1)",
                    }}
                  >
                    {o.rank}
                  </span>
                  {/* person silhouette */}
                  <svg width={36} height={36} viewBox="0 0 40 40" aria-hidden="true" className="lucide no-sketch">
                    <circle cx="20" cy="20" r="19" fill="var(--paper-card)" stroke="var(--paper-accent)" strokeWidth="1.6" opacity="0.95" />
                    <circle cx="20" cy="15" r="5.5" fill="none" stroke="var(--paper-accent)" strokeWidth="1.4" />
                    <path d="M 9 33 C 10 25, 15 22, 20 22 C 25 22, 30 25, 31 33" fill="none" stroke="var(--paper-accent)" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {/* stars */}
                  <div style={{ display: "flex", gap: 1.5 }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <svg key={i} width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 2 L15 9 L22 9 L16.5 13.5 L19 21 L12 17 L5 21 L7.5 13.5 L2 9 L9 9 Z"
                          fill={i < o.stars ? "var(--paper-accent)" : "none"}
                          stroke="var(--paper-accent)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ))}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-accent)", lineHeight: 1 }}>
                    {o.score}%
                  </div>
                </div>
              ))}
            </div>
            <span
              style={{
                fontSize: 15,
                color: "var(--paper-text-3)",
                textAlign: "center",
              }}
            >
              Best candidates, ranked for you
            </span>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section
        id="how-it-works"
        style={{ padding: "60px 20px", borderTop: "1.5px solid var(--paper-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8, color: "var(--paper-text-1)" }}
            >
              Three steps to your shortlist
            </h2>
            <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
              From job posting to ranked candidates in minutes, not days.
            </p>
          </div>
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
            {steps.map((s, i) => (
              <PaperCard key={i} padding="p-6" animationDelay={i * 120}>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "var(--paper-accent)",
                    marginBottom: 10,
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "var(--paper-text-1)" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 16, color: "var(--paper-text-3)", lineHeight: 1.6 }}>{s.desc}</p>
              </PaperCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{ padding: "60px 20px", borderTop: "1.5px solid var(--paper-border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8, color: "var(--paper-text-1)" }}
            >
              Everything you need to screen smarter
            </h2>
          </div>
          <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} onMouseEnter={() => setHovF(i)} onMouseLeave={() => setHovF(null)}>
                <PaperCard
                  padding="p-5"
                  animationDelay={i * 75}
                  style={{
                    background: hovF === i ? "rgba(79,70,229,0.04)" : "var(--paper-card)",
                    borderColor: hovF === i ? "var(--paper-border-acc)" : "var(--paper-border)",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 10, color: "var(--paper-accent)" }}>{f.icon}</div>
                  <h4 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, color: "var(--paper-text-1)" }}>
                    {f.title}
                  </h4>
                  <p style={{ fontSize: 17, color: "var(--paper-text-3)", lineHeight: 1.6 }}>{f.desc}</p>
                </PaperCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section
        id="candidates"
        style={{ padding: "60px 20px", borderTop: "1.5px solid var(--paper-border)" }}
      >
        <div className="max-w-4xl mx-auto grid gap-10 md:gap-14 items-center grid-cols-1 md:grid-cols-2">
          <div>
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontWeight: 700, lineHeight: 1.15, marginBottom: 14, color: "var(--paper-text-1)" }}
            >
              Transparent AI
              <br />
              you can trust
            </h2>
            <p style={{ fontSize: 17, color: "var(--paper-text-3)", lineHeight: 1.7, marginBottom: 20 }}>
              Every ranking comes with clear reasoning — not a black box. Recruiters see exactly why each candidate was
              ranked, what they&apos;re missing, and how confident the AI is.
            </p>
            {[
              "Dimensional scoring across 4 axes",
              "Natural-language reasoning per candidate",
              "AI confidence score on every result",
              "Recruiter override — always human-led",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: "rgba(13,148,136,0.12)",
                    border: "1.5px solid rgba(13,148,136,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "var(--paper-green)",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span style={{ fontSize: 16, color: "var(--paper-text-2)" }}>{t}</span>
              </div>
            ))}
          </div>
          <PaperCard padding="p-6">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                className="torn-bg-dramatic"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  border: "2px solid var(--paper-text-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  ["--torn-color" as string]: "var(--paper-accent)",
                } as React.CSSProperties}
              >
                AU
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-text-1)" }}>Amina Uwimana</div>
                <div style={{ fontSize: 16, color: "var(--paper-text-3)" }}>React Engineer @ Andela</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 36, fontWeight: 700, color: "var(--paper-green)" }}>94</div>
            </div>
            {[
              ["Skills", 88],
              ["Experience", 96],
              ["Education", 90],
              ["Culture Fit", 98],
            ].map(([l, v]) => (
              <ScoreBar key={l as string} label={l as string} value={v as number} />
            ))}
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 4,
                background: "var(--paper-accent-soft)",
                border: "1.5px solid var(--paper-border-acc)",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "var(--paper-accent)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                AI REASONING
              </div>
              <p style={{ fontSize: 17, color: "var(--paper-text-3)", lineHeight: 1.5 }}>
                Exceptional match. Skills and culture alignment top-tier. Minor gaps in cloud infra won&apos;t impact
                this frontend role.
              </p>
            </div>
          </PaperCard>
        </div>
      </section>

      {/* CTA */}
      <section
        id="recruiters"
        style={{ padding: "60px 20px", borderTop: "1.5px solid var(--paper-border)" }}
      >
        <div className="max-w-xl mx-auto">
          <PaperCard padding="p-10" className="text-center">
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 10, color: "var(--paper-text-1)" }}
            >
              Ready to transform
              <br />
              your hiring?
            </h2>
            <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginBottom: 28 }}>
              Join recruiters who&apos;ve cut time-to-hire by screening smarter, not harder.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register">
                <PaperButton variant="primary" size="lg">Get Started Free →</PaperButton>
              </Link>
              <Link href="/dashboard">
                <PaperButton variant="ghost" size="lg">Go to Dashboard</PaperButton>
              </Link>
            </div>
          </PaperCard>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1.5px solid var(--paper-border)", padding: "32px 20px" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row flex-wrap gap-6 justify-between items-start">
          <div style={{ maxWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div
                className="torn-bg-subtle"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  border: "2px solid var(--paper-text-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  ["--torn-color" as string]: "var(--paper-accent)",
                } as React.CSSProperties}
              >
                <BrandFunnelIcon size={16} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-text-1)" }}>HireSense AI</span>
            </div>
            <p style={{ fontSize: 16, color: "var(--paper-text-3)", lineHeight: 1.55 }}>
              AI-powered recruitment screening for the modern HR team.
            </p>
          </div>
          {[
            ["PRODUCT", ["How it Works", "Features", "AI Transparency"]],
            ["COMPANY", ["About", "Contact", "Careers"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--paper-text-3)",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}
              >
                {title as string}
              </div>
              {(links as string[]).map((l) => (
                <div key={l} style={{ fontSize: 17, color: "var(--paper-text-4)", marginBottom: 7 }}>
                  {l}
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 17, color: "var(--paper-text-4)" }}>
            © {new Date().getFullYear()} HireSense AI
            <br />
            Built for the Umurava AI Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
