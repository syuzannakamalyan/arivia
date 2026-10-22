"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Baby, Check, Landmark, Lightbulb, MapPin, Music, PenLine, Pencil, Plus, ShoppingBag, Sparkles, Trees, Utensils, X } from "lucide-react";
import { OPTION_ICONS, PageTitle } from "@/components/OptionsBar";
import LoadingResults from "@/components/LoadingResults";
import { useLanguage } from "@/lib/i18n";
import type { PlanResult } from "@/lib/planner";
import type { IdeasResult } from "@/lib/planner/ideas";
import { INTERESTS, MAX_DAYS, PACES, tripLength, type Activity, type Interest, type Pace, type TripPlan } from "@/lib/planner/types";

// The trip planner, like trip.com's: one editable day-by-day plan that people fill in themselves,
// or let AI draft (all days at once, or place ideas while they plan). The trip is saved in this browser.

type Stop = Activity & { id: string };
type PlanDay = { date: string; title: string; stops: Stop[] };
type Trip = {
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  days: PlanDay[];
  tips: string[];
  split: TripPlan["budget"] | null; // the AI's budget split, when the plan came from AI
};
type AiNote = Pick<PlanResult, "source" | "reason" | "detail">;

const STORAGE_KEY = "arivia-trip";
const INTEREST_ICONS = { food: Utensils, history: Landmark, nature: Trees, shopping: ShoppingBag, nightlife: Music, kids: Baby };
const TIMES = ["morning", "afternoon", "evening"] as const;
const EMPTY: Trip = { destination: "", startDate: "", endDate: "", travellers: 2, days: [], tips: [], split: null };

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;
// 2026-11-12 -> 12.11.2026
const showDate = (iso: string) => iso.split("-").reverse().join(".");
const enc = encodeURIComponent;
const newId = () => Math.random().toString(36).slice(2, 10);

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// One day per date. Days keep their places when dates move; places on days that drop off move to the last day.
function fitDays(days: PlanDay[], start: string, end: string): PlanDay[] {
  const length = tripLength(start, end);
  if (length < 1 || length > MAX_DAYS) return days;
  return Array.from({ length }, (_, i) => ({
    date: addDays(start, i),
    title: days[i]?.title ?? "",
    stops: i === length - 1 ? days.slice(i).flatMap((d) => d.stops) : (days[i]?.stops ?? []),
  }));
}

