import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import { candidateProfileSchema } from "@/lib/validators/schemas";

const MAX_BULK_CANDIDATES = 100;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    if (!isValidObjectId(jobId)) return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });

    await dbConnect();

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, userId }).select("_id").lean();
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    const candidates = await Candidate.find({ jobId }).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
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

    const body = await req.json();

    // Support single or bulk profiles with limit
    const profiles = Array.isArray(body) ? body : [body];
    if (profiles.length > MAX_BULK_CANDIDATES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_BULK_CANDIDATES} candidates per request` },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, userId }).select("_id").lean();
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    const results = [];
    const errors = [];

    for (let i = 0; i < profiles.length; i++) {
      const parsed = candidateProfileSchema.safeParse(profiles[i]);
      if (!parsed.success) {
        errors.push(`Profile ${i + 1}: ${parsed.error.issues[0].message}`);
        continue;
      }

      // Check for duplicate email in this job
      if (parsed.data.email) {
        const existing = await Candidate.findOne({ jobId, "profile.email": parsed.data.email }).select("_id").lean();
        if (existing) {
          errors.push(`Profile ${i + 1}: ${parsed.data.email} already exists for this job`);
          continue;
        }
      }

      const candidate = await Candidate.create({
        jobId,
        source: "platform",
        profile: parsed.data,
        profileParsedByAI: false,
      });
      results.push(candidate);
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `${results.length} candidate(s) added${errors.length ? `, ${errors.length} failed` : ""}`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Add candidate error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
