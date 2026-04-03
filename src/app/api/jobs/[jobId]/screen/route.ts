import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Candidate from "@/lib/db/models/Candidate";
import Job from "@/lib/db/models/Job";
import ScreeningSession from "@/lib/db/models/ScreeningSession";
import { runScreeningPipeline } from "@/lib/ai/orchestrator";

export async function POST(
  _req: NextRequest,
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

    const candidateCount = await Candidate.countDocuments({ jobId });
    if (candidateCount === 0) {
      return NextResponse.json(
        { success: false, error: "No candidates to screen" },
        { status: 400 }
      );
    }

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

    const userId = (session.user as Record<string, unknown>).id as string;

    const screeningSession = await ScreeningSession.create({
      jobId,
      userId,
      status: "pending",
      totalCandidates: candidateCount,
      processedCandidates: 0,
      shortlistSize: job.screeningConfig.shortlistSize,
    });

    // Run pipeline asynchronously (fire and forget)
    runScreeningPipeline(screeningSession._id.toString()).catch((err) => {
      console.error("Screening pipeline error:", err);
    });

    return NextResponse.json({
      success: true,
      data: screeningSession,
    });
  } catch (error) {
    console.error("Screen error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
