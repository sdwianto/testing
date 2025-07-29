import { SignIn, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [signInVisible, setSignInVisible] = useState(false);
  const [hasSignedOut, setHasSignedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Automatically sign out user when they visit the home page
    if (isLoaded && isSignedIn && mounted && !hasSignedOut) {
      console.log("Auto signing out user to force re-authentication");
      setHasSignedOut(true);
      signOut().then(() => {
        console.log("User signed out successfully");
      }).catch((error) => {
        console.error("Error signing out:", error);
      });
    }
  }, [isLoaded, isSignedIn, mounted, hasSignedOut, signOut]);

  useEffect(() => {
    // Set a small delay to ensure SignIn component is ready
    const timer = setTimeout(() => {
      if (isLoaded && mounted) {
        setSignInVisible(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoaded, mounted]);

  // Debug logging
  console.log("Home component state:", { mounted, isLoaded, isSignedIn, signInVisible, hasSignedOut });

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Initializing...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading authentication...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while signing out
  if (isSignedIn && hasSignedOut) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Signing out...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if Clerk is properly configured
  const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Show error if Clerk is not configured
  if (!isClerkConfigured) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Configuration Error</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              Clerk authentication is not configured. Please set up your environment variables.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Required: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always show the sign-in form, regardless of authentication status
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to continue</p>
          {!signInVisible && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Preparing sign-in form...
            </p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {signInVisible ? (
            <SignIn 
              routing="hash"
              afterSignInUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          ) : (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sign-in form...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
