"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Briefcase, Users, Brain, TrendingUp, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Job } from "@/types/job";

export default function DashboardPage() {
  const { status } = useSession({ required: true });
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalCandidates: 0, screeningsRun: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data.success) {
          const jobList = data.data as Job[];
          setJobs(jobList);
          setStats({
            totalJobs: jobList.length,
            activeJobs: jobList.filter((j) => j.status === "open" || j.status === "screening").length,
            totalCandidates: 0,
            screeningsRun: jobList.filter((j) => j.status !== "draft").length,
          });
        }
      } catch {
        // silent fail
      }
      setLoading(false);
    }
    if (status === "authenticated") load();
  }, [status]);

  if (status === "loading" || loading) {
    return <AppLayout><PageLoader /></AppLayout>;
  }

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "bg-blue-100 text-blue-600" },
    { label: "Active Jobs", value: stats.activeJobs, icon: TrendingUp, color: "bg-green-100 text-green-600" },
    { label: "Screenings Run", value: stats.screeningsRun, icon: Brain, color: "bg-purple-100 text-purple-600" },
    { label: "Total Candidates", value: stats.totalCandidates, icon: Users, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your recruitment activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
        <Button onClick={() => router.push("/jobs/new")} size="sm">
          <Plus className="h-4 w-4" /> New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first job posting to start screening candidates with AI."
            action={{ label: "Create Job", onClick: () => router.push("/jobs/new") }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.slice(0, 6).map((job) => (
            <Card
              key={job._id}
              className="cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div onClick={() => router.push(`/jobs/${job._id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-sm text-gray-500 mb-2">{job.company} &middot; {job.location}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{job.requirements.skills.length} required skills</span>
                  <span>&middot;</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
