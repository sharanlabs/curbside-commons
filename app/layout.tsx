import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Onest, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { BUILD_INFO } from "@/lib/build-info";
import { PLATFORM_NAME } from "@/lib/product";
import { COVERAGE } from "@/lib/landing/specimen";
import "./globals.css";

// Self-hosted via next/font/google (no render-blocking <link>, no inline data-URI).
// Two-voice system (storyboard adoption, decision-log 2026-07-15): Onest — one
// variable rounded-sans (100..900) carrying BOTH display and body voices (the
// refined Prismatic Passline storyboard uses no serif) — plus JetBrains Mono for
// tabular ledger numerals / field keys / verdict labels / uppercase eyebrows
// (kept over the storyboard's system-mono stack for cross-OS consistency).
// Exposed as CSS variables consumed in globals.css as --font-sans / --font-mono;
// the --serif/--display token NAMES survive in globals.css but resolve to Onest.
const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase = the LIVE deploy target. Corrected 2026-07-25 (presentation
  // lane (e)): this pointed at `curbside-commons.vercel.app`, but the site is
  // deployed on Cloudflare Pages and the Vercel host was never serving it — so
  // every absolute URL Next derives from this base (OG image, canonical) named
  // a host that does not serve the site. A metadataBase is only correct
  // relative to where the thing actually lives.
  metadataBase: new URL("https://curbside-commons.pages.dev"),
  title: {
    default: "Curbside Commons — deterministic commerce-truth verifier",
    template: "%s · Curbside Commons",
  },
  description:
    "The proof layer for agentic commerce — a deterministic verifier that checks a published feed against the merchant's own records, validates data-format conformance, and audits NYC delivery fee statements, with evidence attached to every finding. A working prototype on simulated data.",
  openGraph: {
    siteName: "Curbside Commons",
    title: "Curbside Commons — the proof layer for agentic commerce",
    // HONESTY (RULES §4) — a social card is the one surface that travels
    // WITHOUT its page, so it has to carry its own scope. Every other surface
    // is labelled in its chrome; a screenshotted card is not. The prototype +
    // simulated-data qualifier is therefore part of the card copy itself, not
    // something a reader has to click through to discover.
    description:
      "Menu and catalog claims checked against the merchant's own record; NYC delivery fee statements audited against the codified caps — evidence attached to every finding. A working prototype run on simulated data; not affiliated with any delivery platform.",
    type: "website",
    locale: "en_US",
    // Static SVG (the site is a static export — no runtime image route). It
    // carries "SIMULATED DATA · PROTOTYPE" on its face, because a card is the
    // one surface that travels without its page.
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Curbside Commons — deterministic verifier for agentic commerce. Simulated data, prototype." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.svg"],
    title: "Curbside Commons — the proof layer for agentic commerce",
    description:
      "A deterministic verifier for agentic commerce: feed-vs-record truth, schema conformance, NYC fee-cap audits. Working prototype, simulated data.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${onest.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a href="#main-content" className="ds-skip">
          Skip to main content
        </a>
        {/* Readout figures derive from the engine's own report via the landing
            specimen module (server) — the nav chrome never hand-types a count. */}
        <Nav
          figures={{
            findingsTotal: COVERAGE.findingsTotal,
            errors: COVERAGE.errors,
            warns: COVERAGE.warns,
          }}
        />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        {/* v9 takeover footer (spec §1, build piece 1 2026-07-20): Documentation ·
            Legacy activation · GitHub. Real-product voice (owner directive
            2026-07-20): the quiet prototype line is retired from the chrome — the
            honesty statement lives on /docs ("What is real, and what is
            invented"), linked here; the bright line (no false realness claims,
            C10) is unchanged. Exactly ONE <footer> (legacy.spec asserts it); the
            build-provenance + credit lines are kept (honest + professional). */}
        <footer className="site-footer">
          <div className="site-footer-in">
            <div className="site-footer-lead">
              <Link href="/" className="site-footer-word">
                {PLATFORM_NAME}
              </Link>
              <p className="site-footer-tagline">
                Independent verification for marketplace feeds.
              </p>
            </div>
            <nav className="site-footer-nav" aria-label="Footer">
              <Link href="/docs">Documentation</Link>
              <Link href="/legacy/console">Legacy activation</Link>
              <a href="https://github.com/sharanlabs/curbside-commons" rel="noopener">
                GitHub
              </a>
            </nav>
            <div className="site-footer-meta">
              <span className="site-footer-credit">
                Built and directed by{" "}
                <a href="https://github.com/sharanlabs" rel="author">
                  Sharan Kumar
                </a>
                .
              </span>
              {/* E1a honest build-provenance line (injected by next.config.ts). */}
              <span className="site-footer-build">{BUILD_INFO.label}.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
