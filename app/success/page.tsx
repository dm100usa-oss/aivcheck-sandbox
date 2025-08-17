import ReportLayout from "@/components/ReportLayout";

export default function SuccessPage() {
  // тестовые данные (пока без Stripe)
  const testItems = [
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
