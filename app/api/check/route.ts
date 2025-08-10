// app/api/check/route.ts
import { NextResponse } from 'next/server';
import { analyzeWeighted } from '@/lib/analyzeWeighted';

// Top 5 keys to display in Quick mode (the overall score is still full)
const QUICK_KEYS = [
  'robots_txt',
  'sitemap_xml',
  'canonical',
  'title',
  'meta_description',
] as const;

type CheckItem = {
  key: string;
  name: string;
  passed: boolean;
  description?: string;
  weight?: number;
  score?: number;
};

type AnalyzeReturn = {
  score: number;                 // 0..100
  interpretation: string;        // e.g. "Excellent / Moderate / Poor"
  checks: CheckItem[];           // all checks (15+)
};

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { url, mode } = await req.json() as { url?: string; mode?: 'quick' | 'full' };

    if (!url || !isValidHttpUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Run ONE full analysis so Quick and Full share the same percent
    const full: AnalyzeReturn = await analyzeWeighted(url);

    if (mode === 'quick') {
      const results = full.checks.filter(c => QUICK_KEYS.includes(c.key as any));
      return NextResponse.json({
        mode: 'quick',
        url,
        score: full.score,
        interpretation: full.interpretation,
        checks: results,
      });
    }

    // Full mode (default)
    return NextResponse.json({
      mode: 'full',
      url,
      score: full.score,
      interpretation: full.interpretation,
      checks: full.checks,
    });
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analyze failed' }, { status: 500 });
  }
}
