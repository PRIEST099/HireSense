import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company: z.string().min(1, "Company is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  company: z.string().min(1, "Company is required"),
  department: z.string().optional().default(""),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["full-time", "part-time", "contract", "internship"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.object({
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    experience: z.object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(20),
    }),
    education: z.string().optional().default(""),
    certifications: z.array(z.string()).optional().default([]),
    languages: z.array(z.string()).optional().default([]),
  }),
  preferences: z
    .object({
      skills: z.array(z.string()).optional().default([]),
      traits: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({ skills: [], traits: [] }),
  salary: z
    .object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(0),
      currency: z.string().default("USD"),
    })
    .optional()
    .default({ min: 0, max: 0, currency: "USD" }),
  screeningConfig: z.object({
    shortlistSize: z.union([z.literal(10), z.literal(20)]).default(10),
    weightSkills: z.number().min(0).max(100).default(40),
    weightExperience: z.number().min(0).max(100).default(30),
    weightEducation: z.number().min(0).max(100).default(20),
    weightCultureFit: z.number().min(0).max(100).default(10),
  }),
});

export const candidateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  linkedIn: z.string().optional().default(""),
  portfolio: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
        yearsOfExperience: z.number().optional().default(0),
      })
    )
    .optional()
    .default([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        startDate: z.string(),
        endDate: z.string().optional().default(""),
        description: z.string().optional().default(""),
        achievements: z.array(z.string()).optional().default([]),
      })
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        field: z.string().optional().default(""),
        graduationYear: z.number().optional().default(0),
      })
    )
    .optional()
    .default([]),
  certifications: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  totalYearsExperience: z.number().optional().default(0),
});

export const aiScoringResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  breakdown: z.object({
    skillsMatch: z.number().min(0).max(100),
    experienceMatch: z.number().min(0).max(100),
    educationMatch: z.number().min(0).max(100),
    cultureFitMatch: z.number().min(0).max(100),
  }),
  strengths: z.array(z.string()).min(1).max(5),
  gaps: z.array(z.string()).max(5),
  recommendation: z.enum(["strong_match", "good_match", "partial_match", "weak_match"]),
  reasoning: z.string().min(10),
  confidenceScore: z.number().min(0).max(100),
});

export const recruiterDecisionSchema = z.object({
  decision: z.enum(["pending", "shortlisted", "rejected", "interview"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type AIScoringResponse = z.infer<typeof aiScoringResponseSchema>;
