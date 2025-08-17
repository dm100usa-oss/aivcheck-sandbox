"use client";

import Donut from "./Donut";
import Link from "next/link";

type CheckItem = {
  name: string;
  status?: "Passed" | "Failed"; // в Preview может не быть
  explanation?: string;         // в Pro есть
};

type ReportLayoutProps = {
  mode: "quick" | "pro";
  url: string;
  score: number; // процент видимости
  interpretation: "Low" | "Moderate" | "High";
  items: CheckItem[];
};

export default function ReportLayout({
  mode,
  url,
  score,
  interpretation,
  items,
}: ReportLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Заголовок */}
      <h1 className="text-2xl font-semibold mb-2">AI Visibility Result</h1>
      <p className="text-gray-500 mb-6">
        Mode: <span className="font-medium">{mode}</span> · URL:{" "}
        <a href={url} className="text-blue-600 underline" target="_blank">
          {url}
        </a>
      </p>

      {/* Donut + Interpretation */}
      <div className="flex items-center gap-6 mb-6">
        <Donut value={score} />
        <div>
          <p className="text-lg font-medium">{score}% visibility</p>
          <p
            className={`mt-1 inline-block px-3 py-1 rounded text-sm ${
              interpretation === "Low"
                ? "bg-red-100 text-red-600"
                : interpretation === "Moderate"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {interpretation}
          </p>
        </div>
      </div>

      {/* Список пунктов */}
      <div className="space-y-4 mb-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="border rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              {item.explanation && (
                <p className="text-sm text-gray-500 mt-1">{item.explanation}</p>
              )}
            </div>
            {item.status && (
              <span
                className={`mt-2 sm:mt-0 px-2 py-1 text-sm font-medium rounded ${
                  item.status === "Passed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Back to Home
        </Link>
      </div>

      {/* Дисклеймер */}
      <p className="text-xs text-gray-400 text-center mt-6">
        Visibility scores are estimated and based on publicly available data.
        Not legal advice.
      </p>
    </div>
  );
}
