"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Donut from "@/components/Donut";

type Check = { key?: string; name: string; passed: boolean; description: string };
type AnalyzeResponse = {
  url: string;
  mode: "quick" | "full";
  results: Check[];
  score: number;
  interpretation: "Low" | "Moderate" | "Good" | "Excellent" | string;
};

const DOT_OK = "bg-emerald-600";
const DOT_BAD = "bg-red-600";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"idle" | "quick" | "full">("idle");
  const [checkingText, setCheckingText] = useState("Checking");
  const dotsRef = useRef(0);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  useEffect(() => {
    if (loading === "idle") return;
    const id = setInterval(() => {
      dotsRef.current = (dotsRef.current + 1) % 4;
      setCheckingText("Checking" + ".".repeat(dotsRef.current));
    }, 400);
    return () => clearInterval(id);
  }, [loading]);

  const isValidUrl = (v: string) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const run = async (mode: "quick" | "full") => {
    if (!url || !isValidUrl(url)) {
      setError("Please enter a valid website URL");
      return;
    }
    setError(null);
    setData(null);
    setLoading(mode);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as AnalyzeResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading("idle");
    }
  };

  const clearInput = () => {
    setUrl("");
    setError(null);
  };

  const checks = useMemo(() => data?.results ?? [], [data]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-gray-900 text-center">AI Visibility Pro</h1>
        <p className="text-gray-600 mb-8 text-center">
          Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
        </p>

        <div className="w-full max-w-xl mx-auto relative">
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm pr-12"
          />
          {url && (
            <button
              onClick={clearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              title="Clear"
              aria-label="Clear input"
            >
              ×
            </button>
          )}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
          <button
            onClick={() => run("quick")}
            disabled={loading !== "idle"}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 font-semibold"
            title="Quick Check — $9.99"
          >
            {loading === "quick" ? checkingText : "Quick Check $9.99"}
          </button>
          <button
            onClick={() => run("full")}
            disabled={loading !== "idle"}
            className="w-full sm:w-auto rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-3 font-semibold"
            title="Business Pro Audit — $19.99"
          >
            {loading === "full" ? checkingText : "Business Pro Audit $19.99"}
          </button>
        </div>

        {data && (
          <div className="mt-10">
            <div className="flex items-center gap-6 flex-col sm:flex-row">
              <Donut percent={data.score} />
              <div className="text-center sm:text-left">
                <div className="text-3xl font-semibold">{data.score}%</div>
                <div className="text-sm text-gray-600 mt-1">
                  Mode: <span className="font-medium">{data.mode === "quick" ? "Quick Check" : "Full Audit"}</span> ·{" "}
                  Interpretation: <span className="font-medium">{data.interpretation}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2 break-all">URL: {data.url}</div>
                {data.mode === "quick" && (
                  <div className="text-xs text-gray-500 mt-1">
                    * Score uses full 15-point weighted model; only 5 core criteria are shown below.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">{data.mode === "quick" ? "Core criteria" : "All checks"}</h2>
              <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
                {checks.map((r, i) => {
                  const ok = r.passed;
                  return (
                    <li key={r.name + i} className="px-4 py-3 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 rounded-full ${ok ? DOT_OK : DOT_BAD}`} />
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-sm text-gray-600">{r.description}</div>
                        </div>
                      </div>
                      {data.mode === "quick" ? (
                        <div className={`text-sm font-semibold ${ok ? "text-emerald-700" : "text-red-600"}`}>
                          {ok ? "Good" : "Insufficient"}
                        </div>
                      ) : (
                        <div className={`text-sm font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                          {ok ? "PASS" : "FAIL"}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-xs text-gray-400">
          Visibility scores are approximate and for informational purposes only.
        </div>
      </div>
    </main>
  );
}
