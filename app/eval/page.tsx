import type { Metadata } from "next";
import Link from "next/link";

/**
 * Redirect stub (build piece 2, 2026-07-20; spec §12 — the /eval /metrics /cost
 * dashboard set merged into /proof, chapter 04). Static-export-safe: a
 * client-side <meta refresh> (no server redirect) preserves the old URL.
 * Pattern: app/audit/page.tsx (S5 precedent).
 */
export const metadata: Metadata = {
  title: "Moved to /proof",
  robots: { index: false },
};

export default function EvalMoved() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <meta httpEquiv="refresh" content="0;url=/proof" />
      <p className="ds-note">
        This page moved to <Link href="/proof">/proof</Link> — chapter 04, the instrument&rsquo;s
        logbook, where every evaluation record now lives.
      </p>
    </main>
  );
}
