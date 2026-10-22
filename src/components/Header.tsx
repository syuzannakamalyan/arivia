"use client";

import Logo from "./Logo";
import OptionsBar from "./OptionsBar";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Logo />
        <ThemeToggle />
      </div>
      {/* On phones the options get their own row that scrolls sideways; on computers they're on the left */}
      <OptionsBar className="border-t border-line px-3 py-1.5 lg:hidden" />
    </header>
  );
}
