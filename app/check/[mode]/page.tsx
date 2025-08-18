// app/check/[mode]/page.tsx
import { redirect } from "next/navigation";

export default async function CheckPage({
  params,
}: {
  params: { mode: string };
}) {
  try {
    // Example request, replace with your actual check logic
    const result = await fetch("https://api.example.com/check");

    if (!result.ok) {
      redirect("/scan-failed");
    }

    const data = await result.json();

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
    redirect("/scan-failed");
  }
}
