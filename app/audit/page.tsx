import type { Metadata } from "next";
import Link from "next/link";

/**
 * Redirect stub for the S5 /legacy/ identity split (decision-log 2026-07-10).
 * The legacy activation audit trail moved to /legacy/audit. Static-export-safe:
 * a client-side <meta refresh> (no server redirect) preserves the old URL.
 */
export const metadata: Metadata = {
  title: "Moved to /legacy/audit",
  robots: { index: false },
};

export default function AuditMoved() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <meta httpEquiv="refresh" content="0;url=/legacy/audit" />
      <p className="ds-note">
        This page moved to <Link href="/legacy/audit">/legacy/audit</Link> — the legacy
        activation module.
      </p>
    </main>
  );
}
