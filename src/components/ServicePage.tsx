"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { SERVICES, type ServiceField, type ServiceKey, type ServiceValues } from "@/data/services";

const ICONS: Record<ServiceKey, string> = {
  cars: "🚗",
  tours: "🎟️",
  privateTours: "🧑‍🏫",
  groupTours: "👥",
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
  const [values, setValues] = useState<ServiceValues>({ place: "", to: "", start: "", end: "", people: 2 });
  const set = (key: keyof ServiceValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: key === "people" ? Number(e.target.value) : e.target.value }));

  const [first, ...others] = mode.partners(values);
  const complete = mode.fields.every((field) => {
    if (field === "dates") return values.start && values.end;
    if (field === "date") return values.start;
    if (field === "address") return values.to.trim();
    if (field === "people") return true;
    return values.place.trim();
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    window.open(first.url, "_blank", "noopener,noreferrer");
  }

  const text = (label: string, placeholder: string, key: "place" | "to") => (
    <label key={label} className="block min-w-0">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input className="input" value={values[key]} placeholder={placeholder} onChange={set(key)} required />
    </label>
  );
  const date = (label: string, key: "start" | "end", min?: string) => (
    <label key={label} className="block min-w-0">
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
    people: () => (
      <label key="people" className="block min-w-0">
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
        <form onSubmit={submit} className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:flex lg:items-end [&>*]:lg:flex-1">
          {mode.fields.map((field) => fields[field]())}
          <button className="btn-primary h-[50px] sm:col-span-2 lg:!flex-none">
            {s.submit} · {first.name}
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-ink/70">{s.alsoOn}:</span>
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
