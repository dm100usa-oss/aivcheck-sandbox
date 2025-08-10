'use client';

import { useState } from 'react';
import Donut from '@/components/Donut';

type AnalyzeResponse = {
  url: string;
  mode: 'quick' | 'full';
  results: { name: string; passed: boolean; description: string }[];
  score: number;
  interpretation: 'Low' | 'Moderate' | 'Good' | 'Excellent';
};

export default function HomePage() {
  const [url, setUrl] = useState('https://example.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const isValidUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  async function run(mode: 'quick' | 'full') {
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    setError('');
    setLoading(true);
    setData(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode }),
      });
      if (!res.ok) throw new Error('Request failed');
      const json = (await res.json()) as AnalyzeResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-10 pb-6">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        AI Visibility Pro
      </h1>

      <p className="text-lg text-center text-gray-700 mb-10 max-w-xl">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
      </p>

      <div className="w-full max-w-md">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          autoComplete="off"
          inputMode="url"
          className="w-full px-4 py-3 rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-md space-y-6">
        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => run('quick')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded text-lg font-medium transition"
            title="Quick Check — $9.99"
          >
            Quick Check $9.99
          </button>
          <p className="text-sm text-gray-600 text-center">
            Instant results, 5-point basic check, simple recommendations
          </p>
        </div>

        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => run('full')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded text-lg font-medium transition"
            title="Business Pro Audit — $19.99"
          >
            Business Pro Audit $19.99
          </button>
          <p className="text-sm text-gray-600 text-center">
            15-point audit, detailed PDF report, dev-ready checklist, results via email
          </p>
        </div>
      </div>

      {loading && <div className="mt-8 text-gray-600">Analyzing…</div>}

      {data && !loading && (
        <div className="mt-10 w-full max-w-3xl">
          <div className="flex items-center gap-6">
            <Donut percent={data.score} />
            <div>
              <div className="text-2xl font-semibold mb-1">{data.score}%</div>
              <div className="text-sm text-gray-600">
                Mode: <span className="font-medium">{data.mode === "quick" ? "Quick Check" : "Full Audit"}</span> · Interpretation: <span className="font-medium">{data.interpretation}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">URL: {data.url}</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Checks</h2>
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
              {data.results.map((r, i) => (
                <li key={r.name + i} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-gray-600">{r.description}</div>
                  </div>
                  <div className={r.passed ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-red-600"}>
                    {r.passed ? "PASS" : "FAIL"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-sm">
        <p className="text-gray-500">© 2025 MYAIID. All rights reserved.</p>
        <p className="text-gray-400 text-xs mt-1">
          Visibility scores are approximate and for informational purposes only.
        </p>
      </footer>
    </main>
  );
}
