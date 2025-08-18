export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Scan Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn’t complete the check for this URL. Please verify the address and try again.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
