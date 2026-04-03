export interface JobRequirements {
  skills: string[];
  experience: { min: number; max: number };
  education: string;
  certifications: string[];
  languages: string[];
}

export interface JobPreferences {
  skills: string[];
  traits: string[];
}

export interface Salary {
  min: number;
  max: number;
  currency: string;
}

export interface ScreeningConfig {
  shortlistSize: 10 | 20;
  weightSkills: number;
  weightExperience: number;
  weightEducation: number;
  weightCultureFit: number;
}

export type JobStatus = "draft" | "open" | "screening" | "closed";
export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface Job {
  _id: string;
  userId: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: JobRequirements;
  preferences: JobPreferences;
  salary: Salary;
  status: JobStatus;
  screeningConfig: ScreeningConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  department?: string;
  location: string;
  type: JobType;
  description: string;
  requirements: JobRequirements;
  preferences?: JobPreferences;
  salary?: Salary;
  screeningConfig: ScreeningConfig;
}
