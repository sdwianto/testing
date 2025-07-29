import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && isLoaded && mounted) {
      void router.replace("/dashboard");
    }
  }, [isSignedIn, isLoaded, router, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Fallback jika Clerk tidak ter-load
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading Clerk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Point of Sale System</p>
        </div>
        <SignIn path="/sign-in" />
      </div>
    </div>
  );
}
