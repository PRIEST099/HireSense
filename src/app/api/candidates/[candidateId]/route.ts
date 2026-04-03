import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import { isValidObjectId } from "@/lib/utils/validate-id";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import Candidate from "@/lib/db/models/Candidate";
import ScreeningResult from "@/lib/db/models/ScreeningResult";
import { recruiterDecisionSchema } from "@/lib/validators/schemas";

async function verifyCandidateOwnership(candidateId: string, userId: string) {
  const candidate = await Candidate.findById(candidateId).lean();
  if (!candidate) return null;

  const job = await Job.findOne({ _id: candidate.jobId, userId }).select("_id").lean();
  if (!job) return null;

  return candidate;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { candidateId } = await params;
    if (!isValidObjectId(candidateId)) return NextResponse.json({ success: false, error: "Invalid candidate ID" }, { status: 400 });

    await dbConnect();

    const candidate = await verifyCandidateOwnership(candidateId, userId);
    if (!candidate) return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });

    const screeningResult = await ScreeningResult.findOne({ candidateId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: { candidate, screeningResult } });
  } catch (error) {
    console.error("Fetch candidate error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { candidateId } = await params;
    if (!isValidObjectId(candidateId)) return NextResponse.json({ success: false, error: "Invalid candidate ID" }, { status: 400 });

    const body = await req.json();
    const parsed = recruiterDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    await dbConnect();

    const candidate = await verifyCandidateOwnership(candidateId, userId);
    if (!candidate) return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });

    const result = await ScreeningResult.findOneAndUpdate(
      { candidateId },
      { recruiterDecision: parsed.data.decision },
      { new: true, sort: { createdAt: -1 } }
    ).lean();

    if (!result) return NextResponse.json({ success: false, error: "No screening result found" }, { status: 404 });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Update decision error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
