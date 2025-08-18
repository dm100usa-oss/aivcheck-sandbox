// /app/success/page.tsx
import React from "react";
import ReportLayout from "../../components/ReportLayout";
import { CheckItem } from "../../types";  // ✅ правильный путь

const testItems: CheckItem[] = [
  { name: "Robots.txt", status: "Failed", explanation: "File missing or blocks AI" },
  { name: "Sitemap.xml", status: "Passed", explanation: "Sitemap found and valid" },
  { name: "Title tag", status: "Passed", explanation: "Title is clear and unique" },
  { name: "Meta description", status: "Failed", explanation: "Missing description" },
  { name: "Structured Data", status: "Failed", explanation: "No JSON-LD found" },
];

export default function SuccessPage() {
  return (
    <ReportLayout
      score={56}
      interpretation="Moderate"
      items={testItems}
    />
  );
}
