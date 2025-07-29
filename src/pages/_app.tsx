// pages/_app.tsx
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import type { NextPage } from "next";
import { type AppProps } from "next/app";
import { Outfit } from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";

const outfit = Outfit({
  subsets: ["latin"],
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback jika environment variable tidak ada
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  // Jika tidak ada publishable key, tampilkan halaman sederhana
  if (!publishableKey) {
    return (
      <div className={`${outfit.className} flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configuration Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Please check your environment variables in Vercel:</p>
            <ul className="mt-2 space-y-1">
              <li>• NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
              <li>• CLERK_SECRET_KEY</li>
              <li>• DATABASE_URL</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`${outfit.className} flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Simple POS</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <div className={`${outfit.className}`}>
          {getLayout(<Component {...pageProps} />)}
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);