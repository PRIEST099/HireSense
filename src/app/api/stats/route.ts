import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import ScreeningSession from "@/lib/db/models/ScreeningSession";
import ScreeningResult from "@/lib/db/models/ScreeningResult";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const userJobs = await Job.find({ userId }).select("_id").lean();
    const jobIds = userJobs.map((j) => j._id);

    const [totalCandidates, screeningsRun, decisionCounts] = await Promise.all([
      Candidate.countDocuments({ jobId: { $in: jobIds } }),
      ScreeningSession.countDocuments({ userId, status: "completed" }),
      ScreeningResult.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: "$recruiterDecision", count: { $sum: 1 } } },
      ]),
    ]);

    const decisions = {
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      pending: 0,
    };
    for (const d of decisionCounts) {
      if (d._id in decisions) {
        decisions[d._id as keyof typeof decisions] = d.count;
      }
    }

    return NextResponse.json({
      success: true,
      data: { totalCandidates, screeningsRun, decisions },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
