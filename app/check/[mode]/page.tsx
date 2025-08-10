'use client';

export default function ResultPage({ searchParams }: any) {
  const url = searchParams?.url || '';
  const score = Number(searchParams?.score ?? 0);
  const mode = String(searchParams?.mode || 'quick');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">AI Visibility Result</h1>
      <div className="w-full max-w-xl rounded border border-gray-200 p-6">
        <p className="mb-2 text-gray-700">
          <span className="font-semibold">Mode:</span> {mode}
        </p>
        <p className="mb-2 text-gray-700 break-words">
          <span className="font-semibold">URL:</span> {url}
        </p>
        <p className="text-2xl font-semibold mt-4">
          Score: <span className="text-blue-600">{isFinite(score) ? `${score}%` : '-'}</span>
        </p>
      </div>

      <a
        href="/"
        className="mt-8 inline-flex h-11 px-5 items-center justify-center rounded bg-gray-900 text-white hover:bg-black"
      >
        New Check
      </a>
    </main>
  );
}
