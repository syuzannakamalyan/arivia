"use client";

import { useState } from "react";
import LoadingResults from "@/components/LoadingResults";
import { useLanguage } from "@/lib/i18n";
import { SERVICES, TOUR_TYPES, type ServiceField, type ServiceKey, type ServiceMode, type ServiceValues, type TourType } from "@/data/services";
import type { OfferKind, OfferResult } from "@/lib/offers/types";

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;

const ICONS: Record<ServiceKey, string> = {
  cars: "🚗",
  tours: "🎟️",
  cruises: "🚢",
  esim: "📶",
};

// One page for each partner-search option: a form, then the search opens on the partner sites.
// Tours and cruises (modes with optionLinks) show an AI list of options first, each with booking links.
export default function ServicePage({ service }: { service: ServiceKey }) {
  const { t, lang } = useLanguage();
  const s = t.services;
  const f = s.fields;
  const r = s.results;
  const info = s[service];
  const modes: ServiceMode[] = SERVICES[service];

  const [modeIndex, setModeIndex] = useState(0);
  const mode = modes[modeIndex];
  const [values, setValues] = useState<ServiceValues>({
    place: "",
    to: "",
    start: "",
    end: "",
    people: 2,
    tourType: "all",
  });
  const set = (key: keyof ServiceValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({
      ...v,
      [key]: key === "people" ? Number(e.target.value) : e.target.value,
    }));

  const [result, setResult] = useState<OfferResult | null>(null);
  // The search the list belongs to, for the booking links.
  const [searched, setSearched] = useState<ServiceValues | null>(null);
  const [loading, setLoading] = useState(false);
  // The form was wrong (400), or the search failed on the way (other code, 0 = no connection).
  const [error, setError] = useState<number | null>(null);

  const [first, ...others] = mode.partners(values);
  const complete = mode.fields.every((field) => {
    if (field === "dates") return values.start && (values.end || mode.endOptional);
    if (field === "date") return values.start;
    if (field === "address") return values.to.trim();
    if (field === "people" || field === "tourType") return true;
    return values.place.trim();
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mode.optionLinks) {
      window.open(first.url, "_blank", "noopener,noreferrer");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: service as OfferKind, ...values, lang }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(res?.status ?? 0);
      return;
    }
    setResult(await res.json());
    setSearched(values);
  }

  // On computers the fields sit in one row: text fields share the space, dates and people stay compact.
  const text = (label: string, placeholder: string, key: "place" | "to") => (
    <label key={label} className="block min-w-0 lg:flex-1">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" value={values[key]} placeholder={placeholder} onChange={set(key)} required />
    </label>
  );
  const date = (label: string, key: "start" | "end", min?: string, required = true) => (
    <label key={label} className="block min-w-0 lg:w-44 lg:flex-none">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" type="date" value={values[key]} min={min || undefined} onChange={set(key)} required={required} />
    </label>
  );
  const fields: Record<ServiceField, () => React.ReactNode> = {
    destination: () => text(f.destination, f.destinationPlaceholder, "place"),
    pickUp: () => text(f.pickUp, f.pickUpPlaceholder, "place"),
    airport: () => text(f.airport, f.airportPlaceholder, "place"),
    address: () => text(f.address, f.addressPlaceholder, "to"),
    country: () => text(f.country, f.countryPlaceholder, "place"),
    port: () => text(f.port, f.portPlaceholder, "place"),
    dates: () => [date(f.start, "start"), mode.endOptional ? date(f.endOptional, "end", values.start, false) : date(f.end, "end", values.start)],
    date: () => date(f.date, "start"),
    tourType: () => null, // shown above the other fields, see below
    people: () => (
      <label key="people" className="block min-w-0 lg:w-28 lg:flex-none">
        <span className="mb-1 block text-sm font-semibold">{f.people}</span>
        <input className="input" type="number" min={1} max={20} value={values.people} onChange={set("people")} />
      </label>
    ),
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        {ICONS[service]} {info.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{info.subtitle}</p>

      <div className="card mt-8 overflow-hidden">
        {modes.length > 1 && (
          <div role="tablist" className="flex gap-1 border-b border-line px-3 pt-3">
            {modes.map((m, i) => (
              <button
                key={m.key}
                role="tab"
                aria-selected={i === modeIndex}
                onClick={() => setModeIndex(i)}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  i === modeIndex ? "border-apricot text-apricot-dark" : "border-transparent text-ink/70 hover:text-ink"
                }`}
              >
                {(info.modes as Record<string, string>)[m.key]}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="p-5 sm:p-6">
          {(mode.fields as ServiceField[]).includes("tourType") && (
            <label className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold">{f.tourType}</span>
              <span className="relative">
                <select
                  className="input !w-auto appearance-none !py-2 !pr-10 text-sm font-semibold"
                  value={values.tourType}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      tourType: e.target.value as TourType,
                    }))
                  }
                >
                  {TOUR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {f.tourTypes[type]}
                    </option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-ink/60">
                  ▼
                </span>
              </span>
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            {mode.fields.map((field) => fields[field]())}
            {mode.optionLinks ? (
              <button className="btn-primary h-[50px] sm:col-span-2 lg:flex-none" disabled={loading}>
                {loading ? r.loading : r.submit}
              </button>
            ) : (
              <button className="btn-primary h-[50px] sm:col-span-2 lg:flex-none" title={first.name}>
                {s.submit} ↗
              </button>
            )}
          </div>
        </form>
      </div>

      {error !== null && (
        <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">
          {error === 400 ? r.error : t.serverError.replace("{code}", String(error))}
        </p>
      )}

      {mode.optionLinks ? (
        <OptionsList result={result} searched={searched} loading={loading} mode={mode} />
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-ink/70">
            {s.opensOn.replace("{name}", first.name)} {s.alsoOn}:
          </span>
          {others.map((partner) =>
            complete ? (
              <a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-apricot-dark hover:underline">
                {partner.name} ↗
              </a>
            ) : (
              <span key={partner.name} className="font-semibold text-ink/40">
                {partner.name}
              </span>
            ),
          )}
        </div>
      )}
      {!mode.optionLinks && <p className="mt-6 rounded-2xl bg-muted px-4 py-3 text-sm">ℹ️ {s.note}</p>}
    </div>
  );
}

// The AI options, each with links to book it; without a list, links to search the partners directly.
function OptionsList({ result, searched, loading, mode }: { result: OfferResult | null; searched: ServiceValues | null; loading: boolean; mode: ServiceMode }) {
  const { t } = useLanguage();
  const r = t.services.results;
  const link = (l: { name: string; url: string }, className: string) => (
    <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className={className}>
      {l.name} ↗
    </a>
  );

  return (
    <section aria-live="polite" className="mt-8">
      {loading ? (
        <LoadingResults />
      ) : !result || !searched ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border-2 border-dashed border-line p-8 text-center text-ink/60">{r.empty}</div>
      ) : result.options.length === 0 ? (
        <div className="card p-6">
          <p className="font-semibold">{r.noResults}</p>
          {result.reason && (
            <p className="mt-1 text-xs text-ink/60">
              {r.reasons[result.reason]}
              {result.detail && ` (${result.detail})`}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">{mode.partners(searched).map((l) => link(l, "btn-secondary"))}</div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3 text-sm">
            <span>ℹ️ {r.estimate}</span>
            <span className="flex flex-wrap gap-x-4">{mode.partners(searched).map((l) => link(l, "font-semibold text-apricot-dark hover:underline"))}</span>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {result.options.map((option) => (
              <li key={option.title} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 text-lg font-bold">{option.title}</h2>
                  <div className="shrink-0 text-right">
                    <div className="font-extrabold text-apricot-dark">
                      {option.priceAmdMin === option.priceAmdMax ? amd(option.priceAmdMin) : `${amd(option.priceAmdMin)} – ${amd(option.priceAmdMax)}`}
                    </div>
                    <div className="text-xs text-ink/60">{r[mode.priceNote ?? "perPerson"]}</div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink/80">{option.description}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {option.details.map((item) => (
                    <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
                {option.providers.length > 0 && (
                  <p className="mt-3 text-sm">
                    <span className="text-ink/60">{r.providers}:</span> <span className="font-semibold">{option.providers.join(", ")}</span>
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                  <span className="text-sm font-semibold">{r.book}:</span>
                  {mode.optionLinks!(option, searched).map((l) => link(l, "text-sm font-semibold text-apricot-dark hover:underline"))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
