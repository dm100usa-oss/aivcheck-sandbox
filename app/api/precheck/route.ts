import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchWithTimeout(url: string, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "AIVPrecheck/1.0 (+https://aivcheck.com)" },
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(url)) {
      return NextResponse.json({ ok: false, reason: "invalid_url" }, { status: 400 });
    }
    const res = await fetchWithTimeout(url, 8000).catch(() => null);
    const ok = !!res && res.ok;
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
