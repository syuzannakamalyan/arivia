"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { PlanResult } from "@/lib/planner";
import { INTERESTS, PACES, type Interest, type Pace } from "@/lib/planner/types";

const amd = (n: number) => `${n.toLocaleString("en-US")} ֏`;
// 2026-11-12 -> 12.11.2026
const showDate = (iso: string) => iso.split("-").reverse().join(".");

export default function PlannerPage() {
  const { t, lang } = useLanguage();
  const p = t.planner;

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(600000);
  const [interests, setInterests] = useState<Interest[]>(["history", "food"]);
  const [pace, setPace] = useState<Pace>("balanced");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const toggle = (interest: Interest) =>
    setInterests((list) => (list.includes(interest) ? list.filter((i) => i !== interest) : [...list, interest]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
    setResult(await res.json());
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">✨ {p.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-navy/70">{p.subtitle}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* Trip details */}
        <form onSubmit={submit} className="rounded-3xl bg-navy p-6 text-cream shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{p.form.destination}</span>
            <input className="input" value={destination} placeholder={p.form.destinationPlaceholder} onChange={(e) => setDestination(e.target.value)} required />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{p.form.start}</span>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{p.form.end}</span>
              <input className="input" type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_2fr] gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{p.form.travellers}</span>
              <input className="input" type="number" min={1} max={20} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{p.form.budget}</span>
              <input className="input" type="number" min={1} step="any" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </label>
          </div>

          <fieldset className="mt-5">
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
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${on ? "bg-apricot text-white" : "bg-cream/10 text-cream/80 hover:bg-cream/20"}`}
                  >
                    {p.interests[interest]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold">{p.form.pace}</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-cream/10 p-1">
              {PACES.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={pace === key}
                  onClick={() => setPace(key)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${pace === key ? "bg-cream text-navy" : "text-cream/80 hover:text-cream"}`}
                >
                  {p.paces[key]}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn-primary mt-6 w-full" disabled={loading}>
            {loading ? p.form.loading : p.form.submit}
          </button>
          {error && <p role="alert" className="mt-3 rounded-xl bg-pomegranate px-3 py-2 text-sm text-white">{p.form.error}</p>}
        </form>

        {/* The plan */}
        <section aria-live="polite">
          {!result ? (
            <div className="flex min-h-64 items-center justify-center rounded-3xl border-2 border-dashed border-sand p-8 text-center text-navy/60">
              {p.result.empty}
            </div>
          ) : (
            <Plan result={result} />
          )}
        </section>
      </div>
    </div>
  );
}

function Plan({ result }: { result: PlanResult }) {
  const { t } = useLanguage();
  const p = t.planner;
  const { plan } = result;
  const total = Object.values(plan.budget).reduce((a, b) => a + b, 0);

  return (
    <div>
      {result.source === "sample" && (
        <p className="rounded-2xl bg-sand/70 px-4 py-3 text-sm">
          <span className="mr-2 rounded-full bg-navy px-2 py-0.5 text-xs font-semibold text-cream">{p.sampleBadge}</span>
          {p.sampleNote}
        </p>
      )}
      <p className="mt-4 text-lg font-semibold">{plan.summary}</p>

      <ol className="mt-4 space-y-4">
        {plan.days.map((day, i) => (
          <li key={day.date} className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-apricot text-sm text-white">{i + 1}</span>
                {day.title}
              </h2>
              <span className="text-sm text-navy/60">{showDate(day.date)}</span>
            </div>
            <ul className="mt-3 space-y-3">
              {day.activities.map((activity) => (
                <li key={activity.time} className="grid grid-cols-[84px_1fr_auto] gap-3 text-sm">
                  <span className="font-semibold text-apricot-dark">{p.times[activity.time]}</span>
                  <span>
                    <span className="font-semibold">{activity.place}</span>
                    <span className="block text-navy/70">{activity.description}</span>
                  </span>
                  <span className="whitespace-nowrap text-navy/70">{activity.costAmd ? amd(activity.costAmd) : p.result.free}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-navy p-5 text-cream">
          <h2 className="font-bold">֏ {p.result.budget}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {(Object.keys(plan.budget) as (keyof typeof plan.budget)[]).map((key) => (
              <div key={key}>
                <div className="flex justify-between">
                  <dt>{p.budgetParts[key]}</dt>
                  <dd className="font-semibold">{amd(plan.budget[key])}</dd>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-cream/15">
                  <div className="h-1.5 rounded-full bg-apricot" style={{ width: `${total ? (plan.budget[key] / total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">💡 {p.result.tips}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-navy/75">
            {plan.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
