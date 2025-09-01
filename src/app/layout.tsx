import { Toaster } from "@/components/ui/sonner";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { RealtimeProvider } from "@/contexts/realtime/RealtimeProvider";
import "@/styles/globals.css";
import { Outfit } from "next/font/google";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextGen ERP - Enterprise Resource Planning",
  description: "Modern ERP system for CA Mine and NextGen Technology Limited, Papua New Guinea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ClientProviders>
          <RealtimeProvider>
            {children}
            <Toaster position="top-right" />
          </RealtimeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
