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
import { Users, Brain, FileText, ArrowRight, MapPin, Building, Calendar, Pencil } from "lucide-react";

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
