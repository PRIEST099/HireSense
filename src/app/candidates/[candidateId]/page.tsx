"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ProgressBar";
import { PageLoader } from "@/components/ui/Spinner";
import { ArrowLeft, Mail, Phone, MapPin, Globe, Link as LinkIcon, Award, CheckCircle, XCircle, Calendar } from "lucide-react";
import { AIDisclaimer } from "@/components/shared/AIDisclaimer";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { SkillRadarChart } from "@/components/screening/SkillRadarChart";
import type { Candidate } from "@/types/candidate";
import type { ScreeningResult } from "@/types/screening";

export default function CandidateDetailPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load candidate"); return r.json(); })
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
    }
    setDecisionLoading(false);
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !candidate) return <AppLayout><div className="max-w-4xl mx-auto"><ErrorBanner message={error || "Candidate not found"} onRetry={() => window.location.reload()} /></div></AppLayout>;

  const p = candidate.profile;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                {p.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {p.email}</span>}
                {p.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone}</span>}
                {p.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.location}</span>}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                {p.linkedIn && <a href={p.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon className="h-3.5 w-3.5" /> LinkedIn</a>}
                {p.portfolio && <a href={p.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe className="h-3.5 w-3.5" /> Portfolio</a>}
              </div>
            </div>
          </div>
          {result && (
            <div className="text-center">
              <p className={`text-4xl font-bold ${result.overallScore >= 70 ? "text-green-600" : result.overallScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {result.overallScore}
              </p>
              <StatusBadge status={result.recommendation} />
            </div>
          )}
        </div>

        {/* Responsible AI Notice */}
        {result && (
          <div className="mb-6">
            <AIDisclaimer />
          </div>
        )}

        {/* Human Decision Controls */}
        {result && (
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recruiter Decision</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Current: <StatusBadge status={result.recruiterDecision} /></p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={result.recruiterDecision === "shortlisted" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleDecision("shortlisted")}
                  disabled={decisionLoading}
                >
                  <CheckCircle className="h-4 w-4" /> Shortlist
                </Button>
                <Button
                  variant={result.recruiterDecision === "interview" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleDecision("interview")}
                  disabled={decisionLoading}
                >
                  <Calendar className="h-4 w-4" /> Interview
                </Button>
                <Button
                  variant={result.recruiterDecision === "rejected" ? "danger" : "outline"}
                  size="sm"
                  onClick={() => handleDecision("rejected")}
                  disabled={decisionLoading}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Analysis */}
          {result && (
            <div className="space-y-6">
              <Card>
                <CardTitle>Score Breakdown</CardTitle>
                <SkillRadarChart breakdown={result.breakdown} />
                <div className="mt-3 space-y-3">
                  <ScoreBar score={result.breakdown.skillsMatch} label="Skills Match" />
                  <ScoreBar score={result.breakdown.experienceMatch} label="Experience" />
                  <ScoreBar score={result.breakdown.educationMatch} label="Education" />
                  <ScoreBar score={result.breakdown.cultureFitMatch} label="Culture Fit" />
                  <div className="border-t pt-3 mt-3">
                    <ScoreBar score={result.confidenceScore} label="AI Confidence" />
                  </div>
                </div>
              </Card>

              <Card>
                <CardTitle>AI Reasoning</CardTitle>
                <p className="text-sm text-gray-600 mt-2 bg-blue-50 rounded-lg p-4">{result.reasoning}</p>
              </Card>

              <Card>
                <CardTitle>Strengths</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.strengths.map((s, i) => (
                    <Badge key={i} variant="success">{s}</Badge>
                  ))}
                </div>
              </Card>

              <Card>
                <CardTitle>Gaps</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.gaps.map((g, i) => (
                    <Badge key={i} variant="warning">{g}</Badge>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Profile details */}
          <div className="space-y-6">
            {p.summary && (
              <Card>
                <CardTitle>Summary</CardTitle>
                <p className="text-sm text-gray-600 mt-2">{p.summary}</p>
              </Card>
            )}

            <Card>
              <CardTitle>Skills</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.skills.map((s) => (
                  <Badge key={s.name} variant="info">
                    {s.name} {s.level !== "intermediate" && `(${s.level})`}
                  </Badge>
                ))}
                {p.skills.length === 0 && <p className="text-sm text-gray-400">No skills listed</p>}
              </div>
            </Card>

            <Card>
              <CardTitle>Experience ({p.totalYearsExperience} years)</CardTitle>
              <div className="mt-2 space-y-4">
                {p.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-4">
                    <p className="font-medium text-gray-900 text-sm">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.company} &middot; {exp.startDate} - {exp.endDate || "Present"}</p>
                    {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                ))}
                {p.experience.length === 0 && <p className="text-sm text-gray-400">No experience listed</p>}
              </div>
            </Card>

            <Card>
              <CardTitle>Education</CardTitle>
              <div className="mt-2 space-y-3">
                {p.education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                      <p className="text-xs text-gray-500">{edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ""}</p>
                    </div>
                  </div>
                ))}
                {p.education.length === 0 && <p className="text-sm text-gray-400">No education listed</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
