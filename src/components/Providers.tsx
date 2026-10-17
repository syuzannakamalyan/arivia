"use client";

import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
