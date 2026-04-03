export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  graduationYear: number;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  languages: string[];
  totalYearsExperience: number;
}

export type CandidateSource = "platform" | "csv" | "excel" | "resume";

export interface Candidate {
  _id: string;
  jobId: string;
  source: CandidateSource;
  profile: CandidateProfile;
  rawResumeText?: string;
  rawCsvRow?: Record<string, string>;
  resumeFileUrl?: string;
  profileParsedByAI: boolean;
  createdAt: string;
}