export default function PlannerPage() {
  const { t, lang } = useLanguage();
  const p = t.planner;
  const e = p.editor;

  const [trip, setTrip] = useState<Trip>(EMPTY);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"self" | "ai">("self");
  const [budget, setBudget] = useState(600000);
  const [interests, setInterests] = useState<Interest[]>(["history", "food"]);
  const [pace, setPace] = useState<Pace>("balanced");
  const [aiNote, setAiNote] = useState<AiNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [mapQuery, setMapQuery] = useState("");

  const { destination, startDate, endDate, travellers, days } = trip;
  const length = tripLength(startDate, endDate);
  const valid = destination.trim() !== "" && length >= 1 && length <= MAX_DAYS;

  // Bring back the trip saved in this browser, or start one from a home page search (?destination=&start=&end=).
  useEffect(() => {
    let saved: Trip | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const asked = params.get("destination");
    let next = saved && Array.isArray(saved.days) ? { ...EMPTY, ...saved } : EMPTY;
    if (asked && asked.trim().toLowerCase() !== next.destination.trim().toLowerCase()) {
      const start = params.get("start") ?? "";
      const end = params.get("end") ?? "";
      next = { ...EMPTY, destination: asked, startDate: start, endDate: end, days: fitDays([], start, end) };
    }
    // Reading the browser's storage has to wait until the page is in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrip(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch {}
  }, [trip, ready]);

  const update = (change: Partial<Trip>) =>
    setTrip((current) => {
      const next = { ...current, ...change };
      return { ...next, days: fitDays(next.days, next.startDate, next.endDate) };
    });
  const setDay = (index: number, change: (day: PlanDay) => PlanDay) =>
    setTrip((current) => ({ ...current, days: current.days.map((day, i) => (i === index ? change(day) : day)) }));

  const toggle = (interest: Interest) =>
    setInterests((list) => (list.includes(interest) ? list.filter((i) => i !== interest) : [...list, interest]));

  async function planWithAi(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    if (days.some((d) => d.stops.length) && !window.confirm(p.replaceConfirm)) return;
    setLoading(true);
    setError(false);
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, startDate, endDate, travellers, budgetAmd: budget, interests, pace, lang }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(true);
      return;
    }
    const result: PlanResult = await res.json();
    setAiNote({ source: result.source, reason: result.reason, detail: result.detail });
    setTrip((current) => ({
      ...current,
      days: fitDays(
        result.plan.days.map((d) => ({ date: d.date, title: d.title, stops: d.activities.map((a) => ({ ...a, id: newId() })) })),
        current.startDate,
        current.endDate,
      ),
      tips: result.plan.tips,
      split: result.plan.budget,
    }));
  }

  function reset() {
    if (!window.confirm(e.resetConfirm)) return;
    setTrip(EMPTY);
    setAiNote(null);
    setMapQuery("");
  }

  const field = (label: string, input: React.ReactNode, className = "") => (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {input}
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <PageTitle option="planner">{p.title}</PageTitle>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{p.subtitle}</p>

      {/* Where, when, who */}
      <div className="card mt-8 grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_170px_170px_110px]">
        {field(
          p.form.destination,
          <input className="input" value={destination} placeholder={p.form.destinationPlaceholder} onChange={(ev) => update({ destination: ev.target.value })} />,
          "sm:col-span-2 lg:col-span-1",
        )}
        {field(p.form.start, <input className="input" type="date" value={startDate} onChange={(ev) => update({ startDate: ev.target.value })} />)}
        {field(p.form.end, <input className="input" type="date" value={endDate} min={startDate || undefined} onChange={(ev) => update({ endDate: ev.target.value })} />)}
        {field(
          p.form.travellers,
          <input className="input" type="number" min={1} max={20} value={travellers} onChange={(ev) => update({ travellers: Number(ev.target.value) })} />,
        )}
      </div>

      {/* Two ways to plan */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1 sm:inline-grid">
        {(["self", "ai"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${mode === key ? "bg-surface text-ink shadow-sm" : "text-ink/70 hover:text-ink"}`}
          >
            {key === "self" ? <PenLine aria-hidden className="h-4 w-4" /> : <Sparkles aria-hidden className="h-4 w-4" />}
            {p.modes[key]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-ink/60">{p.modeHints[mode]}</p>

      {mode === "ai" && (
        <form onSubmit={planWithAi} className="card mt-4 grid gap-5 p-5 sm:p-6 lg:grid-cols-[200px_1fr_auto_auto] lg:items-end">
          {field(p.form.budget, <input className="input" type="number" min={1} step="any" value={budget} onChange={(ev) => setBudget(Number(ev.target.value))} />)}
          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-semibold">{p.form.interests}</legend>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const on = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(interest)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${on ? "bg-brand text-white" : "bg-muted text-ink/75 hover:bg-line"}`}
                  >
                    {(() => {
                      const Icon = INTEREST_ICONS[interest];
                      return <Icon aria-hidden className="h-4 w-4" />;
                    })()}
                    {p.interests[interest]}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{p.form.pace}</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
              {PACES.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pace === key}
                  onClick={() => setPace(key)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${pace === key ? "bg-surface text-ink shadow-sm" : "text-ink/70 hover:text-ink"}`}
                >
                  {p.paces[key]}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn-primary h-[50px]" disabled={loading || !valid}>
            {loading ? p.form.loading : p.form.submit}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">{p.form.error}</p>}

      {!valid ? (
        <div className="mt-8 flex min-h-48 items-center justify-center rounded-3xl border-2 border-dashed border-line p-8 text-center text-ink/60">
          {length > MAX_DAYS ? e.tooLong : e.startHint}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* The days */}
          <section aria-live="polite" className="min-w-0">
            {loading ? (
              <LoadingResults />
            ) : (
              <>
                {aiNote?.source === "sample" && (
                  <p className="mb-4 rounded-2xl bg-muted/70 px-4 py-3 text-sm">
                    <span className="mr-2 rounded-full bg-panel px-2 py-0.5 text-xs font-semibold text-on-panel">{p.sampleBadge}</span>
                    {p.sampleNote}
                    {aiNote.reason && (
                      <span className="mt-1 block text-xs text-ink/60">
                        {p.reasons[aiNote.reason]}
                        {aiNote.detail && ` (${aiNote.detail})`}
                      </span>
                    )}
                  </p>
                )}
                <ol className="space-y-4">
                  {days.map((day, i) => (
                    <DayCard
                      key={day.date}
                      day={day}
                      index={i}
                      destination={destination}
                      onChange={(change) => setDay(i, change)}
                      onShow={(place) => setMapQuery(`${place}, ${destination}`)}
                    />
                  ))}
                </ol>
              </>
            )}
          </section>

          {/* Map, costs, booking and ideas */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <div className="card overflow-hidden">
              <iframe
                title={e.map}
                className="block h-64 w-full border-0"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${enc(mapQuery || destination)}&z=13&output=embed`}
              />
            </div>
            <Costs trip={trip} />
            <div className="card p-5">
              <h2 className="font-bold">{e.book}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {(
                  [
                    ["hotels", `/hotels?destination=${enc(destination)}&checkin=${startDate}&checkout=${endDate}&guests=${travellers}`],
                    ["routes", `/routes?from=Yerevan&to=${enc(destination)}&date=${startDate}&return=${endDate}&travellers=${travellers}`],
                    ["tours", "/tours"],
                    ["cars", "/cars"],
                    ["esim", "/esim"],
                    ["visa", "/visa"],
                  ] as const
                ).map(([key, href]) => {
                  const Icon = OPTION_ICONS[key];
                  return (
                    <Link key={key} href={href} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-semibold hover:bg-line">
                      <Icon aria-hidden className="h-4 w-4 text-brand-strong" />
                      {t.nav[key]}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Ideas trip={trip} interests={interests} onAdd={(index, idea) => setDay(index, (d) => ({ ...d, stops: [...d.stops, { ...idea, id: newId() }] }))} />
            {trip.tips.length > 0 && (
              <div className="card p-5">
                <h2 className="flex items-center gap-2 font-bold"><Lightbulb aria-hidden className="h-5 w-5 text-brand-strong" />{p.result.tips}</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/75">
                  {trip.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-ink/60"><Check aria-hidden className="h-4 w-4" />{e.saved}</span>
              <button type="button" onClick={reset} className="font-semibold text-pomegranate hover:underline">
                {e.reset}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  index,
  destination,
  onChange,
  onShow,
}: {
  day: PlanDay;
  index: number;
  destination: string;
  onChange: (change: (day: PlanDay) => PlanDay) => void;
  onShow: (place: string) => void;
}) {
  const { t } = useLanguage();
  const p = t.planner;
  const e = p.editor;
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const move = (from: number, to: number) =>
    onChange((d) => {
      const stops = [...d.stops];
      [stops[from], stops[to]] = [stops[to], stops[from]];
      return { ...d, stops };
    });
  const dayMap = `https://www.google.com/maps/dir/${day.stops.map((s) => enc(`${s.place}, ${destination}`)).join("/")}`;

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-ink/60">
            {e.day.replace("{n}", String(index + 1))} · {showDate(day.date)}
          </div>
          <input
            className="w-full bg-transparent text-lg font-bold outline-none placeholder:font-semibold placeholder:text-ink/35 focus:underline"
            value={day.title}
            placeholder={e.dayTitlePlaceholder}
            aria-label={e.dayTitlePlaceholder}
            onChange={(ev) => onChange((d) => ({ ...d, title: ev.target.value }))}
          />
        </div>
      </div>

      {day.stops.length === 0 && editing !== "new" && <p className="mt-3 text-sm text-ink/50">{e.emptyDay}</p>}
      <ul className="mt-3 divide-y divide-line">
        {day.stops.map((stop, i) =>
          editing === stop.id ? (
            <li key={stop.id} className="py-3">
              <StopForm
                initial={stop}
                onSave={(saved) => {
                  onChange((d) => ({ ...d, stops: d.stops.map((s) => (s.id === stop.id ? { ...saved, id: stop.id } : s)) }));
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={stop.id} className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-1 py-3 text-sm sm:grid-cols-[84px_1fr_auto]">
              <span className="font-semibold text-brand-strong">{p.times[stop.time]}</span>
              <span className="min-w-0">
                <button type="button" onClick={() => onShow(stop.place)} className="text-left font-semibold hover:underline" title={e.showMap}>
                  <MapPin aria-hidden className="mr-1 inline h-4 w-4 -translate-y-px text-brand-strong" />
                  {stop.place}
                </button>
                {stop.description && <span className="block text-ink/70">{stop.description}</span>}
              </span>
              <span className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:col-start-3 sm:justify-end">
                <span className="whitespace-nowrap text-ink/70">{stop.costAmd ? amd(stop.costAmd) : p.result.free}</span>
                <span className="flex gap-1 text-ink/60">
                  <IconButton label={e.up} disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp className="h-4 w-4" /></IconButton>
                  <IconButton label={e.down} disabled={i === day.stops.length - 1} onClick={() => move(i, i + 1)}><ArrowDown className="h-4 w-4" /></IconButton>
                  <IconButton label={e.edit} onClick={() => setEditing(stop.id)}><Pencil className="h-4 w-4" /></IconButton>
                  <IconButton label={e.remove} onClick={() => onChange((d) => ({ ...d, stops: d.stops.filter((s) => s.id !== stop.id) }))}><X className="h-4 w-4" /></IconButton>
                </span>
              </span>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <div className="mt-2 border-t border-line pt-4">
          <StopForm
            onSave={(stop) => {
              onChange((d) => ({ ...d, stops: [...d.stops, { ...stop, id: newId() }] }));
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setEditing("new")} className="text-sm font-semibold text-brand-strong hover:underline">
            {e.add}
          </button>
          {day.stops.length > 0 && (
            <a href={dayMap} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-ink/60 hover:text-ink hover:underline">
              {e.dayMap} ↗
            </a>
          )}
        </div>
      )}
    </li>
  );
}

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function StopForm({ initial, onSave, onCancel }: { initial?: Activity; onSave: (stop: Activity) => void; onCancel: () => void }) {
  const { t } = useLanguage();
  const p = t.planner;
  const e = p.editor;
  const [time, setTime] = useState<Activity["time"]>(initial?.time ?? "morning");
  const [place, setPlace] = useState(initial?.place ?? "");
  const [note, setNote] = useState(initial?.description ?? "");
  const [cost, setCost] = useState(initial?.costAmd ? String(initial.costAmd) : "");

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!place.trim()) return;
    onSave({ time, place: place.trim(), description: note.trim(), costAmd: Math.max(Number(cost) || 0, 0) });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[130px_1fr_130px]">
      <label className="block min-w-0">
        <span className="mb-1 block text-xs font-semibold">{e.time}</span>
        <select className="input !py-2.5" value={time} onChange={(ev) => setTime(ev.target.value as Activity["time"])}>
          {TIMES.map((key) => (
            <option key={key} value={key}>
              {p.times[key]}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-0">
        <span className="mb-1 block text-xs font-semibold">{e.place}</span>
        <input className="input !py-2.5" value={place} placeholder={e.placePlaceholder} onChange={(ev) => setPlace(ev.target.value)} required autoFocus />
      </label>
      <label className="block min-w-0">
        <span className="mb-1 block text-xs font-semibold">{e.cost}</span>
        <input className="input !py-2.5" type="number" min={0} step="any" value={cost} placeholder="0" onChange={(ev) => setCost(ev.target.value)} />
      </label>
      <label className="block min-w-0 sm:col-span-3">
        <span className="mb-1 block text-xs font-semibold">{e.note}</span>
        <input className="input !py-2.5" value={note} placeholder={e.notePlaceholder} onChange={(ev) => setNote(ev.target.value)} />
      </label>
      <div className="flex gap-3 sm:col-span-3">
        <button className="btn-primary !px-5 !py-2">{e.save}</button>
        <button type="button" onClick={onCancel} className="btn-secondary !px-5 !py-2">
          {e.cancel}
        </button>
      </div>
    </form>
  );
}

function Costs({ trip }: { trip: Trip }) {
  const { t } = useLanguage();
  const p = t.planner;
  const planned = trip.days.reduce((sum, d) => sum + d.stops.reduce((s, stop) => s + (stop.costAmd || 0), 0), 0);
  const split = trip.split;
  const total = split ? Object.values(split).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="rounded-3xl bg-panel p-5 text-on-panel">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-bold">֏ {p.editor.total}</h2>
        <span className="text-lg font-extrabold">{amd(planned)}</span>
      </div>
      {split && (
        <dl className="mt-4 space-y-2 text-sm">
          <dt className="text-xs font-semibold uppercase tracking-wide text-on-panel/60">{p.result.budget}</dt>
          {(Object.keys(split) as (keyof typeof split)[]).map((key) => (
            <div key={key}>
              <div className="flex justify-between">
                <dt>{p.budgetParts[key]}</dt>
                <dd className="font-semibold">{amd(split[key])}</dd>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-on-panel/15">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: `${total ? (split[key] / total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Ideas({ trip, interests, onAdd }: { trip: Trip; interests: Interest[]; onAdd: (dayIndex: number, idea: Activity) => void }) {
  const { t, lang } = useLanguage();
  const e = t.planner.editor;
  const [result, setResult] = useState<IdeasResult | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [target, setTarget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<number | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/plan/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: trip.destination,
        interests,
        travellers: trip.travellers,
        exclude: trip.days.flatMap((d) => d.stops.map((s) => s.place)),
        lang,
      }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(res?.status ?? 0);
      return;
    }
    setResult(await res.json());
    setAdded([]);
  }

  return (
    <div className="card p-5">
      <h2 className="flex items-center gap-2 font-bold"><Sparkles aria-hidden className="h-5 w-5 text-brand-strong" />{e.ideas}</h2>
      <p className="mt-1 text-sm text-ink/60">{e.ideasText}</p>
      <button type="button" onClick={suggest} disabled={loading} className="btn-secondary mt-3 w-full !py-2">
        {loading ? e.ideasLoading : e.ideasCta}
      </button>
      {error !== null && <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">{t.serverError.replace("{code}", String(error))}</p>}
      {result && result.ideas.length > 0 && (
        <>
          {result.source === "sample" && <p className="mt-3 text-xs text-ink/60">{e.ideasSample}</p>}
          <label className="mt-3 flex items-center gap-2 text-sm">
            <span className="font-semibold">{e.addTo}:</span>
            <select className="input !w-auto !py-1.5 text-sm" value={Math.min(target, trip.days.length - 1)} onChange={(ev) => setTarget(Number(ev.target.value))}>
              {trip.days.map((d, i) => (
                <option key={d.date} value={i}>
                  {e.day.replace("{n}", String(i + 1))} · {showDate(d.date)}
                </option>
              ))}
            </select>
          </label>
          <ul className="mt-3 space-y-2">
            {result.ideas.map((idea) => {
              const done = added.includes(idea.place);
              return (
                <li key={idea.place} className="flex items-start gap-3 rounded-2xl bg-muted p-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{idea.place}</span>
                    <span className="block text-ink/70">{idea.description}</span>
                    <span className="mt-0.5 block text-xs text-ink/60">
                      {t.planner.times[idea.time]}
                      {idea.costAmd > 0 && ` · ${amd(idea.costAmd)}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={done}
                    aria-label={`${e.addTo}: ${idea.place}`}
                    onClick={() => {
                      onAdd(Math.min(target, trip.days.length - 1), idea);
                      setAdded((list) => [...list, idea.place]);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white disabled:bg-line disabled:text-ink/50"
                  >
                    {done ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
