import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { CommonsScene } from "@/components/landing/CommonsScene";
import { EvidenceBench } from "@/components/landing/EvidenceBench";
import { MethodRelation } from "@/components/landing/MethodRelation";
import { CoverageTabs, type CoverageTab } from "@/components/landing/CoverageTabs";
import { BENCH, FINDINGS_INDEX, METHOD, COVERAGE, PROOF_BAR } from "@/lib/landing/specimen";

// Landing — the v8 "commons scene" arc (design adoption 2026-07-16: the owner's
// chosen "Curbside Commons Hero v8" sample; narrative flow drafted by gpt-5.6-sol
// on the owner's routing word, adjudicated primary-model-final). Seven chapters:
// Hero scene → 01 The first claim → 02 How the commons proves it (+ proof bar) →
// 03 The listings audit → 04 The fee-cap audit → 05 The limits stay visible →
// 06 Evidence, measured → Close. All counts and specimen figures are grounded in
// the engine measurables via lib/landing/specimen.ts (never hand-typed).
export const metadata = {
  title: "Dinner, ready for an agent. Proven in the commons.",
  description:
    "Curbside Commons is a proof layer for agentic commerce: menu and catalog claims checked against the merchant's own record, delivery fee statements audited against NYC's codified caps — evidence attached to every finding.",
};

const COVERAGE_TABS: CoverageTab[] = [
  {
    id: "listings",
    label: "LISTINGS TRUTH",
    body: `Compares item existence, availability, price, and encoding with the merchant record. The supplied catalog closes at ${COVERAGE.verdict} with ${COVERAGE.findingsTotal} findings: ${COVERAGE.errors} error and ${COVERAGE.warns} warn. This count does not imply broader platform coverage.`,
  },
  {
    id: "schema",
    label: "SCHEMA + PROTOCOL",
    body: `Validates machine-readable data against ${COVERAGE.schemas} pinned official schemas. A conforming structure does not prove that its claims agree with the merchant record.`,
  },
  {
    id: "fees",
    label: "NYC FEE-CAP",
    body: `Evaluates delivery fee statements against ${COVERAGE.feeRulesTotal} codified rules from NYC §20-563.3: ${COVERAGE.feeExecutable} executable checks and ${COVERAGE.feeExternal} that require external evidence. The full audit appears on the fee-cap page.`,
  },
];

const LIMITS: Array<{ id: string; title: string; body: string }> = [
  {
    id: "L-01",
    title: "External evidence",
    body: "Six fee-cap rules depend on evidence beyond the supplied statement. Those cases remain unresolved rather than being forced into pass or fail.",
  },
  {
    id: "L-02",
    title: "Fee basis",
    body: "A fee conclusion that depends on purchase price remains provisional until that value is supported by inspectable evidence.",
  },
  {
    id: "L-03",
    title: "Structural boundary",
    body: "Schema and protocol conformance establish valid structure. They do not establish merchant truth.",
  },
  {
    id: "L-04",
    title: "Input boundary",
    body: "The verifier evaluates only the inputs it receives. It does not infer missing facts, completeness, or freshness.",
  },
];

