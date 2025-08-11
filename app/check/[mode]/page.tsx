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

/* donut for final result */
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

/* subtle skeleton while loading — no text “Checking” */
function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-6 animate-pulse">
      <div className="flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="60" stroke="#E5E7EB" strokeWidth="18" fill="none" />
        </svg>
      </div>
      <ul className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 px-3 py-3">
            <div className="flex-1">
              <div className="h-3 w-40 bg-neutral-200 rounded mb-2" />
              <div className="h-3 w-64 bg-neutral-200 rounded" />
            </div>
            <div className="h-6 w-14 bg-neutral-200 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
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

        // keep skeleton visible at least 900ms for smoothness
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
    return () => { cancelled = true; };
  }, [url, mode]);

  const items = data?.items || [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-center text-2xl font-semibold mb-6">AI Visibility Result</h1>

      <div className="rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="mb-4 text-sm text-neutral-700">
          <div>Mode: <span className="font-medium">{mode}</span></div>
          <div className="truncate">
            URL: <a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a>
          </div>
          {data && (
            <div>
              Interpretation:{" "}
              <span className={[
                "inline-block px-2 py-0.5 rounded text-xs font-semibold align-middle",
                data.interpretation === "Excellent" ? "bg-emerald-100 text-emerald-800" :
                data.interpretation === "Good" ? "bg-blue-100 text-blue-800" :
                data.interpretation === "Moderate" ? "bg-amber-100 text-amber-800" :
                "bg-rose-100 text-rose-800"
              ].join(" ")}>
                {data.interpretation}
              </span>
            </div>
          )}
        </div>

        {loading && <Skeleton />}

        {!loading && err && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && data && (
          <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-6 md:pl-2">
            <div className="flex items-start justify-center">
              <Donut value={data.score} />
            </div>
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.key} className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2">
                  <div className="text-sm">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-neutral-600">{it.description}</div>
                  </div>
                  <span className={["ml-2 shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
                    it.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"].join(" ")}>
                    {it.passed ? "Passed" : "Failed"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-500">
          <span className="opacity-60">
            Visibility scores are estimated and based on publicly available data. Not legal advice.
          </span>
        </p>

        <div className="mt-6 flex justify-center">
          <Link href="/" className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
            New Check
          </Link>
        </div>
      </div>
    </main>
  );
}
