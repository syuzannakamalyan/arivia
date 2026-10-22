"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

// The main options, like the menu on trip.com: a list on the left on computers,
// a row that scrolls sideways under the header on phones.
export const OPTIONS = [
  { key: "planner", href: "/planner", icon: "✨" },
  { key: "hotels", href: "/hotels", icon: "🏨" },
  { key: "routes", href: "/routes", icon: "✈️" },
  { key: "cars", href: "/cars", icon: "🚗" },
  { key: "tours", href: "/tours", icon: "🎟️" },
  { key: "privateTours", href: "/private-tours", icon: "🧑‍🏫" },
  { key: "groupTours", href: "/group-tours", icon: "👥" },
  { key: "cruises", href: "/cruises", icon: "🚢" },
  { key: "esim", href: "/esim", icon: "📶" },
  { key: "visa", href: "/visa", icon: "🛂" },
] as const;

export default function OptionsBar({ vertical = false, className = "" }: { vertical?: boolean; className?: string }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);

  // In the sideways row on phones, bring the current option into view.
  useEffect(() => {
    if (!vertical) nav.current?.querySelector("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname, vertical]);

  return (
    <nav ref={nav} className={`${vertical ? "flex flex-col gap-0.5" : "no-scrollbar flex gap-1 overflow-x-auto"} ${className}`}>
      {OPTIONS.map((option) => {
        const active = pathname.startsWith(option.href);
        return (
          <Link
            key={option.key}
            href={option.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 font-semibold transition ${
              vertical ? "rounded-xl px-3 py-2.5 text-[15px]" : "rounded-full px-3.5 py-2 text-sm"
            } ${active ? "bg-apricot/15 text-apricot-dark" : "text-ink/75 hover:bg-muted hover:text-ink"}`}
          >
            <span aria-hidden className={vertical ? "w-6 text-center text-lg" : ""}>{option.icon}</span>
            {t.nav[option.key]}
          </Link>
        );
      })}
    </nav>
  );
}
