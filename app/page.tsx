// /app/page.tsx
'use client';

import { useState } from 'react';

function isValidUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'quick' | 'full' | ''>('');
  const [result, setResult] = useState<null | {
    score: number;
    interpretation: string;
    checks: { key: string; name: string; passed: boolean; description: string }[];
  }>(null);

  const start = async (mode: 'quick' | 'full') => {
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL (including http/https).');
      return;
    }
    setError('');
    setLoading(mode);
    setResult(null);
    try {
      const r = await fetch(`/api/check?mode=${mode}&url=${encodeURIComponent(url)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Analyze failed');
      setResult(data);
    } catch (e: any) {
      setError('Analyze failed. Please try again.');
    } finally {
      setLoading('');
    }
  };

  const clearInput = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-20 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">AI Visibility Pro</h1>
      <p className="text-gray-700 text-center mb-6">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
      </p>

      <div className="w-full max-w-xl">
        <div className="relative">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className={`w-full px-4 pr-10 py-3 rounded border outline-none text-base
              ${error ? 'border-red-500' : 'border-gray-300'}`
            }
          />
          {url && (
            <button
              aria-label="Clear"
              onClick={clearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="w-full max-w-xl mt-6 flex flex-col gap-4">
        <button
          onClick={() => start('quick')}
          disabled={!!loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded text-lg font-medium transition"
        >
          {loading === 'quick' ? 'Checking…' : 'Quick Check $9.99'}
        </button>

        <button
          onClick={() => start('full')}
          disabled={!!loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded text-lg font-medium transition"
        >
          {loading === 'full' ? 'Checking…' : 'Business Pro Audit $19.99'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <section className="w-full max-w-xl mt-10">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <div className="relative w-40 h-40 rounded-full border-8 border-gray-200">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#16a34a ${result.score}%, #e5e7eb 0)`,
                  WebkitMask:
                    'radial-gradient(farthest-side, transparent 64%, black 66%)',
                  mask:
                    'radial-gradient(farthest-side, transparent 64%, black 66%)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold">{result.score}%</div>
              </div>
            </div>
          </div>

          <ul className="divide-y rounded border">
            {result.checks.map((c) => (
              <li key={c.key} className="flex items-start justify-between p-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.description}</div>
                </div>
                <span className={`text-sm font-semibold ${c.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {c.passed ? 'PASS' : 'FAIL'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-16 text-center text-sm text-gray-500">
        © 2025 MYAIID. All rights reserved.
        <div className="text-gray-400 text-xs mt-1">
          Visibility scores are estimated and based on publicly available data. Not legal advice.
        </div>
      </footer>
    </main>
  );
}
