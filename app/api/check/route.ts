// app/api/check/route.ts
import { NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";

// Edge runtime: no Node-only APIs used
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = (body?.url as string | undefined)?.trim();
    const mode = (body?.mode as "quick" | "pro" | undefined) ?? "quick";

    if (!raw) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!isLikelyUrl(raw)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (mode !== "quick" && mode !== "pro") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const result = await analyze(raw, mode);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Analysis failed", detail: String(err?.message ?? err ?? "unknown error") },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, usage: "POST { url: string; mode: 'quick' | 'pro' }" },
    { status: 200 }
  );
}

function isLikelyUrl(s: string) {
  // Accepts https://example.com, http://example.com, or example.com
  return /^https?:\/\/[\w.-]+\.[a-z]{2,}|^[\w.-]+\.[a-z]{2,}/i.test(s);
}
