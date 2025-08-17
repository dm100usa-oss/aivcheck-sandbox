import React from "react";

interface ReportLayoutProps {
  title: string;
  percentage?: number;
  children: React.ReactNode;
}

export default function ReportLayout({ title, percentage, children }: ReportLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
      {percentage !== undefined && (
        <div className="text-center text-xl font-semibold mb-6">
          AI Visibility: {percentage}%
        </div>
      )}
      <div className="space-y-6">{children}</div>
      <div className="mt-10 text-center">
        <a
          href="/"
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
