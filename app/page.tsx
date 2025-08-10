'use client';

import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const ensureValid = useCallback((value: string) => {
    if (!value || !isValidUrl(value)) {
      setError('Please enter a valid URL (including http/https).');
      return false;
    }
    setError('');
    return true;
  }, []);

  const go = useCallback(
    (mode: 'quick' | 'pro') => {
      const value = url.trim();
      if (!ensureValid(value)) return;
      if (mode === 'quick') setLoadingQuick(true);
      if (mode === 'pro') setLoadingPro(true);

      // forward keeping the same score logic on backend
      router.push(`/check/${mode}?url=${encodeURIComponent(value)}`);
    },
    [url, ensureValid, router],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      go('quick'); // Enter triggers Quick Check
    }
  };

  const clearInput = () => {
    setUrl('');
    setError('');
    // keep focus in the field for fast re-typing
    inputRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        AI Visibility Pro
      </h1>

      <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
      </p>

      <div className="w-full max-w-xl relative">
        <input
          ref={inputRef}
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onKeyDown}
          className={`w-full pr-10 px-4 py-3 rounded border text-base outline-none transition
            ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-500'}
          `}
        />
        {/* Clear (X) button */}
        {url && (
          <button
            aria-label="Clear URL"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-xl space-y-5">
        {/* QUICK CHECK */}
        <button
          onClick={() => go('quick')}
          disabled={loadingQuick || loadingPro}
          className={`w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                      text-white py-3 rounded text-lg font-medium transition`}
        >
          {loadingQuick ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
              </svg>
              Checking…
            </span>
          ) : (
            'Quick Check $9.99'
          )}
        </button>
        <p className="text-sm text-gray-600 text-center">
          Instant results, 5-point basic check, simple recommendations
        </p>

        {/* BUSINESS PRO */}
        <button
          onClick={() => go('pro')}
          disabled={loadingQuick || loadingPro}
          className={`w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
                      text-white py-3 rounded text-lg font-medium transition`}
        >
          {loadingPro ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
              </svg>
              Checking…
            </span>
          ) : (
            'Business Pro Audit $19.99'
          )}
        </button>
        <p className="text-sm text-gray-600 text-center">
          15-point audit, detailed PDF report, dev-ready checklist, results via email
        </p>
      </div>

      <footer className="mt-16 text-center text-sm">
        <p className="text-gray-500">© 2025 MYAIID. All rights reserved.</p>
        <p className="text-gray-400 text-xs mt-1">
          Visibility scores are estimated and based on publicly available data. Not legal advice.
        </p>
      </footer>
    </main>
  );
}
