"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import LanguageSwitch from "./LanguageSwitch";
import { useLanguage } from "@/lib/i18n";
import { backend, useAuth } from "@/lib/auth";

export default function Header() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  async function signOut() {
    await backend.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-navy/80 md:flex">
          <Link href="/#features" className="hover:text-navy">{t.nav.features}</Link>
          <Link href="/#globe" className="hover:text-navy">{t.nav.globe}</Link>
          <Link href="/#faq" className="hover:text-navy">{t.nav.faq}</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch />
          {loading ? null : user ? (
            <>
              <Link href="/profile" className="btn-secondary !px-4 !py-2 text-sm">{t.nav.profile}</Link>
              <button onClick={signOut} className="hidden text-sm font-semibold text-navy/70 hover:text-navy sm:block">
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="hidden text-sm font-semibold text-navy/80 hover:text-navy sm:block">
                {t.nav.signIn}
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">{t.nav.signUp}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
