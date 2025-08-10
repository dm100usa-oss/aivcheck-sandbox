import { NextRequest, NextResponse } from "next/server";
import { analyzeWeighted } from "@/lib/analyzeWeighted";
import type { AnalyzeResponse } from "@/lib/types";

// Node runtime is required to allow external fetch
export const runtime = "nodejs";

// 5 core criteria to display in Quick mode (order matters)
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
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Always compute FULL analysis and FINAL score once
    const { results, score, interpretation } = await analyzeWeighted(url);

    if (mode === "quick") {
      // In Quick mode we SHOW only 5 core checks,
      // but we KEEP the full weighted score so it MATCHES Full Audit.
      const quickResults = results.filter(r => QUICK_KEYS.includes(String((r as any).key)));
      const body: AnalyzeResponse = {
        url,
        mode: "quick",
        results: quickResults,
        score,               // IMPORTANT: same full weighted score
        interpretation,
      };
      return NextResponse.json(body);
    }

    // Full mode: return everything
    const body: AnalyzeResponse = {
      url,
      mode: "full",
      results,
      score,
      interpretation,
    };
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
