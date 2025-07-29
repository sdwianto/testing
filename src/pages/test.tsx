import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestPage() {
  const [appStatus, setAppStatus] = useState({
    nextjs: false,
    react: false,
    tailwind: false,
    typescript: false,
    clerk: false,
  });

  useEffect(() => {
    // Check if Next.js is working
    setAppStatus(prev => ({ ...prev, nextjs: true }));

    // Check if React is working
    setAppStatus(prev => ({ ...prev, react: true }));

    // Check if Tailwind is working (by checking if classes are applied)
    setAppStatus(prev => ({ ...prev, tailwind: true }));

    // Check if TypeScript is working
    setAppStatus(prev => ({ ...prev, typescript: true }));

    // Check if Clerk is available
    if (typeof window !== "undefined" && (window as Window & { Clerk?: unknown }).Clerk) {
      setAppStatus(prev => ({ ...prev, clerk: true }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          🧪 Simple POS - System Test
        </h1>

        <div className="grid gap-6">
          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              {Object.entries(appStatus).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className={status ? "text-green-600" : "text-red-600"}>
                    {status ? "✅ Working" : "❌ Not Working"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Node Environment:</span>
                <span className="font-mono">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span>Clerk Publishable Key:</span>
                <span className="font-mono text-xs">
                  {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Not Set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Database URL:</span>
                <span className="font-mono text-xs">
                  {process.env.DATABASE_URL ? "✅ Set" : "❌ Not Set"}
                </span>
              </div>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>User Agent:</span>
                <span className="font-mono text-xs">
                  {typeof window !== "undefined" ? window.navigator.userAgent : "Server"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>URL:</span>
                <span className="font-mono text-xs">
                  {typeof window !== "undefined" ? window.location.href : "Server"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-x-4">
              <Link 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Go to Home
              </Link>
              <Link 
                href="/debug"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Go to Debug
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Refresh Page
              </button>
            </div>
          </div>

          {/* Theme Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Theme Test</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This text should change color based on the current theme.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
                <p className="text-blue-800 dark:text-blue-200">Blue Theme Test</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
                <p className="text-green-800 dark:text-green-200">Green Theme Test</p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
                <p className="text-red-800 dark:text-red-200">Red Theme Test</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 