"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperBadge, PaperStatusBadge } from "@/components/paper/PaperBadge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import {
  Users,
  Brain,
  ArrowRight,
  MapPin,
  Building,
  Calendar,
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Columns3,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: "var(--paper-text-1)",
        marginBottom: 12,
      }}
    >
      {children}
    </h2>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sublabel,
  onClick,
  color,
}: {
  icon: typeof Users;
  label: React.ReactNode;
  sublabel: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <PaperCard onClick={onClick} padding="p-4">
      <div className="flex items-center gap-3">
        <div
          style={{
            background: `${color}14`,
            border: `1.5px solid ${color}33`,
            borderRadius: 6,
            padding: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--paper-text-1)",
              lineHeight: 1,
              fontFamily: "var(--font-caveat), 'Caveat', cursive",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 2 }}>{sublabel}</div>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: "var(--paper-text-4)" }} />
      </div>
    </PaperCard>
  );
}

export default function JobDetailPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const jobId = params.jobId as string;

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load job");
        return r.json();
      })
      .then((d) => {
        if (d.success) setJob(d.data);
        else setError(d.error || "Job not found");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  if (error || !job)
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <ErrorBanner message={error || "Job not found"} onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );

  const decisionColors = {
    shortlisted: { color: "#0D9488", bg: "rgba(13,148,136,0.08)", border: "rgba(13,148,136,0.25)" },
    interview: { color: "#4F46E5", bg: "rgba(79,70,229,0.08)", border: "rgba(79,70,229,0.25)" },
    rejected: { color: "#B91C1C", bg: "rgba(185,28,28,0.08)", border: "rgba(185,28,28,0.25)" },
    pending: { color: "#B45309", bg: "rgba(180,83,9,0.08)", border: "rgba(180,83,9,0.25)" },
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {job.title}
            </h1>
            <PaperStatusBadge status={job.status} />
            <PaperButton variant="ghost" size="sm" onClick={() => router.push(`/jobs/${jobId}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit
            </PaperButton>
            <PaperButton variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </PaperButton>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2" style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <QuickAction
            icon={Users}
            label={job.candidateCount}
            sublabel="Candidates"
            onClick={() => router.push(`/jobs/${jobId}/applicants`)}
            color="#4F46E5"
          />
          <QuickAction
            icon={Brain}
            label="AI Screening"
            sublabel={job.latestSession ? `Last: ${job.latestSession.status}` : "Not run yet"}
            onClick={() => router.push(`/jobs/${jobId}/results`)}
            color="#7C3AED"
          />
          <QuickAction
            icon={Columns3}
            label="Pipeline"
            sublabel={`Top ${job.screeningConfig.shortlistSize} · ${job.type}`}
            onClick={() => router.push(`/jobs/${jobId}/pipeline`)}
            color="#B45309"
          />
        </div>

        {/* Recruiter Decisions */}
        {job.decisions &&
          job.decisions.shortlisted + job.decisions.interview + job.decisions.rejected + job.decisions.pending > 0 && (
            <PaperCard className="mb-6">
              <SectionTitle>Candidate Decisions</SectionTitle>
              <p style={{ fontSize: 17, color: "var(--paper-text-4)", marginTop: -8, marginBottom: 14 }}>
                Click a category to view those candidates
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "shortlisted", label: "Shortlisted", count: job.decisions.shortlisted, icon: CheckCircle },
                  { key: "interview", label: "Interview", count: job.decisions.interview, icon: Calendar },
                  { key: "rejected", label: "Rejected", count: job.decisions.rejected, icon: XCircle },
                  { key: "pending", label: "Pending", count: job.decisions.pending, icon: Clock },
                ].map((d) => {
                  const c = decisionColors[d.key as keyof typeof decisionColors];
                  return (
                    <div
                      key={d.key}
                      onClick={() => d.count > 0 && router.push(`/jobs/${jobId}/results?decision=${d.key}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 12,
                        borderRadius: 5,
                        background: c.bg,
                        border: `1.5px solid ${c.border}`,
                        cursor: d.count > 0 ? "pointer" : "default",
                        opacity: d.count > 0 ? 1 : 0.6,
                      }}
                    >
                      <d.icon className="h-5 w-5 flex-shrink-0" style={{ color: c.color }} />
                      <div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: c.color,
                            lineHeight: 1,
                            fontFamily: "var(--font-caveat), 'Caveat', cursive",
                          }}
                        >
                          {d.count}
                        </div>
                        <div style={{ fontSize: 17, color: c.color, marginTop: 2 }}>{d.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const total =
                  job.decisions.shortlisted +
                  job.decisions.interview +
                  job.decisions.rejected +
                  job.decisions.pending;
                const reviewed = job.decisions.shortlisted + job.decisions.interview + job.decisions.rejected;
                if (total === 0) return null;
                return (
                  <div className="mt-4">
                    <div
                      className="flex justify-between"
                      style={{ fontSize: 17, color: "var(--paper-text-3)", marginBottom: 4 }}
                    >
                      <span>
                        {reviewed} of {total} reviewed
                      </span>
                      <span>{Math.round((reviewed / total) * 100)}%</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: "var(--paper-radar-grid)",
                        borderRadius: 4,
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      {job.decisions.shortlisted > 0 && (
                        <div
                          style={{
                            background: "var(--paper-green)",
                            height: "100%",
                            width: `${(job.decisions.shortlisted / total) * 100}%`,
                          }}
                        />
                      )}
                      {job.decisions.interview > 0 && (
                        <div
                          style={{
                            background: "var(--paper-accent)",
                            height: "100%",
                            width: `${(job.decisions.interview / total) * 100}%`,
                          }}
                        />
                      )}
                      {job.decisions.rejected > 0 && (
                        <div
                          style={{
                            background: "var(--paper-red)",
                            height: "100%",
                            width: `${(job.decisions.rejected / total) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })()}
            </PaperCard>
          )}

        <PaperCard className="mb-6">
          <SectionTitle>Job Description</SectionTitle>
          <p
            style={{
              fontSize: 16,
              color: "var(--paper-text-2)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {job.description}
          </p>
        </PaperCard>

        <PaperCard className="mb-6">
          <SectionTitle>Requirements</SectionTitle>
          <div className="space-y-4">
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "var(--paper-text-2)", marginBottom: 8 }}>
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.skills.map((s) => (
                  <PaperBadge key={s} variant="info">
                    {s}
                  </PaperBadge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: 17, fontWeight: 600, color: "var(--paper-text-2)" }}>Experience</p>
                <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>
                  {job.requirements.experience.min}-{job.requirements.experience.max} years
                </p>
              </div>
              {job.requirements.education && (
                <div>
                  <p style={{ fontSize: 17, fontWeight: 600, color: "var(--paper-text-2)" }}>Education</p>
                  <p style={{ fontSize: 17, color: "var(--paper-text-3)" }}>{job.requirements.education}</p>
                </div>
              )}
            </div>
          </div>
        </PaperCard>

        <PaperCard>
          <SectionTitle>Screening Configuration</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {[
              { label: "Skills", value: job.screeningConfig.weightSkills },
              { label: "Experience", value: job.screeningConfig.weightExperience },
              { label: "Education", value: job.screeningConfig.weightEducation },
              { label: "Culture Fit", value: job.screeningConfig.weightCultureFit },
            ].map((w) => (
              <div key={w.label} className="text-center">
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--paper-accent)",
                    fontFamily: "var(--font-caveat), 'Caveat', cursive",
                    lineHeight: 1,
                  }}
                >
                  {w.value}%
                </p>
                <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 4 }}>{w.label}</p>
              </div>
            ))}
          </div>
        </PaperCard>
      </div>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Job">
        <p style={{ fontSize: 17, color: "var(--paper-text-2)", marginBottom: 16, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{job.title}</strong>? This will permanently remove the job, all
          candidates, and all screening results. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <PaperButton variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </PaperButton>
          <PaperButton
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={async () => {
              setDeleting(true);
              const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
              const data = await res.json();
              if (data.success) {
                toast("Job deleted");
                router.push("/jobs");
              } else {
                toast(data.error || "Failed to delete job", "error");
                setDeleting(false);
                setShowDeleteModal(false);
              }
            }}
          >
            Delete Job
          </PaperButton>
        </div>
      </Modal>
    </AppLayout>
  );
}
