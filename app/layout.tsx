import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Onest, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { BUILD_INFO } from "@/lib/build-info";
import { PLATFORM_NAME } from "@/lib/product";
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
  title: {
    default: "Curbside Commons — deterministic commerce-truth verifier",
    template: "%s · Curbside Commons",
  },
  description:
    "The truth layer for agentic commerce — a deterministic verifier that checks a platform or AI agent's serving copy against a merchant's own records, validates data-format conformance, and audits NYC delivery fee statements, with evidence attached to every finding.",
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
        <Nav />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        {/* Disclaimer-free professional footer (redesign Slice D freeze-reversal,
            decision-log 2026-07-14 line ~175). Supersedes the 2026-07-10 S2
            semantic-disclosure paragraph: the site carries NO disclaimer and NO
            false claim — the honest technical framing lives in the repo README.
            Exactly ONE <footer> (legacy.spec asserts it); the build-provenance line
            is kept (honest + professional). */}
        <footer className="site-footer">
          <div className="site-footer-in">
            <div className="site-footer-lead">
              <Link href="/" className="site-footer-word">
                {PLATFORM_NAME}
              </Link>
              <p className="site-footer-tagline">
                Deterministic verification for agentic commerce.
              </p>
            </div>
            <nav className="site-footer-nav" aria-label="Footer">
              <Link href="/report">Report</Link>
              <Link href="/demo">Demo</Link>
              <Link href="/playground">Playground</Link>
              <Link href="/eval">Eval evidence</Link>
              <Link href="/metrics">Measurables</Link>
              <Link href="/cost">Cost</Link>
              <Link href="/legacy/console">Legacy</Link>
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
