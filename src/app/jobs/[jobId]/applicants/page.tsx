"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useDropzone } from "react-dropzone";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, Upload, UserPlus, FileSpreadsheet, FileText, CheckCircle, AlertCircle, X, Link as LinkIcon, Trash2 } from "lucide-react";
import type { Candidate } from "@/types/candidate";

export default function ApplicantsPage() {
  useSession({ required: true });
  const params = useParams();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "upload" | "url">("list");

  // Add candidate form
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", location: "", summary: "", skills: "" });
  const [addLoading, setAddLoading] = useState(false);

  // Resume URL state
  const [resumeUrl, setResumeUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<string | null>(null);

  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ candidatesCreated: number; errors: string[]; warnings: string[] } | null>(null);

  const loadCandidates = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/applicants`);
    const data = await res.json();
    if (data.success) setCandidates(data.data);
    setLoading(false);
  }, [jobId]);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, level: "intermediate", yearsOfExperience: 0 }));
    const res = await fetch(`/api/jobs/${jobId}/applicants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, skills, experience: [], education: [], certifications: [], languages: [], totalYearsExperience: 0 }),
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

  const onDrop = useCallback(async (files: File[]) => {
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
  }, [jobId, loadCandidates]);

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

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
            <p className="text-gray-500 mt-1">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={activeTab === "add" ? "primary" : "outline"} size="sm" onClick={() => setActiveTab("add")}>
              <UserPlus className="h-4 w-4" /> Add
            </Button>
            <Button variant={activeTab === "upload" ? "primary" : "outline"} size="sm" onClick={() => setActiveTab("upload")}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
            <Button variant={activeTab === "url" ? "primary" : "outline"} size="sm" onClick={() => setActiveTab("url")}>
              <LinkIcon className="h-4 w-4" /> Resume URL
            </Button>
          </div>
        </div>

        {/* Add candidate form */}
        {activeTab === "add" && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Add Candidate (Structured Profile)</CardTitle>
              <button onClick={() => setActiveTab("list")} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <Input label="Skills (comma-separated)" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
              <TextArea label="Summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={3} placeholder="Brief professional summary..." />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setActiveTab("list")} type="button">Cancel</Button>
                <Button type="submit" loading={addLoading}>Add Candidate</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Resume URL section */}
        {activeTab === "url" && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Import from Resume URL</CardTitle>
              <button onClick={() => setActiveTab("list")} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleResumeUrl} className="space-y-4">
              <Input
                label="Resume / CV URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://example.com/resume.pdf"
                type="url"
                required
              />
              <p className="text-xs text-gray-400">
                Supports: direct PDF links, Google Drive, Dropbox, and OneDrive share links.
                <br />For Google Drive, make sure sharing is set to &quot;Anyone with the link&quot;.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setActiveTab("list")} type="button">Cancel</Button>
                <Button type="submit" loading={urlLoading}>Import from URL</Button>
              </div>
            </form>
            {urlResult && (
              <div className={`mt-3 flex items-center gap-2 text-sm ${urlResult.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                {urlResult.startsWith("Error") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {urlResult}
              </div>
            )}
          </Card>
        )}

        {/* Upload section */}
        {activeTab === "upload" && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Upload Files (CSV, Excel, PDF)</CardTitle>
              <button onClick={() => setActiveTab("list")} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to browse"}
              </p>
              <p className="text-xs text-gray-400">CSV, Excel (.xlsx), or PDF resumes. Max 5MB per file.</p>
            </div>

            {uploadLoading && <p className="text-sm text-blue-600 mt-3 text-center">Processing files...</p>}

            {uploadResult && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{uploadResult.candidatesCreated} candidate(s) imported</span>
                </div>
                {uploadResult.errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">{e}</span>
                  </div>
                ))}
                {uploadResult.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">{w}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Candidates list */}
        {candidates.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              title="No candidates yet"
              description="Add candidates manually or upload CSV/Excel/PDF files."
              action={{ label: "Add Candidate", onClick: () => setActiveTab("add") }}
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {candidates.map((c) => (
              <Card key={c._id} className="hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                      {(c.profile.firstName || c.profile.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{c.profile.firstName && c.profile.lastName ? `${c.profile.firstName} ${c.profile.lastName}` : c.profile.name}</p>
                      <p className="text-xs text-gray-500">{c.profile.email || "No email"} {c.profile.location && `· ${c.profile.location}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                      {c.profile.skills.slice(0, 3).map((s) => (
                        <Badge key={s.name} variant="info" size="sm">{s.name}</Badge>
                      ))}
                      {c.profile.skills.length > 3 && (
                        <Badge size="sm">+{c.profile.skills.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      {c.source === "resume" ? <FileText className="h-4 w-4" /> : c.source === "csv" || c.source === "excel" ? <FileSpreadsheet className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      <button
                        onClick={async () => {
                          if (!confirm("Remove this candidate?")) return;
                          const res = await fetch(`/api/candidates/${c._id}`, { method: "DELETE" });
                          const data = await res.json();
                          if (data.success) { toast("Candidate removed"); loadCandidates(); }
                          else toast(data.error || "Failed to remove", "error");
                        }}
                        className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
