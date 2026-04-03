"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { createJob } from "@/store/slices/jobsSlice";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Select } from "@/components/ui/Input";
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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic info
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("full-time");
  const [description, setDescription] = useState("");

  // Step 2: Requirements
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(10);
  const [education, setEducation] = useState("");

  // Step 3: Screening config
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {s === 1 ? "Basics" : s === 2 ? "Requirements" : "Screening"}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardTitle>Basic Information</CardTitle>
            <div className="space-y-4 mt-4">
              <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Frontend Engineer" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" required />
                <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Rwanda" required />
                <Select label="Job Type" value={type} onChange={(e) => setType(e.target.value)} options={JOB_TYPES} />
              </div>
              <TextArea label="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what you're looking for..." rows={5} required />
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!title || !company || !location || !description}>
                  Next: Requirements
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <Card>
            <CardTitle>Requirements</CardTitle>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1"
                  />
                  <Button onClick={addSkill} variant="secondary" type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Min Experience (years)" type="number" value={expMin} onChange={(e) => setExpMin(Number(e.target.value))} min={0} />
                <Input label="Max Experience (years)" type="number" value={expMax} onChange={(e) => setExpMax(Number(e.target.value))} min={0} />
              </div>

              <Input label="Education Requirement" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Bachelor's in Computer Science or equivalent" />

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={skills.length === 0}>
                  Next: Screening Config
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Screening Config */}
        {step === 3 && (
          <Card>
            <CardTitle>AI Screening Configuration</CardTitle>
            <div className="space-y-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shortlist Size</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShortlistSize(10)}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      shortlistSize === 10 ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Top 10
                  </button>
                  <button
                    onClick={() => setShortlistSize(20)}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      shortlistSize === 20 ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Top 20
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Scoring Weights <span className={`text-xs ${totalWeight === 100 ? "text-green-600" : "text-red-600"}`}>(Total: {totalWeight}%)</span>
                </label>
                <div className="space-y-3">
                  {[
                    { label: "Skills Match", value: weightSkills, setter: setWeightSkills },
                    { label: "Experience", value: weightExperience, setter: setWeightExperience },
                    { label: "Education", value: weightEducation, setter: setWeightEducation },
                    { label: "Culture Fit", value: weightCulture, setter: setWeightCulture },
                  ].map((w) => (
                    <div key={w.label} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-28">{w.label}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={w.value}
                        onChange={(e) => w.setter(Number(e.target.value))}
                        className="flex-1 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-900 w-10 text-right">{w.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} loading={loading} disabled={totalWeight !== 100}>
                  Create Job
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
