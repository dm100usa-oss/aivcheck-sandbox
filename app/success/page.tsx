import ReportLayout from "@/components/ReportLayout";

// Определяем тип для элемента проверки
type CheckItem = {
  name: string;
  status?: "Passed" | "Failed";
  explanation: string;
};

export default function SuccessPage() {
  // Тестовые данные (типизированы правильно)
  const testItems: CheckItem[] = [
    { name: "Robots.txt", status: "Failed", explanation: "File missing or blocks AI" },
    { name: "Sitemap.xml", status: "Passed", explanation: "Sitemap found and valid" },
    { name: "Title tag", status: "Passed", explanation: "Title is clear and unique" },
    { name: "Meta description", status: "Failed", explanation: "Missing description" },
    { name: "Structured Data", status: "Failed", explanation: "No JSON-LD found" },
  ];

  return (
    <ReportLayout
      mode="pro"
      url="https://example.com"
      score={56}
      interpretation="Moderate"
      items={testItems}
    />
  );
}
