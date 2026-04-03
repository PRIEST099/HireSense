import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";

const DEMO_CANDIDATES = [
  { name: "Amina Uwimana", email: "amina@demo.com", location: "Kigali, Rwanda", summary: "Full-stack engineer with 7 years of experience. Led a team of 5 at a fintech startup.", skills: [{ name: "TypeScript", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "expert", yearsOfExperience: 6 }, { name: "React", level: "advanced", yearsOfExperience: 5 }, { name: "PostgreSQL", level: "advanced", yearsOfExperience: 4 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "REST API Design", level: "expert", yearsOfExperience: 6 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 4 }, { name: "Git", level: "expert", yearsOfExperience: 7 }], experience: [{ title: "Senior Software Engineer", company: "PaySwift Rwanda", startDate: "2022-01", endDate: "", description: "Lead engineer for payment platform.", achievements: ["Reduced API latency by 40%", "Led microservices migration"] }], education: [{ degree: "BSc Computer Science", institution: "University of Rwanda", field: "CS", graduationYear: 2017 }], certifications: ["AWS Certified Solutions Architect"], languages: ["English", "Kinyarwanda"], totalYearsExperience: 7 },
  { name: "David Kamanzi", email: "david@demo.com", location: "Kigali, Rwanda", summary: "Backend-focused engineer with 5 years. Specialized in scalable APIs.", skills: [{ name: "Node.js", level: "expert", yearsOfExperience: 5 }, { name: "TypeScript", level: "advanced", yearsOfExperience: 3 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 5 }, { name: "REST API Design", level: "expert", yearsOfExperience: 5 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 5 }], experience: [{ title: "Backend Engineer", company: "DataFlow Systems", startDate: "2021-06", endDate: "", description: "High-throughput data pipelines.", achievements: ["Built API serving 10M requests/day"] }], education: [{ degree: "BSc Software Engineering", institution: "CMU Africa", field: "SE", graduationYear: 2019 }], certifications: [], languages: ["English", "Kinyarwanda"], totalYearsExperience: 5 },
  { name: "Grace Iradukunda", email: "grace@demo.com", location: "Nairobi, Kenya", summary: "Versatile full-stack developer with 6 years. Built products from scratch for 3 startups.", skills: [{ name: "React", level: "expert", yearsOfExperience: 6 }, { name: "TypeScript", level: "expert", yearsOfExperience: 4 }, { name: "Node.js", level: "advanced", yearsOfExperience: 4 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 3 }, { name: "Next.js", level: "expert", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 6 }], experience: [{ title: "Lead Frontend Engineer", company: "AfriMarket", startDate: "2023-01", endDate: "", description: "Frontend architecture for e-commerce.", achievements: ["Rebuilt in Next.js, 55% faster"] }], education: [{ degree: "BSc IT", institution: "JKUAT", field: "IT", graduationYear: 2018 }], certifications: [], languages: ["English", "Swahili"], totalYearsExperience: 6 },
  { name: "Patrick Niyonzima", email: "patrick@demo.com", location: "Kigali, Rwanda", summary: "Full-stack engineer with 6 years. Previously at Deloitte East Africa with client-facing consulting experience.", skills: [{ name: "TypeScript", level: "expert", yearsOfExperience: 4 }, { name: "React", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "advanced", yearsOfExperience: 5 }, { name: "PostgreSQL", level: "advanced", yearsOfExperience: 4 }, { name: "REST API Design", level: "advanced", yearsOfExperience: 5 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 6 }], experience: [{ title: "Senior Consultant", company: "Deloitte East Africa", startDate: "2022-01", endDate: "", description: "Technical lead for digital transformation.", achievements: ["Delivered 12 client engagements", "Built ERP saving $200K/year"] }], education: [{ degree: "BSc CS", institution: "University of Rwanda", field: "CS", graduationYear: 2018 }], certifications: ["AWS Certified Solutions Architect"], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 6 },
  { name: "Emmanuel Nsengiyumva", email: "emmanuel@demo.com", location: "Kampala, Uganda", summary: "Software architect with 9 years. Ex-CTO of YC-backed startup. Deep expertise in distributed systems.", skills: [{ name: "System Architecture", level: "expert", yearsOfExperience: 7 }, { name: "TypeScript", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "expert", yearsOfExperience: 7 }, { name: "React", level: "advanced", yearsOfExperience: 4 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 6 }, { name: "REST API Design", level: "expert", yearsOfExperience: 7 }, { name: "Docker", level: "expert", yearsOfExperience: 5 }, { name: "Kubernetes", level: "advanced", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 9 }], experience: [{ title: "CTO", company: "FarmConnect (YC W22)", startDate: "2021-06", endDate: "2025-12", description: "Co-founded agritech platform with 50K+ users.", achievements: ["Scaled 0 to 50K users", "Raised $2.5M seed"] }], education: [{ degree: "BSc CS", institution: "Makerere University", field: "CS", graduationYear: 2015 }, { degree: "MSc Distributed Systems", institution: "University of Nairobi", field: "DS", graduationYear: 2020 }], certifications: ["AWS Certified Solutions Architect - Professional"], languages: ["English", "Luganda", "Swahili"], totalYearsExperience: 9 },
  { name: "Sarah Mugisha", email: "sarah@demo.com", location: "Kigali, Rwanda", summary: "Junior developer with 2 years. ALX Software Engineering graduate.", skills: [{ name: "JavaScript", level: "intermediate", yearsOfExperience: 2 }, { name: "React", level: "intermediate", yearsOfExperience: 2 }, { name: "Node.js", level: "beginner", yearsOfExperience: 1 }, { name: "Git", level: "intermediate", yearsOfExperience: 2 }], experience: [{ title: "Junior Developer", company: "Kigali Tech Solutions", startDate: "2024-06", endDate: "", description: "Web apps for local businesses.", achievements: ["Completed 5 client websites"] }], education: [{ degree: "ALX SE Certificate", institution: "ALX Africa", field: "SE", graduationYear: 2024 }], certifications: [], languages: ["English", "Kinyarwanda"], totalYearsExperience: 2 },
];

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // Check if user already has demo data
    const existingJobs = await Job.countDocuments({ userId });
    if (existingJobs > 0) {
      return NextResponse.json({ success: false, error: "You already have jobs. Seed is for empty accounts only." }, { status: 400 });
    }

    // Create demo job
    const job = await Job.create({
      userId,
      title: "Senior Software Engineer",
      company: "Apex Consulting Group",
      department: "Technology Solutions",
      location: "Kigali, Rwanda",
      type: "full-time",
      description: "Seeking a Senior Software Engineer to design, build, and maintain scalable enterprise systems for our client portfolio. Involves full-stack development, system architecture, API design, and leading technical delivery on client engagements.",
      requirements: {
        skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "REST API Design", "System Architecture", "Docker", "CI/CD", "Git"],
        experience: { min: 4, max: 10 },
        education: "Bachelor's in Computer Science or equivalent",
        certifications: [],
        languages: ["English"],
      },
      preferences: {
        skills: ["Next.js", "GraphQL", "Kubernetes"],
        traits: ["Strong communicator", "Client-facing experience"],
      },
      salary: { min: 80000, max: 130000, currency: "USD" },
      status: "open",
      screeningConfig: { shortlistSize: 10, weightSkills: 40, weightExperience: 30, weightEducation: 15, weightCultureFit: 15 },
    });

    // Add candidates
    for (const c of DEMO_CANDIDATES) {
      await Candidate.create({
        jobId: job._id,
        source: "platform",
        profile: { ...c, phone: "", linkedIn: "", portfolio: "" },
        profileParsedByAI: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: { jobId: job._id, candidatesCreated: DEMO_CANDIDATES.length },
      message: `Demo job created with ${DEMO_CANDIDATES.length} candidates. Go to the job and run AI Screening!`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
