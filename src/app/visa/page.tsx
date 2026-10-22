"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { CONTACTS, EXEMPTION, LINKS, MFA_VISA_URL, SCHENGEN_LINKS, checkExemption } from "@/data/visaRules";

// Each rule card and the links it shows, in the order of its dictionary link labels.
const RULES = [
  { key: "visaFree", icon: "🕊️", urls: [LINKS.visaFreeUnilateral, LINKS.visaFreeByAgreement] },
  { key: "exemption", icon: "🪪", urls: [LINKS.exemptionCountries] },
  { key: "evisa", icon: "💻", urls: [LINKS.evisa] },
  { key: "length", icon: "📅", urls: [] },
  { key: "invitation", icon: "✉️", urls: [LINKS.invitationOnly, LINKS.eRequest] },
  { key: "laissezPasser", icon: "🇺🇳", urls: [] },
] as const;

type Tab = "citizens" | "visitors";

export default function VisaGuidePage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("citizens");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.visa.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/70">{t.visa.subtitle}</p>

      <div role="tablist" aria-label={t.visa.title} className="mt-8 grid grid-cols-2 gap-1 rounded-2xl bg-muted/60 p-1 sm:inline-grid">
        {(["citizens", "visitors"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`panel-${key}`}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
              tab === key ? "bg-apricot text-white shadow-sm" : "text-ink/70 hover:text-ink"
            }`}
          >
            {t.visa.tabs[key]}
          </button>
        ))}
      </div>

      {tab === "citizens" ? (
        <div role="tabpanel" id="panel-citizens" aria-labelledby="tab-citizens">
          <SchengenSection />
        </div>
      ) : (
        <div role="tabpanel" id="panel-visitors" aria-labelledby="tab-visitors">
          <VisitorsSection />
        </div>
      )}

      <p className="mt-6 text-sm text-ink/60">{t.visa.disclaimer}</p>
    </div>
  );
}

// Foreign visitors coming to Armenia, from the MFA visa page. Same look as SchengenSection.
function VisitorsSection() {
  const { t } = useLanguage();
  const v = t.visa.visiting;
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <section className="mt-8 rounded-3xl bg-panel p-6 text-on-panel shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold">🇦🇲 {v.title}</h2>
      <h3 className="mt-4 text-xl font-semibold text-apricot">{v.subtitle}</h3>
      <p className="mt-2 max-w-3xl text-on-panel/80">{v.text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={MFA_VISA_URL} {...external} className="btn-primary">{t.visa.openSource} ↗</a>
        <a href={LINKS.evisa} {...external} className="inline-flex items-center rounded-full border border-on-panel/30 px-5 py-3 font-semibold text-on-panel hover:bg-on-panel/10">
          {v.evisa} ↗
        </a>
      </div>
      <p className="mt-3 text-xs text-on-panel/60">{t.visa.source} · {t.visa.lastChecked}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map(({ key, icon, urls }) => {
          const rule = t.visa.rules[key];
          return (
            <article key={key} className="rounded-2xl bg-on-panel/10 p-5">
              <h4 className="flex items-center gap-2 font-bold">
                <span aria-hidden>{icon}</span> {rule.title}
              </h4>
              <p className="mt-2 text-sm text-on-panel/80">{rule.text}</p>
              {urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {urls.map((url, i) => (
                    <a key={url} href={url} {...external} className="text-sm font-semibold text-apricot hover:underline">
                      {(rule.links as readonly string[])[i]} ↗
                    </a>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ExemptionChecker />

      <details className="mt-3 rounded-2xl bg-on-panel/10 p-5">
        <summary className="cursor-pointer font-bold">📞 {t.visa.contacts.title}</summary>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold">Email</dt>
            <dd><a href={`mailto:${CONTACTS.email}`} className="text-apricot hover:underline">{CONTACTS.email}</a></dd>
            <dd className="mt-1 text-on-panel/60">{t.visa.contacts.emailNote}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.visa.contacts.entry}</dt>
            {CONTACTS.entryPhones.map((phone) => <dd key={phone} className="text-on-panel/80">{phone}</dd>)}
          </div>
          <div>
            <dt className="font-semibold">{t.visa.contacts.invitations}</dt>
            {CONTACTS.invitationPhones.map((phone) => <dd key={phone} className="text-on-panel/80">{phone}</dd>)}
          </div>
        </dl>
      </details>
    </section>
  );
}

function SchengenSection() {
  const { t, lang } = useLanguage();
  const a = t.visa.abroad;
  const links = SCHENGEN_LINKS[lang];
  // Links for the fact cards, in the order of t.visa.abroad.facts.
  const factUrls = [links.whereToApply, SCHENGEN_LINKS.agreement, "", "", "", "", links.calculator];
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <section className="mt-8 rounded-3xl bg-panel p-6 text-on-panel shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold">✈️ {a.title}</h2>
      <h3 className="mt-4 text-xl font-semibold text-apricot">{a.schengenTitle}</h3>
      <p className="mt-2 max-w-3xl text-on-panel/80">{a.text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={links.page} {...external} className="btn-primary">{a.button} ↗</a>
        <a href={links.calculator} {...external} className="inline-flex items-center rounded-full border border-on-panel/30 px-5 py-3 font-semibold text-on-panel hover:bg-on-panel/10">
          {a.calculator} ↗
        </a>
      </div>
      <p className="mt-3 text-xs text-on-panel/60">{a.source}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {a.facts.map((fact, i) => (
          <article key={fact.title} className="rounded-2xl bg-on-panel/10 p-5">
            <h4 className="flex items-center gap-2 font-bold">
              <span aria-hidden>{fact.icon}</span> {fact.title}
            </h4>
            <p className="mt-2 text-sm text-on-panel/80">{fact.text}</p>
            {fact.link && factUrls[i] && (
              <a href={factUrls[i]} {...external} className="mt-3 inline-block text-sm font-semibold text-apricot hover:underline">
                {fact.link} ↗
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="font-bold">📄 {a.documentsTitle}</h4>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-on-panel/80">
            {a.documents.map((doc) => <li key={doc}>{doc}</li>)}
          </ul>
          <a href={SCHENGEN_LINKS.photo} {...external} className="mt-3 inline-block text-sm font-semibold text-apricot hover:underline">
            {a.photoLink} ↗
          </a>
        </div>
        <div>
          <h4 className="font-bold">🇪🇺 {a.countriesTitle}</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {a.countries.map((country) => (
              <li key={country} className="rounded-full bg-on-panel/10 px-3 py-1 text-sm">{country}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-on-panel/60">{a.countriesNote}</p>
        </div>
      </div>

      <details className="mt-6 rounded-2xl bg-on-panel/10 p-5">
        <summary className="cursor-pointer font-bold">🎟️ {a.freeTitle}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-on-panel/80">
          {a.free.map((group) => <li key={group}>{group}</li>)}
        </ol>
        <p className="mt-3 text-xs text-on-panel/60">{a.freeNote}</p>
      </details>

      <details className="mt-3 rounded-2xl bg-on-panel/10 p-5">
        <summary className="cursor-pointer font-bold">🧾 {a.purposeTitle}</summary>
        <p className="mt-3 text-sm text-on-panel/70">{a.purposeText}</p>
        <dl className="mt-3 space-y-3 text-sm">
          {a.purpose.map(({ who, doc }) => (
            <div key={who}>
              <dt className="font-semibold">{who}</dt>
              <dd className="text-on-panel/80">{doc}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

// Checks a guest's residence permit against the temporary exemption's conditions.
function ExemptionChecker() {
  const { t } = useLanguage();
  const [permitFrom, setPermitFrom] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [permitExpiry, setPermitExpiry] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkExemption> | null>(null);

  // Names come from the dictionary (not the browser) so the server and browser render the same text.
  const names = t.visa.checker.permitCountries;

  const tone =
    result === "ok"
      ? "bg-emerald-50 text-emerald-800"
      : result === "incomplete"
        ? "bg-muted text-ink"
        : "bg-pomegranate text-white";

  return (
    <div className="mt-8 rounded-2xl bg-on-panel/10 p-5">
      <h4 className="font-bold">🧭 {t.visa.checker.title}</h4>
      <p className="mt-1 text-sm text-on-panel/80">{t.visa.checker.text}</p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(checkExemption(permitFrom, entryDate, permitExpiry));
        }}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.permitFrom}</span>
          <select className="input" value={permitFrom} onChange={(e) => setPermitFrom(e.target.value)}>
            <option value="">—</option>
            {EXEMPTION.permitCountries.map((code) => (
              <option key={code} value={code}>{names[code as keyof typeof names]}</option>
            ))}
            <option value="OTHER">{t.visa.checker.other}</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.entryDate}</span>
          <input className="input" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.permitExpiry}</span>
          <input className="input" type="date" value={permitExpiry} onChange={(e) => setPermitExpiry(e.target.value)} />
        </label>
        <button className="btn-primary">{t.visa.checker.button}</button>
      </form>
      {result && (
        <div role="status" className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${tone}`}>
          {t.visa.checker.results[result]}
          {result === "ok" && (
            <a href={LINKS.exemptionCountries} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold underline">
              {t.visa.checker.checkList} ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