export default function Landing() {
  return (
    <main className="lp-main">
      {/* ===== HERO — the commons scene (v8) ===== */}
      <CommonsScene ctaPrimary="Watch the order scene" ctaSecondary="Inspect a held claim">
        <p className="cs-eyebrow">
          <span className="cs-eyebrow-dot" aria-hidden="true" />
          THE PROOF LAYER FOR AGENTIC COMMERCE
        </p>
        <h1 id="hero-h1" className="cs-h1">
          Dinner, ready for an agent.
          <br />
          <span className="cs-h1-lit">Proven in the commons.</span>
        </h1>
        <p className="cs-lede">
          In this illustrative order, the menu makes its claims and the kitchen keeps its own
          record. Curbside Commons reads one against the other, forming proof an agent can consult
          before an order is placed.
        </p>
      </CommonsScene>

      {/* ===== 01 / THE FIRST CLAIM ===== */}
      <section
        id="proof"
        className="ds-wrap ds-section cc-chapter cc-proof"
        aria-labelledby="proof-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">01 / THE FIRST CLAIM</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="proof-h2" className="lp-h2">
            A price that cannot pass.
          </h2>
          <p className="lp-foot">
            The menu serves {PROOF_BAR.menuValue}. The kitchen&rsquo;s own record says{" "}
            {PROOF_BAR.recordValue}. The commons holds the claim because it is {PROOF_BAR.factor}{" "}
            the record — the completed examination is already on the bench: the value, rule,
            arithmetic, and record, resolved into one supported finding. Replay the check to watch
            it resolve again.
          </p>
        </Reveal>
        <Reveal>
          <EvidenceBench bench={BENCH} findings={FINDINGS_INDEX} />
        </Reveal>
      </section>

      {/* ===== 02 / HOW THE COMMONS PROVES IT — three moves + the proof bar ===== */}
      <section
        id="method"
        className="ds-wrap ds-section cc-chapter cc-method"
        aria-labelledby="method-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">02 / HOW THE COMMONS PROVES IT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="method-h2" className="lp-h2">
            Three moves. Each can be checked.
          </h2>
        </Reveal>
        <Reveal>
          <div className="tm-grid">
            <div className="tm-card">
              <div className="tm-card-head">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <rect x="11" y="6" width="26" height="36" rx="6" stroke="#4a4e5a" strokeWidth="1.9" />
                  <path d="M17 15h14" stroke="#3d5ceb" strokeWidth="1.9" strokeLinecap="round" />
                  <path d="M17 22h14M17 29h9" stroke="#8d919c" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
                <span className="tm-num">01</span>
              </div>
              <h3 className="tm-title">The claim</h3>
              <p className="tm-body">
                A menu says what it offers &mdash; dishes, prices, availability. Every line is a
                claim an agent would otherwise have to take on faith.
              </p>
            </div>
            <div className="tm-card">
              <div className="tm-card-head">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M10 18l3-8h22l3 8" stroke="#4a4e5a" strokeWidth="1.9" strokeLinejoin="round" />
                  <path d="M10 18h28" stroke="#4a4e5a" strokeWidth="1.9" strokeLinecap="round" />
                  <path d="M17 10.5V18M24 10.5V18M31 10.5V18" stroke="#3d5ceb" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
                  <path d="M13 18v20h22V18" stroke="#4a4e5a" strokeWidth="1.9" strokeLinejoin="round" />
                </svg>
                <span className="tm-num">02</span>
              </div>
              <h3 className="tm-title">The record</h3>
              <p className="tm-body">
                The kitchen&rsquo;s own log records what is actually offered, at what price, in
                the merchant&rsquo;s own words.
              </p>
            </div>
            <div className="tm-card">
              <div className="tm-card-head">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="16" stroke="#4a4e5a" strokeWidth="1.9" />
                  <path d="M17.5 24.5l4.5 4.5 9-11" stroke="#2438d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="tm-num">03</span>
              </div>
              <h3 className="tm-title">The proof</h3>
              <p className="tm-body">
                The commons reads the claim against the record, preserves the comparison, and
                holds any claim that does not agree.
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <MethodRelation details={METHOD} />
        </Reveal>
        {/* The proof-object bar — every value is the real held-claim specimen. */}
        <Reveal>
          <div className="pb-bar" aria-label="The held claim, as a proof object">
            <span aria-hidden="true" className="pb-dot" />
            <code className="pb-line">
              {PROOF_BAR.verdict} &nbsp;&middot;&nbsp; <b>THE MENU:</b> {PROOF_BAR.menuValue}{" "}
              &nbsp;&middot;&nbsp; <i>THE KITCHEN RECORD:</i> {PROOF_BAR.recordValue}{" "}
              &nbsp;&middot;&nbsp; CLAIM: {PROOF_BAR.factor} THE RECORD
            </code>
            <span className="pb-flag">{PROOF_BAR.verdict}</span>
          </div>
        </Reveal>
      </section>

      {/* ===== 03 / THE LISTINGS AUDIT ===== */}
      <section
        id="listings"
        className="ds-wrap ds-section cc-chapter cc-coverage"
        aria-labelledby="listings-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">03 / THE LISTINGS AUDIT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="listings-h2" className="lp-h2">
            One report. Sixteen findings.
          </h2>
          <p className="lp-foot">
            The worked example ends in {COVERAGE.verdict}: {COVERAGE.errors} errors and{" "}
            {COVERAGE.warns} warnings across {COVERAGE.findingsTotal} findings. Each finding keeps
            the claim beside the record that answered it. The order scene follows the same evidence
            toward an order and shows what happens when a claim is held &mdash; it is an order
            scene, not a marketplace connection.
          </p>
          <div className="ch-links">
            <Link className="lp-btn primary" href="/report">
              Read the listings report
            </Link>
            <Link className="lp-btn ghost" href="/demo">
              Follow the order scene
            </Link>
            <Link className="lp-btn ghost" href="/playground">
              Check a feed in your browser
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== 04 / THE FEE-CAP AUDIT ===== */}
      <section
        id="fees"
        className="ds-wrap ds-section cc-chapter cc-fees"
        aria-labelledby="fees-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">04 / THE FEE-CAP AUDIT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="fees-h2" className="lp-h2">
            The statement, read against the law.
          </h2>
          <p className="lp-foot">
            Delivery-fee statements meet {COVERAGE.feeRulesTotal} codified rules from NYC
            Administrative Code &sect;20-563.3, with four example months showing violations, a
            clean result, a refund that cures, and a refund window still open.{" "}
            {COVERAGE.feeExecutable} rules can be checked from the statement itself;{" "}
            {COVERAGE.feeExternal} require external evidence and stay honestly unresolved.
          </p>
          <div className="ch-links">
            <Link className="lp-btn primary" href="/fees">
              Open the fee-cap audit
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== 05 / THE LIMITS STAY VISIBLE ===== */}
      <section
        id="limits"
        className="ds-wrap ds-section cc-chapter cc-limits cc-limits-sec"
        aria-labelledby="limits-h2"
      >
        <div className="cc-limits-grid">
          <div className="cc-limits-thesis">
            <Reveal>
              <p className="lp-eyebrow">05 / THE LIMITS STAY VISIBLE</p>
              <span className="lp-sec-rule" aria-hidden="true" />
              <h2 id="limits-h2" className="lp-h2">
                Out of focus stays unresolved.
              </h2>
              <p className="lp-foot">
                The audit names its limits, states its assumed fee basis, and does not claim facts
                beyond the input. A useful verifier knows when to stop.
              </p>
            </Reveal>
          </div>
          <Reveal as="section" className="cc-limits-notes-wrap">
            <ol className="cc-limits-notes">
              {LIMITS.map((n) => (
                <li className="cc-note" key={n.id}>
                  <span className="cc-note-idx mono" aria-hidden="true">
                    {n.id}
                  </span>
                  <div className="cc-note-copy">
                    <h3 className="cc-note-title">
                      <span className="cc-note-idx-sr">{n.id}. </span>
                      {n.title}
                    </h3>
                    <p className="cc-note-body">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ===== 06 / EVIDENCE, MEASURED ===== */}
      <section
        id="coverage"
        className="ds-wrap ds-section cc-chapter cc-evidence"
        aria-labelledby="coverage-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">06 / EVIDENCE, MEASURED</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="coverage-h2" className="lp-h2">
            Every label has to be earned.
          </h2>
          <p className="lp-foot">
            Coverage is reported as findings, schemas, and rules &mdash; not as a broad success
            score. The evidence pages carry the earned labels, including a first-attempt DEFER,
            alongside the checks that keep the runtime at $0.
          </p>
        </Reveal>
        <Reveal>
          <CoverageTabs tabs={COVERAGE_TABS} />
        </Reveal>
        <Reveal>
          <div className="ch-links">
            <Link className="lp-btn ghost" href="/eval">
              Evidence
            </Link>
            <Link className="lp-btn ghost" href="/metrics">
              Measurables
            </Link>
            <Link className="lp-btn ghost" href="/cost">
              $0 cost
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== CLOSE — PROOF BEFORE THE ORDER ===== */}
      <section
        id="close"
        className="ds-wrap ds-section cc-close"
        aria-labelledby="close-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">PROOF BEFORE THE ORDER</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="close-h2" className="lp-h2">
            Let the record have the last word.
          </h2>
          <p className="lp-foot">
            Inspect the report, follow the illustrative order scene, or supply a feed for the
            browser audit. The result is proof an agent can consult before an order is placed.
          </p>
          <div className="cc-hero-cta cc-close-cta">
            <Link className="lp-btn primary" href="/report">
              Read the listings report
            </Link>
            <Link className="lp-btn ghost" href="/fees">
              Open the fee-cap audit
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
