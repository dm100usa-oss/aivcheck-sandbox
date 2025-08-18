export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        We couldn’t complete the check for this URL. <br />
        Please check the address and try again.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Back to Home
      </a>
    </div>
  )
}
