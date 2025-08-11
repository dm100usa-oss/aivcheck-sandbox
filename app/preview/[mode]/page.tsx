"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "quick" | "pro";

// Пользовательские лейблы (согласованные). В начале — 5 самых важных.
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

  // Цвета по режиму
  const colorBtn =
    mode === "quick"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";
  const colorDot = mode === "quick" ? "bg-blue-600" : "bg-green-600";

  // Пункты по режиму
  const items = useMemo(() => (mode === "pro" ? ITEMS_FULL : ITEMS_QUICK), [mode]);

  // Email (только для pro)
  const [email, setEmail] = useState("");
  const emailValid =
    mode === "pro" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : true;

  // Заглушка оплаты
  const pay = () => {
    alert("Payment flow opens here (Stripe/PayPal).");
  };

  const back = () => router.push("/");

  // Текст кнопки
  const payLabel = mode === "pro" ? "Pay & Get Full Report" : "Pay & Get Results";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-semibold">
            {status === "ok" ? "Your result is ready" : "Scan failed"}
          </h1>

          {/* Checked website (plain text, bigger URL) */}
          <div className="mb-6 text-center">
            {url ? (
              <div className="truncate">
                <span className="text-[15px] text-neutral-600">Checked website: </span>
                <span className="text-lg sm:text-xl font-medium text-neutral-900">
                  {url}
                </span>
              </div>
            ) : (
              <div className="text-sm text-neutral-600">URL is missing</div>
            )}
          </div>

          {status === "ok" ? (
            <>
              {/* Список с цветными кружками-галочками (значения скрыты до оплаты) */}
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

              {/* Pro: email для отправки отчёта */}
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

              {/* Кнопка оплаты (без цены) */}
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

              {/* Дисклеймер */}
              <p className="mt-6 text-center text-xs text-neutral-500">
                <span className="opacity-60">
                  Visibility scores are estimated and based on publicly available data. Not legal advice.
                </span>
              </p>
            </>
          ) : (
            // Ошибка: кнопки оплаты нет
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
