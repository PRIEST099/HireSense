import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth-helpers";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import { jobSchema } from "@/lib/validators/schemas";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = jobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const job = await Job.create({ ...parsed.data, userId });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
