import type { Metadata } from "next";
import Link from "next/link";

/**
 * /legacy — the one-paragraph archive landing (build piece 2, 2026-07-20;
 * spec §12: the legacy module gets a front door instead of a dead end).
 * The archived first-generation module keeps its own frozen register beneath
 * this route; this page only names what the archive is and hands over.
 */
export const metadata: Metadata = {
  title: "Legacy activation module — archive",
  robots: { index: false },
};

export default function LegacyLanding() {
  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Legacy activation module</h1>
      <p className="ds-lead plain">
        This is the archive of the project&rsquo;s first generation — a merchant-activation
        workflow simulation on synthetic data, kept exactly as it shipped, with its own records
        and its one recorded AI-drafting spend. It is preserved for the record, not maintained.
        The current product — the verification layer this site is about — starts at the{" "}
        <Link href="/">front page</Link>, and its evidence lives in{" "}
        <Link href="/proof">Proof</Link>.
      </p>
      {/* "Merchants" pointed at /legacy/merchant, which 404s: the only route
          under it is /legacy/merchant/[id], so there has never been an index
          page to serve (cross-model gate, 2026-07-28). Retargeted to a record
          that exists rather than given a new index — this archive is
          "preserved, not maintained", and building it a surface it never had
          would be maintaining it. Pinned by the door/link walk in
          evals/e2e/legacy.spec.ts. */}
      <nav aria-label="Archive sections" className="ds-note">
        <Link href="/legacy/console">Console</Link> ·{" "}
        <Link href="/legacy/merchant/M001">A merchant record</Link> ·{" "}
        <Link href="/legacy/audit">Audit trail</Link> ·{" "}
        <Link href="/legacy/eval">Eval</Link> · <Link href="/legacy/metrics">Metrics</Link> ·{" "}
        <Link href="/legacy/cost">Cost</Link>
      </nav>
    </main>
  );
}
