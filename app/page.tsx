'use client';

import { useState, useRef, useEffect } from 'react';

type Mode = 'quick' | 'pro';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState<Mode | null>(null);
  const [dots, setDots] = useState('.');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checking) return;
    const id = setInterval(() => {
      setDots((d) => (d.length === 3 ? '.' : d + '.'));
    }, 450);
    return () => clearInterval(id);
  }, [checking]);

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const startCheck = async (mode: Mode) => {
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL (including http/https).');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setChecking(mode);

    try {
      const res = await fetch('/api/check?mode=' + mode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || 'Analyze failed. Please try again.');
      }

      const data = await res.json();
      const search = new URLSearchParams({
        url,
        score: String(data?.score ?? ''),
        mode,
      }).toString();

      window.location.href = `/check/${mode}?${search}`;
    } catch (e: any) {
      setError(e?.message || 'Analyze failed. Please try again.');
    } finally {
      setChecking(null);
    }
  };

  const clearInput = () => {
    setUrl('');
    setError('');
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
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className={`w-full h-12 pl-4 pr-12 rounded border text-base outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300 focus:border-gray-400'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') startCheck('quick');
          }}
        />
        {url && (
          <button
            aria-label="Clear"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="mt-8 flex flex-col items-center w-full max-w-xl space-y-5">
        <button
          onClick={() => startCheck('quick')}
          disabled={!!checking}
          className={`w-full h-12 rounded text-white text-lg font-medium transition ${
            checking ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {checking === 'quick' ? `Checking${dots}` : 'Quick Check $9.99'}
        </button>
        <p className="text-sm text-gray-600 text-center">
          Instant results, 5-point basic check, simple recommendations
        </p>

        <button
          onClick={() => startCheck('pro')}
          disabled={!!checking}
          className={`w-full h-12 rounded text-white text-lg font-medium transition ${
            checking ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {checking === 'pro' ? `Checking${dots}` : 'Business Pro Audit $19.99'}
        </button>
        <p className="text-sm text-gray-600 text-center">
          15-point audit, detailed PDF report, dev-ready checklist, results via email
        </p>
      </div>

      <footer className="mt-14 text-center text-sm">
        <p className="text-gray-500">© 2025 MYAIID. All rights reserved.</p>
        <p className="text-gray-400 text-xs mt-1">
          Visibility scores are estimated and based on publicly available data. Not legal advice.
        </p>
      </footer>
    </main>
  );
}

async function safeMessage(res: Response) {
  try {
    const j = await res.json();
    return j?.error || j?.message;
  } catch {
    return '';
  }
}
