"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useLanguage } from "@/lib/i18n";

// Light or dark mode lives as the "dark" class on <html>. The first choice comes from the
// device setting (see the script in layout.tsx); the visitor's own choice is remembered.
export const THEME_KEY = "arivia-theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export default function ThemeToggle() {
  const { t } = useLanguage();
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    document.documentElement.classList.toggle("dark", !dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? "light" : "dark");
    } catch {}
  }

  const label = dark ? t.theme.light : t.theme.dark;
  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-lg transition hover:border-ink/40"
    >
      {dark ? <Sun aria-hidden className="h-5 w-5" /> : <Moon aria-hidden className="h-5 w-5" />}
    </button>
  );
}
