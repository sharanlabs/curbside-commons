import type { Metadata } from "next";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";

/**
 * /playground — verify a serving copy in the browser (owner commission
 * 2026-07-13; the full slice the 2026-07-11 prototype existed to evaluate).
 *
 * The real deterministic engine (lib/verifier-core + the listings pack) runs
 * client-side on whatever the visitor pastes; the reference is the committed
 * synthetic SOR catalog, so every report is simulated-labeled by construction.
 * Static page, zero network at runtime; the honesty prose below is scanned by
 * the C10 site gate (evals/packs/honesty-c10.test.ts siteShell set).
 */
export const metadata: Metadata = {
  title: "Playground — verify a feed in your browser",
  description:
    "Paste a delivery-marketplace-style serving copy and run the real deterministic verifier in your browser — no AI calls, no network, receipts on every finding.",
};

export default function PlaygroundPage() {
  return (
    <main className="lp-main pg-page">
      <section className="pg-sec" aria-labelledby="pg-h1">
        <p className="lp-eyebrow">Playground</p>
        <h1 id="pg-h1" className="pg-h1">
          Verify a serving copy in your browser
        </h1>
        <p className="pg-lede">
          The same deterministic engine the CLI runs — compiled into this page. Paste an ACP-style
          feed (or load the committed sample and edit it) and it is checked line by line against
          the committed synthetic merchant catalog: 20 records, the same fixture every test in
          this repo pins. No AI calls, $0 to run, no network requests — nothing you paste leaves
          this page.
        </p>
        <p className="pg-boundary">
          Honest boundary: the only catalog here is the committed <strong>simulated</strong> one,
          so every report carries the simulated label — your paste is genuinely verified, live,
          but items outside those synthetic records will read as unknown or missing. That is the
          verifier being honest, not broken.
        </p>
      </section>

      <noscript>
        <section className="pg-sec">
          <p className="pg-noscript">
            This playground needs JavaScript to run the verifier in your browser. The same verdict
            for the committed sample feed is rendered statically at <a href="/report">/report</a>{" "}
            — 16 findings (11 error / 5 warn), verdict FAIL — from the committed golden{" "}
            <code>fixtures/synthetic-restaurant/expected-report.acp.json</code>.
          </p>
        </section>
      </noscript>

      <section className="pg-sec" aria-label="Paste and verify">
        <PlaygroundClient />
      </section>

      <section className="pg-sec pg-foot-sec" aria-label="Provenance">
        <p className="pg-foot">
          Simulated prototype, run on demand — not a live service. The engine, catalog, and sample
          feed are the repo&rsquo;s committed artifacts; a committed test proves this page&rsquo;s
          engine reproduces the committed golden report byte-for-byte for the sample feed. Not
          affiliated with, endorsed by, or connected to any marketplace, POS vendor, AI company,
          or protocol body.
        </p>
      </section>
    </main>
  );
}
