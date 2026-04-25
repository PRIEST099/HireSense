import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Job from "@/lib/db/models/Job";
import ScreeningSession from "@/lib/db/models/ScreeningSession";

/**
 * Public stats endpoint used by the landing page to show a real "Active jobs"
 * and "Screenings" count. No auth required — aggregates across the whole
 * platform. Cached at the edge for a minute to keep MongoDB load trivial.
 */
export async function GET() {
  try {
    await dbConnect();

    const [totalJobs, totalScreenings] = await Promise.all([
      Job.countDocuments({}),
      ScreeningSession.countDocuments({ status: "completed" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { totalJobs, totalScreenings },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
