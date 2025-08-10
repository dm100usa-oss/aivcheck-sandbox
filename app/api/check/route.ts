// app/api/check/route.ts
import { NextResponse } from 'next/server';
import { analyzeWeighted } from '@/lib/analyzeWeighted';

// 5 core checks to display in Quick mode (score is still computed from all 15)
const QUICK_KEYS = [
  'robots_txt',
  'sitemap_xml',
  'x_robots_tag_header',
  'meta_robots',
  'canonical',
] as const;

// Small helper: strict URL validation (must include http/https)
function ensureHttpUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('URL is required');
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new Error('Please enter a valid URL (including http/https).');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Please enter a valid URL (including http/https).');
  }
  return u.toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = (body?.mode === 'quick' ? 'quick' : 'full') as 'quick' | 'full';
    const url = ensureHttpUrl(body?.url);

    // Always compute the full analysis once
    // analyzeWeighted(url) must return at least: { score: number, checks: any[], interpretation: string }
    const { score, checks, interpretation } = (await analyzeWeighted(url)) as {
      score: number;
      checks: any[];
      interpretation?: string;
    };

    if (mode === 'quick') {
      // Show only 5 core checks, keep the same total score as full analysis
      const quickChecks = checks.filter((c: any) => QUICK_KEYS.includes(String(c?.key) as any));
      return NextResponse.json({
        ok: true,
        mode: 'quick',
        url,
        score,
        checks: quickChecks,
        interpretation: interpretation ?? 'Quick check based on 5 core signals.',
      });
    }

    // Full mode: return everything
    return NextResponse.json({
      ok: true,
      mode: 'full',
      url,
      score,
      checks,
      interpretation: interpretation ?? 'Full analysis across 15 signals.',
    });
  } catch (err: any) {
    // Consistent error payload for the frontend
    return NextResponse.json(
      {
        ok: false,
        error: 'ANALYZE_FAILED',
        message: err?.message || 'Analyze failed. Please try again.',
      },
      { status: 400 },
    );
  }
}
