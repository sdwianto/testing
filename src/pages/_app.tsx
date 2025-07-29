// pages/_app.tsx
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import type { NextPage } from "next";
import { type AppProps } from "next/app";
import { Outfit } from "next/font/google";
import type { ReactElement, ReactNode } from "react";

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

  // Fallback jika environment variable tidak ada
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  // Jika tidak ada publishable key, tampilkan error message
  if (!publishableKey) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
          <p className="mt-2 text-gray-600">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not configured
          </p>
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
      <ThemeProvider defaultTheme="dark" storageKey="pos-theme">
        <div className={`${outfit.className}`}>
          {getLayout(<Component {...pageProps} />)}
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);