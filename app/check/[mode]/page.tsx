"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Mode = "quick" | "pro";

type CheckItem = {
  key: string;
  name: string;
  passed: boolean;
  description: string;
};

type ApiResult = {
  url: string;
  mode: Mode;
  items: CheckItem[];
  score: number;
  interpretation: "Excellent" | "Good" | "Moderate" | "Needs Improvement";
  error?: string;
  detail?: string;
};

/* smooth "Checking …" (двигаются только точки) */
function LoadingDots() {
  return (
    <span className="inline-flex w-[1.7ch] justify-start tabular-nums">
      <span className="dot">.</span>
      <span className="dot dot2">.</span>
      <span className="dot dot3">.</span>
      <style jsx>{`
        .dot { opacity:.2; animation:aiv-dots 1200ms infinite; }
        .dot2 { animation-delay:200ms; }
        .dot3 { animation-delay:400ms; }
        @keyframes aiv-dots { 0%{opacity:.2} 30%{opacity:1} 60%{opacity:.2} 100%{opacity:.2} }
      `}</style>
    </span>
  );
}

/* простой SVG-донат */
function Donut({ value }: { value: number }) {
  const r = 60;
  const C = 2 * Math.PI * r;
  const filled = (value / 100) * C;
  return (
    <svg width="140" height="140" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={r} stroke="#E5E7EB" strokeWidth="18" fill="none" />
      <circle
        cx="80" cy="80" r={r}
        stroke="currentColor" className="text-blue-600"
        strokeWidth="18" strokeLinecap="round" fill="none"
        strokeDasharray={`${filled} ${C - filled}`}
        transform="rotate(-90 80 80)"
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="30" fontWeight={800} fill="#0F172A">
        {value}%
      </text>
    </svg>
  );
}

export default function ResultPage({
  params,
  searchParams,
}: {
  params: { mode: Mode };
  searchParams: Record<string, string>;
}) {
  const mode = (params.mode as Mode) || "quick";
  const url = (searchParams?.url || "").trim();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, mode }),
        });
        const json: ApiResult = await res.json();

        // не исчезать мгновенно
        const left = Math.max(0, 900 - (Date.now() - mountedAt.current));
        await new Promise((r) => setTimeout(r, left));
        if (cancelled) return;

        if (!res.ok || (json as any).error) {
          setErr((json as any).error || "Analysis failed.");
        } else {
          setData(json);
        }
      } catch (e: any) {
        const left = Math.max(0, 900 - (Date.now() - mountedAt.current));
        await new Promise((r) => setTimeout(r, left));
        if (cancelled) return;
        setErr(e?.message || "Network error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (url) run();
    else {
      setErr("URL is missing.");
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [url, mode]);

  const items = data?.items || [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-center text-2xl font-semibold mb-6">AI Visibility Result</h1>

      <div className="rounded-xl border border-neutral-200 p-6">
        <div className="mb-4 text-sm text-neutral-700">
          <div>Mode: <span className="font-medium">{mode}</span></div>
          <div className="truncate">
            URL: <a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a>
          </div>
          {data && (
            <div>
              Interpretation: <span className="font-medium">{data.interpretation}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-8 text-center text-neutral-800">
            Checking <LoadingDots />
          </div>
        )}

        {!loading && err && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && data && (
          <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-6">
            <div className="flex items-center justify-center">
              <Donut value={data.score} />
            </div>
            <ul className="space-y-2">
              {items.map((it) => (
                <li
                  key={it.key}
                  className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
                >
                  <div className="text-sm">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-neutral-600">{it.description}</div>
                  </div>
                  <span
                    className={[
                      "ml-2 shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
                      it.passed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800",
                    ].join(" ")}
                  >
                    {it.passed ? "Passed" : "Failed"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-500">
          Visibility scores are estimated and based on publicly available data. Not legal advice.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            New Check
          </Link>
        </div>
      </div>
    </main>
  );
}
