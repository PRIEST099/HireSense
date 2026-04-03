"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ErrorBanner } from "@/components/shared/ErrorBanner";

type StatusFilter = "all" | "draft" | "open" | "screening" | "closed";

export default function JobsPage() {
  const { status } = useSession({ required: true });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: jobs, loading, error } = useAppSelector((s) => s.jobs);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (status === "authenticated") dispatch(fetchJobs());
  }, [status, dispatch]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((j) => j.status === statusFilter);
    }
    return filtered;
  }, [jobs, searchQuery, statusFilter]);

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

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={() => dispatch(fetchJobs())} /></div>}

      {/* Search & Filter */}
      {jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "draft", "open", "screening", "closed"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs created"
            description="Create your first job to start screening candidates."
            action={{ label: "Create Job", onClick: () => router.push("/jobs/new") }}
          />
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No jobs match your search"
            description="Try a different search term or filter."
            action={{ label: "Clear Filters", onClick: () => { setSearchQuery(""); setStatusFilter("all"); } }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Card
              key={job._id}
              className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div
                onClick={() => router.push(`/jobs/${job._id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
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
