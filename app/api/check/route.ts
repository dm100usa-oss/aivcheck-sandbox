import { NextRequest, NextResponse } from "next/server";
import { analyzeWeighted } from "@/lib/analyzeWeighted";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { url, mode } = (await req.json()) as { url?: string; mode?: "quick" | "full" };
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const { results, score, interpretation } = await analyzeWeighted(url);

    if (mode === "quick") {
      const firstFive = results.slice(0, 5);
      const passed = firstFive.filter(r => r.passed).length;
      const quickScore = Math.round((passed / firstFive.length) * 100);
      const body: AnalyzeResponse = {
        url,
        mode: "quick",
        results: firstFive,
        score: quickScore,
        interpretation: quickScore >= 85 ? "Excellent" : quickScore >= 70 ? "Good" : quickScore >= 50 ? "Moderate" : "Low",
      };
      return NextResponse.json(body);
    }

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
