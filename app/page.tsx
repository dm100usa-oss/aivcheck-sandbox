"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function isValid(u: string) {
    return /^https?:\/\/[\w.-]+\.[a-z]{2,}.*$/i.test(u.trim());
  }

  const go = (mode: "quick" | "pro") => {
    const u = url.trim();
    if (!isValid(u)) {
      setError("Please enter a valid URL (including http/https).");
      return;
    }
    setError(null);
    const q = new URLSearchParams({ url: u });
    router.push(`/check/${mode}?${q.toString()}`);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      {/* Title */}
      <h1 className="text-center text-3xl font-semibold mb-2">
        AI Visibility Pro
      </h1>
      <p className="text-center text-neutral-600 mb-8">
        Check if your website is visible to AI assistants like ChatGPT, Bing
        Copilot, Gemini, and Grok.
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
            "w-full rounded-md border px-4 py-3 outline-none",
            error
              ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
              : "border-neutral-300 focus:ring-2 focus:ring-blue-500",
          ].join(" ")}
        />
      </div>
      {error && (
        <div className="mb-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => go("quick")}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700"
        >
          Quick Check $9.99
        </button>
        <button
          onClick={() => go("pro")}
          className="flex-1 rounded-md bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700"
        >
          Business Pro Audit $19.99
        </button>
      </div>

      {/* Descriptions under buttons */}
      <div className="mb-10 text-center text-sm text-neutral-600">
        <div>Instant results, 5-point basic check, simple recommendations</div>
        <div>15-point audit, detailed PDF report, dev-ready checklist, results via email</div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-neutral-500">
        © 2025 AI Visibility Pro. All rights reserved.
        <br />
        Visibility scores are estimated and based on publicly available data. Not legal advice.
      </footer>
    </main>
  );
}
