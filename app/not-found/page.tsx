export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Website Not Found
        </h1>
        <p className="text-gray-700 mb-6">
          The link you entered doesn't seem to be a valid website.
          Please check the address and try again.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition"
        >
          Go Back
        </a>
      </div>
    </div>
  );
}
