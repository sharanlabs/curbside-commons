import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { TruthCatch } from "@/components/landing/TruthCatch";
import { ENGINE, CALIBRATION, L1 } from "@/lib/dashboard/evidence";

// S6b landing — the owner-adopted "Gallery Cards B-2" design language
// (mockups/variation-b2-gallery-cards-2026-07-13.html) translated onto the
// canonical truth-engine landing. Same Oxblood tokens; B-2 adds the self-drawing
// logo, the cartographic hero line field + drifting survey line, icon-tile card
// medallions, section-rule reveals, and hover micro-transitions. Every honesty
// disclosure stays byte-identical; the shown catch stays imported from the golden
// (TruthCatch), never hardcoded. The root layout title template appends the
// product name; identity renders via the layout, not hardcoded here.
export const metadata = {
  title: "The truth layer for agentic commerce",
  description:
    "A deterministic verifier for agentic commerce: the serving copy an AI shopping agent reads, checked line by line against the merchant's own system-of-record — schema conformance, listings truth, and NYC fee-cap audit. Simulated corpus; $0 runtime; not affiliated with any marketplace.",
};

/* ---- monoline icon set (Oxblood system; currentColor, no fills) ---- */
const ICON_PATHS: Record<string, ReactNode> = {
  shield: (
    <>
      <path d="M10 2.2l6.4 2.4v4.2c0 4.2-2.7 6.7-6.4 8.4-3.7-1.7-6.4-4.2-6.4-8.4V4.6z" />
      <path d="M6.8 10.2l2.2 2.2 4.4-4.6" />
    </>
  ),
  check: <path d="M3.8 10.4l3.6 3.6L16.2 5.6" />,
  eye: (
    <>
      <path d="M2.5 10S5.5 4.8 10 4.8 17.5 10 17.5 10 14.5 15.2 10 15.2 2.5 10 2.5 10z" />
      <circle cx="10" cy="10" r="2.4" />
    </>
  ),
  person: (
    <>
      <circle cx="10" cy="6.6" r="3" />
      <path d="M4.2 16.8c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4" />
    </>
  ),
  record: (
    <>
      <rect x="3.2" y="2.5" width="13.6" height="15" rx="1.6" />
      <path d="M6.2 6.2h7.6M6.2 9.6h7.6M6.2 13h4.6" />
    </>
  ),
  copies: (
    <>
      <rect x="2.8" y="5.4" width="11" height="12" rx="1.4" />
      <path d="M6.4 2.6h9.2a1.4 1.4 0 011.4 1.4v9.6" />
    </>
  ),
  scale: (
    <>
      <path d="M10 3v13M5 16h10M6.5 6l-3 5a2.5 2.5 0 005 0zM13.5 6l-3 5a2.5 2.5 0 005 0z" />
      <path d="M4 6h12" />
    </>
  ),
  alert: (
    <>
      <path d="M10 2.6l7.6 13.4H2.4z" />
      <path d="M10 8v3.6" />
      <circle cx="10" cy="14.2" r=".5" />
    </>
  ),
  arrow: <path d="M3.8 10h11M10.6 5.8l4.2 4.2-4.2 4.2" />,
  spark: <path d="M6 8.5l3.4 3.4M4 4l1.2 3M16 4l-3.6 9.2L9 15z" />,
};

