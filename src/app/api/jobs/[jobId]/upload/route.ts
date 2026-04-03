import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import { parseCSV } from "@/lib/parsers/csv-parser";
import { parseExcel } from "@/lib/parsers/excel-parser";
import { extractTextFromPDF, parseResumeWithAI } from "@/lib/parsers/pdf-parser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    await dbConnect();

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    let totalCreated = 0;
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const jobContext = `${job.title} at ${job.company}. Required skills: ${job.requirements.skills.join(", ")}.`;

    for (const file of files) {
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
          const { candidates, errors } = parseExcel(buffer);
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
            // Still create candidate with raw text for manual review
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
            await Candidate.create({
              jobId,
              source: "resume",
              profile,
              rawResumeText: rawText,
              profileParsedByAI: true,
            });
            totalCreated++;
          } catch (aiError) {
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
      data: {
        candidatesCreated: totalCreated,
        errors: allErrors,
        warnings: allWarnings,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
