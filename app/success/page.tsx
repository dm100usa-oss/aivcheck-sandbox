// app/success/page.tsx
export default function SuccessPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const mode = (searchParams?.mode ?? "quick") as "quick" | "pro";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
        <h1 className="mb-4 text-2xl font-semibold">Payment successful</h1>

        <p className="mb-6 text-neutral-700">
          Thank you! Your payment for{" "}
          {mode === "pro" ? "Business Pro Audit" : "Quick Check"} was completed.
          {mode === "pro"
            ? " You will receive the PDF report at the email you provided."
            : " Your results are now unlocked."}
        </p>

        <a
          href="/"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Back to Home
        </a>

        <p className="mt-6 text-xs text-neutral-500">
          A receipt will be sent by Stripe to your email.
        </p>
      </div>
    </main>
  );
}
