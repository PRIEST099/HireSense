import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  jobSchema,
  candidateProfileSchema,
  aiScoringResponseSchema,
  recruiterDecisionSchema,
} from "../schemas";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@test.com",
      password: "password123",
      company: "Acme Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@test.com",
      password: "password123",
      company: "Acme Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      password: "password123",
      company: "Acme Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@test.com",
      password: "12345",
      company: "Acme Corp",
    });
    expect(result.success).toBe(false);
  });
});

describe("jobSchema", () => {
  const validJob = {
    title: "Software Engineer",
    company: "Acme Corp",
    location: "Kigali",
    type: "full-time" as const,
    description: "Build amazing software systems for our clients.",
    requirements: {
      skills: ["TypeScript", "React"],
      experience: { min: 2, max: 5 },
    },
    screeningConfig: {
      shortlistSize: 10 as const,
      weightSkills: 40,
      weightExperience: 30,
      weightEducation: 20,
      weightCultureFit: 10,
    },
  };

  it("accepts valid job data", () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("rejects empty skills array", () => {
    const result = jobSchema.safeParse({
      ...validJob,
      requirements: { ...validJob.requirements, skills: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid job type", () => {
    const result = jobSchema.safeParse({ ...validJob, type: "freelance" });
    expect(result.success).toBe(false);
  });

  it("defaults optional fields", () => {
    const result = jobSchema.safeParse(validJob);
    if (result.success) {
      expect(result.data.preferences).toBeDefined();
      expect(result.data.salary).toBeDefined();
    }
  });
});

describe("candidateProfileSchema", () => {
  it("accepts minimal profile with firstName/lastName", () => {
    const result = candidateProfileSchema.safeParse({ firstName: "Jane", lastName: "Doe" });
    expect(result.success).toBe(true);
  });

  it("accepts minimal profile with backward-compat name field", () => {
    const result = candidateProfileSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
  });

  it("accepts empty profile (all fields optional with defaults)", () => {
    const result = candidateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full official schema profile", () => {
    const result = candidateProfileSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@test.com",
      headline: "Senior Engineer",
      bio: "Full-stack developer",
      location: "Kigali, Rwanda",
      skills: [{ name: "React", level: "advanced", yearsOfExperience: 3 }],
      languages: [{ name: "English", proficiency: "fluent" }],
      experience: [{ company: "Corp", role: "Engineer", startDate: "2020-01", technologies: ["React"], isCurrent: true }],
      education: [{ institution: "MIT", degree: "BSc CS", fieldOfStudy: "CS", startYear: 2016, endYear: 2020 }],
      certifications: [{ name: "AWS", issuer: "Amazon", issueDate: "2023-01" }],
      projects: [{ name: "App", description: "A cool app", technologies: ["React"], role: "Lead", link: "https://app.com", startDate: "2023-01", endDate: "2023-06" }],
      availability: { status: "available", type: "full-time" },
      socialLinks: { linkedin: "https://linkedin.com/in/jane", github: "https://github.com/jane", portfolio: "" },
      totalYearsExperience: 5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts backward-compat profile with flat strings", () => {
    const result = candidateProfileSchema.safeParse({
      name: "Jane Doe",
      email: "jane@test.com",
      skills: [{ name: "React", level: "advanced", yearsOfExperience: 3 }],
      experience: [{ company: "Corp", role: "Engineer", startDate: "2020-01" }],
      education: [{ degree: "BSc CS", institution: "MIT" }],
      totalYearsExperience: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe("aiScoringResponseSchema", () => {
  it("accepts valid AI response", () => {
    const result = aiScoringResponseSchema.safeParse({
      overallScore: 85,
      breakdown: { skillsMatch: 90, experienceMatch: 80, educationMatch: 75, cultureFitMatch: 88 },
      strengths: ["Expert TypeScript"],
      gaps: ["No cloud experience"],
      recommendation: "good_match",
      reasoning: "Strong full-stack profile with 5 years experience meeting most requirements.",
      confidenceScore: 82,
    });
    expect(result.success).toBe(true);
  });

  it("rejects score over 100", () => {
    const result = aiScoringResponseSchema.safeParse({
      overallScore: 150,
      breakdown: { skillsMatch: 90, experienceMatch: 80, educationMatch: 75, cultureFitMatch: 88 },
      strengths: ["Good"],
      gaps: [],
      recommendation: "good_match",
      reasoning: "Some reasoning here for the candidate.",
      confidenceScore: 82,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid recommendation", () => {
    const result = aiScoringResponseSchema.safeParse({
      overallScore: 85,
      breakdown: { skillsMatch: 90, experienceMatch: 80, educationMatch: 75, cultureFitMatch: 88 },
      strengths: ["Good"],
      gaps: [],
      recommendation: "excellent_match",
      reasoning: "Some reasoning here for the candidate.",
      confidenceScore: 82,
    });
    expect(result.success).toBe(false);
  });
});

describe("recruiterDecisionSchema", () => {
  it("accepts valid decisions", () => {
    for (const decision of ["pending", "shortlisted", "rejected", "interview"]) {
      expect(recruiterDecisionSchema.safeParse({ decision }).success).toBe(true);
    }
  });

  it("rejects invalid decision", () => {
    expect(recruiterDecisionSchema.safeParse({ decision: "maybe" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ email: "test@test.com", password: "pass" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "pass" }).success).toBe(false);
  });
});
