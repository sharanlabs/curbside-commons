import type { Metadata } from "next";
import Link from "next/link";

/**
 * Redirect stub (build piece 2, 2026-07-20; spec §12 — /demo folds into the
 * landing + /report: the landing's turn section carries the examined claim and
 * the try bench, and 01 carries the full audit). Static-export-safe: a
 * client-side <meta refresh> (no server redirect) preserves the old URL.
 * Pattern: app/audit/page.tsx (S5 precedent).
 */
export const metadata: Metadata = {
  title: "Moved to the front page",
  robots: { index: false },
};

export default function DemoMoved() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <meta httpEquiv="refresh" content="0;url=/" />
      <p className="ds-note">
        This page folded into the <Link href="/">front page</Link> — the examined claim now opens
        the story there, and the full audit lives in{" "}
        <Link href="/report">chapter 01, the listings audit</Link>.
      </p>
    </main>
  );
}
