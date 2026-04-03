"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Select } from "@/components/ui/Input";
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
          title, company, department, location, type, description,
          requirements: { skills, experience: { min: expMin, max: expMax }, education, certifications: [], languages: [] },
          screeningConfig: { shortlistSize, weightSkills, weightExperience, weightEducation, weightCultureFit: weightCulture },
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

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error && !title) return <AppLayout><div className="max-w-2xl mx-auto"><ErrorBanner message={error} onRetry={() => window.location.reload()} /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <Card className="mb-6">
          <CardTitle>Basic Information</CardTitle>
          <div className="space-y-4 mt-4">
            <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
              <Select label="Job Type" value={type} onChange={(e) => setType(e.target.value)} options={JOB_TYPES} />
            </div>
            <TextArea label="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
          </div>
        </Card>

        <Card className="mb-6">
          <CardTitle>Requirements</CardTitle>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter" className="flex-1" />
                <Button onClick={addSkill} variant="secondary" type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {skill}
                    <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Min Experience (years)" type="number" value={expMin} onChange={(e) => setExpMin(Number(e.target.value))} min={0} />
              <Input label="Max Experience (years)" type="number" value={expMax} onChange={(e) => setExpMax(Number(e.target.value))} min={0} />
            </div>
            <Input label="Education" value={education} onChange={(e) => setEducation(e.target.value)} />
          </div>
        </Card>

        <Card className="mb-6">
          <CardTitle>Screening Configuration</CardTitle>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shortlist Size</label>
              <div className="flex gap-3">
                {([10, 20] as const).map((size) => (
                  <button key={size} onClick={() => setShortlistSize(size)}
                    className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${shortlistSize === size ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                    Top {size}
                  </button>
                ))}
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
                    <input type="range" min={0} max={100} value={w.value} onChange={(e) => w.setter(Number(e.target.value))} className="flex-1 accent-blue-600" />
                    <span className="text-sm font-medium text-gray-900 w-10 text-right">{w.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => router.push(`/jobs/${jobId}`)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={totalWeight !== 100 || !title || !company}>
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
