"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { ArrowLeft, CheckCircle, Calendar, XCircle, Clock, Shield, ExternalLink } from "lucide-react";

interface PipelineCandidate {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateTopSkills: string[];
  overallScore: number;
  rank: number;
  recommendation: string;
  recruiterDecision: string;
  confidenceScore: number;
  reasoning: string;
}

const COLUMNS = [
  { key: "pending", label: "Pending Review", icon: Clock, color: "var(--paper-text-3)" },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle, color: "var(--paper-green)" },
  { key: "interview", label: "Interview", icon: Calendar, color: "var(--paper-accent)" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "var(--paper-red)" },
];

export default function PipelinePage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [resultsRes, jobRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}/results`),
        fetch(`/api/jobs/${jobId}`),
      ]);
      if (!resultsRes.ok || !jobRes.ok) throw new Error("Failed to load data");
      const resultsData = await resultsRes.json();
      const jobData = await jobRes.json();
      if (resultsData.success) setCandidates(resultsData.data.results || []);
      if (jobData.success) setJobTitle(jobData.data.title || "");
    } catch {
      setError("Failed to load pipeline data");
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  if (error)
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto">
          <ErrorBanner message={error} onRetry={loadData} />
        </div>
      </AppLayout>
    );

  const grouped = COLUMNS.map((col) => ({
    ...col,
    candidates: candidates.filter((c) => c.recruiterDecision === col.key).sort((a, b) => a.rank - b.rank),
  }));

  const totalScreened = candidates.length;
  const totalDecided = candidates.filter((c) => c.recruiterDecision !== "pending").length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <button
              onClick={() => router.push(`/jobs/${jobId}`)}
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
                marginBottom: 8,
                fontFamily: "var(--font-caveat), 'Caveat', cursive",
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Job
            </button>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              Hiring Pipeline
            </h1>
            <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 4 }}>
              {jobTitle} &middot; {totalDecided} of {totalScreened} candidates reviewed
            </p>
          </div>
          <PaperButton variant="ghost" size="sm" onClick={() => router.push(`/jobs/${jobId}/results`)}>
            View Results Table
          </PaperButton>
        </div>

        {totalScreened > 0 && (
          <div className="mb-6">
            <div
              className="flex justify-between"
              style={{ fontSize: 17, color: "var(--paper-text-3)", marginBottom: 4 }}
            >
              <span>Pipeline Progress</span>
              <span>{Math.round((totalDecided / totalScreened) * 100)}% reviewed</span>
            </div>
            <div
              style={{
                width: "100%",
                height: 10,
                background: "var(--paper-radar-grid)",
                borderRadius: 5,
                overflow: "hidden",
                display: "flex",
              }}
            >
              {grouped.map((col) => {
                const pct = totalScreened > 0 ? (col.candidates.length / totalScreened) * 100 : 0;
                if (pct === 0) return null;
                return <div key={col.key} style={{ height: "100%", width: `${pct}%`, background: col.color }} />;
              })}
            </div>
          </div>
        )}

        {totalScreened === 0 ? (
          <PaperCard>
            <div className="text-center py-16">
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-text-2)" }}>No screening results yet</p>
              <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 6 }}>
                Run AI Screening first to see candidates in the pipeline
              </p>
              <div className="mt-5 flex justify-center">
                <PaperButton size="sm" onClick={() => router.push(`/jobs/${jobId}/results`)}>
                  Go to Screening
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {grouped.map((col) => (
              <div
                key={col.key}
                style={{
                  background: "var(--paper-card)",
                  border: "1.5px solid var(--paper-border)",
                  borderRadius: 6,
                  boxShadow: "var(--paper-shadow-card)",
                  minHeight: 400,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderBottom: "1.5px solid var(--paper-border)",
                    background: `${col.color}14`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <col.icon className="h-4 w-4" style={{ color: col.color }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: col.color }}>{col.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      padding: "1px 8px",
                      borderRadius: 3,
                      background: `${col.color}22`,
                      color: col.color,
                      border: `1px solid ${col.color}44`,
                      fontFamily: "var(--font-caveat), 'Caveat', cursive",
                    }}
                  >
                    {col.candidates.length}
                  </span>
                </div>

                <div className="p-3 space-y-2 flex-1">
                  {col.candidates.length === 0 && (
                    <p
                      style={{
                        fontSize: 17,
                        color: "var(--paper-text-4)",
                        textAlign: "center",
                        padding: "32px 0",
                      }}
                    >
                      No candidates
                    </p>
                  )}
                  {col.candidates.map((c, idx) => {
                    const scoreColor =
                      c.overallScore >= 80
                        ? "var(--paper-green)"
                        : c.overallScore >= 60
                        ? "var(--paper-accent)"
                        : c.overallScore >= 40
                        ? "var(--paper-amber)"
                        : "var(--paper-red)";
                    return (
                      <div
                        key={c._id}
                        className="wb-fade-in"
                        onClick={() => router.push(`/candidates/${c.candidateId}`)}
                        style={{
                          background: "var(--paper-card)",
                          border: "1.5px solid var(--paper-border)",
                          borderRadius: 5,
                          padding: 12,
                          cursor: "pointer",
                          boxShadow: "var(--paper-shadow)",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          ["--wb-delay" as string]: `${idx * 50}ms`,
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--paper-border-acc)";
                          e.currentTarget.style.boxShadow = "2px 3px 0 rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--paper-border)";
                          e.currentTarget.style.boxShadow = "var(--paper-shadow)";
                        }}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="torn-bg-dramatic"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 5,
                                border: "2px solid var(--paper-text-1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 17,
                                fontWeight: 700,
                                flexShrink: 0,
                                fontFamily: "var(--font-caveat), 'Caveat', cursive",
                                ["--torn-color" as string]: "var(--paper-accent)",
                              } as React.CSSProperties}
                            >
                              {c.candidateName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p
                                style={{
                                  fontSize: 17,
                                  fontWeight: 700,
                                  color: "var(--paper-text-1)",
                                  lineHeight: 1.15,
                                }}
                                className="truncate"
                              >
                                {c.candidateName}
                              </p>
                              <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>Rank #{c.rank}</p>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: scoreColor,
                              lineHeight: 1,
                              fontFamily: "var(--font-caveat), 'Caveat', cursive",
                            }}
                          >
                            {c.overallScore}
                          </span>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            height: 4,
                            background: "var(--paper-radar-grid)",
                            borderRadius: 2,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              height: 4,
                              background: scoreColor,
                              borderRadius: 2,
                              width: `${c.overallScore}%`,
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {c.candidateTopSkills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              style={{
                                fontSize: 15,
                                background: "var(--paper-input-bg)",
                                color: "var(--paper-text-3)",
                                padding: "1px 6px",
                                borderRadius: 3,
                                border: "1px solid var(--paper-border)",
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div
                          className="flex items-center justify-between"
                          style={{ fontSize: 15, color: "var(--paper-text-4)" }}
                        >
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>{c.confidenceScore}% confidence</span>
                          </div>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
