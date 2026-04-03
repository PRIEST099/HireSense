import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import ScreeningSession from "@/lib/db/models/ScreeningSession";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const userJobs = await Job.find({ userId }).select("_id").lean();
    const jobIds = userJobs.map((j) => j._id);

    const [totalCandidates, screeningsRun] = await Promise.all([
      Candidate.countDocuments({ jobId: { $in: jobIds } }),
      ScreeningSession.countDocuments({ userId, status: "completed" }),
    ]);

    return NextResponse.json({
      success: true,
      data: { totalCandidates, screeningsRun },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
