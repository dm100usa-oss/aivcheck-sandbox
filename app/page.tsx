'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'quick' | 'pro' | null;

export default function HomePage() {
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<Mode>(null);
  const [dots, setDots] = useState('.');

  // animated dots: ".", "..", "..."
  useEffect(() => {
    if (!loading) return;
    const frames = ['.', '..', '...'];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % frames.length;
      setDots(frames[i]);
    }, 450);
    return () => clearInterval(id);
  }, [loading]);

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const showError = (msg: string) => {
    setError(msg);
    // скрываем через 3 сек, чтобы не висело навсегда
    setTimeout(() => setError(''), 3000);
  };

  const handleCheck = async (mode: Exclude<Mode, null>) => {
    if (!url || !isValidUrl(url)) {
      showError('Please enter a valid URL (including http/https).');
      return;
    }
    try {
      setLoading(mode);
      // навигация на существующие страницы результатов
      router.push(`/check/${mode}?url=${encodeURIComponent(url.trim())}`);
    } catch {
      showError('Analyze failed. Please try again.');
      setLoading(null);
    }
  };

  const disabled = !!loading;

  // удобные подсказки плейсхолдера
  const placeholder = useMemo(
    () => (url ? '' : 'https://example.com'),
    [url]
  );

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        AI Visibility Pro
      </h1>

      <p className="text-lg text-center text-gray-700 mb-8 max-w-xl">
        Check if your website is visible to AI assistants like ChatGPT, Bing Copilot, Gemini, and Grok
      </p>

      {/* URL input */}
      <div className="w-full max-w-xl">
        <div
          className={`relative rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300'
          } shadow-sm`}
        >
          <input
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheck('quick');
            }}
            className="w-full px-4 pr-10 py-3 text-base rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* clear button */}
          {url && (
            <button
              aria-label="Clear URL"
              onClick={() => {
                setUrl('');
                setError('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <span className="text-gray-500 text-xl leading-none">&times;</span>
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center w-full max-w-xl space-y-6">
        {/* QUICK CHECK */}
        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => handleCheck('quick')}
            disabled={disabled}
            className={`w-full py-3 rounded text-lg font-medium transition text-white
              ${disabled && loading !== 'quick' ? 'opacity-70 cursor-not-allowed' : ''}
              ${loading === 'quick' ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading === 'quick' ? `Checking${dots}` : 'Quick Check $9.99'}
          </button>
          <p className="text-sm text-gray-600 text-center">
            Instant results, 5-point basic check, simple recommendations
          </p>
        </div>

        {/* BUSINESS PRO */}
        <div className="w-full flex flex-col items-center space-y-1">
          <button
            onClick={() => handleCheck('pro')}
            disabled={disabled}
            className={`w-full py-3 rounded text-lg font-medium transition text-white
              ${disabled && loading !== 'pro' ? 'opacity-70 cursor-not-allowed' : ''}
              ${loading === 'pro' ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading === 'pro' ? `Checking${dots}` : 'Business Pro Audit $19.99'}
          </button>
          <p className="text-sm text-gray-600 text-center">
            15-point audit, detailed PDF report, dev-ready checklist, results via email
          </p>
        </div>
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
