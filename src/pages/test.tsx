export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Simple POS is Working!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The application is successfully deployed and running.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>✅ Next.js is working</p>
          <p>✅ Tailwind CSS is working</p>
          <p>✅ TypeScript is working</p>
          <p>✅ Build process is successful</p>
        </div>
        <div className="mt-8">
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Home Page
          </a>
        </div>
      </div>
    </div>
  );
} 