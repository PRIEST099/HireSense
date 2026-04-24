"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Briefcase, Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchJobs } from "@/store/slices/jobsSlice";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperStatusBadge } from "@/components/paper/PaperBadge";
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
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "var(--paper-text-1)",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            Jobs
          </h1>
          <p style={{ fontSize: 16, color: "var(--paper-text-3)", marginTop: 4 }}>
            {jobs.length} job posting{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <PaperButton onClick={() => router.push("/jobs/new")}>
          <Plus className="h-4 w-4" /> Create Job
        </PaperButton>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={() => dispatch(fetchJobs())} />
        </div>
      )}

      {/* Search & Filter */}
      {jobs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--paper-text-4)" }}
            />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                background: "var(--paper-input-bg)",
                border: "1.5px solid var(--paper-input-border)",
                borderRadius: 5,
                color: "var(--paper-text-1)",
                fontSize: 16,
                fontFamily: "var(--font-caveat), 'Caveat', cursive",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--paper-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--paper-input-border)")}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "draft", "open", "screening", "closed"] as StatusFilter[]).map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    fontSize: 16,
                    padding: "5px 12px",
                    borderRadius: 4,
                    fontWeight: active ? 700 : 500,
                    background: active ? "var(--paper-accent)" : "var(--paper-card)",
                    color: active ? "#fff" : "var(--paper-text-2)",
                    border: active ? "2px solid var(--paper-text-1)" : "1.5px solid var(--paper-border)",
                    boxShadow: active ? "1px 2px 0 var(--paper-text-1)" : "var(--paper-shadow)",
                    cursor: "pointer",
                    fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  }}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <PaperCard>
          <EmptyState
            icon={Briefcase}
            title="No jobs created"
            description="Create your first job to start screening candidates."
            action={{ label: "Create Job", onClick: () => router.push("/jobs/new") }}
          />
        </PaperCard>
      ) : filteredJobs.length === 0 ? (
        <PaperCard>
          <EmptyState
            icon={Search}
            title="No jobs match your search"
            description="Try a different search term or filter."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearchQuery("");
                setStatusFilter("all");
              },
            }}
          />
        </PaperCard>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job, idx) => (
            <PaperCard key={job._id} animationDelay={idx * 60} onClick={() => router.push(`/jobs/${job._id}`)}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="torn-bg-subtle"
                    style={{
                      border: "1.5px solid var(--paper-border-acc)",
                      borderRadius: 6,
                      padding: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      ["--torn-color" as string]: "var(--paper-accent-soft)",
                    } as React.CSSProperties}
                  >
                    <Briefcase className="h-5 w-5" style={{ color: "var(--paper-accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--paper-text-1)",
                        lineHeight: 1.2,
                      }}
                      className="truncate"
                    >
                      {job.title}
                    </h3>
                    <p
                      style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 2 }}
                      className="truncate"
                    >
                      {job.company} &middot; {job.location} &middot; {job.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <div className="text-right hidden sm:block">
                    <p style={{ fontSize: 16, color: "var(--paper-text-3)" }}>
                      {job.requirements.skills.length} skills
                    </p>
                    <p style={{ fontSize: 16, color: "var(--paper-text-4)" }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <PaperStatusBadge status={job.status} />
                </div>
              </div>
            </PaperCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
