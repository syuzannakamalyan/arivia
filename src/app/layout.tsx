import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OptionsBar from "@/components/OptionsBar";

const armenian = Noto_Sans_Armenian({ variable: "--font-armenian", subsets: ["armenian"] });
const latin = Noto_Sans({ variable: "--font-latin", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arivia · Trip planner",
  description: "Plan your trip from Armenia: routes, hotels, visas and a day-by-day plan in one place.",
};

// Runs before the page paints, so dark mode doesn't flash light first.
// Uses the visitor's saved choice, otherwise the device setting.
const themeScript = `try{var t=localStorage.getItem("arivia-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${armenian.variable} ${latin.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <div className="flex flex-1">
            {/* Options on the left, like trip.com */}
            <aside className="sticky top-[61px] hidden self-start h-[calc(100vh-61px)] w-60 shrink-0 overflow-y-auto border-r border-line bg-surface p-3 lg:block">
              <OptionsBar vertical />
            </aside>
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
