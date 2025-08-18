"use client";

import React from "react";
import Donut from "./Donut";

type CheckItem = {
  name: string;
  status: "Passed" | "Failed";
  explanation: string;
};

type ReportLayoutProps = {
  score: number;
  interpretation: "Low" | "Moderate" | "High";
  items: CheckItem[];
};

const ReportLayout: React.FC<ReportLayoutProps> = ({ score, interpretation, items }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Donut + Interpretation */}
      <div className="flex items-center gap-6 mb-6">
        <Donut score={score} />
        <div>
          <p className="text-lg font-medium">{score}% visibility</p>
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            {interpretation}
          </span>
        </div>
      </div>

      {/* Список пунктов */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              item.status === "Passed" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
            }`}
          >
            <p className="font-semibold">
              {item.name} –{" "}
              <span
                className={
                  item.status === "Passed" ? "text-green-600" : "text-red-600"
                }
              >
                {item.status}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
          </div>
        ))}
      </div>

      {/* Кнопка */}
      <div className="mt-6 text-center">
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
