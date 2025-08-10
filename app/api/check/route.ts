import { NextRequest, NextResponse } from "next/server";
import { analyzeWeighted } from "@/lib/analyzeWeighted";

export const runtime = "nodejs";

type Check = { key?: string; name: string; passed: boolean; description: string };
type AnalyzeWeightedReturn = {
  score: number;
  checks: Check[];
  interpretation?: string;
};

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

    const { score, checks, interpretation } = (await analyzeWeighted(url)) as AnalyzeWeightedReturn;

    if (mode === "quick") {
      const quickResults = checks.filter((c) => QUICK_KEYS.includes(String(c.key)));
      return NextResponse.json({
        url,
        mode: "quick",
        results: quickResults,
        score,
        interpretation,
      });
    }

    return NextResponse.json({
      url,
      mode: "full",
      results: checks,
      score,
      interpretation,
    });
  } catch (err) {
    return NextResponse.json({ error: "Analyze failed" }, { status: 500 });
  }
}
