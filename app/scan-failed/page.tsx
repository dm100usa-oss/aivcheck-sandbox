// app/scan-failed/page.tsx
import React from "react";

export default function ScanFailedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Scan Failed</h1>
        <p className="text-gray-700 mb-2">
          We couldn’t complete the scan for this URL.
        </p>
        <p className="text-gray-500 mb-6">
          Please check the address and try again.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
