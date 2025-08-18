// app/preview/[mode]/page.tsx
import React from "react";

type Props = {
  params: { mode: "quick" | "pro" };
};

const quickItems = [
  "Robots.txt",
  "Sitemap.xml",
  "AI Readability",
  "Structured Data",
  "AI-Friendly Page Structure",
];

const proItems = [
  "Robots.txt",
  "Sitemap.xml",
  "X-Robots-Tag",
  "Meta robots",
  "Canonical",
  "Title tag",
  "Meta description",
  "Open Graph",
  "H1",
  "Structured Data",
  "Mobile-friendly (viewport)",
  "HTTPS/SSL",
  "Alt attributes",
  "Favicon",
  "Page size",
];

export default function PreviewPage({ params }: Props) {
  const isPro = params.mode === "pro";
  const items = isPro ? proItems : quickItems;

  const buttonColor = isPro
    ? "bg-green-600 hover:bg-green-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Preview: {isPro ? "Business Pro Audit" : "Quick Check"}
        </h1>

        <ul className="list-disc list-inside mb-8 text-gray-800">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <a
          href="/api/checkout"
          className={`block w-full text-center px-6 py-3 text-white font-medium rounded-lg transition ${buttonColor}`}
        >
          Pay & Get Results
        </a>
      </div>
    </div>
  );
}
