// app/preview/[mode]/page.tsx
import React from "react";
import Link from "next/link";

type Mode = "quick" | "pro";

const POINTS: Record<Mode, string[]> = {
  quick: [
    "AI Visibility",
    "AI Readability of Text",
    "AI Access to Key Pages",
    "Up-to-Date Information for AI",
    "AI-Friendly Page Structure",
  ],
  pro: [
    "Robots.txt",
    "Sitemap.xml",
    "Title tag",
    "Meta description",
    "Open Graph",
    "H1",
    "Structured Data (JSON-LD)",
    "Mobile friendly (viewport)",
    "HTTPS / SSL",
    "Alt attributes",
    "Canonical",
    "X-Robots-Tag (headers)",
    "Meta robots",
    "Favicon",
    "404 page",
  ],
};

export default function PreviewPage({
  params,
}: {
  params: { mode: Mode };
}) {
  const mode = (params.mode === "pro" ? "pro" : "quick") as Mode;
  const items = POINTS[mode];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Your result is ready</h1>
      <p className="text-sm text-gray-500 mb-6">
        Checked website: https://example.com/
      </p>

      <ul className="space-y-3 mb-8">
        {items.map((name) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-[15px]">{name}</span>
          </li>
        ))}
      </ul>

      {/* Sandbox: payment disabled. Redirect to /success. */}
      <form action="/api/pay" method="POST" className="mb-4">
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:opacity-90"
        >
          Pay &amp; Get Results
        </button>
      </form>

      <Link
        href="/"
        className="inline-flex justify-center w-full rounded-md border px-4 py-2 text-sm"
      >
        Back to Home
      </Link>
    </main>
  );
}
