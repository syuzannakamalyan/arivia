"use client";

import { createContext, useContext } from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionaries";

// The site is English only for now. The Armenian texts stay in dictionaries.ts,
// so switching back is a matter of changing SITE_LANG (or bringing back a switch).
const SITE_LANG: Lang = "en";

type LanguageContextValue = { lang: Lang; t: Dictionary };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider value={{ lang: SITE_LANG, t: dictionaries[SITE_LANG] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
