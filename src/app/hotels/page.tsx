"use client";

import { Info, MapPin, Star } from "lucide-react";
import { PageTitle } from "@/components/OptionsBar";
import { Suspense, useCallback, useState } from "react";
import LoadingResults from "@/components/LoadingResults";
import QueryPrefill from "@/components/QueryPrefill";
import { useLanguage } from "@/lib/i18n";
import { bookingComUrl, googleHotelsUrl, hotelLinks, type HotelSearch } from "@/lib/hotels/links";
import type { HotelRequest, HotelResult } from "@/lib/hotels/types";

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;

export default function HotelsPage() {
  const { t, lang } = useLanguage();
  const h = t.hotels;

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<HotelResult | null>(null);
  // The search the list belongs to, for the booking links.
  const [searched, setSearched] = useState<HotelSearch | null>(null);
  const [loading, setLoading] = useState(false);
  // The form was wrong (400), or the search failed on the way (other code, 0 = no connection).
  const [error, setError] = useState<number | null>(null);

  async function search(request: Omit<HotelRequest, "lang">) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, lang }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(res?.status ?? 0);
      return;
    }
    setResult(await res.json());
    setSearched(request);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    search({ destination, checkIn, checkOut, guests, budgetAmd: Number(budget) || undefined });
  }

  // Coming from the home page search: fill the form, and search right away when it's complete.
  const prefill = useCallback((params: URLSearchParams) => {
    const values = {
      destination: params.get("destination") ?? "",
      checkIn: params.get("checkin") ?? "",
      checkOut: params.get("checkout") ?? "",
      guests: Number(params.get("guests")) || 2,
    };
    setDestination(values.destination);
    setCheckIn(values.checkIn);
    setCheckOut(values.checkOut);
    setGuests(values.guests);
    if (values.destination && values.checkIn && values.checkOut) search(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Suspense>
        <QueryPrefill onParams={prefill} />
      </Suspense>
      <PageTitle option="hotels">{h.title}</PageTitle>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{h.subtitle}</p>

      <form onSubmit={submit} className="card mt-8 grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_160px_160px_90px_170px_auto] lg:items-end">
        <label className="block min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-sm font-semibold">{h.destination}</span>
          <input className="input" value={destination} placeholder={h.destinationPlaceholder} onChange={(e) => setDestination(e.target.value)} required />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-semibold">{h.checkIn}</span>
          <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-semibold">{h.checkOut}</span>
          <input className="input" type="date" value={checkOut} min={checkIn || undefined} onChange={(e) => setCheckOut(e.target.value)} required />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-semibold">{h.guests}</span>
          <input className="input" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-semibold">{h.budget}</span>
          <input className="input" type="number" min={1} step="any" value={budget} placeholder={h.budgetPlaceholder} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <button className="btn-primary h-[50px] sm:col-span-2 lg:col-span-1" disabled={loading}>
          {loading ? h.loading : h.submit}
        </button>
      </form>
      {error !== null && (
        <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">
          {error === 400 ? h.error : t.serverError.replace("{code}", String(error))}
        </p>
      )}

      <section aria-live="polite" className="mt-8">
        {loading ? (
          <LoadingResults cards={4} />
        ) : !result || !searched ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink/60">
            {h.empty}
          </div>
        ) : result.hotels.length === 0 ? (
          <div className="card p-6">
            <p className="font-semibold">{h.noResults}</p>
            {result.reason && (
              <p className="mt-1 text-xs text-ink/60">
                {h.reasons[result.reason]}
                {result.detail && ` (${result.detail})`}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={bookingComUrl(searched)} target="_blank" rel="noopener noreferrer" className="btn-secondary">Booking.com ↗</a>
              <a href={googleHotelsUrl(searched)} target="_blank" rel="noopener noreferrer" className="btn-secondary">Google Hotels ↗</a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3 text-sm">
              <span><Info aria-hidden className="mr-1.5 inline h-4 w-4 -translate-y-px text-brand-strong" />{h.estimate}</span>
              <a href={bookingComUrl(searched)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-strong hover:underline">
                {h.searchAll}: Booking.com ↗
              </a>
            </div>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {result.hotels.map((hotel) => (
                <li key={hotel.name} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex gap-0.5 text-amber-500" aria-label={`${hotel.stars}★`}>
                        {Array.from({ length: hotel.stars }, (_, i) => (
                          <Star key={i} aria-hidden className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </p>
                      <h2 className="text-lg font-bold">{hotel.name}</h2>
                      <p className="flex items-center gap-1 text-sm text-ink/60"><MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />{hotel.area}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-extrabold text-brand-strong">
                        {hotel.priceAmdMin === hotel.priceAmdMax ? amd(hotel.priceAmdMin) : `${amd(hotel.priceAmdMin)} – ${amd(hotel.priceAmdMax)}`}
                      </div>
                      <div className="text-xs text-ink/60">{h.perNight}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink/80">{hotel.description}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {hotel.highlights.map((item) => (
                      <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{item}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                    <span className="text-sm font-semibold">{h.book}:</span>
                    {hotelLinks(hotel.name, searched).map((link) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-strong hover:underline">
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
