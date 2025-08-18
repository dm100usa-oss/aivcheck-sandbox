// components/ReportLayout.tsx
import React from "react";
import { CheckItem } from "../types";

type ReportLayoutProps = {
  score: number;
  interpretation: string;
  items: CheckItem[];
};

const getColor = (score: number) => {
  if (score < 40) return "text-red-500";
  if (score < 70) return "text-yellow-500";
  return "text-green-500";
};

export default function ReportLayout({ score, interpretation, items }: ReportLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Visibility Result</h1>

      {/* Donut + Interpretation */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${score * 2.83} ${283 - score * 2.83}`}
              className={getColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-semibold">{score}%</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-medium">{score}% visibility</p>
          <span
            className={`px-2 py-1 rounded text-sm ${
              score < 40
                ? "bg-red-100 text-red-700"
                : score < 70
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {interpretation}
          </span>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3 mb-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border p-3 rounded"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.explanation}</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-sm ${
                item.status === "Passed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="text-center">
        <a
          href="/"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
