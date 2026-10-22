"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { SERVICES, TOUR_TYPES, type ServiceField, type ServiceKey, type ServiceValues, type TourType } from "@/data/services";

const ICONS: Record<ServiceKey, string> = {
  cars: "🚗",
  tours: "🎟️",
  cruises: "🚢",
  esim: "📶",
};

// One page for each partner-search option: a form, then the search opens on the partner sites.
export default function ServicePage({ service }: { service: ServiceKey }) {
  const { t } = useLanguage();
  const s = t.services;
  const f = s.fields;
  const info = s[service];
  const modes = SERVICES[service];

  const [modeIndex, setModeIndex] = useState(0);
  const mode = modes[modeIndex];
  const [values, setValues] = useState<ServiceValues>({ place: "", to: "", start: "", end: "", people: 2, tourType: "all" });
  const set = (key: keyof ServiceValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: key === "people" ? Number(e.target.value) : e.target.value }));

  const [first, ...others] = mode.partners(values);
  const complete = mode.fields.every((field) => {
    if (field === "dates") return values.start && values.end;
    if (field === "date") return values.start;
    if (field === "address") return values.to.trim();
    if (field === "people" || field === "tourType") return true;
    return values.place.trim();
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.open(first.url, "_blank", "noopener,noreferrer");
  }

  // On computers the fields sit in one row: text fields share the space, dates and people stay compact.
  const text = (label: string, placeholder: string, key: "place" | "to") => (
    <label key={label} className="block min-w-0 lg:flex-1">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" value={values[key]} placeholder={placeholder} onChange={set(key)} required />
    </label>
  );
  const date = (label: string, key: "start" | "end", min?: string) => (
    <label key={label} className="block min-w-0 lg:w-44 lg:flex-none">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" type="date" value={values[key]} min={min || undefined} onChange={set(key)} required />
    </label>
  );
  const fields: Record<ServiceField, () => React.ReactNode> = {
    destination: () => text(f.destination, f.destinationPlaceholder, "place"),
    pickUp: () => text(f.pickUp, f.pickUpPlaceholder, "place"),
    airport: () => text(f.airport, f.airportPlaceholder, "place"),
    address: () => text(f.address, f.addressPlaceholder, "to"),
    country: () => text(f.country, f.countryPlaceholder, "place"),
    port: () => text(f.port, f.portPlaceholder, "place"),
    dates: () => [date(f.start, "start"), date(f.end, "end", values.start)],
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
                  className="input !w-auto appearance-none !py-2 pr-10 text-sm font-semibold"
                  value={values.tourType}
                  onChange={(e) => setValues((v) => ({ ...v, tourType: e.target.value as TourType }))}
                >
                  {TOUR_TYPES.map((type) => (
                    <option key={type} value={type}>{f.tourTypes[type]}</option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-ink/60">▼</span>
              </span>
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            {mode.fields.map((field) => fields[field]())}
            <button className="btn-primary h-[50px] sm:col-span-2 lg:flex-none" title={first.name}>
              {s.submit} ↗
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-ink/70">{s.opensOn.replace("{name}", first.name)} {s.alsoOn}:</span>
        {others.map((partner) =>
          complete ? (
            <a key={partner.name} href={partner.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-apricot-dark hover:underline">
              {partner.name} ↗
            </a>
          ) : (
            <span key={partner.name} className="font-semibold text-ink/40">{partner.name}</span>
          ),
        )}
      </div>
      <p className="mt-6 rounded-2xl bg-muted px-4 py-3 text-sm">ℹ️ {s.note}</p>
    </div>
  );
}
