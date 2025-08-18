"use client";

import React from "react";
import { CheckItem } from "../types";
import Donut from "./Donut";

type ReportLayoutProps = {
  score: number;
  interpretation: string;
  items: CheckItem[];
};

export default function ReportLayout({
  score,
  interpretation,
  items,
}: ReportLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Заголовок */}
      <h1 className="text-2xl font-bold mb-4">AI Visibility Result</h1>

      {/* Donut + Interpretation */}
      <div className="flex items-center gap-6 mb-6">
        <Donut score={score} />
        <div>
          <p className="text-lg font-medium">{score}% visibility</p>
          <p className="text-sm text-gray-600">{interpretation}</p>
        </div>
      </div>

      {/* Список пунктов */}
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.explanation}</p>
            </div>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                item.status === "Passed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>

      {/* Кнопка */}
      <div className="mt-6">
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
