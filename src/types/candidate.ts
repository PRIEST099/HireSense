// Official Umurava Talent Profile Schema v1 + HireSense extensions

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
}

export interface Language {
  name: string;
  proficiency: "basic" | "conversational" | "fluent" | "native";
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
  // HireSense extension
  achievements: string[];
  // Backward compat alias
  title?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear?: number;
  endYear?: number;
  // Backward compat aliases
  field?: string;
  graduationYear?: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface Availability {
  status: "available" | "open_to_opportunities" | "not_available";
  type: "full-time" | "part-time" | "contract";
  startDate?: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface CandidateProfile {
  // 3.1 Basic Info (official schema)
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  // Backward compat
  name?: string;
  phone?: string;
  summary?: string;

  // 3.2 Skills & Languages
  skills: Skill[];
  languages: Language[];

  // 3.3 Experience
  experience: Experience[];

  // 3.4 Education
  education: Education[];

  // 3.5 Certifications
  certifications: Certification[];

  // 3.6 Projects
  projects: Project[];

  // 3.7 Availability
  availability: Availability;

  // 3.8 Social Links
  socialLinks: SocialLinks;

  // HireSense extensions
  totalYearsExperience: number;
  // Backward compat flat fields
  linkedIn?: string;
  portfolio?: string;
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

// Helper to get display name from profile (handles both old and new format)
export function getDisplayName(profile: Partial<CandidateProfile>): string {
  if (profile.firstName && profile.lastName) return `${profile.firstName} ${profile.lastName}`;
  if (profile.name) return profile.name;
  return "Unknown";
}

// Helper to get bio/summary (handles both old and new field names)
export function getBio(profile: Partial<CandidateProfile>): string {
  return profile.bio || profile.summary || "";
}
