import React from "react";
import { CheckItem } from "../types";

type ReportLayoutProps = {
  score: number;
  interpretation: string;
  items: CheckItem[];
};

const ReportLayout: React.FC<ReportLayoutProps> = ({ score, interpretation, items }) => {
  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">AI Visibility Result</h1>

      {/* Donut */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={
                score < 40
                  ? "#ef4444" // красный
                  : score < 70
                  ? "#f59e0b" // жёлтый
                  : "#22c55e" // зелёный
              }
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{score}%</span>
            <span className="text-sm">{interpretation}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.explanation}</p>
            </div>
            <span
              className={`px-3 py-1 rounded text-white text-sm ${
                item.status === "Passed" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>

      {/* Back button */}
      <div className="mt-8 text-center">
        <a
          href="/"
          className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default ReportLayout;
