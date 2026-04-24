"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperBadge, PaperStatusBadge } from "@/components/paper/PaperBadge";
import { ScoreRing } from "@/components/paper/ScoreRing";
import { RadarChart } from "@/components/paper/RadarChart";
import { ScoreBar } from "@/components/ui/ProgressBar";
import { PageLoader } from "@/components/ui/Spinner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { AIDisclaimer } from "@/components/shared/AIDisclaimer";
import { useToast } from "@/components/ui/Toast";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { Candidate } from "@/types/candidate";
import type { ScreeningResult } from "@/types/screening";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 10 }}>{children}</h2>
  );
}

export default function CandidateDetailPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load candidate");
        return r.json();
      })
      .then((d) => {
        if (d.success) {
          setCandidate(d.data.candidate);
          setResult(d.data.screeningResult);
        } else {
          setError(d.error || "Candidate not found");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleDecision = async (decision: string) => {
    setDecisionLoading(true);
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    if (data.success && result) {
      setResult({ ...result, recruiterDecision: decision as ScreeningResult["recruiterDecision"] });
      const label =
        decision === "shortlisted" ? "Shortlisted" : decision === "interview" ? "Marked for Interview" : "Rejected";
      toast(`Candidate ${label}`);
    }
    setDecisionLoading(false);
  };

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  if (error || !candidate)
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <ErrorBanner message={error || "Candidate not found"} onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );

  const p = candidate.profile;
  const displayName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name;
  const initial = (p.firstName || p.name || "?").charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 16,
            color: "var(--paper-text-3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
            fontFamily: "var(--font-caveat), 'Caveat', cursive",
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <PaperCard className="mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="torn-bg-dramatic"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  border: "2px solid var(--paper-text-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "2px 3px 0 var(--paper-text-1)",
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  ["--torn-color" as string]: "var(--paper-accent)",
                } as React.CSSProperties}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--paper-text-1)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {displayName}
                </h1>
                {p.headline && (
                  <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 4 }}>{p.headline}</p>
                )}
                <div
                  className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-2"
                  style={{ fontSize: 16, color: "var(--paper-text-3)" }}
                >
                  {p.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {p.email}
                    </span>
                  )}
                  {p.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {p.phone}
                    </span>
                  )}
                  {p.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1">
                  {p.linkedIn && (
                    <a
                      href={p.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 16,
                        color: "var(--paper-accent)",
                        textDecoration: "underline",
                      }}
                    >
                      <LinkIcon className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {p.portfolio && (
                    <a
                      href={p.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 16,
                        color: "var(--paper-accent)",
                        textDecoration: "underline",
                      }}
                    >
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
            {result && (
              <div className="text-center flex flex-col items-center gap-2 flex-shrink-0">
                <ScoreRing score={result.overallScore} size={84} stroke={7} />
                <PaperStatusBadge status={result.recommendation} />
              </div>
            )}
          </div>
        </PaperCard>

        {result && (
          <div className="mb-6">
            <AIDisclaimer />
          </div>
        )}

        {/* Decision Controls */}
        {result && (
          <PaperCard className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <SectionTitle>Recruiter Decision</SectionTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontSize: 16, color: "var(--paper-text-3)" }}>Current:</span>
                  <PaperStatusBadge status={result.recruiterDecision} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <PaperButton
                  variant={result.recruiterDecision === "shortlisted" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handleDecision("shortlisted")}
                  disabled={decisionLoading}
                >
                  <CheckCircle className="h-4 w-4" /> Shortlist
                </PaperButton>
                <PaperButton
                  variant={result.recruiterDecision === "interview" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handleDecision("interview")}
                  disabled={decisionLoading}
                >
                  <Calendar className="h-4 w-4" /> Interview
                </PaperButton>
                <PaperButton
                  variant={result.recruiterDecision === "rejected" ? "danger" : "ghost"}
                  size="sm"
                  onClick={() => handleDecision("rejected")}
                  disabled={decisionLoading}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Analysis */}
          {result && (
            <div className="space-y-6">
              <PaperCard>
                <SectionTitle>Score Breakdown</SectionTitle>
                <div className="flex justify-center">
                  <RadarChart
                    skills={result.breakdown.skillsMatch}
                    experience={result.breakdown.experienceMatch}
                    education={result.breakdown.educationMatch}
                    culture={result.breakdown.cultureFitMatch}
                    size={220}
                  />
                </div>
                <div className="mt-3 space-y-3">
                  <ScoreBar score={result.breakdown.skillsMatch} label="Skills Match" />
                  <ScoreBar score={result.breakdown.experienceMatch} label="Experience" />
                  <ScoreBar score={result.breakdown.educationMatch} label="Education" />
                  <ScoreBar score={result.breakdown.cultureFitMatch} label="Culture Fit" />
                  <div style={{ borderTop: "1.5px solid var(--paper-border)", paddingTop: 12, marginTop: 12 }}>
                    <ScoreBar score={result.confidenceScore} label="AI Confidence" />
                  </div>
                </div>
              </PaperCard>

              <PaperCard>
                <SectionTitle>AI Reasoning</SectionTitle>
                <div
                  style={{
                    background: "var(--paper-accent-soft)",
                    border: "1.5px solid var(--paper-border-acc)",
                    borderRadius: 5,
                    padding: 14,
                  }}
                >
                  <p style={{ fontSize: 17, color: "var(--paper-text-2)", lineHeight: 1.6 }}>{result.reasoning}</p>
                </div>
              </PaperCard>

              <PaperCard>
                <SectionTitle>Strengths</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {result.strengths.map((s, i) => (
                    <PaperBadge key={i} variant="success">
                      {s}
                    </PaperBadge>
                  ))}
                  {result.strengths.length === 0 && (
                    <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>No strengths listed</p>
                  )}
                </div>
              </PaperCard>

              <PaperCard>
                <SectionTitle>Gaps</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {result.gaps.map((g, i) => (
                    <PaperBadge key={i} variant="warning">
                      {g}
                    </PaperBadge>
                  ))}
                  {result.gaps.length === 0 && (
                    <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>No significant gaps</p>
                  )}
                </div>
              </PaperCard>
            </div>
          )}

          {/* Profile details */}
          <div className="space-y-6">
            {(p.bio || p.summary) && (
              <PaperCard>
                <SectionTitle>Summary</SectionTitle>
                <p style={{ fontSize: 17, color: "var(--paper-text-2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {p.bio || p.summary}
                </p>
              </PaperCard>
            )}

            <PaperCard>
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => (
                  <PaperBadge key={s.name} variant="info">
                    {s.name} {s.level !== "intermediate" && `(${s.level})`}
                  </PaperBadge>
                ))}
                {p.skills.length === 0 && (
                  <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>No skills listed</p>
                )}
              </div>
            </PaperCard>

            <PaperCard>
              <SectionTitle>Experience ({p.totalYearsExperience} years)</SectionTitle>
              <div className="space-y-4">
                {p.experience.map((exp, i) => (
                  <div
                    key={i}
                    style={{
                      borderLeft: "2px solid var(--paper-border-acc)",
                      paddingLeft: 14,
                    }}
                  >
                    <p style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-text-1)" }}>
                      {exp.role || exp.title}
                    </p>
                    <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
                      {exp.company} &middot; {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p style={{ fontSize: 17, color: "var(--paper-text-2)", marginTop: 4, lineHeight: 1.5 }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
                {p.experience.length === 0 && (
                  <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>No experience listed</p>
                )}
              </div>
            </PaperCard>

            <PaperCard>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                {p.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Award className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--paper-text-3)" }} />
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-text-1)" }}>{edu.degree}</p>
                      <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
                        {edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
                {p.education.length === 0 && (
                  <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>No education listed</p>
                )}
              </div>
            </PaperCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
