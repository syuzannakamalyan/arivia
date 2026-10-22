"use client";

import { useState } from "react";
import LoadingResults from "@/components/LoadingResults";
import { useLanguage } from "@/lib/i18n";
import { SERVICES } from "@/data/services";
import type { CarMode, CarRequest, CarResult } from "@/lib/cars/types";

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;
const MODES: CarMode[] = ["rental", "transfer"];

export default function CarsPage() {
  const { t, lang } = useLanguage();
  const c = t.services.cars;
  const f = t.services.fields;

  const [mode, setMode] = useState<CarMode>("rental");
  const [place, setPlace] = useState("");
  const [to, setTo] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [people, setPeople] = useState(2);
  const [result, setResult] = useState<CarResult | null>(null);
  // The search the list belongs to, for the booking links.
  const [searched, setSearched] = useState<CarRequest | null>(null);
  const [loading, setLoading] = useState(false);
  // The form was wrong (400), or the search failed on the way (other code, 0 = no connection).
  const [error, setError] = useState<number | null>(null);

  function switchMode(next: CarMode) {
    setMode(next);
    setResult(null);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const request: CarRequest = {
      mode,
      place,
      to: mode === "transfer" ? to : undefined,
      start,
      end: mode === "rental" ? end : undefined,
      people,
      lang,
    };
    setLoading(true);
    setError(null);
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(res?.status ?? 0);
      return;
    }
    setResult(await res.json());
    setSearched(request);
  }

  // Partner links for the searched place and dates (Kayak, Kiwitaxi...).
  const links = (request: CarRequest) =>
    SERVICES.cars
      .find((m) => m.key === request.mode)!
      .partners({ place: request.place, to: request.to ?? "", start: request.start, end: request.end ?? "", people: request.people, tourType: "all" });

  const field = (label: string, input: React.ReactNode) => (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {input}
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">🚗 {c.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{c.subtitle}</p>

      <div className="card mt-8 overflow-hidden">
        <div role="tablist" className="flex gap-1 border-b border-line px-3 pt-3">
          {MODES.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={m === mode}
              onClick={() => switchMode(m)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                m === mode ? "border-apricot text-apricot-dark" : "border-transparent text-ink/70 hover:text-ink"
              }`}
            >
              {c.modes[m]}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:flex lg:items-end [&>*]:lg:flex-1">
          {mode === "rental" ? (
            <>
              {field(f.pickUp, <input className="input" value={place} placeholder={f.pickUpPlaceholder} onChange={(e) => setPlace(e.target.value)} required />)}
              {field(f.start, <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} required />)}
              {field(f.end, <input className="input" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} required />)}
            </>
          ) : (
            <>
              {field(f.airport, <input className="input" value={place} placeholder={f.airportPlaceholder} onChange={(e) => setPlace(e.target.value)} required />)}
              {field(f.address, <input className="input" value={to} placeholder={f.addressPlaceholder} onChange={(e) => setTo(e.target.value)} required />)}
              {field(f.date, <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} required />)}
            </>
          )}
          {field(f.people, <input className="input" type="number" min={1} max={20} value={people} onChange={(e) => setPeople(Number(e.target.value))} />)}
          <button className="btn-primary h-[50px] sm:col-span-2 lg:!flex-none" disabled={loading}>
            {loading ? c.loading : c.submit}
          </button>
        </form>
      </div>
      {error !== null && (
        <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">
          {error === 400 ? c.error : t.serverError.replace("{code}", String(error))}
        </p>
      )}

      <section aria-live="polite" className="mt-8">
        {loading ? (
          <LoadingResults />
        ) : !result || !searched ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink/60">
            {c.empty}
          </div>
        ) : result.options.length === 0 ? (
          <div className="card p-6">
            <p className="font-semibold">{c.noResults}</p>
            {result.reason && (
              <p className="mt-1 text-xs text-ink/60">
                {c.reasons[result.reason]}
                {result.detail && ` (${result.detail})`}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {links(searched).map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  {link.name} ↗
                </a>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="rounded-2xl bg-muted px-4 py-3 text-sm">ℹ️ {c.estimate}</p>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {result.options.map((option) => (
                <li key={option.title} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-lg font-bold">{option.title}</h2>
                    <div className="shrink-0 text-right">
                      <div className="font-extrabold text-apricot-dark">
                        {option.priceAmdMin === option.priceAmdMax ? amd(option.priceAmdMin) : `${amd(option.priceAmdMin)} – ${amd(option.priceAmdMax)}`}
                      </div>
                      <div className="text-xs text-ink/60">{searched.mode === "rental" ? c.perDay : c.perRide}</div>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {option.details.map((item) => (
                      <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item}</li>
                    ))}
                  </ul>
                  {option.providers.length > 0 && (
                    <p className="mt-3 text-sm">
                      <span className="text-ink/60">{c.providers}:</span> <span className="font-semibold">{option.providers.join(", ")}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-ink/70">{option.note}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                    <span className="text-sm font-semibold">{c.book}:</span>
                    {links(searched).map((link) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-apricot-dark hover:underline">
                        {link.name} ↗
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
