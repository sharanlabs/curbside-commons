import Link from "next/link";

/** RV1 (owner review pick 2026-07-11): branded not-found in the site's voice.
 *  Renders inside the root layout, so the nav + honesty footer stay present.
 *  The S8 smoke's unknown-path 404 probe exercises this page. */
export default function NotFound() {
  return (
    <main className="ds-data ds-wrap ds-narrow ds-view">
      <h1>Nothing is served at this path</h1>
      <p className="ds-lead plain">
        Fitting, for a site about verifying what gets served: this URL has no page behind it. If a
        link brought you here, the pages below are the real inventory.
      </p>
      <ul style={{ margin: "14px 0 0", paddingLeft: "18px", lineHeight: 2 }}>
        <li>
          <Link href="/" className="ds-mlink">
            The landing — what this engine is
          </Link>
        </li>
        <li>
          <Link href="/report" className="ds-mlink">
            The listings report — the copy vs the records
          </Link>
        </li>
        <li>
          <Link href="/fees" className="ds-mlink">
            The fee-cap audit — a statement read against the law
          </Link>
        </li>
        <li>
          <Link href="/playground" className="ds-mlink">
            Check a feed — the verifier in your browser
          </Link>
        </li>
        <li>
          <Link href="/eval" className="ds-mlink">
            The evidence dashboard
          </Link>
        </li>
        <li>
          <Link href="/legacy/console" className="ds-mlink">
            The legacy activation module
          </Link>
        </li>
      </ul>
    </main>
  );
}
