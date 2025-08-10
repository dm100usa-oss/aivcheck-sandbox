"use client";

import { useState, useMemo } from "react";
import Donut from "@/components/Donut";

type Check = { key?: string; name: string; passed: boolean; description: string };

const QUICK_LABELS: Record<string, string> = {
  robots_txt: "robots.txt",
  sitemap_xml: "sitemap.xml",
  title: "Title tag",
  meta_description: "Meta description",
  structured_data: "Structured data (JSON-LD)",
};

function isValidHttpUrl(input: string) {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"idle" | "quick" | "full">("idle");
  const [mode, setMode] = useState<"quick" | "full" | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<Check[] | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");

  const disabled = loading !== "idle";

  const placeholder = "https://example.com";

  const showQuickList = mode === "quick" && results;

  const handleClear = () => {
    setUrl("");
    setError("");
    setScore(null);
    setResults(null);
    setInterpretation("");
    setMode(null);
  };

  const runCheck = async (selected: "quick" | "full") => {
    if (!url || !isValidHttpUrl(url)) {
      setError("Please enter a valid website URL");
      return;
    }
    setError("");
    setLoading(selected);
    setMode(selected);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: selected }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setScore(data.score ?? null);
      setResults(data.results ?? null);
      setInterpretation(data.interpretation ?? "");
    } catch (e) {
      setError("Analyze failed. Please try again.");
      setScore(null);
      setResults(null);
      setInterpretation("");
      setMode(null);
    } finally {
      setLoading("idle");
    }
  };

  const prettyMode = useMemo(() => {
    if (!mode) return "";
    return mode === "quick" ? "Quick Check" : "Business Pro Audit";
  }, [mode]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">AI Visibility Pro</h1>

      <p className="text-lg text-center text-gray-700 mb-8 max-w-xl">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
      </p>

      {/* URL input */}
      <div className="w-full max-w-md relative">
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className={`w-full pr-10 pl-4 py-3 rounded border text-base outline-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {/* Clear (X) */}
        {url && (
          <button
            aria-label="Clear"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
          >
            ×
          </button>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col items-center w-full max-w-md space-y-5">
        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => runCheck("quick")}
            disabled={disabled}
            className={`w-full text-white py-3 rounded text-lg font-medium transition ${
              disabled ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading === "quick" ? "Checking…" : "Quick Check $9.99"}
          </button>
          <p className="text-sm text-gray-600 text-center">
            Instant results, 5-point basic check, simple recommendations
          </p>
        </div>

        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => runCheck("full")}
            disabled={disabled}
            className={`w-full text-white py-3 rounded text-lg font-medium transition ${
              disabled ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading === "full" ? "Checking…" : "Business Pro Audit $19.99"}
          </button>
          <p className="text-sm text-gray-600 text-center">
            15-point audit, detailed PDF report, dev-ready checklist, results via email
          </p>
        </div>
      </div>

      {/* Result */}
      {score !== null && (
        <section className="mt-10 w-full max-w-2xl">
          <div className="flex flex-col items-center">
            <Donut value={score} />
            <div className="mt-4 text-center">
              <p className="text-xl font-semibold text-gray-900">{score}%</p>
              {mode && (
                <p className="text-sm text-gray-600">
                  Mode: {prettyMode} · Interpretation: {interpretation || "—"} <br />
                  URL: {url}
                </p>
              )}
            </div>
          </div>

          {/* Quick: show only 5 core checks (no percentages), colored status */}
          {showQuickList && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Checks</h3>
              <ul className="divide-y divide-gray-200 rounded border border-gray-200">
                {results!.map((c) => {
                  const label = QUICK_LABELS[c.key ?? ""] ?? c.name;
                  const ok = c.passed;
                  return (
                    <li key={label} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            ok ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-gray-900">{label}</span>
                      </div>
                      <span className={`text-sm font-medium ${ok ? "text-green-600" : "text-red-600"}`}>
                        {ok ? "Good" : "Insufficient"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Full: show all 15 with PASS/FAIL */}
          {mode === "full" && results && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Checks</h3>
              <ul className="divide-y divide-gray-200 rounded border border-gray-200">
                {results.map((c, i) => (
                  <li key={`${c.key ?? c.name}-${i}`} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-gray-900">{c.name}</p>
                      <p className="text-gray-500 text-sm">{c.description}</p>
                    </div>
                    <span className={`text-sm font-semibold ${c.passed ? "text-green-600" : "text-red-600"}`}>
                      {c.passed ? "PASS" : "FAIL"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="mt-16 text-center text-sm">
        <p className="text-gray-500">© 2025 MYAIID. All rights reserved.</p>
        <p className="text-gray-400 text-xs mt-1">
          Visibility scores are estimated and based on publicly available data. Not legal advice.
        </p>
      </footer>
    </main>
  );
}
