import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import ScreeningResult from "@/lib/db/models/ScreeningResult";
import ScreeningSession from "@/lib/db/models/ScreeningSession";
import { jobSchema } from "@/lib/validators/schemas";

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

    const job = await Job.findOne({ _id: jobId, userId }).lean();
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    const candidateCount = await Candidate.countDocuments({ jobId });
    const latestSession = await ScreeningSession.findOne({ jobId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: { ...job, candidateCount, latestSession } });
  } catch (error) {
    console.error("Fetch job error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    if (!isValidObjectId(jobId)) return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });

    const body = await req.json();

    // Validate with partial schema — strip dangerous fields
    const parsed = jobSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await dbConnect();

    const job = await Job.findOneAndUpdate({ _id: jobId, userId }, parsed.data, { new: true }).lean();
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
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

    // NOTE: Sequential deletes are acceptable for single-user demo.
    // For production, wrap in a MongoDB transaction for atomicity.
    await ScreeningResult.deleteMany({ jobId });
    await ScreeningSession.deleteMany({ jobId });
    await Candidate.deleteMany({ jobId });
    await Job.findByIdAndDelete(jobId);

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
