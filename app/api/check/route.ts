// /app/api/check/route.ts
import { NextResponse } from 'next/server';
import { analyzeWeighted } from '@/lib/analyzeWeighted';
import type { AnalyzeReturn, CheckKey } from '@/lib/types';

// 5 core checks to show in Quick UI
const QUICK_KEYS: CheckKey[] = [
  'robots_txt', 'sitemap_xml', 'canonical', 'title', 'meta_description',
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const mode = (searchParams.get('mode') || 'quick') as 'quick' | 'full';

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // One full analysis so Quick and Full share the same percent
    const full: AnalyzeReturn = await analyzeWeighted(url);

    if (mode === 'quick') {
      const results = full.checks.filter(c => QUICK_KEYS.includes(c.key));
      return NextResponse.json({
        score: full.score,
        interpretation: full.interpretation,
        checks: results,
        totalChecks: full.checks.length,
      });
    }

    // Full
    return NextResponse.json(full);
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Analyze failed', detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
