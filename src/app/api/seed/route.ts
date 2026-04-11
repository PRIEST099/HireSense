import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";

const DEMO_CANDIDATES = [
  // Strong matches (4) — high skill coverage, right experience range
  { name: "Emmanuel Nsengiyumva", email: "emmanuel@demo.com", location: "Kampala, Uganda", summary: "Software architect with 9 years building distributed systems. Ex-CTO of YC-backed startup. Deep expertise in system design, microservices, and cloud-native development.", skills: [{ name: "System Architecture", level: "expert", yearsOfExperience: 7 }, { name: "TypeScript", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "expert", yearsOfExperience: 7 }, { name: "React", level: "advanced", yearsOfExperience: 4 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 6 }, { name: "REST API Design", level: "expert", yearsOfExperience: 7 }, { name: "Docker", level: "expert", yearsOfExperience: 5 }, { name: "Kubernetes", level: "advanced", yearsOfExperience: 3 }, { name: "CI/CD", level: "expert", yearsOfExperience: 6 }, { name: "Git", level: "expert", yearsOfExperience: 9 }], experience: [{ title: "CTO", company: "FarmConnect (YC W22)", startDate: "2021-06", endDate: "2025-12", description: "Co-founded agritech platform with 50K+ users across East Africa.", achievements: ["Scaled 0 to 50K users", "Raised $2.5M seed", "Built 12-person engineering team"] }, { title: "Senior Software Engineer", company: "SafeBoda", startDate: "2018-01", endDate: "2021-05", description: "Core platform team for ride-hailing and payments.", achievements: ["Designed real-time matching algorithm", "Payment system processing $5M/month"] }], education: [{ degree: "BSc Computer Science", institution: "Makerere University", field: "CS", graduationYear: 2015 }, { degree: "MSc Distributed Systems", institution: "University of Nairobi", field: "DS", graduationYear: 2020 }], certifications: ["AWS Certified Solutions Architect - Professional"], languages: ["English", "Luganda", "Swahili"], totalYearsExperience: 9 },
  { name: "Amina Uwimana", email: "amina@demo.com", location: "Kigali, Rwanda", summary: "Full-stack engineer with 7 years of experience. Led a team of 5 at a fintech startup building a payment processing platform handling 50K+ daily transactions.", skills: [{ name: "TypeScript", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "expert", yearsOfExperience: 6 }, { name: "React", level: "advanced", yearsOfExperience: 5 }, { name: "PostgreSQL", level: "advanced", yearsOfExperience: 4 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "REST API Design", level: "expert", yearsOfExperience: 6 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 4 }, { name: "CI/CD", level: "advanced", yearsOfExperience: 4 }, { name: "Git", level: "expert", yearsOfExperience: 7 }], experience: [{ title: "Senior Software Engineer", company: "PaySwift Rwanda", startDate: "2022-01", endDate: "", description: "Lead engineer for payment platform.", achievements: ["Reduced API latency by 40%", "Led microservices migration", "Mentored 3 juniors"] }, { title: "Software Engineer", company: "TechHub Africa", startDate: "2019-03", endDate: "2021-12", description: "Client-facing dashboards and REST APIs.", achievements: ["Delivered 8 client projects on time"] }], education: [{ degree: "BSc Computer Science", institution: "University of Rwanda", field: "CS", graduationYear: 2017 }], certifications: ["AWS Certified Solutions Architect - Associate"], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 7 },
  { name: "Patrick Niyonzima", email: "patrick@demo.com", location: "Kigali, Rwanda", summary: "Full-stack engineer with 6 years. Previously at Deloitte East Africa with extensive client-facing consulting experience on digital transformation projects.", skills: [{ name: "TypeScript", level: "expert", yearsOfExperience: 4 }, { name: "React", level: "expert", yearsOfExperience: 5 }, { name: "Node.js", level: "advanced", yearsOfExperience: 5 }, { name: "PostgreSQL", level: "advanced", yearsOfExperience: 4 }, { name: "REST API Design", level: "advanced", yearsOfExperience: 5 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 3 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "CI/CD", level: "advanced", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 6 }], experience: [{ title: "Senior Consultant - Technology", company: "Deloitte East Africa", startDate: "2022-01", endDate: "", description: "Technical lead on digital transformation projects for banking and telecom.", achievements: ["Delivered 12 client engagements", "Built ERP module saving $200K/year"] }, { title: "Software Engineer", company: "Irembo", startDate: "2019-07", endDate: "2021-12", description: "Rwanda e-government platform.", achievements: ["Document verification system", "100K+ daily requests"] }], education: [{ degree: "BSc Computer Science", institution: "University of Rwanda", field: "CS", graduationYear: 2018 }], certifications: ["AWS Certified Solutions Architect - Associate", "Scrum Master Certified"], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 6 },
  { name: "Jean-Baptiste Mugabo", email: "jb@demo.com", location: "Kigali, Rwanda", summary: "Senior engineer with 8 years in enterprise software. Expert in PostgreSQL optimization and backend architecture for financial services.", skills: [{ name: "Node.js", level: "expert", yearsOfExperience: 7 }, { name: "TypeScript", level: "expert", yearsOfExperience: 5 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 8 }, { name: "REST API Design", level: "expert", yearsOfExperience: 7 }, { name: "Docker", level: "advanced", yearsOfExperience: 4 }, { name: "CI/CD", level: "advanced", yearsOfExperience: 5 }, { name: "System Architecture", level: "expert", yearsOfExperience: 6 }, { name: "Git", level: "expert", yearsOfExperience: 8 }, { name: "React", level: "intermediate", yearsOfExperience: 2 }], experience: [{ title: "Principal Engineer", company: "Bank of Kigali Digital", startDate: "2020-03", endDate: "", description: "Architecting digital banking platform serving 2M+ customers.", achievements: ["Reduced transaction processing time by 65%", "Zero-downtime migration of core banking APIs"] }, { title: "Senior Developer", company: "Jali Finance", startDate: "2016-08", endDate: "2020-02", description: "Core backend systems for micro-lending platform.", achievements: ["Built fraud detection engine", "Scaled to 500K loan applications/year"] }], education: [{ degree: "BSc Computer Engineering", institution: "University of Rwanda", field: "CE", graduationYear: 2016 }], certifications: ["AWS Certified Database Specialty"], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 8 },

  // Good matches (5) — solid skills but with some gaps
  { name: "Grace Iradukunda", email: "grace@demo.com", location: "Nairobi, Kenya", summary: "Versatile full-stack developer with 6 years. Built products from scratch for 3 startups. Strong React and system design skills.", skills: [{ name: "React", level: "expert", yearsOfExperience: 6 }, { name: "TypeScript", level: "expert", yearsOfExperience: 4 }, { name: "Node.js", level: "advanced", yearsOfExperience: 4 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 3 }, { name: "Next.js", level: "expert", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 6 }, { name: "MongoDB", level: "advanced", yearsOfExperience: 3 }], experience: [{ title: "Lead Frontend Engineer", company: "AfriMarket", startDate: "2023-01", endDate: "", description: "Frontend architecture for e-commerce platform.", achievements: ["Rebuilt in Next.js, 55% faster load times", "Manages 4 developers"] }, { title: "Full-Stack Developer", company: "HealthBridge", startDate: "2020-06", endDate: "2022-12", description: "Telemedicine platform across 5 countries.", achievements: ["Real-time video consultation system", "HIPAA compliance"] }], education: [{ degree: "BSc Information Technology", institution: "JKUAT", field: "IT", graduationYear: 2018 }], certifications: [], languages: ["English", "Swahili"], totalYearsExperience: 6 },
  { name: "David Kamanzi", email: "david@demo.com", location: "Kigali, Rwanda", summary: "Backend-focused engineer with 5 years. Specialized in scalable APIs and database systems. Open-source contributor.", skills: [{ name: "Node.js", level: "expert", yearsOfExperience: 5 }, { name: "TypeScript", level: "advanced", yearsOfExperience: 3 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 5 }, { name: "REST API Design", level: "expert", yearsOfExperience: 5 }, { name: "Docker", level: "advanced", yearsOfExperience: 3 }, { name: "Git", level: "expert", yearsOfExperience: 5 }, { name: "GraphQL", level: "advanced", yearsOfExperience: 2 }], experience: [{ title: "Backend Engineer", company: "DataFlow Systems", startDate: "2021-06", endDate: "", description: "High-throughput data pipelines and REST APIs.", achievements: ["Built API serving 10M requests/day", "Optimized DB queries, 60% faster"] }, { title: "Software Developer", company: "CodeCraft Ltd", startDate: "2019-08", endDate: "2021-05", description: "Backend services for e-commerce.", achievements: ["Payment gateway integration"] }], education: [{ degree: "BSc Software Engineering", institution: "Carnegie Mellon University Africa", field: "SE", graduationYear: 2019 }], certifications: [], languages: ["English", "Kinyarwanda"], totalYearsExperience: 5 },
  { name: "Jean-Pierre Habimana", email: "jp@demo.com", location: "Kigali, Rwanda", summary: "DevOps and backend engineer with 8 years in infrastructure automation and cloud architecture. Deep Kubernetes and Terraform expertise.", skills: [{ name: "Docker", level: "expert", yearsOfExperience: 6 }, { name: "Kubernetes", level: "expert", yearsOfExperience: 4 }, { name: "CI/CD", level: "expert", yearsOfExperience: 7 }, { name: "System Architecture", level: "advanced", yearsOfExperience: 5 }, { name: "Node.js", level: "intermediate", yearsOfExperience: 3 }, { name: "TypeScript", level: "intermediate", yearsOfExperience: 2 }, { name: "Git", level: "expert", yearsOfExperience: 8 }, { name: "PostgreSQL", level: "intermediate", yearsOfExperience: 3 }], experience: [{ title: "Senior DevOps Engineer", company: "CloudScale Africa", startDate: "2021-01", endDate: "", description: "Lead infrastructure architect for banks and telecoms.", achievements: ["Deployment time from 2hr to 8min", "99.99% uptime SLA"] }, { title: "DevOps Engineer", company: "Andela", startDate: "2018-03", endDate: "2020-12", description: "CI/CD for distributed engineering teams.", achievements: ["Automated infra with Terraform"] }], education: [{ degree: "BSc Computer Engineering", institution: "University of Rwanda", field: "CE", graduationYear: 2016 }], certifications: ["AWS Certified Solutions Architect - Professional", "CKA"], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 8 },
  { name: "Diane Uwineza", email: "diane@demo.com", location: "Kigali, Rwanda", summary: "Mobile and full-stack developer with 5 years. Built fintech and health apps used by 200K+ people across East Africa.", skills: [{ name: "React", level: "expert", yearsOfExperience: 4 }, { name: "TypeScript", level: "advanced", yearsOfExperience: 3 }, { name: "Node.js", level: "advanced", yearsOfExperience: 4 }, { name: "REST API Design", level: "advanced", yearsOfExperience: 4 }, { name: "Git", level: "expert", yearsOfExperience: 5 }, { name: "React Native", level: "expert", yearsOfExperience: 4 }, { name: "Docker", level: "intermediate", yearsOfExperience: 2 }], experience: [{ title: "Senior Mobile Engineer", company: "MoMo Health", startDate: "2022-01", endDate: "", description: "Health tracking app with 200K+ users.", achievements: ["Launched in 3 countries", "4.7 star rating on Play Store"] }, { title: "Full-Stack Developer", company: "Kigali Digital Labs", startDate: "2019-09", endDate: "2021-12", description: "Web and mobile solutions for NGOs.", achievements: ["Built donation platform processing $1M+/year"] }], education: [{ degree: "BSc Computer Science", institution: "African Leadership University", field: "CS", graduationYear: 2019 }], certifications: ["Google Associate Cloud Engineer"], languages: ["English", "Kinyarwanda"], totalYearsExperience: 5 },
  { name: "Eric Ndayisaba", email: "eric@demo.com", location: "Bujumbura, Burundi", summary: "Backend engineer with 4 years focused on API development and microservices. Passionate about clean code and test-driven development.", skills: [{ name: "Node.js", level: "advanced", yearsOfExperience: 4 }, { name: "TypeScript", level: "advanced", yearsOfExperience: 3 }, { name: "REST API Design", level: "advanced", yearsOfExperience: 4 }, { name: "PostgreSQL", level: "advanced", yearsOfExperience: 3 }, { name: "Docker", level: "intermediate", yearsOfExperience: 2 }, { name: "Git", level: "advanced", yearsOfExperience: 4 }, { name: "CI/CD", level: "intermediate", yearsOfExperience: 2 }], experience: [{ title: "Software Engineer", company: "BBOXX East Africa", startDate: "2022-03", endDate: "", description: "IoT platform for solar energy distribution.", achievements: ["Microservices serving 100K+ devices", "Reduced API errors by 80%"] }, { title: "Junior Developer", company: "Econet Wireless", startDate: "2020-06", endDate: "2022-02", description: "Telecom billing systems.", achievements: ["Automated reconciliation saving 20hr/week"] }], education: [{ degree: "BSc Software Engineering", institution: "University of Burundi", field: "SE", graduationYear: 2020 }], certifications: [], languages: ["English", "French", "Kirundi"], totalYearsExperience: 4 },

  // Partial matches (3) — some skills but clear gaps
  { name: "Claudine Mukamana", email: "claudine@demo.com", location: "Kigali, Rwanda", summary: "Data engineer transitioning to full-stack development. 4 years building data pipelines and analytics platforms. Strong SQL and Python.", skills: [{ name: "Python", level: "expert", yearsOfExperience: 4 }, { name: "PostgreSQL", level: "expert", yearsOfExperience: 4 }, { name: "TypeScript", level: "beginner", yearsOfExperience: 1 }, { name: "React", level: "beginner", yearsOfExperience: 1 }, { name: "Node.js", level: "beginner", yearsOfExperience: 1 }, { name: "Docker", level: "intermediate", yearsOfExperience: 2 }, { name: "Git", level: "advanced", yearsOfExperience: 4 }], experience: [{ title: "Data Engineer", company: "MTN Rwanda", startDate: "2022-03", endDate: "", description: "Data pipelines and analytics dashboards.", achievements: ["Dashboard tracking 5M+ subscribers", "Reduced ETL time by 70%"] }], education: [{ degree: "BSc Mathematics & CS", institution: "University of Rwanda", field: "Math", graduationYear: 2020 }], certifications: ["Google Data Analytics"], languages: ["English", "Kinyarwanda"], totalYearsExperience: 4 },
  { name: "Kevin Ndahimana", email: "kevin@demo.com", location: "Kigali, Rwanda", summary: "Frontend developer with 3 years focused on UI/UX. Strong design skills but limited backend experience.", skills: [{ name: "React", level: "advanced", yearsOfExperience: 3 }, { name: "TypeScript", level: "intermediate", yearsOfExperience: 2 }, { name: "CSS/Tailwind", level: "expert", yearsOfExperience: 3 }, { name: "Next.js", level: "intermediate", yearsOfExperience: 2 }, { name: "Git", level: "intermediate", yearsOfExperience: 3 }, { name: "Figma", level: "advanced", yearsOfExperience: 3 }], experience: [{ title: "Frontend Developer", company: "Creative Rwanda", startDate: "2023-01", endDate: "", description: "Building marketing websites and web apps.", achievements: ["Delivered 15+ client projects", "Established design system"] }, { title: "UI Developer Intern", company: "Irembo", startDate: "2022-01", endDate: "2022-12", description: "Frontend for e-government services.", achievements: ["Redesigned citizen portal"] }], education: [{ degree: "BSc Information Systems", institution: "University of Rwanda", field: "IS", graduationYear: 2022 }], certifications: [], languages: ["English", "Kinyarwanda"], totalYearsExperience: 3 },
  { name: "Aline Ishimwe", email: "aline@demo.com", location: "Kigali, Rwanda", summary: "QA engineer with 4 years exploring a move into software development. Strong testing and automation background.", skills: [{ name: "JavaScript", level: "intermediate", yearsOfExperience: 3 }, { name: "TypeScript", level: "beginner", yearsOfExperience: 1 }, { name: "Git", level: "advanced", yearsOfExperience: 4 }, { name: "CI/CD", level: "advanced", yearsOfExperience: 3 }, { name: "Selenium", level: "expert", yearsOfExperience: 4 }, { name: "Node.js", level: "beginner", yearsOfExperience: 1 }], experience: [{ title: "Senior QA Engineer", company: "Zipline Rwanda", startDate: "2021-06", endDate: "", description: "Test automation for drone delivery platform.", achievements: ["Built test suite with 95% coverage", "Reduced production bugs by 70%"] }, { title: "QA Analyst", company: "Muraho Technology", startDate: "2020-01", endDate: "2021-05", description: "Manual and automated testing.", achievements: ["Introduced automated regression testing"] }], education: [{ degree: "BSc IT", institution: "KIST", field: "IT", graduationYear: 2019 }], certifications: ["ISTQB Foundation Level"], languages: ["English", "Kinyarwanda"], totalYearsExperience: 4 },

  // Weak matches (3) — below requirements threshold
  { name: "Sarah Mugisha", email: "sarah@demo.com", location: "Kigali, Rwanda", summary: "Junior developer with 2 years. ALX Software Engineering graduate. Quick learner with strong fundamentals.", skills: [{ name: "JavaScript", level: "intermediate", yearsOfExperience: 2 }, { name: "React", level: "intermediate", yearsOfExperience: 2 }, { name: "Node.js", level: "beginner", yearsOfExperience: 1 }, { name: "Git", level: "intermediate", yearsOfExperience: 2 }], experience: [{ title: "Junior Developer", company: "Kigali Tech Solutions", startDate: "2024-06", endDate: "", description: "Web apps for local businesses.", achievements: ["Completed 5 client websites"] }], education: [{ degree: "ALX SE Certificate", institution: "ALX Africa", field: "SE", graduationYear: 2024 }], certifications: [], languages: ["English", "Kinyarwanda"], totalYearsExperience: 2 },
  { name: "Olivier Manzi", email: "olivier@demo.com", location: "Kigali, Rwanda", summary: "Fresh graduate passionate about technology. Completed bootcamp and looking for first professional role.", skills: [{ name: "Python", level: "intermediate", yearsOfExperience: 1 }, { name: "HTML/CSS", level: "intermediate", yearsOfExperience: 2 }, { name: "JavaScript", level: "beginner", yearsOfExperience: 1 }, { name: "Git", level: "beginner", yearsOfExperience: 1 }], experience: [{ title: "Intern", company: "250Startups", startDate: "2025-01", endDate: "2025-06", description: "Assisted with web development projects.", achievements: ["Built landing page for client"] }], education: [{ degree: "BSc Economics", institution: "University of Rwanda", field: "Economics", graduationYear: 2024 }], certifications: [], languages: ["English", "Kinyarwanda", "French"], totalYearsExperience: 1 },
  { name: "Josiane Uwase", email: "josiane@demo.com", location: "Huye, Rwanda", summary: "IT support specialist with 3 years exploring a career shift into development. Self-taught programmer.", skills: [{ name: "Python", level: "intermediate", yearsOfExperience: 2 }, { name: "JavaScript", level: "beginner", yearsOfExperience: 1 }, { name: "SQL", level: "intermediate", yearsOfExperience: 2 }, { name: "Linux", level: "advanced", yearsOfExperience: 3 }], experience: [{ title: "IT Support Engineer", company: "RwandAir", startDate: "2022-06", endDate: "", description: "Infrastructure support and helpdesk.", achievements: ["Automated ticketing system workflows", "Maintained 200+ workstations"] }], education: [{ degree: "Diploma in IT", institution: "IPRC Huye", field: "IT", graduationYear: 2022 }], certifications: ["CompTIA A+"], languages: ["English", "Kinyarwanda"], totalYearsExperience: 3 },
];

