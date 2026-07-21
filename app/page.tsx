import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { CommonsScene } from "@/components/landing/CommonsScene";
import { TurnSection, type TurnReceiptData } from "@/components/landing/TurnSection";
import { TryBench, type TryBenchData } from "@/components/landing/TryBench";
import {
  ARITH,
  BENCH,
  COVERAGE,
  PROOF_BAR,
  SPECIMEN_ITEM,
  TRUST_TESTS,
  TRY_BENCH,
} from "@/lib/landing/specimen";

/**
 * Home — the v9 takeover (build piece 1, 2026-07-20; design source
 * `mockups/takeover-v9-home-listings-2026-07-17.html`, ADOPTED). Seven beats,
 * one continuing case: hero scene (W3 verbatim) → the turn (six-step receipt +
 * proof bar) → the case file (FILE A listings · FILE B fee law) → the reader
 * enters (break the feed) → why it matters (seats + the empty seat, as-of
 * mid-2026) → trust (deterministic · tests · DEFER) → the door to 01.
 * Every count and figure derives from lib/landing/specimen.ts.
 * Owner rulings applied over the mockup: D3 (route-true copy — no "two-page
 * sample" residue), D4 (retired vocabulary relabeled), D6 (held = gold),
 * sol dedup (the "same input → same receipt" refrain appears exactly once).
 */
export const metadata = {
  title: "Dinner can be ordered while you sleep. What the agent read needs proof.",
  description:
    "Curbside Commons is the independent verification layer for marketplace feeds. It reads each claim against the merchant's own records and attaches a receipt before the order is placed.",
};

const RECEIPT: TurnReceiptData = {
  caseLine: `CASE 001 · FINDING ${BENCH.finding.index}/${BENCH.finding.total}`,
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

const TRY_DATA: TryBenchData = { ...TRY_BENCH };

// Spelled-out register for small counts in prose position (the v9 door voice),
// DERIVED from the engine value — never hand-typed (the fees-surface pack bans
// literal figure words in this file).
const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
] as const;
const spelled = (n: number) => WORDS[n] ?? String(n);

