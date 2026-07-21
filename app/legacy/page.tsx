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
        <Link href="/proof">chapter 04, Proof</Link>.
      </p>
      <nav aria-label="Archive sections" className="ds-note">
        <Link href="/legacy/console">Console</Link> ·{" "}
        <Link href="/legacy/merchant">Merchants</Link> ·{" "}
        <Link href="/legacy/audit">Audit trail</Link> ·{" "}
        <Link href="/legacy/eval">Eval</Link> · <Link href="/legacy/metrics">Metrics</Link> ·{" "}
        <Link href="/legacy/cost">Cost</Link>
      </nav>
    </main>
  );
}
