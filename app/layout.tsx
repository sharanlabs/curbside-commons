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
  title: "ActivationOps AI",
  description:
    "Merchant activation for a local-commerce delivery marketplace — deterministic triage, eval-gated bounded AI outreach, human approval, audit. Simulated data; company-agnostic prototype.",
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
        <footer
          style={{
            background: "var(--bg-2)",
            borderTop: "1px solid var(--rule-2)",
          }}
        >
          <div
            className="ds-wrap"
            style={{
              padding: "40px 32px 72px",
              fontSize: "13px",
              lineHeight: 1.62,
              color: "var(--body)",
              maxWidth: "var(--maxw)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>
              Demo / portfolio prototype.
            </span>{" "}
            REPLAY over <span style={{ fontWeight: 600 }}>fictional display names</span> +{" "}
            <span style={{ fontWeight: 600 }}>synthetic activation state</span> (the adapter
            ingests real public DataSF records; the demo shows invented ones) — not production
            logs, real sends, real marketplace access, or real-impact data. The &ldquo;real
            Gemini&rdquo; output shown is a{" "}
            <span style={{ fontWeight: 600 }}>recorded static fixture</span> (reproduce it
            locally with your own key). Human-led, AI-assisted, professionally reviewed.{" "}
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
