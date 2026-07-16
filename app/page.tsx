import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { CorrespondenceHero } from "@/components/landing/CorrespondenceHero";
import { EvidenceBench } from "@/components/landing/EvidenceBench";
import { MethodRelation } from "@/components/landing/MethodRelation";
import { CoverageTabs, type CoverageTab } from "@/components/landing/CoverageTabs";
import { BENCH, METHOD, COVERAGE } from "@/lib/landing/specimen";

// Landing — the approved "Correspondence Field" arc (docs/redesign-blueprint-2026-07-14.md,
// authored by gpt-5.6-sol, adjudicated primary-model-final). One evidence language across
// six chapters: Hero → 01 Evidence Bench → 02 Method → 03 Coverage → 04 Limits → Close, each
// with a chapter accent hue (proof ember · method violet · coverage azure · limits gold). All
// counts and specimen figures are grounded in the engine measurables via lib/landing/specimen.ts
// (never hand-typed). Built on the B1 pure-white token system: hairlines, radii ≤6px, near-flat.
export const metadata = {
  title: "Check every claim against the record",
  description:
    "Curbside Commons deterministically checks machine-readable menu and catalog claims against a merchant's own record, validates schema and protocol conformance, and audits NYC delivery fee-cap statements — with evidence attached to every finding.",
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
    body: `Evaluates delivery fee statements against ${COVERAGE.feeRulesTotal} codified rules from NYC §20-563.3: ${COVERAGE.feeExecutable} executable checks and ${COVERAGE.feeExternal} that require external evidence.`,
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
      {/* ===== HERO — the Prismatic Passline behind centered copy ===== */}
      <CorrespondenceHero>
        <p className="cc-eyebrow mono">PROOF BEFORE TRUST</p>
        <h1 id="hero-h1" className="cc-hero-title">
          Check every claim <span className="cc-hero-lit">against the record</span>.
        </h1>
        <p className="cc-hero-lede">
          Curbside Commons compares machine-readable menu and catalog claims with a merchant&rsquo;s
          own records. It also validates data formats and audits NYC delivery fee-cap statements, with
          evidence attached to every finding.
        </p>
        <div className="cc-hero-cta">
          <Link className="lp-btn primary" href="#proof">
            Inspect one claim
          </Link>
          <Link className="lp-btn ghost" href="#method">
            See the method
          </Link>
        </div>
      </CorrespondenceHero>

      {/* ===== 01 / EVIDENCE BENCH — ember ===== */}
      <section
        id="proof"
        className="ds-wrap ds-section cc-chapter cc-proof"
        aria-labelledby="proof-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">01 / EVIDENCE BENCH</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="proof-h2" className="lp-h2">
            See the mismatch before reading the receipt.
          </h2>
          <p className="lp-foot">
            The machine-readable claim displays {BENCH.claim.money}. The merchant record states{" "}
            {BENCH.record.money}. A valid structure does not make a price true — a well-formed listing
            can still misstate the amount. The completed examination is already on the bench: the
            value, rule, arithmetic, and record, resolved into one supported finding. Replay the
            check to watch it resolve again.
          </p>
        </Reveal>
        <Reveal>
          <EvidenceBench bench={BENCH} />
        </Reveal>
      </section>

      {/* ===== 02 / METHOD — violet ===== */}
      <section
        id="method"
        className="ds-wrap ds-section cc-chapter cc-method"
        aria-labelledby="method-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">02 / METHOD</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="method-h2" className="lp-h2">
            A verdict is a relationship, not a label.
          </h2>
        </Reveal>
        <Reveal>
          <MethodRelation details={METHOD} />
        </Reveal>
      </section>

      {/* ===== 03 / MEASURED COVERAGE — azure ===== */}
      <section
        id="coverage"
        className="ds-wrap ds-section cc-chapter cc-coverage"
        aria-labelledby="coverage-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">03 / MEASURED COVERAGE</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="coverage-h2" className="lp-h2">
            Coverage is measured, not implied.
          </h2>
          <p className="lp-foot">
            Coverage is reported as findings, schemas, and rules — not as a broad success score.
          </p>
        </Reveal>
        <Reveal>
          <CoverageTabs tabs={COVERAGE_TABS} />
        </Reveal>
      </section>

      {/* ===== 04 / HONEST LIMITS — gold, static sticky thesis + margin notes ===== */}
      <section
        id="limits"
        className="ds-wrap ds-section cc-chapter cc-limits cc-limits-sec"
        aria-labelledby="limits-h2"
      >
        <div className="cc-limits-grid">
          <div className="cc-limits-thesis">
            <Reveal>
              <p className="lp-eyebrow">04 / HONEST LIMITS</p>
              <span className="lp-sec-rule" aria-hidden="true" />
              <h2 id="limits-h2" className="lp-h2">
                Honesty belongs in the interface.
              </h2>
              <p className="lp-foot">A useful verifier knows when to stop.</p>
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

      {/* ===== CLOSE — THE STANDARD ===== */}
      <section
        id="close"
        className="ds-wrap ds-section cc-close"
        aria-labelledby="close-h2"
      >
        <Reveal>
          <p className="lp-eyebrow">THE STANDARD</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="close-h2" className="lp-h2">
            Make the conclusion as inspectable as the claim.
          </h2>
          <p className="lp-foot">
            A trustworthy finding should show its work. Read the claim, governing reference, rule,
            and evidence, then reach the same conclusion yourself.
          </p>
          <div className="cc-hero-cta cc-close-cta">
            <Link className="lp-btn primary" href="#proof">
              Review the proof
            </Link>
            <Link className="lp-btn ghost" href="/report">
              Open the verifier report
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