export async function POST() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const existingJobs = await Job.countDocuments({ userId });
    if (existingJobs > 0) {
      return NextResponse.json({ success: false, error: "You already have jobs. Seed is for empty accounts only." }, { status: 400 });
    }

    const job = await Job.create({
      userId,
      title: "Senior Software Engineer",
      company: "Apex Consulting Group",
      department: "Technology Solutions",
      location: "Kigali, Rwanda",
      type: "full-time",
      description: "Seeking a Senior Software Engineer to design, build, and maintain scalable enterprise systems for our diverse client portfolio. You will work directly with consulting teams and clients to translate business requirements into robust technical solutions. The role involves full-stack development, system architecture, API design, database optimization, and leading technical delivery on client engagements. You will mentor junior developers and contribute to our internal tooling and best practices.",
      requirements: {
        skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "REST API Design", "System Architecture", "Docker", "CI/CD", "Git"],
        experience: { min: 4, max: 10 },
        education: "Bachelor's in Computer Science, Software Engineering, or equivalent practical experience",
        certifications: [],
        languages: ["English"],
      },
      preferences: {
        skills: ["Next.js", "GraphQL", "Kubernetes", "Terraform"],
        traits: ["Strong communicator", "Client-facing experience", "Self-starter", "Problem solver"],
      },
      salary: { min: 80000, max: 130000, currency: "USD" },
      status: "open",
      screeningConfig: { shortlistSize: 10, weightSkills: 40, weightExperience: 30, weightEducation: 15, weightCultureFit: 15 },
    });

    for (const c of DEMO_CANDIDATES) {
      // Split name into firstName/lastName
      const nameParts = c.name.split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Normalize to official schema format
      const profile = {
        ...c,
        firstName,
        lastName,
        headline: c.experience?.[0] ? `${c.experience[0].title} at ${c.experience[0].company}` : "",
        bio: c.summary,
        phone: "",
        linkedIn: "",
        portfolio: "",
        // Normalize languages from string[] to object[]
        languages: (c.languages || []).map((l: string | { name: string; proficiency: string }) =>
          typeof l === "string" ? { name: l, proficiency: "fluent" } : l
        ),
        // Normalize certifications from string[] to object[]
        certifications: (c.certifications || []).map((cert: string | { name: string; issuer: string; issueDate: string }) =>
          typeof cert === "string" ? { name: cert, issuer: "", issueDate: "" } : cert
        ),
        // Normalize experience: add role alias, technologies, isCurrent
        experience: (c.experience || []).map((exp) => ({
          company: exp.company,
          role: exp.title,
          title: exp.title,
          startDate: exp.startDate,
          endDate: exp.endDate || "",
          description: exp.description,
          technologies: [] as string[],
          isCurrent: !exp.endDate,
          achievements: exp.achievements || [],
        })),
        // Normalize education: add fieldOfStudy, startYear, endYear
        education: (c.education || []).map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.field || "",
          field: edu.field || "",
          startYear: 0,
          endYear: edu.graduationYear || 0,
          graduationYear: edu.graduationYear || 0,
        })),
        // New official fields
        projects: [],
        availability: { status: "available", type: "full-time", startDate: "" },
        socialLinks: { linkedin: "", github: "", portfolio: "" },
      };

      await Candidate.create({
        jobId: job._id,
        source: "platform",
        profile,
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
