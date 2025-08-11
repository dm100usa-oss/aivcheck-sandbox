import { NextResponse } from "next/server";
import { analyze } from "@/lib/analyze";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = (body?.url as string | undefined)?.trim();
    const mode = (body?.mode as "quick" | "pro" | undefined) ?? "quick";

    if (!raw) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    if (!/^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(raw))
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    if (mode !== "quick" && mode !== "pro")
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });

    const data = await analyze(raw, mode);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Analysis failed", detail: String(e?.message ?? e ?? "unknown error") },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: true });
}
