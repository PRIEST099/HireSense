"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Brain, Play, Download, ChevronDown, ChevronUp, Trophy } from "lucide-react";

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

export default function ResultsPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/results`);
    const data = await res.json();
    if (data.success) {
      setSession(data.data.session);
      setResults(data.data.results);
    }
    setLoading(false);
  }, [jobId]);

  useEffect(() => { loadResults(); }, [loadResults]);

  // Polling for in-progress screening
  useEffect(() => {
    if (!session || !["pending", "processing"].includes(session.status)) return;
    const interval = setInterval(loadResults, 3000);
    return () => clearInterval(interval);
  }, [session, loadResults]);

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

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Email", "Score", "Skills", "Experience", "Education", "Culture Fit", "Recommendation", "Strengths", "Gaps", "Reasoning"];
    const rows = results.map((r) => [
      r.rank, r.candidateName, r.candidateEmail, r.overallScore,
      r.breakdown.skillsMatch, r.breakdown.experienceMatch, r.breakdown.educationMatch, r.breakdown.cultureFitMatch,
      r.recommendation, r.strengths.join("; "), r.gaps.join("; "), r.reasoning,
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Screening Results</h1>
            {session && <p className="text-gray-500 mt-1">Session: <StatusBadge status={session.status} /></p>}
          </div>
          <div className="flex gap-2">
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            )}
            <Button onClick={triggerScreening} loading={triggerLoading || !!isScreening} disabled={!!isScreening}>
              <Play className="h-4 w-4" /> {isScreening ? "Screening..." : "Run AI Screening"}
            </Button>
          </div>
        </div>

        {/* Progress bar during screening */}
        {isScreening && session && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
              <p className="text-sm font-medium text-gray-900">AI Screening in progress...</p>
            </div>
            <ProgressBar
              value={session.processedCandidates}
              max={session.totalCandidates}
              label={`Processing candidates (${session.processedCandidates}/${session.totalCandidates})`}
            />
          </Card>
        )}

        {/* Results table */}
        {results.length === 0 && !isScreening ? (
          <Card>
            <EmptyState
              icon={Brain}
              title="No screening results"
              description="Run AI screening to analyze and rank your candidates."
              action={{ label: "Run Screening", onClick: triggerScreening }}
            />
          </Card>
        ) : results.length > 0 && (
          <div className="space-y-2">
            {results.map((r) => (
              <Card key={r._id} padding={false}>
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                >
                  <div className="flex items-center gap-2 w-12">
                    {r.rank <= 3 && <Trophy className={`h-4 w-4 ${r.rank === 1 ? "text-yellow-500" : r.rank === 2 ? "text-gray-400" : "text-orange-400"}`} />}
                    <span className="text-sm font-bold text-gray-900">#{r.rank}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{r.candidateName}</p>
                    <div className="flex gap-1 mt-1">
                      {r.candidateTopSkills.slice(0, 3).map((s) => (
                        <Badge key={s} size="sm" variant="info">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-center w-20">
                    <p className={`text-2xl font-bold ${r.overallScore >= 70 ? "text-green-600" : r.overallScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {r.overallScore}
                    </p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>

                  <StatusBadge status={r.recommendation} />

                  <div className="w-24">
                    <StatusBadge status={r.recruiterDecision} />
                  </div>

                  {expandedRow === r._id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>

                {expandedRow === r._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</p>
                        <div className="space-y-2">
                          <ScoreBar score={r.breakdown.skillsMatch} label="Skills Match" />
                          <ScoreBar score={r.breakdown.experienceMatch} label="Experience" />
                          <ScoreBar score={r.breakdown.educationMatch} label="Education" />
                          <ScoreBar score={r.breakdown.cultureFitMatch} label="Culture Fit" />
                        </div>
                        <div className="mt-3">
                          <ScoreBar score={r.confidenceScore} label="AI Confidence" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Strengths</p>
                          <div className="flex flex-wrap gap-1">
                            {r.strengths.map((s, i) => (
                              <Badge key={i} variant="success" size="sm">{s}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Gaps</p>
                          <div className="flex flex-wrap gap-1">
                            {r.gaps.map((g, i) => (
                              <Badge key={i} variant="warning" size="sm">{g}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">AI Reasoning</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{r.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/candidates/${r.candidateId}`)}>
                        View Full Profile
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
