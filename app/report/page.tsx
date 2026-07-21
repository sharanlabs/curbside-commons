import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { Jewel } from "@/components/report/Jewel";
import { Ledger } from "@/components/report/Ledger";
import { ARITH, BENCH, COVERAGE, FINDINGS_INDEX } from "@/lib/landing/specimen";

/**
 * `/report` — 01 · The listings audit (v9 takeover build piece 1, 2026-07-20;
 * design source `mockups/takeover-v9-home-listings-2026-07-17.html` §page-listings,
 * ADOPTED). Chapter head → the ×100 jewel → the sixteen-row accession ledger
 * (drift-locked derived index) → the method strip → the door to 02.
 *
 * Every figure derives from lib/landing/specimen.ts (the engine's own report);
 * the ledger rows are FINDINGS_INDEX — pinned byte-for-byte to the committed
 * landing golden by evals/packs/landing-browse-drift-lock.test.ts.
 * D3 applied over the mockup: the 02 door is a REAL route link (no "parked in
 * this sample" residue). ONE-CASE grammar (owner ruling 2026-07-20): CASE 001.
 */
export const metadata: Metadata = {
  title: "01 · Listings audit — what the feed claims vs. what the records say",
  description:
    "A delivery-marketplace feed checked line by line against the merchant's own catalog: sixteen findings, each keeping the claim beside the record that answered it. Deterministic; zero AI calls.",
};

// Spelled-out register for counts in heading position (numerals never sit in
// headings — locked ledger), DERIVED from the engine value; the fees-surface
// pack bans hand-typed figure words on the landing and this page mirrors it.
const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
] as const;
const spelledCap = (n: number) => {
  const w = WORDS[n] ?? String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

export default function ReportPage() {
  return (
    <main className="lp-main p2-main">
      <section className="p2-head sect ds-wrap" aria-labelledby="p2-h1">
        <Reveal>
          <p className="lp-eyebrow">01 · LISTINGS AUDIT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h1 className="p2-h1" id="p2-h1">
            What the feed claims vs. what the records say.
          </h1>
          <p className="p2-lede">
            A delivery-marketplace feed for one restaurant is checked line by line against
            the merchant&rsquo;s own catalog. The audit closes with a {COVERAGE.verdict} verdict
            and {COVERAGE.findingsTotal} findings. Each finding keeps the claim beside the record
            used to check it.
          </p>
          <p className="p2-status">
            <span className={`schip ${COVERAGE.verdict === "FAIL" ? "fail" : "pass"}`}>
              {COVERAGE.verdict}
            </span>
            <span className="schip">{COVERAGE.findingsTotal} FINDINGS</span>
            <span className="schip">{COVERAGE.errors} ERRORS</span>
            <span className="schip">{COVERAGE.warns} WARNINGS</span>
          </p>
        </Reveal>
      </section>

      <section className="sect ds-wrap" aria-labelledby="jewel-label">
        <Reveal>
          <Jewel
            data={{
              claimCents: ARITH.claimCents,
              recordCents: ARITH.recordCents,
              claimDollars: ARITH.claimDollars,
              ruleId: BENCH.rule.id,
              findingIndex: String(Number(BENCH.finding.index)),
              findingTotal: BENCH.finding.total,
            }}
          />
          <p className="acc r" aria-hidden="true" style={{ marginTop: 12 }}>
            FIG. 02 — ONE NUMBER, TWO READINGS
          </p>
        </Reveal>
      </section>

      <section className="idx sect ds-wrap" aria-labelledby="idx-h2">
        <Reveal>
          <div className="idx-head">
            <p className="lp-eyebrow">THE FULL INDEX</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 className="lp-h2" id="idx-h2">
              {spelledCap(COVERAGE.findingsTotal)} findings, each with its receipt.
            </h2>
          </div>
        </Reveal>
        <Ledger rows={[...FINDINGS_INDEX]} />
      </section>

      <section className="sect ds-wrap" aria-labelledby="method-h2">
        <h2 className="sr" id="method-h2">
          How each finding is put together
        </h2>
        <Reveal>
          <div className="method">
            <div className="m-cell">
              <p className="m-k">CLAIM</p>
              <p className="m-v">
                {BENCH.finding.claimId} · {ARITH.served}
              </p>
              <p className="m-n">The machine-readable field and the value as served.</p>
            </div>
            <div className="m-cell">
              <p className="m-k">RECORD</p>
              <p className="m-v">
                {BENCH.finding.idBase} · {BENCH.record.field} · {ARITH.recordDollars}
              </p>
              <p className="m-n">The same field in the merchant&rsquo;s own system.</p>
            </div>
            <div className="m-cell">
              <p className="m-k">RULE</p>
              <p className="m-v">
                {BENCH.rule.label.toLowerCase()} · {BENCH.rule.factor}
              </p>
              <p className="m-n">The relationship used to compare the two values.</p>
            </div>
            <div className="m-cell">
              <p className="m-k">VERDICT</p>
              <p className="m-v">
                {BENCH.finding.severity} · price · {BENCH.arithmetic.factor}
              </p>
              <p className="m-n">Claim, record, and rule kept attached to the conclusion.</p>
            </div>
            <span className="m-arrow" style={{ left: "25%" }} aria-hidden="true">
              →
            </span>
            <span className="m-arrow" style={{ left: "50%" }} aria-hidden="true">
              →
            </span>
            <span className="m-arrow" style={{ left: "75%" }} aria-hidden="true">
              →
            </span>
          </div>
        </Reveal>
      </section>

      <section className="sect sect-last ds-wrap">
        <Reveal>
          <Link className="door" href="/fees">
            <span>
              <span className="d-eyebrow">CONTINUE · 02</span>
              <span className="d-title">The fee audit</span>
              <span className="d-sub">
                The statement, checked against the law. New York City alone.
              </span>
            </span>
            <span className="d-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
