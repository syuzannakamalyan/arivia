"use client";

import { Suspense, useCallback, useState } from "react";
import QueryPrefill from "@/components/QueryPrefill";
import { useLanguage } from "@/lib/i18n";
import { bookingComUrl, googleHotelsUrl } from "@/lib/hotels/links";

export default function HotelsPage() {
  const { t } = useLanguage();
  const h = t.hotels;

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const search = { destination, checkIn, checkOut, guests };
  const complete = destination.trim() && checkIn && checkOut;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.open(bookingComUrl(search), "_blank", "noopener,noreferrer");
  }

  // Coming from the home page search: fill in the form.
  const prefill = useCallback((params: URLSearchParams) => {
    setDestination(params.get("destination") ?? "");
    setCheckIn(params.get("checkin") ?? "");
    setCheckOut(params.get("checkout") ?? "");
    setGuests(Number(params.get("guests")) || 2);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Suspense>
        <QueryPrefill onParams={prefill} />
      </Suspense>
      <h1 className="text-3xl font-extrabold sm:text-4xl">🏨 {h.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{h.subtitle}</p>

      <form onSubmit={submit} className="card mt-8 grid gap-3 p-5 sm:p-6 lg:grid-cols-[1fr_170px_170px_110px_auto] lg:items-end">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{h.destination}</span>
          <input className="input" value={destination} placeholder={h.destinationPlaceholder} onChange={(e) => setDestination(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{h.checkIn}</span>
          <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{h.checkOut}</span>
          <input className="input" type="date" value={checkOut} min={checkIn || undefined} onChange={(e) => setCheckOut(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{h.guests}</span>
          <input className="input" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </label>
        <button className="btn-primary h-[50px]">{h.submit}</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-ink/70">{h.alsoOn}:</span>
        {complete ? (
          <a href={googleHotelsUrl(search)} target="_blank" rel="noopener noreferrer" className="font-semibold text-apricot-dark hover:underline">
            Google Hotels ↗
          </a>
        ) : (
          <span className="font-semibold text-ink/40">Google Hotels</span>
        )}
      </div>
      <p className="mt-6 rounded-2xl bg-muted px-4 py-3 text-sm">ℹ️ {h.note}</p>
    </div>
  );
}
