import type { Metadata } from "next";
import { TASA_Orbiter, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

// Same stack as motion.dev/examples: TASA Orbiter (Latin) + Inter fallback
// (Inter carries Cyrillic, so Ukrainian text falls back to it per-glyph).
const tasa = TASA_Orbiter({
  subsets: ["latin"],
  variable: "--font-tasa",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glow Motion Library — внутрішня бібліотека мікроанімацій",
  description:
    "Практичний каталог мікроанімацій для дизайн-команди: параметри, dev handoff і правила використання.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${tasa.variable} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <Header />
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
        <footer className="mt-12 border-t border-border">
          <div className="hatch h-6 border-b border-border" />
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
            <span className="caps text-muted">// GLOW MOTION LIBRARY</span>
            <span className="caps text-muted">ВНУТРІШНІЙ ІНСТРУМЕНТ</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
