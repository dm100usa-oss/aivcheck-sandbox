export default function ScanFailedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Scan Failed
        </h1>
        <p className="text-gray-700 mb-6">
          Something went wrong while checking this website. 
          Please try again later or choose another site.
        </p>
        <a
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-3 transition"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
