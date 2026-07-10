import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

// Self-hosted via next/font/google (no render-blocking <link>). Geist = UI/display,
// JetBrains Mono = the tabular ledger numerals / field keys / verdict labels, Geist Mono
// kept available as a second mono. Exposed as CSS variables consumed in globals.css.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Curbside Commons — deterministic commerce-truth verifier (simulated prototype)",
    template: "%s · Curbside Commons",
  },
  description:
    "The truth layer for agentic commerce — a deterministic verifier of platform/AI-agent serving copies vs the merchant system-of-record, UCP conformance, and NYC fee-cap audit. Simulated corpus; company-agnostic prototype.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a href="#main-content" className="ds-skip">
          Skip to main content
        </a>
        <Nav />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="site-footer">
          <div className="site-footer-in">
            {/* S2 semantic disclosure contract (decision-log 2026-07-10 freeze-reversal row):
                the five semantic elements below are enforced by C10 tests — edit the wording
                freely, never the semantics. */}
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>
              Demo / portfolio prototype — simulated data throughout.
            </span>{" "}
            Every page is a <span style={{ fontWeight: 600 }}>static replay of committed,
            labeled fixtures</span>: the truth-audit report and demo render frozen golden
            reports from a synthetic corpus; the legacy activation pages replay{" "}
            <span style={{ fontWeight: 600 }}>synthetic activation state</span> over fictional
            display names, and the &ldquo;real Gemini&rdquo; output shown there is a{" "}
            <span style={{ fontWeight: 600 }}>recorded static fixture</span> (reproduce it
            locally with your own key). <span style={{ fontWeight: 600 }}>This site initiates
            no sends and makes no live calls</span>; exactly one recorded, owner-armed send
            exists in the project&rsquo;s history — see the repo&rsquo;s SHOWCASE and its
            committed run record. Human-led, AI-assisted, professionally reviewed.{" "}
            <span style={{ fontWeight: 600 }}>
              Not affiliated with, endorsed by, or connected to
            </span>{" "}
            DoorDash, Uber Eats, Grubhub, DataSF, or any named business.
          </div>
        </footer>
      </body>
    </html>
  );
}
