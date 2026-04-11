import Papa from "papaparse";

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["name", "full name", "candidate name", "applicant", "full_name"],
  email: ["email", "e-mail", "email address", "email_address"],
  phone: ["phone", "telephone", "mobile", "contact", "phone number"],
  skills: ["skills", "technical skills", "competencies", "tech skills"],
  experience: ["experience", "years of experience", "yoe", "years_experience", "total_experience"],
  education: ["education", "degree", "qualification"],
  location: ["location", "city", "address", "region"],
  summary: ["summary", "about", "bio", "profile summary", "profile_summary"],
  linkedIn: ["linkedin", "linkedin url", "linkedin_url"],
  portfolio: ["portfolio", "website", "portfolio url", "github"],
  certifications: ["certifications", "certificates", "certs"],
  languages: ["languages", "spoken languages"],
};

function matchColumn(header: string): string | null {
  const normalized = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
      return field;
    }
  }
  return null;
}

export interface ParsedCandidate {
  profile: {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
    headline: string;
    bio: string;
    location: string;
    summary: string;
    linkedIn: string;
    portfolio: string;
    skills: { name: string; level: "intermediate"; yearsOfExperience: number }[];
    experience: never[];
    education: { institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number }[];
    certifications: { name: string; issuer: string; issueDate: string }[];
    languages: { name: string; proficiency: string }[];
    projects: never[];
    availability: { status: string; type: string; startDate: string };
    socialLinks: { linkedin: string; github: string; portfolio: string };
    totalYearsExperience: number;
  };
  rawCsvRow: Record<string, string>;
}

export function parseCSV(csvText: string): { candidates: ParsedCandidate[]; errors: string[] } {
  const errors: string[] = [];

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  if (result.errors.length > 0) {
    result.errors.forEach((e) => errors.push(`Row ${e.row}: ${e.message}`));
  }

  const headers = result.meta.fields || [];
  const columnMap: Record<string, string> = {};
  headers.forEach((h) => {
    const mapped = matchColumn(h);
    if (mapped) columnMap[h] = mapped;
  });

  const nameColumn = Object.entries(columnMap).find(([, v]) => v === "name");
  if (!nameColumn) {
    errors.push("Could not detect a 'name' column. Please ensure your CSV has a name/full name column.");
    return { candidates: [], errors };
  }

  const candidates: ParsedCandidate[] = [];

  result.data.forEach((row, idx) => {
    const mapped: Record<string, string> = {};
    for (const [csvCol, field] of Object.entries(columnMap)) {
      mapped[field] = row[csvCol] || "";
    }

    if (!mapped.name?.trim()) {
      errors.push(`Row ${idx + 2}: Missing name, skipped`);
      return;
    }

    const skills = mapped.skills
      ? mapped.skills
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({
            name,
            level: "intermediate" as const,
            yearsOfExperience: 0,
          }))
      : [];

    const education = mapped.education
      ? (() => {
          const parts = mapped.education.split(",").map((p) => p.trim());
          const degree = parts[0] || mapped.education;
          const institution = parts[1] || "";
          const yearMatch = mapped.education.match(/\b(19|20)\d{2}\b/);
          const graduationYear = yearMatch ? parseInt(yearMatch[0], 10) : 0;
          return [{ institution, degree, fieldOfStudy: "", startYear: 0, endYear: graduationYear }];
        })()
      : [];

    const certifications = mapped.certifications
      ? mapped.certifications.split(/[,;|]/).map((c) => c.trim()).filter(Boolean).map((name) => ({ name, issuer: "", issueDate: "" }))
      : [];

    const languages = mapped.languages
      ? mapped.languages.split(/[,;|]/).map((l) => l.trim()).filter(Boolean).map((name) => ({ name, proficiency: "fluent" }))
      : [];

    const totalYears = mapped.experience ? parseInt(mapped.experience, 10) || 0 : 0;

    // Split name into firstName/lastName
    const nameParts = mapped.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    candidates.push({
      profile: {
        firstName,
        lastName,
        name: mapped.name.trim(),
        email: mapped.email || "",
        phone: mapped.phone || "",
        headline: "",
        bio: mapped.summary || "",
        location: mapped.location || "",
        summary: mapped.summary || "",
        linkedIn: mapped.linkedIn || "",
        portfolio: mapped.portfolio || "",
        skills,
        experience: [],
        education,
        certifications,
        languages,
        projects: [],
        availability: { status: "available", type: "full-time", startDate: "" },
        socialLinks: { linkedin: mapped.linkedIn || "", github: "", portfolio: mapped.portfolio || "" },
        totalYearsExperience: totalYears,
      },
      rawCsvRow: row,
    });
  });

  return { candidates, errors };
}
