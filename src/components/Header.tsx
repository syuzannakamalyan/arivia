"use client";

import Link from "next/link";
import Logo from "./Logo";
import LanguageSwitch from "./LanguageSwitch";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-sand/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-navy/80 md:flex">
          <Link href="/planner" className="hover:text-navy">{t.nav.planner}</Link>
          <Link href="/#globe" className="hover:text-navy">{t.nav.globe}</Link>
          <Link href="/#faq" className="hover:text-navy">{t.nav.faq}</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch />
          <Link href="/visa" className="btn-primary !px-4 !py-2 text-sm">{t.nav.visa}</Link>
        </div>
      </div>
    </header>
  );
}
