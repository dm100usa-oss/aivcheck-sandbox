import { NextResponse } from "next/server";
import { analyze } from "../../../lib/analyze";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing URL" },
        { status: 400 }
      );
    }

    const result = await analyze(url);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in /api/check:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
