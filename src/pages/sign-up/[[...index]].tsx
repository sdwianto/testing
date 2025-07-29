import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
} 