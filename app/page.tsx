import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { CommonsScene } from "@/components/landing/CommonsScene";
import { TurnSection, type TurnReceiptData } from "@/components/landing/TurnSection";
import { AuditWorkbench } from "@/components/playground/AuditWorkbench";
import {
  ARITH,
  BENCH,
  COVERAGE,
  PROOF_BAR,
  SPECIMEN_ITEM,
  TRUST_TESTS,
} from "@/lib/landing/specimen";

/**
 * Home — the working tool (2026-07-28, owner: *"the website looks like a
 * display piece with numbers … I want ready to use website to upload test
 * files and check how it is working. Reevaluate the whole design walkthrough
 * from start"*).
 *
 * WHAT CHANGED AND WHY. Session 36 built the two-file workbench and put it in
 * section four of page three; the owner returned with the same complaint. The
 * defect was never the tool — it was the ORDER. Measured before this rewrite:
 * `/` was 4924px tall and contained no upload affordance at all, and the tool
 * on `/playground` began ~2990px down behind four exhibit sections. `.cs-hero`
 * is `min-height: calc(100vh - 68px)`, so while the scene was the hero NOTHING
 * else could reach the first screen — the burial was structural, not editorial.
 *
 * So the page is inverted: state what this is, hand over the instrument, and
 * only then explain it. The scene and the receipt are not deleted — a diagram
 * belongs after the thing it explains, not in front of it.
 *
 * REMOVED, on the owner's word: the audience eyebrow and the three-seat
 * "who keeps the receipt" band (both were positioning copy, not a next step);
 * the one-field "break the feed yourself" bench, which the real workbench
 * directly above now supersedes — a toy standing where the tool should be is
 * what made this read as an exhibit; and the case-file register (FILE A/FILE B
 * tab cuts, CASE 001, FIG captions, CONTINUE · 01 doors, the big stat rows).
 *
 * Every count still derives from lib/landing/specimen.ts — the prose-figure
 * lock in evals/packs/fees-surface.test.ts bans hand-typed engine figures here,
 * and that constraint outlives the redesign.
 */
export const metadata = {
  title: "Curbside Commons — audit a marketplace feed against the merchant's records",
  description:
    "Upload a feed and the merchant records it should agree with. Every claim is checked line by line in your browser, and you get a verdict and a downloadable report. No AI calls, and nothing you upload leaves your browser.",
};

const RECEIPT: TurnReceiptData = {
  caseLine: `FINDING ${BENCH.finding.index} OF ${BENCH.finding.total}`,
  claim: { field: BENCH.claim.field, unit: BENCH.claim.unit, claimId: BENCH.finding.claimId },
  record: { field: BENCH.record.field, cents: BENCH.record.cents, money: BENCH.record.money },
  rule: { id: BENCH.rule.id, plain: BENCH.rule.plain },
  claimDollars: ARITH.claimDollars,
  claimCents: ARITH.claimCents,
  recordCents: ARITH.recordCents,
  severity: BENCH.finding.severity,
  findingIndex: String(Number(BENCH.finding.index)),
  findingTotal: BENCH.finding.total,
  remainingErrors: COVERAGE.errors - 1,
  warns: COVERAGE.warns,
  itemLabel: SPECIMEN_ITEM.label,
  served: String(ARITH.served),
};