function Icon({ name, className = "lp-ic" }: { name: keyof typeof ICON_PATHS; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/**
 * The hero's cartographic line field (B-2 floor ④) — a layered contour field on
 * the pure ground. Ink-only line-work: no gradients, no tinted washes. Paths are
 * drawn by default (fully visible under reduced-motion / no-JS); under allowed
 * motion they self-draw on load and one dashed survey line drifts slowly. Purely
 * decorative → aria-hidden.
 */
function HeroField() {
  return (
    <svg
      className="lp-hero-field"
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path pathLength="1" className="f1" d="M-40 520 C 240 430, 520 610, 780 500 S 1240 380, 1480 460" />
      <path pathLength="1" className="f2" d="M-40 420 C 300 330, 560 500, 860 400 S 1280 300, 1480 360" />
      <path pathLength="1" className="f3" d="M-40 610 C 360 540, 640 690, 980 590 S 1320 500, 1480 560" />
      <path pathLength="1" className="f4" d="M1480 120 C 1180 200, 900 60, 640 150 S 200 260, -40 190" />
      <path pathLength="1" className="f5" d="M-40 320 C 340 250, 620 400, 940 310 S 1300 220, 1480 270" />
      <path pathLength="1" className="f6" d="M1480 40 C 1140 110, 860 -10, 560 70 S 160 170, -40 110" />
      <path className="survey" d="M-40 470 C 280 385, 540 555, 820 450 S 1260 340, 1480 410" />
      <g className="ticks">
        <path d="M120 500 V488" />
        <path d="M320 452 V440" />
        <path d="M520 512 V500" />
        <path d="M720 470 V458" />
        <path d="M920 420 V408" />
        <path d="M1120 405 V393" />
        <path d="M1320 398 V386" />
      </g>
    </svg>
  );
}

/** The verifier seal (B-2 floor ③ companion) — a monoline shield-over-baseline
 *  medallion in the hero corner. Self-draws under allowed motion; complete and
 *  static otherwise. Carries a real accessible label. */
function HeroSeal() {
  return (
    <svg className="lp-hero-seal" viewBox="0 0 120 120" role="img" aria-label="Verifier seal — verified against the record">
      <defs>
        <path id="lp-sealring" d="M60 12 A48 48 0 1 1 59.9 12" />
      </defs>
      <circle className="draw" cx="60" cy="60" r="54" pathLength="1" />
      <text className="ringtext">
        <textPath href="#lp-sealring" startOffset="1%">
          VERIFIED AGAINST THE RECORD &#183; CURBSIDE COMMONS &#183;{" "}
        </textPath>
      </text>
      <path className="draw d2" d="M60 40 L80 47 V64 C80 77 71 85 60 90 C49 85 40 77 40 64 V47 Z" pathLength="1" />
      <path className="draw d3" d="M50 63 L57 70 L71 55" pathLength="1" />
    </svg>
  );
}

/**
 * The five-stage flow — B-2 icon-tile cards. The two `gate` stages are the
 * deterministic checks; their kicker carries the wine accent.
 */
const FLOW: Array<{
  icon: keyof typeof ICON_PATHS;
  kicker: string;
  title: string;
  desc: string;
  gate?: boolean;
}> = [
  {
    icon: "record",
    kicker: "Ground truth",
    title: "The merchant's own record",
    desc: "The system-of-record — the catalog, prices, and availability the restaurant itself maintains — is the only thing a listing is allowed to be true against.",
  },
  {
    icon: "copies",
    kicker: "What agents read",
    title: "The serving copies",
    desc: "Platforms serve agent-readable copies of that record (ACP- and UCP-shaped feeds). This is what an AI shopping agent actually reads — and where drift lives.",
  },
  {
    icon: "scale",
    kicker: "Gate · truth",
    title: "Line-by-line comparison",
    desc: "A deterministic comparator checks every claim in the copy against the record, exactly. No AI calls, $0, same input → same report.",
    gate: true,
  },
  {
    icon: "eye",
    kicker: "Gate · receipts",
    title: "Evidence, not vibes",
    desc: "Every finding carries its receipts: the claim id, the rule that caught it, and the record row it failed against — auditable end to end.",
    gate: true,
  },
  {
    icon: "person",
    kicker: "Act",
    title: "Humans stay in the loop",
    desc: "Findings become recommendations — reports, drafts, deliveries — behind explicit human gates. Nothing sends itself.",
  },
];

const MODULES: Array<{ icon: keyof typeof ICON_PATHS; title: string; desc: ReactNode }> = [
  {
    icon: "check",
    title: "Listings truth check",
    desc: "The serving copy vs the system-of-record, line by line — availability, price, existence, encoding. The committed demo report catches a sold-out item still being served.",
  },
  {
    icon: "copies",
    title: "Protocol conformance",
    desc: (
      <>
        Validation against {ENGINE.ucpSchemaCount} pinned official UCP schemas (spec{" "}
        {ENGINE.ucpSpecVersion}) — and the headline it exists to prove: a feed can be
        schema-conformant and still false against the merchant&rsquo;s records. Both legs are
        machine-checked.
      </>
    ),
  },
  {
    icon: "scale",
    title: "Fee-cap audit",
    desc: (
      <>
        NYC &sect;20-563.3 codified as {ENGINE.feeRulesTotal} rules ({ENGINE.feeRulePredicates}{" "}
        executable predicates + {ENGINE.feeRulesNonCheckable} registered non-checkable clauses) over
        hostile, relabeled statement lines — with a calibrated classifier in front and the
        deterministic table deciding.
      </>
    ),
  },
];

export default function Landing() {
  return (
    <main className="lp-main">
      {/* ===== HERO — canonical product; cartographic line field + seal (B-2) ===== */}
      <section className="lp-hero" aria-labelledby="hero-h1">
        <HeroField />
        <HeroSeal />
        <div className="ds-wrap lp-hero-inner">
          <p className="lp-eyebrow">
            <Icon name="shield" /> Commerce truth verification &middot; simulated prototype
          </p>
          <h1 id="hero-h1">
            AI agents are starting to buy what platforms serve them. This engine checks the
            serving copy, line by line, against{" "}
            <span className="lp-mark">the merchant&rsquo;s own records</span>.
          </h1>
          <p className="lp-lede">
            A menu copy can pass every schema check and still offer a dish the restaurant sold out
            of. The verifier is deterministic — no AI calls, $0 to run — and every finding ships
            with its receipts.
          </p>
          <div className="lp-cta-row">
            <Link className="lp-btn primary" href="/report">
              Read the verifier report <Icon name="arrow" />
            </Link>
            <Link className="lp-btn ghost" href="/demo">
              Watch an agent get caught
            </Link>
          </div>
        </div>
      </section>

      {/* ===== THE SHOWN CATCH — imported golden, styled as a B-2 gallery panel ===== */}
      <section className="ds-wrap ds-section lp-sec" id="catch" aria-labelledby="catch-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="scale" /> Demo report &middot; verified against the record
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="catch-h2" className="lp-h2">
            The serving copy, checked against the merchant&rsquo;s records.
          </h2>
          <p className="lp-foot" style={{ maxWidth: "70ch" }}>
            A condensed excerpt of the committed demo report — the same golden the full report
            renders, with the verdict, tally, and findings imported straight from the fixture. The
            verifier is deterministic and makes no AI calls at runtime, so the same input always
            produces the same report.
          </p>
        </Reveal>
        <Reveal>
          <aside className="lp-catch-wrap" aria-label="Two findings from the committed demo report">
            <TruthCatch />
          </aside>
        </Reveal>
      </section>

      {/* ===== THE PROBLEM — conformant is not true ===== */}
      <section className="ds-wrap ds-section lp-sec" id="problem" aria-labelledby="problem-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="alert" /> The gap this engine exists for
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="problem-h2" className="lp-h2">
            Schema-conformant is not the same as true.
          </h2>
          <p className="lp-foot" style={{ maxWidth: "72ch" }}>
            Agentic-commerce protocols standardize the <em>shape</em> of what agents read; nothing
            in the shape guarantees the <em>content</em> matches the merchant&rsquo;s reality. The
            repo commits a spec-valid feed that passes every pinned schema while lying about the
            catalog — the conformance leg passes it, the truth leg catches it. That pair is the
            product in one sentence.
          </p>
        </Reveal>
      </section>

      {/* ===== HOW — the five-stage flow as icon-tile cards ===== */}
      <section className="ds-wrap ds-section lp-sec" id="how" aria-labelledby="how-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="scale" /> How a listing gets checked
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="how-h2" className="lp-h2">
            From the merchant&rsquo;s record to an evidence-cited verdict.
          </h2>
        </Reveal>
        <Reveal stagger className="lp-cardgrid c5">
          {FLOW.map((s, i) => (
            <article className={`lp-card${s.gate ? " gate" : ""}`} key={s.title}>
              <div className="lp-card-ic" aria-hidden="true">
                <Icon name={s.icon} className="lp-cardglyph" />
              </div>
              <span className="lp-card-idx" aria-hidden="true">
                {i + 1}
              </span>
              <span className={`lp-kicker${s.gate ? " gate" : ""}`}>{s.kicker}</span>
              <h3 className="lp-card-h3">{s.title}</h3>
              <p className="lp-card-desc">{s.desc}</p>
            </article>
          ))}
        </Reveal>
      </section>

      {/* ===== MODULES — three icon-tile cards ===== */}
      <section className="ds-wrap ds-section lp-sec" id="modules" aria-labelledby="modules-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="check" /> Three verification modules, one spine
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="modules-h2" className="lp-h2">
            Listings truth &middot; protocol conformance &middot; fee-cap audit.
          </h2>
        </Reveal>
        <Reveal stagger className="lp-cardgrid c3">
          {MODULES.map((m) => (
            <article className="lp-card" key={m.title}>
              <div className="lp-card-ic" aria-hidden="true">
                <Icon name={m.icon} className="lp-cardglyph" />
              </div>
              <span className="lp-kicker">Module</span>
              <h3 className="lp-card-h3">{m.title}</h3>
              <p className="lp-card-desc">{m.desc}</p>
            </article>
          ))}
        </Reveal>
      </section>

      {/* ===== EVIDENCE DISCIPLINE — honest prose kept byte-identical (calibration
              wording is a frozen honesty surface); restyled into the B-2 register ===== */}
      <section className="ds-wrap ds-section lp-sec" id="evidence" aria-labelledby="evidence-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="spark" /> Labels are earned here, or not claimed
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="evidence-h2" className="lp-h2">
            Every quality label traces to a pre-registered run.
          </h2>
        </Reveal>
        <Reveal>
          <p className="lp-foot" style={{ maxWidth: "72ch" }}>
            The fee-line classifier&rsquo;s first calibration run missed one floor and the label
            was <em>deferred</em> — that record stays public. A fresh pre-registered retry then
            cleared every floor ({CALIBRATION.retryRun.score}) and earned it. The live agent-crew
            run scored {L1.cases}/{L1.cases} against floors committed before the run — and only
            the two model-directed members carry the &ldquo;agent&rdquo; label, because that is
            what the pre-registration says the result licenses.{" "}
            <Link href="/eval" className="ds-mlink">
              The eval evidence dashboard
            </Link>{" "}
            traces every figure to its committed record.
          </p>
        </Reveal>
      </section>

      {/* ===== HONESTY + LINEAGE — frozen honesty prose; restyled register ===== */}
      <section className="ds-wrap ds-section lp-sec" id="honesty" aria-labelledby="honesty-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="person" /> What this is — and what it is not
          </p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 id="honesty-h2" className="lp-h2">
            A simulated prototype, honest about its own edges.
          </h2>
        </Reveal>
        <Reveal>
          <p className="lp-foot" style={{ maxWidth: "72ch" }}>
            The restaurant, its menu, and its records are invented; the verification rules, the
            pinned data-format standard, and the codified fee caps are real. The site is a static
            replay of committed fixtures — it initiates nothing. This project began as a merchant
            activation prototype; that first product is preserved, working, as{" "}
            <Link href="/legacy/console" className="ds-mlink">
              the legacy activation module
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </main>
  );
}
