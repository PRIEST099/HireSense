import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import ScreeningResult from "@/lib/db/models/ScreeningResult";
import ScreeningSession from "@/lib/db/models/ScreeningSession";
import Candidate from "@/lib/db/models/Candidate";

export async function GET(
  req: NextRequest,
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

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId && !isValidObjectId(sessionId)) {
      return NextResponse.json({ success: false, error: "Invalid session ID" }, { status: 400 });
    }

    const query = sessionId ? { _id: sessionId, jobId } : { jobId };
    const screeningSession = await ScreeningSession.findOne(query).sort({ createdAt: -1 }).lean();

    if (!screeningSession) {
      return NextResponse.json({ success: true, data: { session: null, results: [] } });
    }

    const results = await ScreeningResult.find({ jobId, sessionId: screeningSession._id })
      .sort({ rank: 1 })
      .limit(200)
      .lean();

    const candidateIds = results.map((r) => r.candidateId);
    const candidates = await Candidate.find({ _id: { $in: candidateIds } })
      .select("profile.name profile.email profile.location profile.skills")
      .lean();

    const candidateMap = new Map(candidates.map((c) => [c._id.toString(), c]));

    const enrichedResults = results.map((r) => {
      const candidate = candidateMap.get(r.candidateId.toString());
      return {
        ...r,
        candidateName: candidate?.profile?.name || "Unknown",
        candidateEmail: candidate?.profile?.email || "",
        candidateLocation: candidate?.profile?.location || "",
        candidateTopSkills: candidate?.profile?.skills?.slice(0, 5).map((s: { name: string }) => s.name) || [],
      };
    });

    return NextResponse.json({ success: true, data: { session: screeningSession, results: enrichedResults } });
  } catch (error) {
    console.error("Fetch results error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
