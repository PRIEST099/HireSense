"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Briefcase, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJobs } from "@/store/slices/jobsSlice";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";

export default function JobsPage() {
  const { status } = useSession({ required: true });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: jobs, loading } = useAppSelector((s) => s.jobs);

  useEffect(() => {
    if (status === "authenticated") dispatch(fetchJobs());
  }, [status, dispatch]);

  if (status === "loading" || loading) {
    return <AppLayout><PageLoader /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">{jobs.length} job posting{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/jobs/new")}>
          <Plus className="h-4 w-4" /> Create Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs created"
            description="Create your first job to start screening candidates."
            action={{ label: "Create Job", onClick: () => router.push("/jobs/new") }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job._id}
              className="cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div
                onClick={() => router.push(`/jobs/${job._id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                      {job.company} &middot; {job.location} &middot; {job.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500">{job.requirements.skills.length} skills</p>
                    <p className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
