"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ProgressBar, ScoreBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { AIDisclaimer } from "@/components/shared/AIDisclaimer";
import { ScoreDistributionChart } from "@/components/screening/ScoreDistributionChart";
import {
  Brain,
  Play,
  Download,
  ChevronDown,
  ChevronUp,
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
  Briefcase,
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
  screeningConfig: { shortlistSize: number; weightSkills: number; weightExperience: number; weightEducation: number; weightCultureFit: number };
}

type SortField = "rank" | "score" | "skills" | "experience";
type FilterMatch = "all" | "strong_match" | "good_match" | "partial_match" | "weak_match";

export default function ResultsPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);

  // Filters
  const [minScore, setMinScore] = useState(0);
  const [matchFilter, setMatchFilter] = useState<FilterMatch>("all");
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const loadResults = useCallback(async () => {
    const [resultsRes, jobRes] = await Promise.all([
      fetch(`/api/jobs/${jobId}/results`),
      fetch(`/api/jobs/${jobId}`),
    ]);
    const resultsData = await resultsRes.json();
    const jobData = await jobRes.json();
    if (resultsData.success) {
      setSession(resultsData.data.session);
      setResults(resultsData.data.results);
      // Results loaded — auto-expand handled by separate useEffect
    }
    if (jobData.success) setJob(jobData.data);
    setLoading(false);
  }, [jobId]);

  useEffect(() => { loadResults(); }, [loadResults]);

  useEffect(() => {
    if (!session || !["pending", "processing"].includes(session.status)) return;
    const interval = setInterval(loadResults, 3000);
    return () => clearInterval(interval);
  }, [session, loadResults]);

  // Fix #5: Auto-expand first candidate in separate effect (no stale closure)
  useEffect(() => {
    if (results.length > 0 && expandedRow === null) {
      setExpandedRow(results[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const triggerScreening = async () => {
    setTriggerLoading(true);
    const res = await fetch(`/api/jobs/${jobId}/screen`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setSession(data.data);
      setResults([]);
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
        prev.map((r) => r.candidateId === candidateId ? { ...r, recruiterDecision: decision } : r)
      );
    }
    setDecisionLoading(null);
  };

  const filteredResults = useMemo(() => {
    let filtered = results.filter((r) => r.overallScore >= minScore);
    if (matchFilter !== "all") filtered = filtered.filter((r) => r.recommendation === matchFilter);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "score": return b.overallScore - a.overallScore;
        case "skills": return b.breakdown.skillsMatch - a.breakdown.skillsMatch;
        case "experience": return b.breakdown.experienceMatch - a.breakdown.experienceMatch;
        default: return a.rank - b.rank;
      }
    });
  }, [results, minScore, matchFilter, sortBy]);

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Email", "Score", "Skills Match", "Experience", "Education", "Culture Fit", "Confidence", "Recommendation", "Decision", "Strengths", "Gaps", "AI Reasoning"];
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

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  const isScreening = session && ["pending", "processing"].includes(session.status);
  const topCandidate = results.length > 0 ? results[0] : null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">

        {/* Job Context Header */}
        {job && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-5 w-5 text-blue-200" />
                  <span className="text-blue-200 text-sm font-medium">{job.company}</span>
                </div>
                <h1 className="text-2xl font-bold mb-3">{job.title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.requirements.skills.slice(0, 6).map((s) => (
                    <span key={s} className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                  {job.requirements.skills.length > 6 && (
                    <span className="bg-white/10 text-blue-200 text-xs px-2.5 py-1 rounded-full">
                      +{job.requirements.skills.length - 6} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-200">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span>{job.requirements.experience.min}-{job.requirements.experience.max} years experience</span>
                  <span>Top {job.screeningConfig.shortlistSize} shortlist</span>
                </div>
              </div>
              <div className="flex gap-2">
                {results.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={exportCSV} className="text-white hover:bg-white/10">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                )}
                <Button
                  onClick={triggerScreening}
                  loading={triggerLoading || !!isScreening}
                  disabled={!!isScreening}
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  <Play className="h-4 w-4" /> {isScreening ? "Screening..." : "Run AI Screening"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar during screening */}
        {isScreening && session && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">AI Screening in progress</p>
                <p className="text-xs text-gray-500">Analyzing candidates against job requirements...</p>
              </div>
            </div>
            <ProgressBar
              value={session.processedCandidates}
              max={session.totalCandidates}
              label={`Scoring candidates (${session.processedCandidates} of ${session.totalCandidates})`}
            />
          </Card>
        )}

        {/* Responsible AI Notice */}
        {results.length > 0 && !isScreening && (
          <div className="mb-4">
            <AIDisclaimer compact />
          </div>
        )}

        {/* Stats bar when results exist */}
        {results.length > 0 && !isScreening && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="text-center py-4">
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500">Candidates Screened</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-bold text-green-600">{results.filter((r) => r.recommendation === "strong_match").length}</p>
              <p className="text-xs text-gray-500">Strong Matches</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-bold text-blue-600">{Math.round(results.reduce((s, r) => s + r.overallScore, 0) / results.length)}</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-bold text-purple-600">{Math.round(results.reduce((s, r) => s + r.confidenceScore, 0) / results.length)}%</p>
              <p className="text-xs text-gray-500">Avg AI Confidence</p>
            </Card>
          </div>
        )}

        {/* Score Distribution Chart */}
        {results.length > 1 && !isScreening && (
          <Card className="mb-6">
            <ScoreDistributionChart
              candidates={results.map((r) => ({ name: r.candidateName, score: r.overallScore, rank: r.rank }))}
              shortlistSize={job?.screeningConfig.shortlistSize || 10}
            />
          </Card>
        )}

        {/* Why #1 highlight */}
        {topCandidate && !isScreening && results.length > 1 && (
          <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-2.5 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Top Candidate: {topCandidate.candidateName}</h3>
                  <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">#{topCandidate.rank}</span>
                  <span className="text-2xl font-bold text-green-600">{topCandidate.overallScore}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{topCandidate.reasoning}</p>
                <div className="flex flex-wrap gap-1.5">
                  {topCandidate.strengths.map((s, i) => (
                    <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/candidates/${topCandidate.candidateId}`)}>
                <Eye className="h-4 w-4" /> View
              </Button>
            </div>
          </Card>
        )}

        {/* Compare Top 3 Modal */}
        {showCompare && results.length >= 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCompare(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  <GitCompareArrows className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Compare Top Candidates</h2>
                </div>
                <button onClick={() => setShowCompare(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className={`grid gap-4 ${results.slice(0, 3).length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {results.slice(0, 3).map((r) => (
                    <div key={r._id} className={`rounded-xl border-2 p-5 ${r.rank === 1 ? "border-yellow-300 bg-yellow-50/30" : "border-gray-200"}`}>
                      {/* Header */}
                      <div className="text-center mb-4">
                        <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-lg font-bold mb-2 ${
                          r.rank === 1 ? "bg-yellow-100 text-yellow-700" : r.rank === 2 ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}>
                          {r.candidateName.charAt(0)}
                        </div>
                        <h3 className="font-bold text-gray-900">{r.candidateName}</h3>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Trophy className={`h-4 w-4 ${r.rank === 1 ? "text-yellow-500" : r.rank === 2 ? "text-gray-400" : "text-orange-400"}`} />
                          <span className="text-sm text-gray-500">Rank #{r.rank}</span>
                        </div>
                        <p className={`text-4xl font-bold mt-2 ${r.overallScore >= 80 ? "text-green-600" : r.overallScore >= 60 ? "text-blue-600" : "text-yellow-600"}`}>
                          {r.overallScore}
                        </p>
                        <StatusBadge status={r.recommendation} />
                      </div>

                      {/* Score bars */}
                      <div className="space-y-2.5 mb-4">
                        {[
                          { label: "Skills", score: r.breakdown.skillsMatch },
                          { label: "Experience", score: r.breakdown.experienceMatch },
                          { label: "Education", score: r.breakdown.educationMatch },
                          { label: "Culture Fit", score: r.breakdown.cultureFitMatch },
                        ].map((s) => (
                          <div key={s.label}>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-xs text-gray-500">{s.label}</span>
                              <span className="text-xs font-bold text-gray-700">{s.score}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${s.score >= 70 ? "bg-green-500" : s.score >= 50 ? "bg-yellow-500" : "bg-red-400"}`}
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Confidence */}
                      <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2 mb-4">
                        <span className="text-xs font-medium text-purple-700">AI Confidence</span>
                        <span className="text-sm font-bold text-purple-700">{r.confidenceScore}%</span>
                      </div>

                      {/* Strengths */}
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Strengths</p>
                        <div className="space-y-1">
                          {r.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gaps */}
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gaps</p>
                        <div className="space-y-1">
                          {r.gaps.map((g, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <XCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{g}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-blue-700 mb-1">AI Reasoning</p>
                        <p className="text-xs text-blue-800 leading-relaxed">{r.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        {results.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant={showFilters ? "primary" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" /> Filters
              </Button>
              {results.length >= 2 && (
                <Button variant="outline" size="sm" onClick={() => setShowCompare(true)}>
                  <GitCompareArrows className="h-4 w-4" /> Compare Top {Math.min(3, results.length)}
                </Button>
              )}
              <span className="text-sm text-gray-500">{filteredResults.length} of {results.length} candidates</span>
            </div>
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
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
          <Card className="mb-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Min Score</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-32 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900 w-8">{minScore}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Match Type</label>
                <div className="flex gap-1.5">
                  {[
                    { value: "all", label: "All" },
                    { value: "strong_match", label: "Strong" },
                    { value: "good_match", label: "Good" },
                    { value: "partial_match", label: "Partial" },
                    { value: "weak_match", label: "Weak" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setMatchFilter(f.value as FilterMatch)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        matchFilter === f.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setMinScore(0); setMatchFilter("all"); setSortBy("rank"); }}>
                Reset
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {results.length === 0 && !isScreening ? (
          <Card>
            <EmptyState
              icon={Brain}
              title="No screening results"
              description="Run AI screening to analyze and rank your candidates."
              action={{ label: "Run Screening", onClick: triggerScreening }}
            />
          </Card>
        ) : filteredResults.length === 0 && results.length > 0 ? (
          <Card>
            <EmptyState
              icon={Filter}
              title="No candidates match your filters"
              description={`${results.length} candidates were screened, but none match the current filter settings. Try adjusting the minimum score or match type.`}
              action={{ label: "Reset Filters", onClick: () => { setMinScore(0); setMatchFilter("all"); setSortBy("rank"); } }}
            />
          </Card>
        ) : filteredResults.length > 0 && (
          <div className="space-y-3">
            {filteredResults.map((r) => {
              const isTop3 = r.rank <= 3;
              const isExpanded = expandedRow === r._id;
              const decisionBusy = decisionLoading === r.candidateId;

              return (
                <div
                  key={r._id}
                  className={`bg-white rounded-xl border transition-all ${
                    isTop3 ? "border-blue-200 shadow-md shadow-blue-50" : "border-gray-200"
                  } ${isExpanded ? "ring-2 ring-blue-100" : "hover:shadow-md"}`}
                >
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedRow(isExpanded ? null : r._id)}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10">
                      {r.rank === 1 ? (
                        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        </div>
                      ) : r.rank === 2 ? (
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-gray-500" />
                        </div>
                      ) : r.rank === 3 ? (
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-orange-500" />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-300">#{r.rank}</span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isTop3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {r.candidateName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{r.candidateName}</p>
                          {isTop3 && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              Top {r.rank}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {r.candidateTopSkills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                          {r.candidateTopSkills.length > 3 && (
                            <span className="text-[11px] text-gray-400">+{r.candidateTopSkills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score with mini bar */}
                    <div className="w-28 text-center">
                      <p className={`text-3xl font-bold ${
                        r.overallScore >= 80 ? "text-green-600" : r.overallScore >= 60 ? "text-blue-600" : r.overallScore >= 40 ? "text-yellow-600" : "text-red-500"
                      }`}>
                        {r.overallScore}
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            r.overallScore >= 80 ? "bg-green-500" : r.overallScore >= 60 ? "bg-blue-500" : r.overallScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${r.overallScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommendation */}
                    <StatusBadge status={r.recommendation} />

                    {/* Confidence */}
                    <div className="hidden lg:flex items-center gap-1.5 w-20">
                      <Shield className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">{r.confidenceScore}%</span>
                    </div>

                    {/* Decision buttons (inline) */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDecision(r.candidateId, "shortlisted")}
                        disabled={decisionBusy}
                        className={`p-1.5 rounded-lg transition-colors ${
                          r.recruiterDecision === "shortlisted"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-300 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title="Shortlist"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDecision(r.candidateId, "interview")}
                        disabled={decisionBusy}
                        className={`p-1.5 rounded-lg transition-colors ${
                          r.recruiterDecision === "interview"
                            ? "bg-purple-100 text-purple-700"
                            : "text-gray-300 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                        title="Interview"
                      >
                        <Calendar className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDecision(r.candidateId, "rejected")}
                        disabled={decisionBusy}
                        className={`p-1.5 rounded-lg transition-colors ${
                          r.recruiterDecision === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Expand toggle */}
                    <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                          {/* Column 1: Score Breakdown */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-4 w-4 text-blue-600" />
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Score Breakdown</h4>
                            </div>
                            <div className="space-y-3">
                              <ScoreBar score={r.breakdown.skillsMatch} label="Skills Match" />
                              <ScoreBar score={r.breakdown.experienceMatch} label="Experience" />
                              <ScoreBar score={r.breakdown.educationMatch} label="Education" />
                              <ScoreBar score={r.breakdown.cultureFitMatch} label="Culture Fit" />
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                                </div>
                                <span className={`text-lg font-bold ${
                                  r.confidenceScore >= 80 ? "text-green-600" : r.confidenceScore >= 60 ? "text-blue-600" : "text-yellow-600"
                                }`}>
                                  {r.confidenceScore}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1.5">
                                <div
                                  className={`h-2 rounded-full ${
                                    r.confidenceScore >= 80 ? "bg-purple-500" : r.confidenceScore >= 60 ? "bg-purple-400" : "bg-purple-300"
                                  }`}
                                  style={{ width: `${r.confidenceScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Strengths & Gaps */}
                          <div>
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-green-600" />
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Strengths</h4>
                              </div>
                              <div className="space-y-1.5">
                                {r.strengths.map((s, i) => (
                                  <div key={i} className="flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-800">{s}</span>
                                  </div>
                                ))}
                                {r.strengths.length === 0 && (
                                  <p className="text-sm text-gray-400 italic">No strengths identified</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-amber-600" />
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Gaps</h4>
                              </div>
                              <div className="space-y-1.5">
                                {r.gaps.map((g, i) => (
                                  <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2">
                                    <XCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-amber-800">{g}</span>
                                  </div>
                                ))}
                                {r.gaps.length === 0 && (
                                  <p className="text-sm text-gray-400 italic">No significant gaps</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Column 3: AI Reasoning + Actions */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">AI Reasoning</h4>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                              <p className="text-sm text-blue-900 leading-relaxed">{r.reasoning}</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recruiter Decision</h4>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => handleDecision(r.candidateId, "shortlisted")}
                                  disabled={decisionBusy}
                                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                                    r.recruiterDecision === "shortlisted"
                                      ? "bg-green-600 text-white shadow-md"
                                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                  }`}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleDecision(r.candidateId, "interview")}
                                  disabled={decisionBusy}
                                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                                    r.recruiterDecision === "interview"
                                      ? "bg-purple-600 text-white shadow-md"
                                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                  }`}
                                >
                                  <Calendar className="h-5 w-5" />
                                  Interview
                                </button>
                                <button
                                  onClick={() => handleDecision(r.candidateId, "rejected")}
                                  disabled={decisionBusy}
                                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                                    r.recruiterDecision === "rejected"
                                      ? "bg-red-600 text-white shadow-md"
                                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                  }`}
                                >
                                  <XCircle className="h-5 w-5" />
                                  Reject
                                </button>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => router.push(`/candidates/${r.candidateId}`)}
                            >
                              View Full Profile <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