export default function Landing() {
  return (
    <main className="lp-main">
      {/* ===== HERO — the order scene (W3 hero verbatim) ===== */}
      <CommonsScene ctaPrimary="Watch the check" ctaSecondary="Try it on a feed">
        <p className="cs-eyebrow">
          <span className="cs-eyebrow-dot" aria-hidden="true" />
          FOR MERCHANTS <b>·</b> PLATFORMS <b>·</b> AGENT OPERATORS
        </p>
        <h1 id="hero-h1" className="cs-h1">
          Dinner can be ordered while you sleep.
          <br />
          <span className="cs-h1-lit">What the agent read needs proof.</span>
        </h1>
        <p className="cs-lede">
          Curbside Commons is the independent verification layer for marketplace feeds. It reads
          each claim against the merchant&rsquo;s own records and attaches a receipt before the
          order is placed.
        </p>
      </CommonsScene>

      {/* ===== THE TURN — the six-step examination receipt ===== */}
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

      {/* ===== THE CASE FILE — FILE A listings · FILE B fee law ===== */}
      <section className="sect ds-wrap" aria-labelledby="world-h2">
        <Reveal>
          <p className="lp-eyebrow">THE CASE FILE</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="world-h2">
            One held claim opens a case.
          </h2>
        </Reveal>
        <div className="files">
          <Reveal as="section" className="file">
            <p className="tab-cut" aria-hidden="true">
              FILE A
            </p>
            <p className="tab2">LISTINGS · ANYWHERE IN THE US</p>
            <h3>The listings file</h3>
            <p className="d">
              One examined feed carries {COVERAGE.findingsTotal} findings: {COVERAGE.errors} errors and{" "}
              {COVERAGE.warns} warnings. Ghost items, hidden items, stale promises, and a sale
              price above the regular price. Feed checks work anywhere in the US.
            </p>
            <p className="figs">
              <span>
                <b>{COVERAGE.findingsTotal}</b>FINDINGS
              </span>
              <span>
                <b>{COVERAGE.errors}</b>ERRORS
              </span>
              <span>
                <b>{COVERAGE.warns}</b>WARNINGS
              </span>
            </p>
            <Link className="go" href="/report">
              Open the listings audit{" "}
              <span className="arr" aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
          <Reveal as="section" className="file law">
            <p className="tab-cut" aria-hidden="true">
              FILE B
            </p>
            <p className="tab2">FEES · NEW YORK CITY ALONE</p>
            <h3>The fee-law file</h3>
            <p className="d">
              New York City caps delivery fees. The audit applies {COVERAGE.feeRulesTotal}{" "}
              codified rules from New York City Administrative Code &sect;20-563.3. Of those,{" "}
              {COVERAGE.feeExecutable} are checkable from the statement itself;{" "}
              {COVERAGE.feeExternal} need outside evidence and say so.
            </p>
            <p className="figs">
              <span>
                <b className="nyc">{COVERAGE.feeRulesTotal}</b>RULES
              </span>
              <span>
                <b>{COVERAGE.feeExecutable}</b>FROM THE STATEMENT
              </span>
              <span>
                <b>{COVERAGE.feeExternal}</b>NEED EVIDENCE
              </span>
            </p>
            <Link className="go" href="/fees">
              Open the fee audit{" "}
              <span className="arr" aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== THE READER ENTERS — break the feed yourself ===== */}
      <section className="sect ds-wrap" id="try" aria-labelledby="try-h2">
        <Reveal>
          <p className="lp-eyebrow">YOUR TURN</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="try-h2">
            Break the feed yourself.
          </h2>
          <p className="lp-foot">
            Change the served price below. The same rule checks it against the merchant&rsquo;s
            record, and the verdict updates with the result. On the try-it-live page, you can
            check an entire feed.
          </p>
        </Reveal>
        <Reveal>
          <TryBench data={TRY_DATA} />
        </Reveal>
      </section>

      {/* ===== WHY IT MATTERS — who keeps the receipt + the empty seat ===== */}
      <section className="sect ds-wrap" aria-labelledby="why-h2">
        <Reveal>
          <p className="lp-eyebrow">WHO KEEPS THE RECEIPT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="why-h2">
            Different roles need the same proof.
          </h2>
        </Reveal>
        <div className="seats">
          <Reveal className="seat">
            <p className="who">MERCHANTS</p>
            <h3>Your records remain the source of truth</h3>
            <p>
              Not the feed&rsquo;s copy of them. When a listing drifts, the finding names the row
              and the receipt shows the break.
            </p>
          </Reveal>
          <Reveal className="seat">
            <p className="who">PLATFORMS</p>
            <h3>Find drift before customers do</h3>
            <p>
              {COVERAGE.findingsTotal} disagreements, found line by line, with evidence attached to
              every one.
            </p>
          </Reveal>
          <Reveal className="seat">
            <p className="who">AGENT OPERATORS</p>
            <h3>Check the feed before purchase</h3>
            <p>
              Keep the deterministic receipt. A held claim arrives with the rule and the record
              attached.
            </p>
          </Reveal>
        </div>
        <Reveal className="empty-seat">
          <span className="asof">AS OF MID-2026</span>
          <p>
            Trust products verify the agent: who it is and what it may spend.{" "}
            <b>No named product independently verifies the feed against the merchant&rsquo;s records.</b>{" "}
            Curbside Commons is built for that check.
          </p>
        </Reveal>
      </section>

      {/* ===== TRUST — why believe this + the door to 01 ===== */}
      <section className="sect sect-last ds-wrap" aria-labelledby="trust-h2">
        <Reveal>
          <p className="lp-eyebrow">WHY BELIEVE THIS</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="trust-h2">
            The same input, the same receipt, every time.
          </h2>
          <p className="lp-foot">
            Verdicts are deterministic. No model is in the loop when a claim is judged. Failures
            are reported, not hidden.
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
            <p className="d">{TRUST_TESTS.plain.charAt(0).toUpperCase() + TRUST_TESTS.plain.slice(1)} compare the engine&rsquo;s output with the results it has committed to.</p>
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
        <Reveal>
          <Link className="door" href="/report">
            <span>
              <span className="d-eyebrow">CONTINUE · 01</span>
              <span className="d-title">The listings audit</span>
              <span className="d-sub">
                All {spelled(COVERAGE.findingsTotal)} findings, with the receipt that started the
                case.
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
