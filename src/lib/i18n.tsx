"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionaries";

// English by default; visitors can switch to Armenian, and the choice is remembered in the browser.
const STORAGE_KEY = "arivia-lang";
const CHANGE_EVENT = "arivia-lang-change";
const DEFAULT_LANG: Lang = "en";

type LanguageContextValue = { lang: Lang; t: Dictionary; setLang: (lang: Lang) => void };

function readSavedLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "hy" ? "hy" : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readSavedLang, () => DEFAULT_LANG);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
