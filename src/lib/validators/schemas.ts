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
    skills: z.array(z.string()).min(1, "At least one skill is required").max(30, "Maximum 30 skills allowed"),
    experience: z.object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(20),
    }).refine((e) => e.min <= e.max, { message: "Minimum experience must not exceed maximum" }),
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
  }).refine(
    (c) => c.weightSkills + c.weightExperience + c.weightEducation + c.weightCultureFit === 100,
    { message: "Screening weights must sum to 100" }
  ),
});

// Official Umurava Talent Profile Schema + backward compat
export const candidateProfileSchema = z.object({
  // 3.1 Basic Info
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  name: z.string().optional().default(""), // backward compat
  email: z.string().optional().default(""),
  headline: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  location: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  summary: z.string().optional().default(""), // backward compat alias for bio

  // 3.2 Skills & Languages
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
    yearsOfExperience: z.number().optional().default(0),
  })).optional().default([]),
  languages: z.array(
    z.union([
      z.object({ name: z.string(), proficiency: z.enum(["basic", "conversational", "fluent", "native"]).default("fluent") }),
      z.string(), // backward compat: accept flat strings
    ])
  ).optional().default([]),

  // 3.3 Experience
  experience: z.array(z.object({
    company: z.string(),
    role: z.string().optional().default(""),
    title: z.string().optional().default(""), // backward compat
    startDate: z.string(),
    endDate: z.string().optional().default(""),
    description: z.string().optional().default(""),
    technologies: z.array(z.string()).optional().default([]),
    isCurrent: z.boolean().optional().default(false),
    achievements: z.array(z.string()).optional().default([]),
  })).optional().default([]),

  // 3.4 Education
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional().default(""),
    field: z.string().optional().default(""), // backward compat
    startYear: z.number().optional().default(0),
    endYear: z.number().optional().default(0),
    graduationYear: z.number().optional().default(0), // backward compat
  })).optional().default([]),

  // 3.5 Certifications
  certifications: z.array(
    z.union([
      z.object({ name: z.string(), issuer: z.string().optional().default(""), issueDate: z.string().optional().default("") }),
      z.string(), // backward compat: accept flat strings
    ])
  ).optional().default([]),

  // 3.6 Projects
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional().default(""),
    technologies: z.array(z.string()).optional().default([]),
    role: z.string().optional().default(""),
    link: z.string().optional().default(""),
    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),
  })).optional().default([]),

  // 3.7 Availability
  availability: z.object({
    status: z.enum(["available", "open_to_opportunities", "not_available"]).default("available"),
    type: z.enum(["full-time", "part-time", "contract"]).default("full-time"),
    startDate: z.string().optional().default(""),
  }).optional().default({ status: "available", type: "full-time", startDate: "" }),

  // 3.8 Social Links
  socialLinks: z.object({
    linkedin: z.string().optional().default(""),
    github: z.string().optional().default(""),
    portfolio: z.string().optional().default(""),
  }).optional().default({ linkedin: "", github: "", portfolio: "" }),

  // Extensions
  totalYearsExperience: z.number().optional().default(0),
  linkedIn: z.string().optional().default(""), // backward compat
  portfolio: z.string().optional().default(""), // backward compat
});

export const aiScoringResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  breakdown: z.object({
    skillsMatch: z.number().min(0).max(100),
    experienceMatch: z.number().min(0).max(100),
    educationMatch: z.number().min(0).max(100),
    cultureFitMatch: z.number().min(0).max(100),
  }),
  strengths: z.array(z.string()).min(1).max(3),
  gaps: z.array(z.string()).max(3),
  recommendation: z.enum(["strong_match", "good_match", "partial_match", "weak_match"]),
  reasoning: z.string().min(10),
  confidenceScore: z.number().min(0).max(100),
});

export const recruiterDecisionSchema = z.object({
  decision: z.enum(["pending", "shortlisted", "rejected", "interview"]),
});

export const aiRankingResponseSchema = z.object({
  rankings: z.array(
    z.object({
      candidateId: z.string(),
      rank: z.number().int().min(1),
      adjustedScore: z.number().min(0).max(100),
      adjustmentReason: z.string().optional().default(""),
    })
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
export type AIScoringResponse = z.infer<typeof aiScoringResponseSchema>;
export type AIRankingResponse = z.infer<typeof aiRankingResponseSchema>;
