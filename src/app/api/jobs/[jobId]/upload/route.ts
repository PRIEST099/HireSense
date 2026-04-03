import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseExcel } from "@/lib/parsers/excel-parser";
import { extractTextFromPDF, parseResumeWithAI } from "@/lib/parsers/pdf-parser";
import { validateResumeUrl } from "@/lib/utils/url-validator";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    if (!isValidObjectId(jobId)) return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });

    await dbConnect();

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    const formData = await req.formData();

    // Handle resume URL
    const resumeUrl = formData.get("resumeUrl") as string | null;
    if (resumeUrl) {
      // Fix #1: SSRF protection
      const urlCheck = validateResumeUrl(resumeUrl);
      if (!urlCheck.valid) {
        return NextResponse.json({ success: false, error: urlCheck.error }, { status: 400 });
      }

      const jobContext = `${job.title} at ${job.company}. Required skills: ${job.requirements.skills.join(", ")}.`;
      try {
        const response = await fetch(resumeUrl, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("pdf") && !resumeUrl.toLowerCase().endsWith(".pdf")) {
          return NextResponse.json({ success: false, error: "URL must point to a PDF file" }, { status: 400 });
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > MAX_FILE_SIZE) {
          return NextResponse.json({ success: false, error: "Resume PDF exceeds 5MB limit" }, { status: 400 });
        }
        const rawText = await extractTextFromPDF(buffer);
        try {
          const { profile } = await parseResumeWithAI(rawText, jobContext);
          await Candidate.create({ jobId, source: "resume", profile, rawResumeText: rawText, resumeFileUrl: resumeUrl, profileParsedByAI: true });
        } catch {
          const name = resumeUrl.split("/").pop()?.replace(".pdf", "") || "Unknown";
          await Candidate.create({
            jobId, source: "resume",
            profile: { name, email: "", phone: "", location: "", linkedIn: "", portfolio: "", summary: rawText.slice(0, 500), skills: [], experience: [], education: [], certifications: [], languages: [], totalYearsExperience: 0 },
            rawResumeText: rawText, resumeFileUrl: resumeUrl, profileParsedByAI: false,
          });
        }
        return NextResponse.json({ success: true, data: { candidatesCreated: 1, errors: [], warnings: [] } });
      } catch (err) {
        console.error("Resume URL processing error:", err);
        return NextResponse.json({ success: false, error: "Failed to process the resume URL. Please check it points to a valid, accessible PDF." }, { status: 400 });
      }
    }

    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `Maximum ${MAX_FILES} files per upload` }, { status: 400 });
    }

    let totalCreated = 0;
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const jobContext = `${job.title} at ${job.company}. Required skills: ${job.requirements.skills.join(", ")}.`;

    for (const file of files) {
      // File size check
      if (file.size > MAX_FILE_SIZE) {
        allErrors.push(`${file.name}: File exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      try {
        if (fileName.endsWith(".csv")) {
          const text = buffer.toString("utf-8");
          const { candidates, errors } = parseCSV(text);
          allErrors.push(...errors.map((e) => `${file.name}: ${e}`));

          for (const c of candidates) {
            await Candidate.create({
              jobId,
              source: "csv",
              profile: c.profile,
              rawCsvRow: c.rawCsvRow,
              profileParsedByAI: false,
            });
            totalCreated++;
          }
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          const { candidates, errors, warnings: excelWarnings } = parseExcel(buffer);
          allWarnings.push(...(excelWarnings || []).map((w) => `${file.name}: ${w}`));
          allErrors.push(...errors.map((e) => `${file.name}: ${e}`));

          for (const c of candidates) {
            await Candidate.create({
              jobId,
              source: "excel",
              profile: c.profile,
              rawCsvRow: c.rawCsvRow,
              profileParsedByAI: false,
            });
            totalCreated++;
          }
        } else if (fileName.endsWith(".pdf")) {
          const rawText = await extractTextFromPDF(buffer);

          if (rawText.length < 50) {
            allWarnings.push(`${file.name}: Could not extract sufficient text from PDF`);
            await Candidate.create({
              jobId,
              source: "resume",
              profile: { name: file.name.replace(".pdf", ""), email: "", phone: "", location: "", linkedIn: "", portfolio: "", summary: "", skills: [], experience: [], education: [], certifications: [], languages: [], totalYearsExperience: 0 },
              rawResumeText: rawText,
              profileParsedByAI: false,
            });
            totalCreated++;
            continue;
          }

          try {
            const { profile } = await parseResumeWithAI(rawText, jobContext);
            await Candidate.create({ jobId, source: "resume", profile, rawResumeText: rawText, profileParsedByAI: true });
            totalCreated++;
          } catch {
            allWarnings.push(`${file.name}: AI parsing failed, stored raw text for manual review`);
            await Candidate.create({
              jobId,
              source: "resume",
              profile: { name: file.name.replace(".pdf", ""), email: "", phone: "", location: "", linkedIn: "", portfolio: "", summary: rawText.slice(0, 500), skills: [], experience: [], education: [], certifications: [], languages: [], totalYearsExperience: 0 },
              rawResumeText: rawText,
              profileParsedByAI: false,
            });
            totalCreated++;
          }
        } else {
          allErrors.push(`${file.name}: Unsupported file type. Use CSV, Excel, or PDF.`);
        }
      } catch (fileError) {
        allErrors.push(`${file.name}: ${(fileError as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: { candidatesCreated: totalCreated, errors: allErrors, warnings: allWarnings },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
