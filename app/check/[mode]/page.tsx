// app/check/[mode]/page.tsx
import { redirect } from "next/navigation";

export default async function CheckPage({
  params,
}: {
  params: { mode: string };
}) {
  try {
    // имитация запроса проверки (замени на свою логику)
    const result = await fetch("https://api.example.com/check");

    if (!result.ok) {
      // ❌ ошибка → редирект
      redirect("/scan-failed");
    }

    const data = await result.json();

    // ✅ если всё хорошо → выводим данные
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Check completed: {params.mode}
        </h1>
        <pre className="bg-gray-100 p-4 rounded text-left text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    // ❌ любая ошибка → редирект
    redirect("/scan-failed");
  }
}
