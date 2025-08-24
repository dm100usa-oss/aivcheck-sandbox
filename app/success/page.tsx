// app/success/page.tsx
import React from "react";
import ReportLayout from "../../components/ReportLayout";
import { CheckItem } from "../../lib/analyze"; // ✅ используем правильный тип

// Тестовые данные в правильной структуре
const testItems: CheckItem[] = [
  {
    key: "robots_txt",
    name: "Robots.txt",
    passed: false,
    description: "File missing or blocks AI",
  },
  {
    key: "sitemap_xml",
    name: "Sitemap.xml",
    passed: true,
    description: "Sitemap found and valid",
  },
  {
    key: "title_tag",
    name: "Title tag",
    passed: true,
    description: "Title is clear and unique",
  },
  {
    key: "meta_description",
    name: "Meta description",
    passed: false,
    description: "Missing description",
  },
  {
    key: "structured_data",
    name: "Structured Data",
    passed: false,
    description: "No JSON-LD found",
  },
];

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl w-full">
        <ReportLayout score={56} interpretation="Moderate" items={testItems} />
      </div>
    </div>
  );
}
