"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useDropzone } from "react-dropzone";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperBadge } from "@/components/paper/PaperBadge";
import { PaperInput, PaperTextArea } from "@/components/paper/PaperInput";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Users,
  Upload,
  UserPlus,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import type { Candidate } from "@/types/candidate";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: "var(--paper-text-1)",
      }}
    >
      {children}
    </h2>
  );
}

export default function ApplicantsPage() {
  useSession({ required: true });
  const params = useParams();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "upload" | "url">("list");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  const [resumeUrl, setResumeUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<string | null>(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    candidatesCreated: number;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const loadCandidates = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/applicants`);
    const data = await res.json();
    if (data.success) setCandidates(data.data);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const skills = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, level: "intermediate", yearsOfExperience: 0 }));
    const res = await fetch(`/api/jobs/${jobId}/applicants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        skills,
        experience: [],
        education: [],
        certifications: [],
        languages: [],
        totalYearsExperience: 0,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setFormData({ name: "", email: "", phone: "", location: "", summary: "", skills: "" });
      setActiveTab("list");
      loadCandidates();
      toast("Candidate added successfully");
    } else {
      toast(data.error || "Failed to add candidate", "error");
    }
    setAddLoading(false);
  };

  const handleResumeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl.trim()) return;
    setUrlLoading(true);
    setUrlResult(null);
    try {
      const formData = new FormData();
      formData.append("resumeUrl", resumeUrl.trim());
      const res = await fetch(`/api/jobs/${jobId}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setUrlResult(`Candidate imported from URL successfully`);
        setResumeUrl("");
        loadCandidates();
        toast("Resume imported from URL successfully");
      } else {
        setUrlResult(`Error: ${data.error}`);
        toast(data.error || "Failed to import from URL", "error");
      }
    } catch {
      setUrlResult("Failed to fetch resume from URL");
      toast("Failed to fetch resume from URL", "error");
    }
    setUrlLoading(false);
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploadLoading(true);
      setUploadResult(null);
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch(`/api/jobs/${jobId}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadResult(data.data);
        loadCandidates();
        toast(`${data.data.candidatesCreated} candidate(s) imported`);
      } else {
        toast(data.error || "Upload failed", "error");
      }
      setUploadLoading(false);
    },
    [jobId, loadCandidates, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              Applicants
            </h1>
            <p style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 4 }}>
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PaperButton
              variant={activeTab === "add" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(activeTab === "add" ? "list" : "add")}
            >
              <UserPlus className="h-4 w-4" /> Add
            </PaperButton>
            <PaperButton
              variant={activeTab === "upload" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(activeTab === "upload" ? "list" : "upload")}
            >
              <Upload className="h-4 w-4" /> Upload
            </PaperButton>
            <PaperButton
              variant={activeTab === "url" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(activeTab === "url" ? "list" : "url")}
            >
              <LinkIcon className="h-4 w-4" /> Resume URL
            </PaperButton>
          </div>
        </div>

        {activeTab === "add" && (
          <PaperCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Add Candidate (Structured Profile)</SectionTitle>
              <button
                onClick={() => setActiveTab("list")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--paper-text-3)",
                  display: "flex",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PaperInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <PaperInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PaperInput
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <PaperInput
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <PaperInput
                label="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js"
              />
              <PaperTextArea
                label="Summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                placeholder="Brief professional summary..."
              />
              <div className="flex justify-end gap-2">
                <PaperButton variant="ghost" onClick={() => setActiveTab("list")} type="button">
                  Cancel
                </PaperButton>
                <PaperButton type="submit" loading={addLoading}>
                  Add Candidate
                </PaperButton>
              </div>
            </form>
          </PaperCard>
        )}

        {activeTab === "url" && (
          <PaperCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Import from Resume URL</SectionTitle>
              <button
                onClick={() => setActiveTab("list")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--paper-text-3)",
                  display: "flex",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleResumeUrl} className="space-y-4">
              <PaperInput
                label="Resume / CV URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://example.com/resume.pdf"
                type="url"
                required
              />
              <p style={{ fontSize: 17, color: "var(--paper-text-4)", lineHeight: 1.5 }}>
                Supports: direct PDF links, Google Drive, Dropbox, and OneDrive share links.
                <br />
                For Google Drive, make sure sharing is set to &quot;Anyone with the link&quot;.
              </p>
              <div className="flex justify-end gap-2">
                <PaperButton variant="ghost" onClick={() => setActiveTab("list")} type="button">
                  Cancel
                </PaperButton>
                <PaperButton type="submit" loading={urlLoading}>
                  Import from URL
                </PaperButton>
              </div>
            </form>
            {urlResult && (
              <div
                className="mt-3 flex items-center gap-2"
                style={{
                  fontSize: 16,
                  color: urlResult.startsWith("Error") ? "var(--paper-red)" : "var(--paper-green)",
                }}
              >
                {urlResult.startsWith("Error") ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {urlResult}
              </div>
            )}
          </PaperCard>
        )}

        {activeTab === "upload" && (
          <PaperCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Upload Files (CSV, Excel, PDF)</SectionTitle>
              <button
                onClick={() => setActiveTab("list")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--paper-text-3)",
                  display: "flex",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              {...getRootProps()}
              style={{
                borderRadius: 6,
                padding: 32,
                textAlign: "center",
                cursor: "pointer",
                background: isDragActive ? "var(--paper-accent-soft)" : "var(--paper-input-bg)",
                border: `2px dashed ${isDragActive ? "var(--paper-accent)" : "var(--paper-border)"}`,
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--paper-text-3)" }} />
              <p style={{ fontSize: 16, color: "var(--paper-text-2)", marginBottom: 4 }}>
                {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to browse"}
              </p>
              <p style={{ fontSize: 17, color: "var(--paper-text-4)" }}>
                CSV, Excel (.xlsx), or PDF resumes. Max 5MB per file.
              </p>
            </div>

            {uploadLoading && (
              <p
                style={{ fontSize: 16, color: "var(--paper-accent)", marginTop: 12, textAlign: "center", fontWeight: 600 }}
              >
                Processing files...
              </p>
            )}

            {uploadResult && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2" style={{ color: "var(--paper-green)" }}>
                  <CheckCircle className="h-4 w-4" />
                  <span style={{ fontSize: 16 }}>{uploadResult.candidatesCreated} candidate(s) imported</span>
                </div>
                {uploadResult.errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ color: "var(--paper-red)" }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span style={{ fontSize: 17 }}>{e}</span>
                  </div>
                ))}
                {uploadResult.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ color: "var(--paper-amber)" }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span style={{ fontSize: 17 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </PaperCard>
        )}

        {candidates.length === 0 ? (
          <PaperCard>
            <EmptyState
              icon={Users}
              title="No candidates yet"
              description="Add candidates manually or upload CSV/Excel/PDF files."
              action={{ label: "Add Candidate", onClick: () => setActiveTab("add") }}
            />
          </PaperCard>
        ) : (
          <div className="space-y-2">
            {candidates.map((c, idx) => {
              const displayName =
                c.profile.firstName && c.profile.lastName
                  ? `${c.profile.firstName} ${c.profile.lastName}`
                  : c.profile.name;
              const initial = (c.profile.firstName || c.profile.name || "?").charAt(0).toUpperCase();
              return (
                <PaperCard key={c._id} animationDelay={idx * 50}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="torn-bg-dramatic"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          border: "2px solid var(--paper-text-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 17,
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: "var(--font-caveat), 'Caveat', cursive",
                          ["--torn-color" as string]: "var(--paper-accent)",
                        } as React.CSSProperties}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p
                          style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-text-1)", lineHeight: 1.2 }}
                          className="truncate"
                        >
                          {displayName}
                        </p>
                        <p
                          style={{ fontSize: 17, color: "var(--paper-text-3)", marginTop: 2 }}
                          className="truncate"
                        >
                          {c.profile.email || "No email"} {c.profile.location && `· ${c.profile.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-xs">
                        {c.profile.skills.slice(0, 3).map((s) => (
                          <PaperBadge key={s.name} variant="info">
                            {s.name}
                          </PaperBadge>
                        ))}
                        {c.profile.skills.length > 3 && <PaperBadge>+{c.profile.skills.length - 3}</PaperBadge>}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--paper-text-3)" }}>
                        {c.source === "resume" ? (
                          <FileText className="h-4 w-4" />
                        ) : c.source === "csv" || c.source === "excel" ? (
                          <FileSpreadsheet className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm("Remove this candidate?")) return;
                            const res = await fetch(`/api/candidates/${c._id}`, { method: "DELETE" });
                            const data = await res.json();
                            if (data.success) {
                              toast("Candidate removed");
                              loadCandidates();
                            } else toast(data.error || "Failed to remove", "error");
                          }}
                          title="Remove candidate"
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--paper-text-3)",
                            display: "flex",
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </PaperCard>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
