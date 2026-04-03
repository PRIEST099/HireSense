import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Candidate from "@/lib/db/models/Candidate";
import ScreeningResult from "@/lib/db/models/ScreeningResult";
import { recruiterDecisionSchema } from "@/lib/validators/schemas";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await params;
    await dbConnect();

    const candidate = await Candidate.findById(candidateId).lean();
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }

    const screeningResult = await ScreeningResult.findOne({ candidateId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: { candidate, screeningResult },
    });
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await params;
    const body = await req.json();

    const parsed = recruiterDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await ScreeningResult.findOneAndUpdate(
      { candidateId },
      { recruiterDecision: parsed.data.decision },
      { new: true, sort: { createdAt: -1 } }
    ).lean();

    if (!result) {
      return NextResponse.json({ success: false, error: "No screening result found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Update decision error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
