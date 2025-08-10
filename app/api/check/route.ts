import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyzeWeighted as _analyzeWeighted } from '@/lib/analyzeWeighted';

// NOTE: we always compute FULL analysis once so that Quick and Full share the same percent.
// Then we only trim the list of checks for Quick UI.
const FIVE = 5;

function isHttpUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const url = (searchParams.get('url') || '').trim();
  // mode is optional: 'quick' | 'full'. Default = 'quick' (UI can change later)
  const mode = ((searchParams.get('mode') || 'quick').toLowerCase() === 'full'
    ? 'full'
    : 'quick') as 'quick' | 'full';

  if (!url) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter.' },
      { status: 400 }
    );
  }
  if (!isHttpUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid URL. Use http(s)://example.com' },
      { status: 400 }
    );
  }

  try {
    // IMPORTANT: analyzeWeighted currently expects 2 args -> pass a second arg.
    // We pass 'full' intentionally to force full analysis once.
    const analyzeWeighted = _analyzeWeighted as any;
    const { score, checks, interpretation } = (await analyzeWeighted(
      url,
      'full'
    )) as {
      score: number;
      interpretation?: string;
      checks: Array<{
        key: string;
        name: string;
        passed: boolean;
        description?: string;
        weight?: number;
      }>;
    };

    const payload = {
      mode,
      url,
      score,
      interpretation: interpretation || null,
      checks: mode === 'quick' ? checks.slice(0, FIVE) : checks,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: typeof e?.message === 'string' ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
