"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OPTIONS } from "@/components/OptionsBar";
import { useLanguage } from "@/lib/i18n";
import { WONDERS, type Wonder } from "@/data/wonders";

// The globe uses WebGL, so it only loads in the browser.
const WonderGlobe = dynamic(() => import("@/components/WonderGlobe"), { ssr: false });

export default function Home() {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Wonder | null>(null);

  return (
    <>
      {/* Hero with the search box, like trip.com */}
      <section className="bg-gradient-to-b from-apricot/15 to-transparent">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
          <h1 className="text-4xl leading-tight font-extrabold sm:text-5xl">{t.home.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink/70">{t.home.subtitle}</p>
          <SearchBox />
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="text-2xl font-bold">{t.home.popularTitle}</h2>
        <p className="mt-1 text-ink/70">{t.home.popularSubtitle}</p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {t.home.cities.map((city) => (
            <li key={city.query}>
              <Link
                href={`/planner?destination=${encodeURIComponent(city.query)}`}
                className="card flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:border-apricot"
              >
                <span className="text-3xl" aria-hidden>{city.emoji}</span>
                <span className="mt-3 font-bold">{city.name}</span>
                <span className="text-sm text-ink/60">{city.country}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Trip planner */}
      <section id="planner" className="scroll-mt-20 border-y border-line bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold">🗺️ {t.planner.teaser.title}</h2>
            <p className="mt-3 text-lg text-ink/70">{t.planner.teaser.text}</p>
            <Link href="/planner" className="btn-primary mt-6">{t.planner.teaser.cta}</Link>
          </div>
          <ol className="space-y-3">
            {t.planner.teaser.steps.map((step, i) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl bg-muted p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-apricot font-bold text-white">{i + 1}</span>
                <span className="font-semibold">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The wonders globe */}
      <section id="wonders" className="scroll-mt-20 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-3xl font-bold">{t.globe.title}</h2>
            <p className="mt-2 text-ink/70">{t.globe.subtitle}</p>
            <div className="mt-6 space-y-4">
              {(["new", "ancient"] as const).map((group) => (
                <div key={group}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-3 w-3 rounded-full ${group === "new" ? "bg-apricot" : "bg-pomegranate"}`} />
                    {group === "new" ? t.globe.newWonders : t.globe.ancientWonders}
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {WONDERS.filter((w) => w.group === group).map((w) => (
                      <li key={w.id}>
                        <button
                          onClick={() => setSelected(w)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selected?.id === w.id ? "border-ink bg-ink text-page" : "border-line bg-surface hover:border-ink/30"
                          }`}
                        >
                          {w.name[lang]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-[520px] min-w-0 justify-self-center overflow-hidden">
            <WonderGlobe selected={selected} onSelect={setSelected} lang={lang} />
            {selected && <WonderCard wonder={selected} onClose={() => setSelected(null)} />}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">{t.faq.title}</h2>
          <div className="mt-6 space-y-3">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group rounded-2xl bg-muted p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span className="text-apricot transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

// The options that can be searched right from the home page.
const SEARCH_TABS = OPTIONS.filter((option) => ["planner", "routes", "hotels", "visa"].includes(option.key));
type Tab = "planner" | "routes" | "hotels" | "visa";

// The search box with one tab per option. Each tab sends its values to that option's page.
function SearchBox() {
  const { t } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("planner");
  const [where, setWhere] = useState("");
  const [from, setFrom] = useState("Yerevan");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [oneWay, setOneWay] = useState(false);
  const [people, setPeople] = useState(2);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = (values: Record<string, string | number | undefined>) =>
      new URLSearchParams(Object.entries(values).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
    if (tab === "planner") router.push(`/planner?${q({ destination: where, start, end })}`);
    if (tab === "routes") router.push(`/routes?${q({ from, to: where, date: start, return: oneWay ? undefined : end, travellers: people })}`);
    if (tab === "hotels") router.push(`/hotels?${q({ destination: where, checkin: start, checkout: end, guests: people })}`);
  }

  const field = (label: string, input: React.ReactNode) => (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {input}
    </label>
  );
  const dates = (startLabel: string, endLabel: string, needEnd = true) => (
    <>
      {field(startLabel, <input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} required />)}
      {needEnd && field(endLabel, <input className="input" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} required />)}
    </>
  );
  const peopleField = (label: string) =>
    field(label, <input className="input" type="number" min={1} max={20} value={people} onChange={(e) => setPeople(Number(e.target.value))} />);

  return (
    <div className="card mt-8 overflow-hidden">
      <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-3">
        {SEARCH_TABS.map((option) => (
          <button
            key={option.key}
            role="tab"
            aria-selected={tab === option.key}
            onClick={() => setTab(option.key as Tab)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === option.key ? "border-apricot text-apricot-dark" : "border-transparent text-ink/70 hover:text-ink"
            }`}
          >
            <span aria-hidden>{option.icon}</span>
            {t.nav[option.key]}
          </button>
        ))}
      </div>

      {tab === "visa" ? (
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="text-ink/80">{t.home.visaText}</p>
          <Link href="/visa" className="btn-primary shrink-0">{t.home.visaCta}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="p-5 sm:p-6">
          {tab === "routes" && (
            <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={oneWay} onChange={(e) => setOneWay(e.target.checked)} className="h-4 w-4 accent-apricot" />
              {t.routes.oneWay}
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end [&>*]:lg:flex-1">
            {tab === "planner" && (
              <>
                {field(t.planner.form.destination, <input className="input" value={where} placeholder={t.planner.form.destinationPlaceholder} onChange={(e) => setWhere(e.target.value)} required />)}
                {dates(t.planner.form.start, t.planner.form.end)}
              </>
            )}
            {tab === "routes" && (
              <>
                {field(t.routes.from, <input className="input" value={from} placeholder={t.routes.fromPlaceholder} onChange={(e) => setFrom(e.target.value)} required />)}
                {field(t.routes.to, <input className="input" value={where} placeholder={t.routes.toPlaceholder} onChange={(e) => setWhere(e.target.value)} required />)}
                {dates(t.routes.date, t.routes.returnDate, !oneWay)}
                {peopleField(t.routes.travellers)}
              </>
            )}
            {tab === "hotels" && (
              <>
                {field(t.hotels.destination, <input className="input" value={where} placeholder={t.hotels.destinationPlaceholder} onChange={(e) => setWhere(e.target.value)} required />)}
                {dates(t.hotels.checkIn, t.hotels.checkOut)}
                {peopleField(t.hotels.guests)}
              </>
            )}
            <button className="btn-primary h-[50px] sm:col-span-2 lg:!flex-none">{t.home.search}</button>
          </div>
          {tab === "planner" && <p className="mt-3 text-sm text-ink/60">{t.home.plannerText}</p>}
        </form>
      )}
    </div>
  );
}

function WonderCard({ wonder, onClose }: { wonder: Wonder; onClose: () => void }) {
  const { t, lang } = useLanguage();
  return (
    <div className="card absolute right-2 bottom-2 left-2 p-4 sm:left-auto sm:w-72">
      <button onClick={onClose} className="absolute top-2 right-3 text-xl text-ink/40 hover:text-ink" aria-label="Close">×</button>
      <p className={`text-xs font-semibold ${wonder.group === "new" ? "text-apricot-dark" : "text-pomegranate"}`}>
        {wonder.group === "new" ? t.globe.newWonders : t.globe.ancientWonders}
      </p>
      <p className="mt-1 text-lg font-bold">{wonder.name[lang]}</p>
      <p className="text-sm text-ink/60">{wonder.place[lang]}</p>
      <p className="mt-2 text-xs text-ink/50">{wonder.standing ? t.globe.standing : t.globe.lost}</p>
    </div>
  );
}
