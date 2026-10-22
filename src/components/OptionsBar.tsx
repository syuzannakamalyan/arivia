"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

// The main options, like the product bar on trip.com.
export const OPTIONS = [
  { key: "planner", href: "/planner", icon: "✨" },
  { key: "routes", href: "/routes", icon: "✈️" },
  { key: "hotels", href: "/hotels", icon: "🏨" },
  { key: "visa", href: "/visa", icon: "🛂" },
] as const;

export default function OptionsBar({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav className={`no-scrollbar flex gap-1 overflow-x-auto ${className}`}>
      {OPTIONS.map((option) => {
        const active = pathname.startsWith(option.href);
        return (
          <Link
            key={option.key}
            href={option.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              active ? "bg-apricot/15 text-apricot-dark" : "text-ink/75 hover:bg-muted hover:text-ink"
            }`}
          >
            <span aria-hidden>{option.icon}</span>
            {t.nav[option.key]}
          </Link>
        );
      })}
    </nav>
  );
}
