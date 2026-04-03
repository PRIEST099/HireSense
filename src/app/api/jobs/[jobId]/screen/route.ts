import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Candidate from "@/lib/db/models/Candidate";
import Job from "@/lib/db/models/Job";
import ScreeningSession from "@/lib/db/models/ScreeningSession";
import { runScreeningPipeline } from "@/lib/ai/orchestrator";

const PIPELINE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(
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

    const candidateCount = await Candidate.countDocuments({ jobId });
    if (candidateCount === 0) {
      return NextResponse.json({ success: false, error: "No candidates to screen" }, { status: 400 });
    }

    // Check for stuck sessions (processing for > 5 min) and mark them failed
    await ScreeningSession.updateMany(
      {
        jobId,
        status: { $in: ["pending", "processing"] },
        startedAt: { $lt: new Date(Date.now() - PIPELINE_TIMEOUT_MS) },
      },
      { status: "failed", error: "Screening timed out after 5 minutes" }
    );

    // Check for active screening
    const activeSession = await ScreeningSession.findOne({
      jobId,
      status: { $in: ["pending", "processing"] },
    });
    if (activeSession) {
      return NextResponse.json(
        { success: false, error: "A screening is already in progress" },
        { status: 409 }
      );
    }

    const screeningSession = await ScreeningSession.create({
      jobId,
      userId,
      status: "pending",
      totalCandidates: candidateCount,
      processedCandidates: 0,
      shortlistSize: job.screeningConfig.shortlistSize,
    });

    // Run pipeline with timeout
    const pipelinePromise = runScreeningPipeline(screeningSession._id.toString());
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Screening timed out")), PIPELINE_TIMEOUT_MS)
    );

    Promise.race([pipelinePromise, timeoutPromise]).catch(async (err) => {
      console.error("Screening pipeline error:", err);
      await ScreeningSession.findByIdAndUpdate(screeningSession._id, {
        status: "failed",
        error: err.message || "Pipeline failed",
      });
      await Job.findByIdAndUpdate(jobId, { status: "open" });
    });

    return NextResponse.json({ success: true, data: screeningSession });
  } catch (error) {
    console.error("Screen error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
