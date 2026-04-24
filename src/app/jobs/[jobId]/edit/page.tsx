"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperInput, PaperTextArea, PaperSelect } from "@/components/paper/PaperInput";
import { PaperBadge } from "@/components/paper/PaperBadge";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { useToast } from "@/components/ui/Toast";
import { X } from "lucide-react";

const JOB_TYPES = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export default function EditJobPage() {
  useSession({ required: true });
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("full-time");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(10);
  const [education, setEducation] = useState("");
  const [shortlistSize, setShortlistSize] = useState<10 | 20>(10);
  const [weightSkills, setWeightSkills] = useState(40);
  const [weightExperience, setWeightExperience] = useState(30);
  const [weightEducation, setWeightEducation] = useState(20);
  const [weightCulture, setWeightCulture] = useState(10);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const j = d.data;
          setTitle(j.title);
          setCompany(j.company);
          setDepartment(j.department || "");
          setLocation(j.location);
          setType(j.type);
          setDescription(j.description);
          setSkills(j.requirements?.skills || []);
          setExpMin(j.requirements?.experience?.min || 0);
          setExpMax(j.requirements?.experience?.max || 10);
          setEducation(j.requirements?.education || "");
          setShortlistSize(j.screeningConfig?.shortlistSize || 10);
          setWeightSkills(j.screeningConfig?.weightSkills || 40);
          setWeightExperience(j.screeningConfig?.weightExperience || 30);
          setWeightEducation(j.screeningConfig?.weightEducation || 20);
          setWeightCulture(j.screeningConfig?.weightCultureFit || 10);
        } else {
          setError(d.error || "Job not found");
        }
      })
      .catch(() => setError("Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          department,
          location,
          type,
          description,
          requirements: {
            skills,
            experience: { min: expMin, max: expMax },
            education,
            certifications: [],
            languages: [],
          },
          screeningConfig: {
            shortlistSize,
            weightSkills,
            weightExperience,
            weightEducation,
            weightCultureFit: weightCulture,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast("Job updated successfully", "success");
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      setError((err as Error).message || "Failed to update job");
      setSaving(false);
    }
  };

  const totalWeight = weightSkills + weightExperience + weightEducation + weightCulture;

  if (loading)
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  if (error && !title)
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <ErrorBanner message={error} onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "var(--paper-text-1)",
            letterSpacing: "-0.01em",
            marginBottom: 24,
          }}
        >
          Edit Job
        </h1>

        {error && (
          <div
            style={{
              background: "var(--paper-red-soft)",
              color: "var(--paper-red)",
              fontSize: 17,
              padding: "10px 14px",
              borderRadius: 5,
              border: "1.5px solid rgba(185,28,28,0.25)",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <PaperCard className="mb-6">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 16 }}>
            Basic Information
          </h2>
          <div className="space-y-4">
            <PaperInput label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaperInput label="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              <PaperInput label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaperInput label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              <PaperSelect
                label="Job Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={JOB_TYPES}
              />
            </div>
            <PaperTextArea
              label="Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>
        </PaperCard>

        <PaperCard className="mb-6">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 16 }}>
            Requirements
          </h2>
          <div className="space-y-4">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--paper-text-2)",
                  marginBottom: 6,
                }}
              >
                Required Skills
              </label>
              <div className="flex gap-2">
                <PaperInput
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1"
                />
                <PaperButton onClick={addSkill} variant="ghost" type="button">
                  Add
                </PaperButton>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      background: "var(--paper-accent-soft)",
                      color: "var(--paper-accent)",
                      border: "1.5px solid var(--paper-border-acc)",
                      borderRadius: 4,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                    <button
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--paper-accent)",
                        display: "flex",
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PaperInput
                label="Min Experience (years)"
                type="number"
                value={expMin}
                onChange={(e) => setExpMin(Number(e.target.value))}
                min={0}
              />
              <PaperInput
                label="Max Experience (years)"
                type="number"
                value={expMax}
                onChange={(e) => setExpMax(Number(e.target.value))}
                min={0}
              />
            </div>
            <PaperInput label="Education" value={education} onChange={(e) => setEducation(e.target.value)} />
          </div>
        </PaperCard>

        <PaperCard className="mb-6">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 16 }}>
            Screening Configuration
          </h2>
          <div className="space-y-6">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--paper-text-2)",
                  marginBottom: 8,
                }}
              >
                Shortlist Size
              </label>
              <div className="flex gap-3">
                {([10, 20] as const).map((size) => {
                  const active = shortlistSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setShortlistSize(size)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 5,
                        background: active ? "var(--paper-accent-soft)" : "var(--paper-card)",
                        color: active ? "var(--paper-accent)" : "var(--paper-text-2)",
                        border: active ? "1.5px solid var(--paper-border-acc)" : "1.5px solid var(--paper-border)",
                        fontSize: 17,
                        fontWeight: active ? 700 : 500,
                        fontFamily: "var(--font-caveat), 'Caveat', cursive",
                        cursor: "pointer",
                        boxShadow: "var(--paper-shadow)",
                      }}
                    >
                      Top {size}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--paper-text-2)",
                  marginBottom: 10,
                }}
              >
                Scoring Weights{" "}
                <PaperBadge variant={totalWeight === 100 ? "success" : "danger"}>Total: {totalWeight}%</PaperBadge>
              </label>
              <div className="space-y-3">
                {[
                  { label: "Skills Match", value: weightSkills, setter: setWeightSkills },
                  { label: "Experience", value: weightExperience, setter: setWeightExperience },
                  { label: "Education", value: weightEducation, setter: setWeightEducation },
                  { label: "Culture Fit", value: weightCulture, setter: setWeightCulture },
                ].map((w) => (
                  <div key={w.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span
                      className="sm:w-[110px]"
                      style={{ fontSize: 17, color: "var(--paper-text-3)", flexShrink: 0 }}
                    >
                      {w.label}
                    </span>
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={w.value}
                        onChange={(e) => w.setter(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--paper-text-1)",
                          width: 44,
                          textAlign: "right",
                          fontFamily: "var(--font-caveat), 'Caveat', cursive",
                        }}
                      >
                        {w.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PaperCard>

        <div className="flex justify-between">
          <PaperButton variant="ghost" onClick={() => router.push(`/jobs/${jobId}`)}>
            Cancel
          </PaperButton>
          <PaperButton onClick={handleSave} loading={saving} disabled={totalWeight !== 100 || !title || !company}>
            Save Changes
          </PaperButton>
        </div>
      </div>
    </AppLayout>
  );
}
