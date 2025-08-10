"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* only dots animate, text is stable */
function Dots() {
  return (
    <span className="inline-flex w-[1.7ch] justify-start tabular-nums align-middle">
      <span className="dot">.</span>
      <span className="dot dot2">.</span>
      <span className="dot dot3">.</span>
      <style jsx>{`
        .dot { opacity: .2; animation: aiv-dots 1200ms infinite; }
        .dot2 { animation-delay: 200ms; }
        .dot3 { animation-delay: 400ms; }
        @keyframes aiv-dots {
          0% { opacity: .2; } 30% { opacity: 1; } 60% { opacity: .2; } 100% { opacity: .2; }
        }
      `}</style>
    </span>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const router = useRouter();

  function isValid(u: string) {
    return /^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(u.trim());
  }

  const go = async (mode: "quick" | "pro") => {
    const u = url.trim();
    if (!isValid(u)) {
      setError("Please enter a valid URL (including http/https).");
      return;
    }
    setError(null);

    if (mode === "quick") setLoadingQuick(true);
    else setLoadingPro(true);

    // keep dots visible at least 800ms for professional feel
    const started = Date.now();
    const q = new URLSearchParams({ url: u }).toString();
    router.push(`/check/${mode}?${q}`);
    const left = Math.max(0, 800 - (Date.now() - started));
    await new Promise((r) => setTimeout(r, left));
    if (mode === "quick") setLoadingQuick(false);
    else setLoadingPro(false);
  };

  return (
    <main className="mx-auto max-w-2xl px-6 pt-20 pb-16">
      {/* Title */}
      <h1 className="text-center text-4xl font-semibold tracking-tight mb-4">
        AI Visibility Pro
      </h1>
      <p className="text-center text-neutral-600 mb-8 leading-relaxed">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini,
        and Grok.
      </p>

      {/* URL input */}
      <div className="mb-2">
        <input
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={[
            "w-full rounded-md border px-4 py-3 text-base outline-none",
            error
              ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
              : "border-neutral-300 focus:ring-2 focus:ring-blue-500",
          ].join(" ")}
        />
      </div>
      {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}

      {/* Quick button */}
      <button
        onClick={() => go("quick")}
        disabled={loadingQuick || loadingPro}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-white text-base font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loadingQuick ? (
          <span className="inline-flex items-center">
            Checking<Dots />
          </span>
        ) : (
          "Quick Check $9.99"
        )}
      </button>
      <p className="mt-2 mb-4 text-center text-sm text-neutral-600">
        Instant results, 5-point basic check, simple recommendations
      </p>

      {/* Pro button */}
      <button
        onClick={() => go("pro")}
        disabled={loadingQuick || loadingPro}
        className="w-full rounded-md bg-green-600 px-4 py-3 text-white text-base font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {loadingPro ? (
          <span className="inline-flex items-center">
            Checking<Dots />
          </span>
        ) : (
          "Business Pro Audit $19.99"
        )}
      </button>
      <p className="mt-2 text-center text-sm text-neutral-600">
        15-point audit, detailed PDF report, dev-ready checklist, results via email
      </p>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-neutral-500">
        © 2025 MYAIID. All rights reserved.
        <br />
        Visibility scores are estimated and based on publicly available data. Not legal advice.
      </footer>
    </main>
  );
}
