"use client";

import { useLanguage } from "@/lib/i18n";

// Shown while the AI writes an answer: placeholder cards, so the page doesn't look stuck.
export default function LoadingResults({ cards = 3 }: { cards?: number }) {
  const { t } = useLanguage();
  return (
    <div role="status">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink/70">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-apricot border-t-transparent" />
        {t.loadingNote}
      </p>
      <ul className="mt-4 space-y-4" aria-hidden>
        {Array.from({ length: cards }, (_, i) => (
          <li key={i} className="card animate-pulse p-5">
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="mt-3 h-5 w-2/3 rounded bg-muted" />
            <div className="mt-4 h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
