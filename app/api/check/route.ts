// app/api/check/route.ts

import { NextResponse } from 'next/server';
import analyzeWeighted from '@/lib/analyzeWeighted';

// 5 основных критериев, которые показываем в Quick-режиме
const QUICK_KEYS = [
  'robots_txt',
  'sitemap_xml',
  'canonical',
  'title',
  'meta_description',
] as const;

type Mode = 'quick' | 'full';

function isValidHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Общий обработчик (GET/POST сходятся сюда)
async function handle(url: string, mode: Mode) {
  if (!isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid URL. Use http(s)://...' },
      { status: 400 }
    );
  }

  try {
    // ВАЖНО: считаем ПОЛНЫЙ анализ один раз (ожидаем 2-й аргумент = режим)
    // Если ваша analyzeWeighted ожидает именно 'full' | 'quick', используем 'full'.
    const full = await analyzeWeighted(url, 'full');

    // full должен вернуть минимум: { score: number, checks: Array<{ key: string, passed: boolean, ... }>, interpretation?: string }
    const score = full.score ?? 0;
    const interpretation =
      full.interpretation ??
      (score >= 80 ? 'Excellent' : score >= 60 ? 'Moderate' : 'Low');

    const allChecks = Array.isArray(full.checks) ? full.checks : [];

    const quickChecks =
      mode === 'quick'
        ? allChecks.filter((c: any) => QUICK_KEYS.includes(String(c.key) as any))
        : allChecks;

    return NextResponse.json(
      {
        mode,
        url,
        score, // одинаковый процент для обоих режимов
        interpretation,
        checks: quickChecks,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Analyze failed:', err);
    return NextResponse.json(
      { error: 'Analyze failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/check?url=...&mode=quick|full
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const modeParam = (searchParams.get('mode') || 'quick').toLowerCase();
  const mode: Mode = modeParam === 'full' ? 'full' : 'quick';
  return handle(url as string, mode);
}

// POST /api/check  { url, mode }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const url = body?.url as string | undefined;
  const modeParam = (body?.mode || 'quick').toLowerCase();
  const mode: Mode = modeParam === 'full' ? 'full' : 'quick';
  return handle(url ?? '', mode);
}
