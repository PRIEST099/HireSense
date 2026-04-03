import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Candidate from "@/lib/db/models/Candidate";
import { candidateProfileSchema } from "@/lib/validators/schemas";

export async function GET(
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

    const candidates = await Candidate.find({ jobId }).sort({ createdAt: -1 }).lean();

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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = await req.json();

    // Support single or bulk profiles
    const profiles = Array.isArray(body) ? body : [body];
    const results = [];
    const errors = [];

    await dbConnect();

    for (let i = 0; i < profiles.length; i++) {
      const parsed = candidateProfileSchema.safeParse(profiles[i]);
      if (!parsed.success) {
        errors.push(`Profile ${i + 1}: ${parsed.error.issues[0].message}`);
        continue;
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
