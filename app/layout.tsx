import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActivationOps AI",
  description:
    "Merchant activation for a local-commerce delivery marketplace — deterministic triage, eval-gated bounded AI outreach, human approval, audit. Simulated data; company-agnostic prototype.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        <Nav />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="mx-auto mt-16 max-w-6xl border-t border-neutral-200 px-6 py-6 text-[12px] leading-relaxed text-neutral-500">
          <span className="font-medium text-neutral-600">Demo / portfolio prototype.</span> REPLAY over
          <span className="font-medium"> fictional display names</span> + <span className="font-medium">synthetic
          activation state</span> (the adapter ingests real public DataSF records; the demo shows invented
          ones) — not production logs, real sends, real marketplace access, or real-impact data. The &ldquo;real Gemini&rdquo; output shown is a <span className="font-medium">recorded static
          fixture</span> (reproduce it locally with your own key). Human-led, AI-assisted, professionally
          reviewed. <span className="font-medium">Not affiliated with, endorsed by, or connected to</span>{" "}
          DoorDash, Uber Eats, Grubhub, DataSF, or any named business.
        </footer>
      </body>
    </html>
  );
}