export default function Landing() {
  return (
    <main className="lp-main">
      {/* ===== HERO ZONE — one centred object: the announcement and the
               instrument (design direction S1, 2026-07-31; Evil Martians
               study: for a narrow-scope utility the winning hero visual is
               the live product embed, and hero + embed read as ONE object).
               Deliberately NOT a full viewport: the drop zones stay wholly
               above a 900px fold at 1280 (canonical.spec contract). ===== */}
      <section className="home-lead ds-wrap" aria-labelledby="hero-h1">
        <h1 id="hero-h1" className="cs-h1">
          Dinner can be ordered while you sleep.
          <br />
          <span className="cs-h1-lit">What the agent read needs proof.</span>
        </h1>
        <p className="cs-lede">
          Curbside Commons checks a marketplace feed against the merchant&rsquo;s own records and
          reports every claim that disagrees. Bring your two files, or run the bundled pair.
        </p>
      </section>

      {/* ===== THE INSTRUMENT — the hero's embed. "Audit a feed." is set in
               the premium display voice at a sub-H1 size (owner, 2026-07-31:
               "no instrument type fonts" — the short-lived mono nameplate is
               reverted; mono stays for DATA, never headings). The 78ch
               instruction wall is reduced to its two load-bearing ideas (D-6):
               the slots themselves demonstrate drag / choose / paste / samples. ===== */}
      <section className="sect-tool ds-wrap" id="audit" aria-labelledby="audit-h2">
        <h2 className="lp-h2 tool-h2" id="audit-h2">
          Audit a feed.
        </h2>
        <p className="lp-foot tool-foot">
          Every claim is checked line by line, in this tab, and you get a report you can
          download. <b>Nothing you load leaves this page.</b>
        </p>
        <AuditWorkbench />
      </section>

      {/* ===== WHAT HAPPENS TO A CLAIM — the scene, relocated below the thing
               it explains (it used to be the full-height hero). RENAMED from
               "HOW THE CHECK WORKS" 2026-07-31 (nav finding N-2): it collided
               word-for-word with the nav's "How it works", which points at
               /playground — same words, two destinations. The nav label is
               e2e-pinned; the eyebrow yields. ===== */}
      <section className="sect ds-wrap sect-scene" aria-labelledby="scene-h2">
        <Reveal>
          <p className="lp-eyebrow">WHAT HAPPENS TO A CLAIM</p>
          <span className="lp-sec-rule" aria-hidden="true" />
        </Reveal>
      </section>
      <CommonsScene
        ctaPrimary="Watch a claim get held"
        ctaSecondary="See a full worked report"
        ctaSecondaryHref="/report"
        labelledBy="scene-h2"
      >
        <h2 id="scene-h2" className="cs-h1 scene-h2">
          A claim is checked <span className="cs-h1-lit">before the order is placed.</span>
        </h2>
        <p className="cs-lede">
          An ordering agent reads the feed and builds a basket. Each claim it read is matched to the
          merchant&rsquo;s record, the rule is applied, and a claim that disagrees is held — with the
          arithmetic attached.
        </p>
      </CommonsScene>

      {/* ===== THE RECEIPT — what a single finding actually contains ===== */}
      <section className="sect ds-wrap" id="turn" aria-labelledby="turn-h2">
        <TurnSection data={RECEIPT} />
        <Reveal>
          <div className="pb-bar" aria-label="The held claim, as a proof object">
            <span aria-hidden="true" className="pb-dot" />
            <code className="pb-line">
              {PROOF_BAR.verdict} &nbsp;&middot;&nbsp; <b>THE MENU:</b> {PROOF_BAR.menuValue}{" "}
              &nbsp;&middot;&nbsp; <i>THE MERCHANT RECORD:</i> {PROOF_BAR.recordValue}{" "}
              &nbsp;&middot;&nbsp; CLAIM: {PROOF_BAR.factor} THE RECORD
            </code>
            <span className="pb-flag">{PROOF_BAR.verdict}</span>
          </div>
        </Reveal>
      </section>

      {/* ===== WHAT IT CHECKS — two plain doors (was FILE A / FILE B) ===== */}
      <section className="sect ds-wrap" aria-labelledby="world-h2">
        <Reveal>
          <p className="lp-eyebrow">WHAT IT CHECKS</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="world-h2">
            Two kinds of claim.
          </h2>
        </Reveal>
        <div className="files">
          <Reveal as="section" className="file">
            <p className="tab2">LISTINGS &middot; ANYWHERE IN THE US</p>
            <h3>What the listing says</h3>
            <p className="d">
              Price, availability, and whether the item exists at all. The bundled run carries{" "}
              {COVERAGE.findingsTotal} findings — {COVERAGE.errors} errors and {COVERAGE.warns}{" "}
              warnings: ghost items, hidden items, stale promises, and a sale price above the regular
              price.
            </p>
            <Link className="go" href="/report">
              See the full report{" "}
              <span className="arr" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </Reveal>
          <Reveal as="section" className="file law">
            <p className="tab2">DELIVERY FEES &middot; NEW YORK CITY</p>
            <h3>What the fee statement says</h3>
            <p className="d">
              New York City caps delivery fees. The audit applies {COVERAGE.feeRulesTotal}{" "}
              codified rules from New York City Administrative Code &sect;20-563.3 —{" "}
              {COVERAGE.feeExecutable}{" "}
              checkable from the statement itself, {COVERAGE.feeExternal} that need outside evidence
              and say so.
            </p>
            <Link className="go" href="/fees">
              Open the fee rules{" "}
              <span className="arr" aria-hidden="true">
                &rarr;
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== WHY TRUST IT ===== */}
      <section className="sect sect-last ds-wrap" aria-labelledby="trust-h2">
        <Reveal>
          <p className="lp-eyebrow">WHY TRUST THE VERDICT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="trust-h2">
            The same input, the same receipt, every time.
          </h2>
          <p className="lp-foot">
            Verdicts are deterministic. No model is in the loop when a claim is judged. Failures are
            reported, not hidden.
          </p>
        </Reveal>
        <div className="trust">
          <Reveal className="fact">
            <p className="fig">1 = 1</p>
            <p className="cap">DETERMINISTIC</p>
            <p className="d">A verdict is exact rule logic, byte for byte. No model decides it.</p>
          </Reveal>
          <Reveal className="fact">
            <p className="fig">
              <span className="accent">{TRUST_TESTS.figure}</span>
            </p>
            <p className="cap">AUTOMATED TESTS</p>
            <p className="d">
              {TRUST_TESTS.plain.charAt(0).toUpperCase() + TRUST_TESTS.plain.slice(1)}{" "}
              compare the engine&rsquo;s output with the results it has committed to.
            </p>
          </Reveal>
          <Reveal className="fact">
            <p className="fig">DEFER</p>
            <p className="cap">ON THE RECORD</p>
            <p className="d">
              Where evidence fell short of a pre-registered floor, the label says so. A
              first-attempt DEFER stays published.
            </p>
          </Reveal>
        </div>
        {/* ===== THE CLOSE (design direction S3, 2026-07-31). The research
             order wants trust then a final action; the pinned H2 sequence
             keeps trust last, so trust IS the closing beat and ends on the
             action. Specific verbs, existing button vocabulary, no new copy
             claims: back up to the instrument, or to the honesty ledger. ===== */}
        <Reveal>
          <div className="lp-cta-row lp-cta-close">
            <a className="lp-btn primary" href="#audit">
              Audit a feed
            </a>
            <Link className="lp-btn ghost" href="/docs">
              What is real, what is invented
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
