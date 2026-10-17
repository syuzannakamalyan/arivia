"use client";

import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex rounded-full border border-navy/15 bg-white p-0.5 text-sm font-semibold">
      {(["hy", "en"] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`rounded-full px-3 py-1 transition ${lang === code ? "bg-navy text-white" : "text-navy/70 hover:text-navy"}`}
          aria-pressed={lang === code}
        >
          {code === "hy" ? "ՀՅ" : "EN"}
        </button>
      ))}
    </div>
  );
}
