"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Users, Brain, FileText, ArrowRight, MapPin, Building, Calendar, Pencil, CheckCircle, XCircle, Clock } from "lucide-react";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: string;
  requirements: {
    skills: string[];
    experience: { min: number; max: number };
    education: string;
  };
  screeningConfig: {
    shortlistSize: number;
    weightSkills: number;
    weightExperience: number;
    weightEducation: number;
    weightCultureFit: number;
  };
  candidateCount: number;
  latestSession: { status: string; completedAt: string } | null;
  decisions: { shortlisted: number; interview: number; rejected: number; pending: number };
  createdAt: string;
}

export default function JobDetailPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jobId = params.jobId as string;

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load job"); return r.json(); })
      .then((d) => { if (d.success) setJob(d.data); else setError(d.error || "Job not found"); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !job) return <AppLayout><div className="max-w-4xl mx-auto"><ErrorBanner message={error || "Job not found"} onRetry={() => window.location.reload()} /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${jobId}/edit`)} className="mb-3">
              <Pencil className="h-4 w-4" /> Edit Job
            </Button>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => router.push(`/jobs/${jobId}/applicants`)}>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{job.candidateCount}</p>
                <p className="text-sm text-gray-500">Candidates</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Card>

          <Card className="cursor-pointer hover:border-purple-300 transition-colors" onClick={() => router.push(`/jobs/${jobId}/results`)}>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">AI Screening</p>
                <p className="text-sm text-gray-500">
                  {job.latestSession ? `Last: ${job.latestSession.status}` : "Not run yet"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Shortlist: Top {job.screeningConfig.shortlistSize}</p>
                <p className="text-sm text-gray-500">{job.type}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recruiter Decisions for this job */}
        {job.decisions && (job.decisions.shortlisted + job.decisions.interview + job.decisions.rejected + job.decisions.pending) > 0 && (
          <Card className="mb-6">
            <CardTitle>Candidate Decisions</CardTitle>
            <p className="text-xs text-gray-400 mt-1 mb-4">Click a category to view those candidates</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "shortlisted", label: "Shortlisted", count: job.decisions.shortlisted, icon: CheckCircle, bg: "bg-green-50 hover:bg-green-100", iconColor: "text-green-600", textColor: "text-green-700", subColor: "text-green-600", border: "border-green-200" },
                { key: "interview", label: "Interview", count: job.decisions.interview, icon: Calendar, bg: "bg-purple-50 hover:bg-purple-100", iconColor: "text-purple-600", textColor: "text-purple-700", subColor: "text-purple-600", border: "border-purple-200" },
                { key: "rejected", label: "Rejected", count: job.decisions.rejected, icon: XCircle, bg: "bg-red-50 hover:bg-red-100", iconColor: "text-red-500", textColor: "text-red-700", subColor: "text-red-600", border: "border-red-200" },
                { key: "pending", label: "Pending", count: job.decisions.pending, icon: Clock, bg: "bg-gray-50 hover:bg-gray-100", iconColor: "text-gray-500", textColor: "text-gray-700", subColor: "text-gray-500", border: "border-gray-200" },
              ].map((d) => (
                <div
                  key={d.key}
                  onClick={() => d.count > 0 && router.push(`/jobs/${jobId}/results?decision=${d.key}`)}
                  className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${d.bg} ${d.border} ${d.count > 0 ? "cursor-pointer" : "opacity-60"}`}
                >
                  <d.icon className={`h-5 w-5 ${d.iconColor}`} />
                  <div>
                    <p className={`text-xl font-bold ${d.textColor}`}>{d.count}</p>
                    <p className={`text-xs ${d.subColor}`}>{d.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            {(() => {
              const total = job.decisions.shortlisted + job.decisions.interview + job.decisions.rejected + job.decisions.pending;
              const reviewed = job.decisions.shortlisted + job.decisions.interview + job.decisions.rejected;
              if (total === 0) return null;
              return (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{reviewed} of {total} reviewed</span>
                    <span>{Math.round((reviewed / total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                    {job.decisions.shortlisted > 0 && <div className="bg-green-500 h-full" style={{ width: `${(job.decisions.shortlisted / total) * 100}%` }} />}
                    {job.decisions.interview > 0 && <div className="bg-purple-500 h-full" style={{ width: `${(job.decisions.interview / total) * 100}%` }} />}
                    {job.decisions.rejected > 0 && <div className="bg-red-400 h-full" style={{ width: `${(job.decisions.rejected / total) * 100}%` }} />}
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Description */}
        <Card className="mb-6">
          <CardTitle>Job Description</CardTitle>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{job.description}</p>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardTitle>Requirements</CardTitle>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.skills.map((s) => (
                  <Badge key={s} variant="info">{s}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-500">{job.requirements.experience.min}-{job.requirements.experience.max} years</p>
              </div>
              {job.requirements.education && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Education</p>
                  <p className="text-sm text-gray-500">{job.requirements.education}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Screening Config */}
        <Card>
          <CardTitle>Screening Configuration</CardTitle>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Skills", value: job.screeningConfig.weightSkills },
              { label: "Experience", value: job.screeningConfig.weightExperience },
              { label: "Education", value: job.screeningConfig.weightEducation },
              { label: "Culture Fit", value: job.screeningConfig.weightCultureFit },
            ].map((w) => (
              <div key={w.label} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{w.value}%</p>
                <p className="text-xs text-gray-500">{w.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
