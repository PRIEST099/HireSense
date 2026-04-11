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

function emptyProfile(name: string, summary: string = "") {
  return {
    firstName: "", lastName: "", name, email: "", phone: "", headline: "", bio: summary, summary,
    location: "", linkedIn: "", portfolio: "",
    skills: [], experience: [], education: [], certifications: [], languages: [],
    projects: [], availability: { status: "available", type: "full-time", startDate: "" },
    socialLinks: { linkedin: "", github: "", portfolio: "" },
    totalYearsExperience: 0,
  };
}

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

    // Handle resume URL (supports direct PDF links + Google Drive, Dropbox, OneDrive)
    const resumeUrl = formData.get("resumeUrl") as string | null;
    if (resumeUrl) {
      const urlCheck = validateResumeUrl(resumeUrl);
      if (!urlCheck.valid) {
        return NextResponse.json({ success: false, error: urlCheck.error }, { status: 400 });
      }

      const fetchUrl = urlCheck.resolvedUrl || resumeUrl;
      const jobContext = `${job.title} at ${job.company}. Required skills: ${job.requirements.skills.join(", ")}.`;

      try {
        console.log(`[Upload] Fetching resume from: ${fetchUrl} (original: ${resumeUrl})`);
        // Follow redirects (cloud storage often redirects to CDN)
        const response = await fetch(fetchUrl, {
          signal: AbortSignal.timeout(20000),
          redirect: "follow",
          headers: { "User-Agent": "HireSense-AI/1.0" },
        });
        if (!response.ok) {
          return NextResponse.json({ success: false, error: `Could not download file (HTTP ${response.status}). Make sure the link is publicly accessible.` }, { status: 400 });
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > MAX_FILE_SIZE) {
          return NextResponse.json({ success: false, error: "File exceeds 5MB limit" }, { status: 400 });
        }
        if (buffer.length < 100) {
          return NextResponse.json({ success: false, error: "Downloaded file is too small — it may be an error page. Check the sharing settings." }, { status: 400 });
        }

        // Check PDF magic bytes (%PDF)
        const header = buffer.subarray(0, 5).toString("ascii");
        if (!header.startsWith("%PDF")) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("html")) {
            return NextResponse.json({ success: false, error: "The URL returned an HTML page, not a PDF. If using Google Drive, make sure the file sharing is set to 'Anyone with the link'." }, { status: 400 });
          }
          return NextResponse.json({ success: false, error: "The downloaded file is not a valid PDF. Please check the URL." }, { status: 400 });
        }

        const rawText = await extractTextFromPDF(buffer);
        if (rawText.length < 30) {
          return NextResponse.json({ success: false, error: "Could not extract text from this PDF. It may be a scanned image or corrupted file." }, { status: 400 });
        }

        try {
          const { profile } = await parseResumeWithAI(rawText, jobContext);
          await Candidate.create({ jobId, source: "resume", profile, rawResumeText: rawText, resumeFileUrl: resumeUrl, profileParsedByAI: true });
        } catch {
          // AI parsing failed — store with raw text for manual review
          await Candidate.create({
            jobId, source: "resume",
            profile: emptyProfile("Imported from URL", rawText.slice(0, 500)),
            rawResumeText: rawText, resumeFileUrl: resumeUrl, profileParsedByAI: false,
          });
        }
        return NextResponse.json({ success: true, data: { candidatesCreated: 1, errors: [], warnings: [] } });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("Resume URL processing error:", errMsg, err);
        if (errMsg.includes("timeout") || errMsg.includes("abort")) {
          return NextResponse.json({ success: false, error: "Download timed out. The file may be too large or the server is slow. Try a direct PDF link instead." }, { status: 400 });
        }
        if (errMsg.includes("fetch") || errMsg.includes("network") || errMsg.includes("ENOTFOUND")) {
          return NextResponse.json({ success: false, error: "Could not reach the URL. Check your internet connection and that the link is correct." }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: `Failed to process: ${errMsg.slice(0, 150)}` }, { status: 400 });
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
              profile: emptyProfile(file.name.replace(".pdf", "")),
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
              profile: emptyProfile(file.name.replace(".pdf", ""), rawText.slice(0, 500)),
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
