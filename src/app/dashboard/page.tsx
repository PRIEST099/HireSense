"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Briefcase, Users, Brain, TrendingUp, Plus, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperStatusBadge } from "@/components/paper/PaperBadge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { useCountUp } from "@/hooks/useCountUp";
import type { Job } from "@/types/job";

interface StatItem {
  label: string;
  value: number;
  icon: typeof Briefcase;
  color: string;
}

function StatCard({ label, value, icon: Icon, color, index }: StatItem & { index: number }) {
  const display = useCountUp(value, 900, 150 + index * 75);
  return (
    <PaperCard padding="p-5" animationDelay={index * 75}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          className="torn-bg-dramatic"
          style={{
            width: 42,
            height: 42,
            borderRadius: 6,
            border: `1.5px solid ${color}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            ["--torn-color" as string]: `${color}14`,
          } as React.CSSProperties}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "var(--paper-text-1)",
              lineHeight: 1,
              fontFamily: "var(--font-caveat), 'Caveat', cursive",
            }}
          >
            {display}
          </div>
          <div style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 2 }}>{label}</div>
        </div>
      </div>
    </PaperCard>
  );
}

export default function DashboardPage() {
  const { status } = useSession({ required: true });
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalCandidates: 0, screeningsRun: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, statsRes] = await Promise.all([fetch("/api/jobs"), fetch("/api/stats")]);
        if (!jobsRes.ok) throw new Error("Failed to load jobs");
        const data = await jobsRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : { success: false };
        if (data.success) {
          const jobList = data.data as Job[];
          setJobs(jobList);
          setStats({
            totalJobs: jobList.length,
            activeJobs: jobList.filter((j) => j.status === "open" || j.status === "screening").length,
            totalCandidates: statsData.success ? statsData.data.totalCandidates : 0,
            screeningsRun: statsData.success
              ? statsData.data.screeningsRun
              : jobList.filter((j) => j.status !== "draft").length,
          });
        }
      } catch {
        setError("Failed to load dashboard data. Please try again.");
      }
      setLoading(false);
    }
    if (status === "authenticated") load();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  const statCards: StatItem[] = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "#4F46E5" },
    { label: "Active Jobs", value: stats.activeJobs, icon: TrendingUp, color: "#0D9488" },
    { label: "Screenings Run", value: stats.screeningsRun, icon: Brain, color: "#7C3AED" },
    { label: "Total Candidates", value: stats.totalCandidates, icon: Users, color: "#B45309" },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "var(--paper-text-1)",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 4 }}>Overview of your recruitment activity.</p>
      </div>

      {error && (
        <div style={{ marginBottom: 20 }}>
          <ErrorBanner message={error} onRetry={() => window.location.reload()} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 28 }}>
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)" }}>Recent Jobs</h2>
        <PaperButton onClick={() => router.push("/jobs/new")} size="sm">
          <Plus className="h-4 w-4" /> New Job
        </PaperButton>
      </div>

      {jobs.length === 0 ? (
        <PaperCard>
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first job posting or load demo data to see AI screening in action."
            action={{ label: "Create Job", onClick: () => router.push("/jobs/new") }}
          />
          <div className="flex justify-center mt-2 pb-2">
            <PaperButton
              variant="ghost"
              size="sm"
              onClick={async () => {
                const res = await fetch("/api/seed", { method: "POST" });
                const data = await res.json();
                if (data.success) window.location.reload();
              }}
            >
              <Sparkles className="h-4 w-4" /> Load Demo Data
            </PaperButton>
          </div>
        </PaperCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.slice(0, 6).map((job, idx) => (
            <PaperCard key={job._id} animationDelay={idx * 75} onClick={() => router.push(`/jobs/${job._id}`)}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "var(--paper-text-1)",
                    lineHeight: 1.2,
                  }}
                  className="line-clamp-1"
                >
                  {job.title}
                </h3>
                <PaperStatusBadge status={job.status} />
              </div>
              <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginBottom: 8 }}>
                {job.company} &middot; {job.location}
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, color: "var(--paper-text-4)" }}
              >
                <span>{job.requirements.skills.length} required skills</span>
                <span>&middot;</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </PaperCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
