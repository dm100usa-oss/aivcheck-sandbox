"use client";

import { useEffect, useRef, useState } from "react";

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

/* ---------- Inline loading dots (smooth, no text jump) ---------- */
function LoadingDots({
  label = "Checking",
  show,
}: {
  label?: string;
  show: boolean;
}) {
  const [visible, setVisible] = useState(show);
  const mountedAt = useRef<number>(Date.now());

  // guarantee at least 900ms visible to avoid flicker
  useEffect(() => {
    if (!show) {
      const remain = Math.max(0, 900 - (Date.now() - mountedAt.current));
      const t = setTimeout(() => setVisible(false), remain);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;
  return (
    <div
      className={[
        "inline-flex items-center text-neutral-800",
        "transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-live="polite"
      aria-busy={show}
    >
      <span className="mr-1">{label}</span>
      <span className="inline-flex w-[1.6ch] justify-start tabular-nums">
        <span className="dot">.</span>
        <span className="dot dot2">.</span>
        <span className="dot dot3">.</span>
      </span>
      <style jsx>{`
        .dot {
          opacity: 0.2;
          animation: aiv-dots 1200ms infinite;
        }
        .dot2 {
          animation-delay: 200ms;
        }
        .dot3 {
          animation-delay: 400ms;
        }
        @keyframes aiv-dots {
          0% {
            opacity: 0.2;
          }
          30% {
            opacity: 1;
          }
          60% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCheck(selected: Mode) {
    setMode(selected);
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL (including http/https).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: selected }),
      });
      const data: ApiResult = await res.json();

      if (!res.ok || (data as any).error) {
        setError((data as any).error || "Analysis failed.");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e?.message || "Network error.");
    } finally {
      // let LoadingDots fade out smoothly (component handles min time)
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  /* ---------- Simple donut ring (SVG) for % ---------- */
  function Donut({ value }: { value: number }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const filled = (value / 100) * circumference;
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="18"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          className="text-blue-600"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform="rotate(-90 80 80)"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="36"
          fontWeight={800}
          fill="#0F172A"
        >
          {value}%
        </text>
      </svg>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <h1 className="text-center text-3xl font-semibold mb-2">
        AI Visibility Pro
      </h1>
      <p className="text-center text-neutral-600 mb-8">
        Check if your website is visible to AI assistants like ChatGPT, Bing
        Copilot, Gemini, and Grok.
      </p>

      {/* Input */}
      <div className="mb-4">
        <input
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => runCheck("quick")}
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          Quick Check $9.99
        </button>
        <button
          onClick={() => runCheck("pro")}
          disabled={loading}
          className="flex-1 rounded-md bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-60"
        >
          Business Pro Audit $19.99
        </button>
      </div>

      {/* Loading */}
      <div className="mt-6 flex justify-center">
        <LoadingDots show={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <div className="mt-10 rounded-lg border border-neutral-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-6">
            <div className="flex items-center justify-center">
              <Donut value={result.score} />
            </div>
            <div>
              <div className="mb-3 text-sm text-neutral-600">
                Mode: <span className="font-medium">{result.mode}</span>
                <br />
                URL:{" "}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-neutral-400 hover:text-blue-700"
                >
                  {result.url}
                </a>
                <br />
                Interpretation:{" "}
                <span className="font-medium">{result.interpretation}</span>
              </div>

              <ul className="space-y-2">
                {result.items.map((it) => (
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
          </div>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Visibility scores are estimated and based on publicly available
            data. Not legal advice.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={reset}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              New Check
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-neutral-500">
        © 2025 AI Visibility Pro. All rights reserved.
      </footer>
    </main>
  );
}
