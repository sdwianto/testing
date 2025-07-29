import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to continue</p>
        </div>
        
        {/* Simple container without complex styling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0 border-0",
                headerTitle: "text-xl font-semibold text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 