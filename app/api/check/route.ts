import { NextResponse } from 'next/server';
import { analyzeWeighted } from '@/lib/analyzeWeighted';

const QUICK_KEYS = ['robots_txt', 'sitemap', 'canonical', 'title', 'og_title']; // adjust for your keys

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const mode = (new URL(req.url).searchParams.get('mode') || 'quick') as 'quick' | 'pro';

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    // run full analysis once
    const full: any = await analyzeWeighted(url);
    if (!full || typeof full !== 'object') {
      return NextResponse.json({ error: 'Analyzer returned no data.' }, { status: 500 });
    }

    const score = Number(full.score ?? 0);
    const interpretation = String(full.interpretation ?? '');
    const allChecks: any[] = Array.isArray(full.checks) ? full.checks : [];

    const payload =
      mode === 'quick'
        ? {
            score,
            interpretation,
            checks: allChecks.filter((c) => QUICK_KEYS.includes(String(c?.key))),
          }
        : {
            score,
            interpretation,
            checks: allChecks,
          };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
