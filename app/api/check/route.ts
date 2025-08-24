import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !/^https?:\/\/.+/i.test(url)) {
      return NextResponse.redirect(new URL("/scan-failed", req.url));
    }

    return NextResponse.redirect(new URL(`/preview/quick?url=${encodeURIComponent(url)}`, req.url));
  } catch (error) {
    console.error("Error in /api/check:", error);
    return NextResponse.redirect(new URL("/scan-failed", req.url));
  }
}
