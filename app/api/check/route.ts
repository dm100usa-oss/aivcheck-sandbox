import { NextResponse } from "next/server";

/**
 * API: POST /api/check
 * Body: { url: string, mode?: "quick" | "full" }
 * - Runs ONE full analysis so quick & full share the same percent.
 * - In "quick" mode the response returns only 5 core checks (but the score is the same).
 * - Returns checks WITHOUT the internal "weight" field.
 */

// The 5 core checks we show for Quick mode (adjust keys to your check keys)
const QUICK_KEYS = [
  "robots_txt",
  "sitemap_xml",
  "canonical",
  "title",
  "meta_description",
] as const;

type QuickOrFull = "quick" | "full";

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Minimal shape we return to the UI
type PublicCheck = {
  key: string;
  name: string;
  passed: boolean;
  description?: string;
  details?: string;
};

type PublicReturn = {
  score: number;
  checks: PublicCheck[];
  interpretation: string;
};

export async function POST(req: Request) {
  try {
    // 1) Read input (JSON body is primary; query fallback just in case)
    const contentType = req.headers.get("content-type") ?? "";
    let url = "";
    let mode: QuickOrFull = "full";

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      url = String(body?.url ?? "");
      mode = (body?.mode === "quick" ? "quick" : "full") as QuickOrFull;
    } else {
      const u = new URL(req.url);
      url = String(u.searchParams.get("url") ?? "");
      mode = (u.searchParams.get("mode") === "quick" ? "quick" : "full") as QuickOrFull;
    }

    // 2) Validate URL
    if (!isHttpUrl(url)) {
      return NextResponse.json(
        { error: "Please enter a valid URL (http/https)." },
        { status: 400 }
      );
    }

    // 3) Run ONE full analysis so Quick & Full share the same percent
    //    Use dynamic import + "any" to avoid TypeScript signature conflicts across refactors.
    const { analyzeWeighted }: any = await import("@/lib/analyzeWeighted");
    // If your analyze function requires weights, import them dynamically too:
    let analysis: any;
    try {
      const maybeScore = await import("@/lib/score").catch(() => null as any);
      const weights = (maybeScore?.DEFAULT_WEIGHTS ?? maybeScore?.WEIGHTS ?? undefined) as any;
      analysis = weights !== undefined
        ? await analyzeWeighted(url, weights)
        : await analyzeWeighted(url);
    } catch (e) {
      // Fallback: try without weights if the signature changed
      analysis = await analyzeWeighted(url);
    }

    // Expecting { score: number, checks: Array<{ key, name, passed, description?, details?, weight? }> }
    const score: number = Number(analysis?.score ?? 0);

    // Strip internal "weight" before sending to the client
    const allChecks: PublicCheck[] = Array.isArray(analysis?.checks)
      ? analysis.checks.map((c: any) => ({
          key: String(c.key),
          name: String(c.name ?? c.key),
          passed: Boolean(c.passed),
          description: c?.description ? String(c.description) : undefined,
          details: c?.details ? String(c.details) : undefined,
        }))
      : [];

    // 4) Interpretation for UX (simple thresholds; adjust as needed)
    const interpretation =
      score >= 90
        ? "Excellent"
        : score >= 75
        ? "Good"
        : score >= 55
        ? "Moderate"
        : "Poor";

    // 5) Quick mode: only 5 core checks (but same score)
    const payload: PublicReturn =
      mode === "quick"
        ? {
            score,
            checks: allChecks.filter((c) => QUICK_KEYS.includes(c.key as any)).slice(0, 5),
            interpretation,
          }
        : {
            score,
            checks: allChecks,
            interpretation,
          };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("API /api/check error:", err);
    return NextResponse.json(
      { error: "Analyze failed. Please try again." },
      { status: 500 }
    );
  }
}
