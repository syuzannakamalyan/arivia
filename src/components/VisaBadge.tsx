"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

// Valid / expires soon (under 60 days) / expired, for a visa expiry date.
export default function VisaBadge({ expiry }: { expiry: string }) {
  const { t } = useLanguage();
  const [now] = useState(() => Date.now());
  if (!expiry) return null;
  const days = (new Date(expiry).getTime() - now) / 86_400_000;
  const [label, style] =
    days < 0
      ? [t.profile.expired, "bg-pomegranate/15 text-pomegranate"]
      : days < 60
        ? [t.profile.expiresSoon, "bg-apricot/20 text-apricot-dark"]
        : [t.profile.valid, "bg-emerald-100 text-emerald-700"];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${style}`}>{label}</span>;
}
