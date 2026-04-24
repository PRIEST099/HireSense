"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperBadge, PaperStatusBadge } from "@/components/paper/PaperBadge";
import { ScoreRing } from "@/components/paper/ScoreRing";
import { RadarChart } from "@/components/paper/RadarChart";
import { PageLoader } from "@/components/ui/Spinner";
import { ProgressBar, ScoreBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { AIDisclaimer } from "@/components/shared/AIDisclaimer";
import { ScoreDistributionChart } from "@/components/screening/ScoreDistributionChart";
import {
  Brain,
  Columns3,
  Play,
  Download,
  ChevronDown,
  Trophy,
  Sparkles,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  Shield,
  ArrowRight,
  Filter,
  SortDesc,
  MapPin,
  Star,
  MessageSquare,
  Eye,
  GitCompareArrows,
  X,
} from "lucide-react";

interface EnrichedResult {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateLocation: string;
  candidateTopSkills: string[];
  overallScore: number;
  breakdown: { skillsMatch: number; experienceMatch: number; educationMatch: number; cultureFitMatch: number };
  rank: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  reasoning: string;
  confidenceScore: number;
  recruiterDecision: string;
}

interface SessionData {
  _id: string;
  status: string;
  totalCandidates: number;
  processedCandidates: number;
  completedAt: string;
  error: string;
}

interface JobData {
  title: string;
  company: string;
  location: string;
  requirements: { skills: string[]; experience: { min: number; max: number }; education: string };
  screeningConfig: {
    shortlistSize: number;
    weightSkills: number;
    weightExperience: number;
    weightEducation: number;
    weightCultureFit: number;
  };
}

type SortField = "rank" | "score" | "skills" | "experience";
type FilterMatch = "all" | "strong_match" | "good_match" | "partial_match" | "weak_match";
type FilterDecision = "all" | "shortlisted" | "interview" | "rejected" | "pending";

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 17,
        padding: "5px 12px",
        borderRadius: 4,
        fontWeight: active ? 700 : 500,
        background: active ? "var(--paper-accent)" : "var(--paper-card)",
        color: active ? "#fff" : "var(--paper-text-2)",
        border: active ? "2px solid var(--paper-text-1)" : "1.5px solid var(--paper-border)",
        boxShadow: active ? "1px 2px 0 var(--paper-text-1)" : "var(--paper-shadow)",
        cursor: "pointer",
        fontFamily: "var(--font-caveat), 'Caveat', cursive",
      }}
    >
      {children}
    </button>
  );
}

