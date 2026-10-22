"use client";

import Logo from "./Logo";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto bg-panel text-on-panel/80">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="rounded-xl bg-muted px-3 py-1 inline-block"><Logo className="text-xl" /></div>
          <p className="mt-3 text-sm">{t.footer.tagline}</p>
        </div>
        <p className="text-xs text-on-panel/50">© 2026 Arivia. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
