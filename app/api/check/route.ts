import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  try {
    const { url, mode } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing URL" },
        { status: 400 }
      );
    }

    const result = await analyze(url, mode || "quick");

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Check API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
