import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DemoBanner from "@/components/DemoBanner";

const armenian = Noto_Sans_Armenian({ variable: "--font-armenian", subsets: ["armenian"] });
const latin = Noto_Sans({ variable: "--font-latin", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Արիվիա · Arivia",
  description: "Պլանավորիր քո ճամփորդությունը սկզբից մինչև վերջ։ Plan your trip from start to finish.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hy" className={`${armenian.variable} ${latin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <DemoBanner />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
