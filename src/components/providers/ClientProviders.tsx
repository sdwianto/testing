"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "./TRPCProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
