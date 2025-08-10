import { NextRequest, NextResponse } from "next/server";
import { analyzeWeighted } from "@/lib/analyzeWeighted";
import type { AnalyzeWeightedReturn, Check } from "@/lib/types";

export const runtime = "nodejs";

const QUICK_KEYS: string[] = [
  "robots_txt",
  "sitemap_xml",
  "title",
  "meta_description",
  "structured_data",
];

export async function POST(req: NextRequest) {
  try {
    const { url, mode } = (await req.json()) as { url?: string; mode?: "quick" | "full" };

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // One full analysis so Quick and Full share the same percent
    const { score, checks, interpretation } = (await analyzeWeighted(url)) as AnalyzeWeightedReturn;

    if (mode === "quick") {
      const results = checks.filter((c: Check) => QUICK_KEYS.includes(String(c.key)));
      return NextResponse.json({ url, mode: "quick", results, score, interpretation });
    }

    return NextResponse.json({ url, mode: "full", results: checks, score, interpretation });
  } catch {
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
