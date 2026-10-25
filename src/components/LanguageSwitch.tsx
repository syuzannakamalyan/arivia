"use client";

import { useLanguage } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

const LANGS: { key: Lang; label: string; name: string }[] = [
  { key: "en", label: "EN", name: "English" },
  { key: "hy", label: "ՀՅ", name: "Հայերեն" },
];

// English / Armenian switch in the header.
export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div role="group" aria-label="Language / Լեզու" className="flex rounded-full border border-line bg-surface p-0.5 text-sm font-semibold">
      {LANGS.map((option) => (
        <button
          key={option.key}
          type="button"
          lang={option.key}
          title={option.name}
          aria-pressed={lang === option.key}
          onClick={() => setLang(option.key)}
          className={`rounded-full px-3 py-1.5 transition ${lang === option.key ? "bg-brand text-white" : "text-ink/70 hover:text-ink"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
