"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch } from "@/store/hooks";
import { createJob } from "@/store/slices/jobsSlice";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaperCard } from "@/components/paper/PaperCard";
import { PaperButton } from "@/components/paper/PaperButton";
import { PaperInput, PaperTextArea, PaperSelect } from "@/components/paper/PaperInput";
import { PaperBadge } from "@/components/paper/PaperBadge";
import { X } from "lucide-react";

const JOB_TYPES = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export default function NewJobPage() {
  useSession({ required: true });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await dispatch(
        createJob({
          title,
          company,
          department,
          location,
          type: type as "full-time" | "part-time" | "contract" | "internship",
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
        })
      ).unwrap();
      toast("Job created successfully");
      router.push("/jobs");
    } catch (err) {
      setError((err as Error).message || "Failed to create job");
      setLoading(false);
    }
  };

  const totalWeight = weightSkills + weightExperience + weightEducation + weightCulture;

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
          Create New Job
        </h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 5,
                  border: step >= s ? "2px solid var(--paper-text-1)" : "1.5px solid var(--paper-border)",
                  background: step >= s ? "var(--paper-accent)" : "var(--paper-card)",
                  color: step >= s ? "#fff" : "var(--paper-text-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 700,
                  boxShadow: step >= s ? "1px 2px 0 var(--paper-text-1)" : "var(--paper-shadow)",
                  flexShrink: 0,
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                }}
              >
                {s}
              </div>
              <span
                style={{ fontSize: 17, color: step >= s ? "var(--paper-text-1)" : "var(--paper-text-3)" }}
                className="hidden sm:inline"
              >
                {s === 1 ? "Basics" : s === 2 ? "Requirements" : "Screening"}
              </span>
              {s < 3 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: step > s ? "var(--paper-accent)" : "var(--paper-border)",
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

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

        {step === 1 && (
          <PaperCard>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 16 }}>
              Basic Information
            </h2>
            <div className="space-y-4">
              <PaperInput
                label="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Frontend Engineer"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PaperInput
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  required
                />
                <PaperInput
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PaperInput
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kigali, Rwanda"
                  required
                />
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
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={5}
                required
              />
              <div className="flex justify-end">
                <PaperButton onClick={() => setStep(2)} disabled={!title || !company || !location || !description}>
                  Next: Requirements
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        )}

        {step === 2 && (
          <PaperCard>
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
                        onClick={() => removeSkill(skill)}
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

              <PaperInput
                label="Education Requirement"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Bachelor's in Computer Science or equivalent"
              />

              <div className="flex justify-between">
                <PaperButton variant="ghost" onClick={() => setStep(1)}>
                  Back
                </PaperButton>
                <PaperButton onClick={() => setStep(3)} disabled={skills.length === 0}>
                  Next: Screening Config
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        )}

        {step === 3 && (
          <PaperCard>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 16 }}>
              AI Screening Configuration
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
                  {[10, 20].map((size) => {
                    const active = shortlistSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setShortlistSize(size as 10 | 20)}
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
                    <div key={w.label} className="flex items-center gap-4">
                      <span style={{ fontSize: 17, color: "var(--paper-text-3)", width: 110, flexShrink: 0 }}>
                        {w.label}
                      </span>
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
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <PaperButton variant="ghost" onClick={() => setStep(2)}>
                  Back
                </PaperButton>
                <PaperButton onClick={handleSubmit} loading={loading} disabled={totalWeight !== 100}>
                  Create Job
                </PaperButton>
              </div>
            </div>
          </PaperCard>
        )}
      </div>
    </AppLayout>
  );
}
