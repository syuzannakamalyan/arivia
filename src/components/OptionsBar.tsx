"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BedDouble, Car, Map, Plane, Ship, Stamp, Ticket, Wifi, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

// The main options, like the menu on trip.com: a list on the left on computers,
// a row that scrolls sideways under the header on phones.
// Simple line icons, in the style of trip.com's menu.
export const OPTIONS = [
  { key: "planner", href: "/planner", icon: Map },
  { key: "hotels", href: "/hotels", icon: BedDouble },
  { key: "routes", href: "/routes", icon: Plane },
  { key: "cars", href: "/cars", icon: Car },
  { key: "tours", href: "/tours", icon: Ticket },
  { key: "cruises", href: "/cruises", icon: Ship },
  { key: "esim", href: "/esim", icon: Wifi },
  { key: "visa", href: "/visa", icon: Stamp },
] as const satisfies readonly { key: string; href: string; icon: LucideIcon }[];

export type OptionKey = (typeof OPTIONS)[number]["key"];
export const OPTION_ICONS = Object.fromEntries(OPTIONS.map((o) => [o.key, o.icon])) as Record<OptionKey, LucideIcon>;

// A page heading with its option's icon, the same on every page.
export function PageTitle({ option, children }: { option: OptionKey; children: React.ReactNode }) {
  const Icon = OPTION_ICONS[option];
  return (
    <h1 className="flex items-center gap-3 text-3xl font-extrabold sm:text-4xl">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-strong">
        <Icon aria-hidden className="h-6 w-6" strokeWidth={2} />
      </span>
      {children}
    </h1>
  );
}

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
            } ${active ? "bg-brand/15 text-brand-strong" : "text-ink/75 hover:bg-muted hover:text-ink"}`}
          >
            <option.icon aria-hidden className={vertical ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2} />
            {t.nav[option.key]}
          </Link>
        );
      })}
    </nav>
  );
}
