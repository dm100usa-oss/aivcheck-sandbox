"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "pro";

// User-facing labels. Top 5 first for both modes.
const ITEMS_TOP5 = [
  "AI Visibility",
  "AI Readability of Text",
  "AI Access to Key Pages",
  "Up-to-Date Information for AI",
  "AI-Friendly Page Structure",
];

const ITEMS_FULL_REST = [
  "Search Discoverability for AI",
  "Visibility of Key Sections for AI",
  "Key Facts Marked for AI",
  "Clear Titles and Descriptions for AI",
  "Duplicate Pages (Impact on AI)",
  "Enough Useful Text for AI",
  "Image Descriptions for AI",
  "Direct Content Access for AI",
  "Barriers to AI Reading",
  "Access to All Pages for AI and Search Engines",
];

const ITEMS_QUICK = ITEMS_TOP5;
const ITEMS_FULL = [...ITEMS_TOP5, ...ITEMS_FULL_REST];

export default function PreviewPage({
  params,
  searchParams,
}: {
  params: { mode: Mode };
  searchParams: Record<string, string | undefined>;
}) {
  const mode = (params.mode as Mode) || "quick";
  const url = (searchParams?.url || "").trim();
  const status = (searchParams?.status || "ok").toLowerCase(); // "ok" | "error"
  const router = useRouter();

  const colorBtn =
    mode === "quick"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";
  const colorDot = mode === "quick" ? "bg-blue-600" : "bg-green-600";

  const items = useMemo(() => (mode === "pro" ? ITEMS_FULL : ITEMS_QUICK), [mode]);

  const [email, setEmail] = useState("");
  const emailValid =
    mode === "pro" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : true;

  // Create checkout session and redirect
  const pay = async () => {
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          mode,
          email: mode === "pro" ? email.trim() : undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.sessionUrl) {
        alert(data?.error || "Payment initialization failed.");
        return;
      }
      window.location.href = data.sessionUrl as string;
    } catch {
      alert("Payment initialization failed.");
    }
  };

  const back = () => router.push("/");

  const payLabel = mode === "pro" ? "Pay & Get Full Report" : "Pay & Get Results";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-semibold">
            {status === "ok" ? "Your result is ready" : "Scan failed"}
          </h1>

          {/* Checked website (plain text, compact) */}
          <div className="mb-6 text-center text-sm text-neutral-600">
            {url ? (
              <div className="truncate">
                Checked website: <span className="font-medium">{url}</span>
              </div>
            ) : (
              <div>URL is missing</div>
            )}
          </div>

          {status === "ok" ? (
            <>
              {/* Checklist (no numeric values before payment) */}
              <ul className="mb-6 space-y-3">
                {items.map((t, i) => (
                  <li key={i} className="flex items-center">
                    <span
                      className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full ${colorDot}`}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 10.5l3 3 7-7"
                          stroke="white"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[15px]">{t}</span>
                  </li>
                ))}
              </ul>

              {/* Pro: email for report delivery */}
              {mode === "pro" && (
                <div className="mb-4">
                  <label htmlFor="email" className="mb-1 block text-sm text-neutral-700">
                    Email to receive the report
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={[
                      "w-full rounded-md border px-3 py-2 text-sm outline-none",
                      email
                        ? emailValid
                          ? "border-neutral-300 focus:ring-2 focus:ring-green-500"
                          : "border-rose-400 focus:ring-2 focus:ring-rose-300"
                        : "border-neutral-300 focus:ring-2 focus:ring-green-500",
                    ].join(" ")}
                    aria-invalid={mode === "pro" && !emailValid ? "true" : "false"}
                    aria-describedby={mode === "pro" && !emailValid ? "email-err" : undefined}
                  />
                  {mode === "pro" && !emailValid && (
                    <p id="email-err" className="mt-1 text-xs text-rose-600">
                      Please enter a valid email.
                    </p>
                  )}
                </div>
              )}

              {/* Pay */}
              <button
                onClick={pay}
                disabled={!url || (mode === "pro" && !emailValid)}
                className={[
                  "w-full rounded-md px-4 py-3 text-base font-medium transition-colors disabled:opacity-60",
                  colorBtn,
                ].join(" ")}
              >
                {payLabel}
              </button>

              <p className="mt-6 text-center text-xs text-neutral-500">
                <span className="opacity-60">
                  Visibility scores are estimated and based on publicly available data. Not legal advice.
                </span>
              </p>
            </>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              We couldn’t complete the scan for this URL. Please check the address and try again.
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={back}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Back to Home
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-neutral-500">
          © 2025 AI Visibility Pro. All rights reserved.
          <br />
          <span className="opacity-60">
            Visibility scores are estimated and based on publicly available data. Not legal advice.
          </span>
        </footer>
      </div>
    </main>
  );
}
