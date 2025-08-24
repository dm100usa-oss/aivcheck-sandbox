export default function ScanFailed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Invalid URL</h1>
      <p className="text-gray-700 mb-6">
        Please enter a valid website address starting with http:// or https://
      </p>
      <a
        href="/"
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Go Back
      </a>
    </div>
  );
}
