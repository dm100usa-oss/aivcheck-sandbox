'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'quick' | 'pro' | null>(null);

  // simple URL validator
  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const canSubmit = useMemo(() => isValidUrl(url), [url]);

  const startCheck = async (mode: 'quick' | 'pro') => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (including http/https).');
      return;
    }
    setError('');
    setLoading(mode);

    const target =
      mode === 'quick'
        ? `/check/quick?url=${encodeURIComponent(url)}`
        : `/check/pro?url=${encodeURIComponent(url)}`;

    // navigate
    router.push(target);

    // clear field so next site can be pasted immediately
    setUrl('');
    setLoading(null);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start sm:justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-4xl font-semibold text-gray-900">AI Visibility Pro</h1>
        <p className="mt-3 text-center text-gray-700">
          Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
        </p>

        {/* URL input */}
        <div className="mt-8 relative">
          <input
            type="url"
            inputMode="url"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            className={`w-full appearance-none bg-white text-gray-900 placeholder-gray-400 outline-none 
                        border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md 
                        px-4 py-3 shadow-sm`}
          />
          {/* Clear button */}
          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setError('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-gray-500 hover:text-gray-700"
              aria-label="Clear URL"
              title="Clear"
            >
              ✕
            </button>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-6">
          {/* Quick Check */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => startCheck('quick')}
              disabled={loading === 'quick'}
              className={`w-full rounded-md py-3 text-lg font-medium text-white transition
                         ${loading === 'quick' ? 'bg-blue-500/70 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading === 'quick' ? (
                <span className="inline-flex items-center gap-2">
                  Checking<span className="animate-pulse">…</span>
                </span>
              ) : (
                'Quick Check $9.99'
              )}
            </button>
            <p className="text-sm text-gray-600 text-center">
              Instant results, 5-point basic check, simple recommendations
            </p>
          </div>

          {/* Business Pro */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => startCheck('pro')}
              disabled={loading === 'pro'}
              className={`w-full rounded-md py-3 text-lg font-medium text-white transition
                         ${loading === 'pro' ? 'bg-green-600/70 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading === 'pro' ? (
                <span className="inline-flex items-center gap-2">
                  Checking<span className="animate-pulse">…</span>
                </span>
              ) : (
                'Business Pro Audit $19.99'
              )}
            </button>
            <p className="text-sm text-gray-600 text-center">
              15-point audit, detailed PDF report, dev-ready checklist, results via email
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500">© 2025 MYAIID. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-400">
            Visibility scores are estimated and based on publicly available data. Not legal advice.
          </p>
        </footer>
      </div>
    </main>
  );
}
