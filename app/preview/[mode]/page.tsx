// app/preview/[mode]/page.tsx
import React from "react";
import { loadStripe } from "@stripe/stripe-js";

type Props = {
  params: { mode: "quick" | "pro" };
};

const quickItems = [
  "Robots.txt",
  "Sitemap.xml",
  "AI Readability",
  "Structured Data",
  "AI-Friendly Page Structure",
];

const proItems = [
  "Robots.txt",
  "Sitemap.xml",
  "X-Robots-Tag",
  "Meta robots",
  "Canonical",
  "Title tag",
  "Meta description",
  "Open Graph",
  "H1",
  "Structured Data",
  "Mobile-friendly (viewport)",
  "HTTPS/SSL",
  "Alt attributes",
  "Favicon",
  "Page size",
];

export default function PreviewPage({ params }: Props) {
  const isPro = params.mode === "pro";
  const items = isPro ? proItems : quickItems;

  const buttonColor = isPro
    ? "bg-green-600 hover:bg-green-700"
    : "bg-blue-600 hover:bg-blue-700";

  const priceId = isPro
    ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_QUICK_PRICE_ID;

  const handleCheckout = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const session = await response.json();
    await stripe?.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Preview: {isPro ? "Business Pro Audit" : "Quick Check"}
        </h1>

        <ul className="list-disc list-inside mb-8 text-gray-800">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <button
          onClick={handleCheckout}
          className={`w-full px-6 py-3 text-white font-medium rounded-lg transition ${buttonColor}`}
        >
          Pay & Get Results
        </button>
      </div>
    </div>
  );
}
