"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { bookingLinks, searchLinks } from "@/lib/routes/links";
import type { RouteRequest, RouteResult } from "@/lib/routes/types";

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;

export default function RoutesPage() {
  const { t, lang } = useLanguage();
  const r = t.routes;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [result, setResult] = useState<RouteResult | null>(null);
  // The search the result belongs to, for the booking links.
  const [searched, setSearched] = useState<Pick<RouteRequest, "from" | "to" | "date"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, date, travellers, lang }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(true);
      return;
    }
    setResult(await res.json());
    setSearched({ from, to, date });
  }

  const duration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h && `${h} ${r.hours}`, m && `${m} ${r.minutes}`].filter(Boolean).join(" ") || `0 ${r.minutes}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">🧭 {r.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-navy/70">{r.subtitle}</p>

      <form onSubmit={submit} className="mt-8 grid gap-3 rounded-3xl bg-navy p-5 text-cream shadow-sm sm:p-6 lg:grid-cols-[1fr_auto_1fr_180px_120px_auto] lg:items-end">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{r.from}</span>
          <input className="input" value={from} placeholder={r.fromPlaceholder} onChange={(e) => setFrom(e.target.value)} required />
        </label>
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label={r.swap}
          title={r.swap}
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-lg hover:bg-cream/20"
        >
          ⇄
        </button>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{r.to}</span>
          <input className="input" value={to} placeholder={r.toPlaceholder} onChange={(e) => setTo(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{r.date}</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{r.travellers}</span>
          <input className="input" type="number" min={1} max={20} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} />
        </label>
        <button className="btn-primary h-[50px]" disabled={loading}>
          {loading ? r.loading : r.submit}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">{r.error}</p>}

      <section aria-live="polite" className="mt-8">
        {!result || !searched ? (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border-2 border-dashed border-sand p-8 text-center text-navy/60">
            {r.empty}
          </div>
        ) : result.options.length === 0 ? (
          <div className="card p-6">
            <p className="font-semibold">{r.noResults}</p>
            {result.reason && (
              <p className="mt-1 text-xs text-navy/60">
                {r.reasons[result.reason]}
                {result.detail && ` (${result.detail})`}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {searchLinks(searched).map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  {link.name} ↗
                </a>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="rounded-2xl bg-sand/70 px-4 py-3 text-sm">ℹ️ {r.estimate}</p>
            <ol className="mt-4 space-y-4">
              {result.options.map((option, i) => (
                <li key={i} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold">{r.modes[option.mode]}</span>
                      <h2 className="mt-2 text-lg font-bold">{option.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-apricot-dark">
                        {option.priceAmdMin === option.priceAmdMax ? amd(option.priceAmdMin) : `${amd(option.priceAmdMin)} – ${amd(option.priceAmdMax)}`}
                      </div>
                      <div className="text-sm text-navy/60">
                        {duration(option.durationMinutes)} · {option.transfers ? `${r.transfers}: ${option.transfers}` : r.direct}
                      </div>
                    </div>
                  </div>
                  <ol className="mt-4 space-y-1.5 border-l-2 border-apricot/40 pl-4 text-sm">
                    {option.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  <p className="mt-3 text-sm text-navy/70">{option.note}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-sm font-semibold">{r.book}:</span>
                    {bookingLinks(option.mode, searched).map((link) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-apricot-dark hover:underline">
                        {link.name} ↗
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