export default function ResultsPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);

  const [minScore, setMinScore] = useState(0);
  const [matchFilter, setMatchFilter] = useState<FilterMatch>("all");
  const [decisionFilter, setDecisionFilter] = useState<FilterDecision>(() => {
    const param = searchParams.get("decision");
    if (param && ["shortlisted", "interview", "rejected", "pending"].includes(param)) {
      return param as FilterDecision;
    }
    return "all";
  });
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [showFilters, setShowFilters] = useState(() => !!searchParams.get("decision"));
  const [showCompare, setShowCompare] = useState(false);

  const loadResults = useCallback(async () => {
    try {
      const [resultsRes, jobRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}/results`),
        fetch(`/api/jobs/${jobId}`),
      ]);
      if (!resultsRes.ok || !jobRes.ok) throw new Error("Failed to load screening data");
      const resultsData = await resultsRes.json();
      const jobData = await jobRes.json();
      if (resultsData.success) {
        setSession(resultsData.data.session);
        setResults(resultsData.data.results);
      }
      if (jobData.success) setJob(jobData.data);
    } catch (err) {
      console.error("Load results error:", err);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (!session || !["pending", "processing"].includes(session.status)) return;
    const interval = setInterval(loadResults, 3000);
    return () => clearInterval(interval);
  }, [session, loadResults]);

  useEffect(() => {
    if (results.length > 0 && expandedRow === null) {
      setExpandedRow(results[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const triggerScreening = async () => {
    setTriggerLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/screen`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession(data.data);
        setResults([]);
        toast("AI Screening started", "info");
      } else {
        toast(data.error || "Failed to start screening", "error");
      }
    } catch {
      toast("Failed to start screening", "error");
    }
    setTriggerLoading(false);
  };

  const handleDecision = async (candidateId: string, decision: string) => {
    setDecisionLoading(candidateId);
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    if (data.success) {
      setResults((prev) =>
        prev.map((r) => (r.candidateId === candidateId ? { ...r, recruiterDecision: decision } : r))
      );
      const label =
        decision === "shortlisted" ? "Shortlisted" : decision === "interview" ? "Marked for Interview" : "Rejected";
      toast(`Candidate ${label}`);
    }
    setDecisionLoading(null);
  };

  const filteredResults = useMemo(() => {
    let filtered = results.filter((r) => r.overallScore >= minScore);
    if (matchFilter !== "all") filtered = filtered.filter((r) => r.recommendation === matchFilter);
    if (decisionFilter !== "all") filtered = filtered.filter((r) => r.recruiterDecision === decisionFilter);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.overallScore - a.overallScore;
        case "skills":
          return b.breakdown.skillsMatch - a.breakdown.skillsMatch;
        case "experience":
          return b.breakdown.experienceMatch - a.breakdown.experienceMatch;
        default:
          return a.rank - b.rank;
      }
    });
  }, [results, minScore, matchFilter, decisionFilter, sortBy]);

  const exportCSV = () => {
    const headers = [
      "Rank", "Name", "Email", "Score", "Skills Match", "Experience", "Education", "Culture Fit",
      "Confidence", "Recommendation", "Decision", "Strengths", "Gaps", "AI Reasoning",
    ];
    const rows = filteredResults.map((r) => [
      r.rank, r.candidateName, r.candidateEmail, r.overallScore,
      r.breakdown.skillsMatch, r.breakdown.experienceMatch, r.breakdown.educationMatch, r.breakdown.cultureFitMatch,
      r.confidenceScore, r.recommendation, r.recruiterDecision,
      r.strengths.join("; "), r.gaps.join("; "), r.reasoning,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screening-results-${jobId}.csv`;
    a.click();
  };

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );

  const isScreening = session && ["pending", "processing"].includes(session.status);
  const topCandidate = results.length > 0 ? results[0] : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Job Context Header */}
        {job && (
          <PaperCard className="mb-6" padding="p-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{
                      fontSize: 17,
                      color: "var(--paper-text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                    }}
                  >
                    {job.company}
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "var(--paper-text-1)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                    marginBottom: 12,
                  }}
                >
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.requirements.skills.slice(0, 6).map((s) => (
                    <PaperBadge key={s} variant="info">
                      {s}
                    </PaperBadge>
                  ))}
                  {job.requirements.skills.length > 6 && (
                    <PaperBadge>+{job.requirements.skills.length - 6} more</PaperBadge>
                  )}
                </div>
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-2"
                  style={{ fontSize: 16, color: "var(--paper-text-3)" }}
                >
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span>
                    {job.requirements.experience.min}-{job.requirements.experience.max} years experience
                  </span>
                  <span>Top {job.screeningConfig.shortlistSize} shortlist</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.length > 0 && (
                  <>
                    <PaperButton variant="ghost" size="sm" onClick={() => router.push(`/jobs/${jobId}/pipeline`)}>
                      <Columns3 className="h-4 w-4" /> Pipeline
                    </PaperButton>
                    <PaperButton variant="ghost" size="sm" onClick={exportCSV}>
                      <Download className="h-4 w-4" /> Export
                    </PaperButton>
                  </>
                )}
                <PaperButton onClick={triggerScreening} disabled={triggerLoading || !!isScreening} size="sm">
                  <Play className="h-4 w-4" /> {isScreening ? "Screening..." : "Run AI Screening"}
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        )}

        {/* Progress bar during screening */}
        {isScreening && session && (
          <PaperCard className="mb-6" style={{ borderColor: "var(--paper-border-acc)", background: "var(--paper-accent-soft)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Brain className="h-6 w-6" style={{ color: "var(--paper-accent)" }} />
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 10,
                    height: 10,
                    background: "var(--paper-accent)",
                    borderRadius: "50%",
                    animation: "pulse-dot 1.2s infinite",
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--paper-text-1)" }}>
                  AI Screening in progress
                </p>
                <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
                  Analyzing candidates against job requirements...
                </p>
              </div>
            </div>
            <ProgressBar
              value={session.processedCandidates}
              max={session.totalCandidates}
              label={`Scoring candidates (${session.processedCandidates} of ${session.totalCandidates})`}
            />
          </PaperCard>
        )}

        {/* Responsible AI Notice */}
        {results.length > 0 && !isScreening && (
          <div className="mb-4">
            <AIDisclaimer compact />
          </div>
        )}

        {/* Stats bar */}
        {results.length > 0 && !isScreening && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { value: results.length, label: "Candidates Screened", color: "var(--paper-text-1)" },
              {
                value: results.filter((r) => r.recommendation === "strong_match").length,
                label: "Strong Matches",
                color: "var(--paper-green)",
              },
              {
                value: Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length),
                label: "Avg Score",
                color: "var(--paper-accent)",
              },
              {
                value: `${Math.round(results.reduce((s, r) => s + r.confidenceScore, 0) / results.length)}%`,
                label: "Avg AI Confidence",
                color: "#7C3AED",
              },
            ].map((s) => (
              <PaperCard key={s.label} padding="p-4" className="text-center">
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1,
                    fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 6 }}>{s.label}</p>
              </PaperCard>
            ))}
          </div>
        )}

        {/* Score Distribution Chart */}
        {results.length > 1 && !isScreening && (
          <PaperCard className="mb-6">
            <ScoreDistributionChart
              candidates={results.map((r) => ({ name: r.candidateName, score: r.overallScore, rank: r.rank }))}
              shortlistSize={job?.screeningConfig.shortlistSize || 10}
            />
          </PaperCard>
        )}

        {/* Top candidate highlight */}
        {topCandidate && !isScreening && results.length > 1 && (
          <PaperCard
            className="mb-6"
            style={{
              background: "rgba(180,83,9,0.05)",
              borderColor: "rgba(180,83,9,0.3)",
            }}
          >
            <div className="flex items-start gap-4 flex-wrap">
              <div
                style={{
                  background: "rgba(180,83,9,0.15)",
                  border: "1.5px solid rgba(180,83,9,0.3)",
                  borderRadius: 6,
                  padding: 10,
                  flexShrink: 0,
                }}
              >
                <Star className="h-6 w-6" style={{ color: "var(--paper-amber)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-text-1)" }}>
                    Top Candidate: {topCandidate.candidateName}
                  </h3>
                  <PaperBadge variant="warning">#{topCandidate.rank}</PaperBadge>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: "var(--paper-green)",
                      fontFamily: "var(--font-caveat), 'Caveat', cursive",
                    }}
                  >
                    {topCandidate.overallScore}
                  </span>
                </div>
                <p style={{ fontSize: 17, color: "var(--paper-text-2)", marginBottom: 8 }}>{topCandidate.reasoning}</p>
                <div className="flex flex-wrap gap-1.5">
                  {topCandidate.strengths.map((s, i) => (
                    <PaperBadge key={i} variant="success">
                      {s}
                    </PaperBadge>
                  ))}
                </div>
              </div>
              <PaperButton
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/candidates/${topCandidate.candidateId}`)}
              >
                <Eye className="h-4 w-4" /> View
              </PaperButton>
            </div>
          </PaperCard>
        )}

        {/* Compare Modal */}
        {showCompare && results.length >= 2 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(23,24,38,0.5)" }}
            onClick={() => setShowCompare(false)}
          >
            <div
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              style={{
                background: "var(--paper-card)",
                border: "1.5px solid var(--paper-border)",
                borderRadius: 6,
                boxShadow: "4px 6px 0 rgba(0,0,0,0.08), 0 14px 36px rgba(0,0,0,0.14)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between sticky top-0 z-10"
                style={{
                  padding: "14px 20px",
                  borderBottom: "1.5px solid var(--paper-border)",
                  background: "var(--paper-card)",
                }}
              >
                <div className="flex items-center gap-2">
                  <GitCompareArrows className="h-5 w-5" style={{ color: "var(--paper-accent)" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--paper-text-1)" }}>
                    Compare Top Candidates
                  </h2>
                </div>
                <button
                  onClick={() => setShowCompare(false)}
                  style={{
                    padding: 4,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--paper-text-3)",
                    display: "flex",
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div style={{ padding: 20 }}>
                <div className={`grid gap-4 grid-cols-1 ${results.slice(0, 3).length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {results.slice(0, 3).map((r) => (
                    <PaperCard
                      key={r._id}
                      padding="p-5"
                      style={r.rank === 1 ? { borderColor: "rgba(180,83,9,0.35)", background: "rgba(180,83,9,0.04)" } : {}}
                    >
                      <div className="text-center mb-4">
                        <div
                          className="torn-bg-dramatic"
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            marginBottom: 8,
                            border: "2px solid var(--paper-text-1)",
                            color: "#fff",
                            boxShadow: "2px 3px 0 var(--paper-text-1)",
                            fontFamily: "var(--font-caveat), 'Caveat', cursive",
                            ["--torn-color" as string]: "var(--paper-accent)",
                          } as React.CSSProperties}
                        >
                          {r.candidateName.charAt(0)}
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-text-1)" }}>
                          {r.candidateName}
                        </h3>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Trophy
                            className="h-4 w-4"
                            style={{
                              color:
                                r.rank === 1
                                  ? "var(--paper-amber)"
                                  : r.rank === 2
                                  ? "var(--paper-text-3)"
                                  : "var(--paper-amber)",
                            }}
                          />
                          <span style={{ fontSize: 16, color: "var(--paper-text-3)" }}>Rank #{r.rank}</span>
                        </div>
                        <div className="flex justify-center mt-3">
                          <ScoreRing score={r.overallScore} size={92} stroke={7} />
                        </div>
                        <div className="mt-3">
                          <PaperStatusBadge status={r.recommendation} />
                        </div>
                      </div>

                      <div className="flex justify-center mb-3">
                        <RadarChart
                          skills={r.breakdown.skillsMatch}
                          experience={r.breakdown.experienceMatch}
                          education={r.breakdown.educationMatch}
                          culture={r.breakdown.cultureFitMatch}
                          size={170}
                        />
                      </div>

                      <div
                        className="flex items-center justify-between mb-4"
                        style={{
                          background: "var(--paper-accent-soft)",
                          border: "1.5px solid var(--paper-border-acc)",
                          borderRadius: 5,
                          padding: "8px 12px",
                        }}
                      >
                        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-accent)" }}>
                          AI Confidence
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--paper-accent)",
                            fontFamily: "var(--font-caveat), 'Caveat', cursive",
                          }}
                        >
                          {r.confidenceScore}%
                        </span>
                      </div>

                      <div className="mb-3">
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--paper-text-3)",
                            letterSpacing: "0.06em",
                            marginBottom: 6,
                          }}
                        >
                          STRENGTHS
                        </p>
                        <div className="space-y-1">
                          {r.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle
                                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                style={{ color: "var(--paper-green)" }}
                              />
                              <span style={{ fontSize: 17, color: "var(--paper-text-2)" }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--paper-text-3)",
                            letterSpacing: "0.06em",
                            marginBottom: 6,
                          }}
                        >
                          GAPS
                        </p>
                        <div className="space-y-1">
                          {r.gaps.map((g, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <XCircle
                                className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                                style={{ color: "var(--paper-amber)" }}
                              />
                              <span style={{ fontSize: 17, color: "var(--paper-text-2)" }}>{g}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "var(--paper-accent-soft)",
                          border: "1.5px solid var(--paper-border-acc)",
                          borderRadius: 5,
                          padding: 12,
                        }}
                      >
                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--paper-accent)", marginBottom: 4 }}>
                          AI Reasoning
                        </p>
                        <p style={{ fontSize: 17, color: "var(--paper-text-2)", lineHeight: 1.5 }}>{r.reasoning}</p>
                      </div>
                    </PaperCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        {results.length > 0 && (
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <PaperButton
                variant={showFilters ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" /> Filters
              </PaperButton>
              {results.length >= 2 && (
                <PaperButton variant="ghost" size="sm" onClick={() => setShowCompare(true)}>
                  <GitCompareArrows className="h-4 w-4" /> Compare Top {Math.min(3, results.length)}
                </PaperButton>
              )}
              <span style={{ fontSize: 16, color: "var(--paper-text-3)" }}>
                {filteredResults.length} of {results.length} candidates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4" style={{ color: "var(--paper-text-4)" }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                style={{
                  fontSize: 17,
                  border: "1.5px solid var(--paper-border)",
                  borderRadius: 5,
                  padding: "6px 10px",
                  background: "var(--paper-card)",
                  color: "var(--paper-text-1)",
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="rank">Sort by Rank</option>
                <option value="score">Sort by Score</option>
                <option value="skills">Sort by Skills Match</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>
          </div>
        )}

        {showFilters && (
          <PaperCard className="mb-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div>
                <label
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--paper-text-3)",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  MIN SCORE
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    style={{ width: 128 }}
                  />
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--paper-text-1)",
                      width: 32,
                      fontFamily: "var(--font-caveat), 'Caveat', cursive",
                    }}
                  >
                    {minScore}
                  </span>
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--paper-text-3)",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  MATCH TYPE
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { value: "all", label: "All" },
                    { value: "strong_match", label: "Strong" },
                    { value: "good_match", label: "Good" },
                    { value: "partial_match", label: "Partial" },
                    { value: "weak_match", label: "Weak" },
                  ].map((f) => (
                    <FilterPill
                      key={f.value}
                      active={matchFilter === f.value}
                      onClick={() => setMatchFilter(f.value as FilterMatch)}
                    >
                      {f.label}
                    </FilterPill>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--paper-text-3)",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  DECISION
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { value: "all", label: "All" },
                    { value: "shortlisted", label: "Shortlisted" },
                    { value: "interview", label: "Interview" },
                    { value: "rejected", label: "Rejected" },
                    { value: "pending", label: "Pending" },
                  ].map((f) => (
                    <FilterPill
                      key={f.value}
                      active={decisionFilter === f.value}
                      onClick={() => setDecisionFilter(f.value as FilterDecision)}
                    >
                      {f.label}
                    </FilterPill>
                  ))}
                </div>
              </div>
              <PaperButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMinScore(0);
                  setMatchFilter("all");
                  setDecisionFilter("all");
                  setSortBy("rank");
                }}
              >
                Reset
              </PaperButton>
            </div>
          </PaperCard>
        )}

        {/* Results */}
        {results.length === 0 && !isScreening ? (
          <PaperCard>
            <EmptyState
              icon={Brain}
              title="No screening results"
              description="Run AI screening to analyze and rank your candidates."
              action={{ label: "Run Screening", onClick: triggerScreening }}
            />
          </PaperCard>
        ) : filteredResults.length === 0 && results.length > 0 ? (
          <PaperCard>
            <EmptyState
              icon={Filter}
              title="No candidates match your filters"
              description={`${results.length} candidates were screened, but none match the current filter settings.`}
              action={{
                label: "Reset Filters",
                onClick: () => {
                  setMinScore(0);
                  setMatchFilter("all");
                  setDecisionFilter("all");
                  setSortBy("rank");
                },
              }}
            />
          </PaperCard>
        ) : (
          filteredResults.length > 0 && (
            <div className="space-y-3">
              {filteredResults.map((r, idx) => {
                const isTop3 = r.rank <= 3;
                const isExpanded = expandedRow === r._id;
                const decisionBusy = decisionLoading === r.candidateId;

                return (
                  <div
                    key={r._id}
                    className="wb-fade-in"
                    style={{
                      background: "var(--paper-card)",
                      border: `1.5px solid ${isTop3 ? "var(--paper-border-acc)" : "var(--paper-border)"}`,
                      borderRadius: 6,
                      boxShadow: "var(--paper-shadow-card)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      ["--wb-delay" as string]: `${idx * 60}ms`,
                    } as React.CSSProperties}
                  >
                    {/* Row header */}
                    <div
                      className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : r._id)}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 flex-shrink-0">
                        {r.rank <= 3 ? (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background:
                                r.rank === 1 ? "rgba(180,83,9,0.15)" : r.rank === 2 ? "rgba(107,115,138,0.15)" : "rgba(180,83,9,0.1)",
                              border: `1.5px solid ${r.rank === 1 ? "rgba(180,83,9,0.4)" : r.rank === 2 ? "rgba(107,115,138,0.3)" : "rgba(180,83,9,0.3)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trophy
                              className="h-5 w-5"
                              style={{
                                color:
                                  r.rank === 1
                                    ? "var(--paper-amber)"
                                    : r.rank === 2
                                    ? "var(--paper-text-3)"
                                    : "var(--paper-amber)",
                              }}
                            />
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "var(--paper-text-4)",
                              fontFamily: "var(--font-caveat), 'Caveat', cursive",
                            }}
                          >
                            #{r.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar + Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="torn-bg-dramatic"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            border: "2px solid var(--paper-text-1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 17,
                            fontWeight: 700,
                            flexShrink: 0,
                            fontFamily: "var(--font-caveat), 'Caveat', cursive",
                            ["--torn-color" as string]: isTop3 ? "var(--paper-accent)" : "var(--paper-text-3)",
                          } as React.CSSProperties}
                        >
                          {r.candidateName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: "var(--paper-text-1)",
                                lineHeight: 1.2,
                              }}
                              className="truncate"
                            >
                              {r.candidateName}
                            </p>
                            {isTop3 && <PaperBadge variant="accent">Top {r.rank}</PaperBadge>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {r.candidateTopSkills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: 15,
                                  background: "var(--paper-input-bg)",
                                  color: "var(--paper-text-3)",
                                  padding: "1px 8px",
                                  borderRadius: 3,
                                  border: "1px solid var(--paper-border)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {r.candidateTopSkills.length > 3 && (
                              <span style={{ fontSize: 15, color: "var(--paper-text-4)" }}>
                                +{r.candidateTopSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score ring */}
                      <div className="hidden sm:block flex-shrink-0">
                        <ScoreRing score={r.overallScore} size={52} stroke={5} />
                      </div>

                      {/* Recommendation */}
                      <div className="flex-shrink-0">
                        <PaperStatusBadge status={r.recommendation} />
                      </div>

                      {/* Confidence */}
                      <div
                        className="hidden lg:flex items-center gap-1.5 w-20 flex-shrink-0"
                        style={{ fontSize: 16, color: "var(--paper-text-3)" }}
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>{r.confidenceScore}%</span>
                      </div>

                      {/* Decision buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {[
                          { key: "shortlisted", icon: CheckCircle, color: "var(--paper-green)", title: "Shortlist" },
                          { key: "interview", icon: Calendar, color: "var(--paper-accent)", title: "Interview" },
                          { key: "rejected", icon: XCircle, color: "var(--paper-red)", title: "Reject" },
                        ].map((d) => {
                          const isActive = r.recruiterDecision === d.key;
                          return (
                            <button
                              key={d.key}
                              onClick={() => handleDecision(r.candidateId, d.key)}
                              disabled={decisionBusy}
                              title={d.title}
                              style={{
                                padding: 6,
                                borderRadius: 4,
                                background: isActive ? `${d.color}20` : "transparent",
                                color: isActive ? d.color : "var(--paper-text-4)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <d.icon className="h-5 w-5" />
                            </button>
                          );
                        })}
                      </div>

                      <div
                        className="flex-shrink-0"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "", transition: "transform 0.15s" }}
                      >
                        <ChevronDown className="h-5 w-5" style={{ color: "var(--paper-text-4)" }} />
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div style={{ borderTop: "1.5px solid var(--paper-border)", background: "var(--paper-input-bg)" }}>
                        <div className="p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Score Breakdown + Radar */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4" style={{ color: "var(--paper-accent)" }} />
                                <h4
                                  style={{
                                    fontSize: 17,
                                    fontWeight: 700,
                                    color: "var(--paper-text-1)",
                                    letterSpacing: "0.06em",
                                  }}
                                >
                                  SCORE BREAKDOWN
                                </h4>
                              </div>
                              <div className="flex justify-center mb-4">
                                <RadarChart
                                  skills={r.breakdown.skillsMatch}
                                  experience={r.breakdown.experienceMatch}
                                  education={r.breakdown.educationMatch}
                                  culture={r.breakdown.cultureFitMatch}
                                  size={180}
                                />
                              </div>
                              <div className="space-y-3">
                                <ScoreBar score={r.breakdown.skillsMatch} label="Skills Match" />
                                <ScoreBar score={r.breakdown.experienceMatch} label="Experience" />
                                <ScoreBar score={r.breakdown.educationMatch} label="Education" />
                                <ScoreBar score={r.breakdown.cultureFitMatch} label="Culture Fit" />
                              </div>
                              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1.5px solid var(--paper-border)" }}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="h-4 w-4" style={{ color: "#7C3AED" }} />
                                    <span style={{ fontSize: 16, fontWeight: 600, color: "var(--paper-text-2)" }}>
                                      AI Confidence
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 17,
                                      fontWeight: 700,
                                      color: "#7C3AED",
                                      fontFamily: "var(--font-caveat), 'Caveat', cursive",
                                    }}
                                  >
                                    {r.confidenceScore}%
                                  </span>
                                </div>
                                <div
                                  style={{
                                    width: "100%",
                                    height: 6,
                                    background: "var(--paper-radar-grid)",
                                    borderRadius: 3,
                                  }}
                                >
                                  <div
                                    style={{
                                      height: 6,
                                      background: "#7C3AED",
                                      borderRadius: 3,
                                      width: `${r.confidenceScore}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Strengths & Gaps */}
                            <div>
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4" style={{ color: "var(--paper-green)" }} />
                                  <h4
                                    style={{
                                      fontSize: 17,
                                      fontWeight: 700,
                                      color: "var(--paper-text-1)",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    STRENGTHS
                                  </h4>
                                </div>
                                <div className="space-y-1.5">
                                  {r.strengths.map((s, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2"
                                      style={{
                                        background: "var(--paper-green-soft)",
                                        border: "1.5px solid rgba(13,148,136,0.25)",
                                        borderRadius: 5,
                                        padding: "8px 10px",
                                      }}
                                    >
                                      <CheckCircle
                                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                                        style={{ color: "var(--paper-green)" }}
                                      />
                                      <span style={{ fontSize: 16, color: "var(--paper-green)" }}>{s}</span>
                                    </div>
                                  ))}
                                  {r.strengths.length === 0 && (
                                    <p style={{ fontSize: 16, color: "var(--paper-text-4)", fontStyle: "italic" }}>
                                      No strengths identified
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-4 w-4" style={{ color: "var(--paper-amber)" }} />
                                  <h4
                                    style={{
                                      fontSize: 17,
                                      fontWeight: 700,
                                      color: "var(--paper-text-1)",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    GAPS
                                  </h4>
                                </div>
                                <div className="space-y-1.5">
                                  {r.gaps.map((g, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2"
                                      style={{
                                        background: "var(--paper-amber-soft)",
                                        border: "1.5px solid rgba(180,83,9,0.25)",
                                        borderRadius: 5,
                                        padding: "8px 10px",
                                      }}
                                    >
                                      <XCircle
                                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                                        style={{ color: "var(--paper-amber)" }}
                                      />
                                      <span style={{ fontSize: 16, color: "var(--paper-amber)" }}>{g}</span>
                                    </div>
                                  ))}
                                  {r.gaps.length === 0 && (
                                    <p style={{ fontSize: 16, color: "var(--paper-text-4)", fontStyle: "italic" }}>
                                      No significant gaps
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* AI Reasoning + Actions */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4" style={{ color: "var(--paper-accent)" }} />
                                <h4
                                  style={{
                                    fontSize: 17,
                                    fontWeight: 700,
                                    color: "var(--paper-text-1)",
                                    letterSpacing: "0.06em",
                                  }}
                                >
                                  AI REASONING
                                </h4>
                              </div>
                              <div
                                style={{
                                  background: "var(--paper-accent-soft)",
                                  border: "1.5px solid var(--paper-border-acc)",
                                  borderRadius: 5,
                                  padding: 12,
                                  marginBottom: 14,
                                }}
                              >
                                <p style={{ fontSize: 16, color: "var(--paper-text-2)", lineHeight: 1.5 }}>
                                  {r.reasoning}
                                </p>
                              </div>

                              <PaperCard padding="p-3">
                                <h4
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "var(--paper-text-3)",
                                    letterSpacing: "0.06em",
                                    marginBottom: 10,
                                  }}
                                >
                                  RECRUITER DECISION
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    {
                                      key: "shortlisted",
                                      icon: CheckCircle,
                                      label: "Shortlist",
                                      color: "var(--paper-green)",
                                      bg: "var(--paper-green-soft)",
                                    },
                                    {
                                      key: "interview",
                                      icon: Calendar,
                                      label: "Interview",
                                      color: "var(--paper-accent)",
                                      bg: "var(--paper-accent-soft)",
                                    },
                                    {
                                      key: "rejected",
                                      icon: XCircle,
                                      label: "Reject",
                                      color: "var(--paper-red)",
                                      bg: "var(--paper-red-soft)",
                                    },
                                  ].map((d) => {
                                    const isActive = r.recruiterDecision === d.key;
                                    return (
                                      <button
                                        key={d.key}
                                        onClick={() => handleDecision(r.candidateId, d.key)}
                                        disabled={decisionBusy}
                                        style={{
                                          padding: "10px 6px",
                                          borderRadius: 5,
                                          background: isActive ? d.color : d.bg,
                                          color: isActive ? "#fff" : d.color,
                                          border: isActive
                                            ? "2px solid var(--paper-text-1)"
                                            : `1.5px solid ${d.color}44`,
                                          fontSize: 17,
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: 4,
                                          fontFamily: "var(--font-caveat), 'Caveat', cursive",
                                          boxShadow: isActive ? "1px 2px 0 var(--paper-text-1)" : "none",
                                        }}
                                      >
                                        <d.icon className="h-5 w-5" />
                                        {d.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </PaperCard>

                              <PaperButton
                                variant="ghost"
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => router.push(`/candidates/${r.candidateId}`)}
                              >
                                View Full Profile <ArrowRight className="h-4 w-4" />
                              </PaperButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
