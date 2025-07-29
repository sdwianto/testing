import { useEffect, useState } from "react";

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [clerkLoaded, setClerkLoaded] = useState(false);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✅ Set" : "❌ Not Set",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_CLERK_DISABLE_DEVELOPMENT_WARNING: process.env.NEXT_PUBLIC_CLERK_DISABLE_DEVELOPMENT_WARNING,
    });

    // Check if Clerk is loaded
    if (typeof window !== "undefined") {
      const checkClerk = () => {
        if ((window as any).Clerk) {
          setClerkLoaded(true);
        } else {
          setTimeout(checkClerk, 100);
        }
      };
      checkClerk();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔍 Debug Information
        </h1>

        <div className="grid gap-6">
          {/* Environment Variables */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-sm">{key}:</span>
                  <span className="font-mono text-sm">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clerk Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Clerk Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Clerk Loaded:</span>
                <span className={clerkLoaded ? "text-green-600" : "text-red-600"}>
                  {clerkLoaded ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Window Object:</span>
                <span className="text-green-600">✅ Available</span>
              </div>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>User Agent:</span>
                <span className="font-mono text-xs">{typeof window !== "undefined" ? window.navigator.userAgent : "Server"}</span>
              </div>
              <div className="flex justify-between">
                <span>URL:</span>
                <span className="font-mono text-xs">{typeof window !== "undefined" ? window.location.href : "Server"}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-x-4">
              <a 
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Go to Home
              </a>
              <a 
                href="/test"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Go to Test Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 