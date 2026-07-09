import type { ReactNode } from "react";
import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/product";
import { CatchPanel } from "@/components/landing/CatchPanel";
import { Reveal } from "@/components/landing/Reveal";

// Short, honest headline. The root layout title template appends the product name,
// so no brand token is hardcoded here (identity renders via PLATFORM_NAME in prose).
export const metadata = {
  title: "Merchant activation, with every claim checked",
  description:
    "AI drafts your merchant outreach; every claim is checked against that merchant's own record, and nothing false reaches a merchant without a person signing off. A simulated prototype — not affiliated with any marketplace.",
};

/* ---- monoline icon set (ported from the Oxblood v2 mockup; currentColor, no fills) ---- */
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
  filter: <path d="M3 4h14l-5.2 6.2v5.4l-3.6-1.9v-3.5z" />,
  record: (
    <>
      <rect x="3.2" y="2.5" width="13.6" height="15" rx="1.6" />
      <path d="M6.2 6.2h7.6M6.2 9.6h7.6M6.2 13h4.6" />
    </>
  ),
  pen: (
    <>
      <path d="M13.2 3.4l3.4 3.4L7.4 16H4v-3.4z" />
      <path d="M11.6 5l3.4 3.4" />
    </>
  ),
  alert: (
    <>
      <path d="M10 2.6l7.6 13.4H2.4z" />
      <path d="M10 8v3.6" />
      <circle cx="10" cy="14.2" r=".5" />
    </>
  ),
  scale: (
    <>
      <path d="M10 3v13M5 16h10M6.5 6l-3 5a2.5 2.5 0 005 0zM13.5 6l-3 5a2.5 2.5 0 005 0z" />
      <path d="M4 6h12" />
    </>
  ),
  spark: <path d="M6 8.5l3.4 3.4M4 4l1.2 3M16 4l-3.6 9.2L9 15z" />,
  arrow: <path d="M3.8 10h11M10.6 5.8l4.2 4.2-4.2 4.2" />,
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
 * The five-stage flow — a hairline-connected strip, NOT numbered 01/02/03 cards.
 * The two `gate` stages (the exact check + the independent reviewer) are the emphasised
 * checks; they carry the wine accent. Copy from the landing copy deck (Beat 5).
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
    kicker: "Your data",
    title: "The record",
    desc: "The merchant’s own record is the only thing a message is allowed to be true against.",
  },
  {
    icon: "pen",
    kicker: "Draft",
    title: "AI drafts from it",
    desc: "The AI writes the outreach from that record — not the open web, not typed-in text.",
  },
  {
    icon: "filter",
    kicker: "Gate · check",
    title: "Exact automatic check",
    desc: "Every fact must match a field in the record, exactly. Anything that doesn’t is flagged.",
    gate: true,
  },
  {
    icon: "eye",
    kicker: "Judge · check",
    title: "Independent reviewer",
    desc: "A separate AI reviewer flags anything the data can’t back — including facts slipped in casually.",
    gate: true,
  },
  {
    icon: "person",
    kicker: "Approve",
    title: "A person approves",
    desc: "Your reviewer approves, edits, or holds. Nothing sends itself; every decision lands on the trail.",
  },
];

const CHECKS: Array<{ icon: keyof typeof ICON_PATHS; title: string; desc: string }> = [
  {
    icon: "check",
    title: "An exact, automatic check",
    desc: "Every fact the message states is matched, exactly, against the merchant’s record. No match, no pass.",
  },
  {
    icon: "eye",
    title: "An independent second reviewer",
    desc: "A separate AI reviewer re-reads the message for anything the record can’t back. It doesn’t grade its own work.",
  },
  {
    icon: "person",
    title: "A person signs off",
    desc: "Anything in question is held for your team. Approve, edit, or hold. Nothing sends itself.",
  },
];

const QUESTIONS: Array<{ head: string; body: ReactNode }> = [
  {
    head: "We measure it against human judgment.",
    body: "A calibration run has cleared its pre-registered bar on a held-out set · figures stay unpublished until a larger validation run confirms them.",
  },
  {
    head: "It’s tuned to hold, not to over-block.",
    body: "A false hold costs a glance; a shipped falsehood costs trust.",
  },
  {
    head: "The exact check underneath is locked.",
    body: "The deterministic comparison is fixed and auditable — it can’t drift.",
  },
];

export default function Landing() {
  return (
    <main className="lp-main">
      {/* ===== HERO — the fixed honest headline + the shown catch ===== */}
      <section className="ds-wrap lp-hero" aria-labelledby="hero-h1">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">
              <Icon name="shield" /> Merchant activation &middot; review &amp; approval
            </p>
            <h1 id="hero-h1">
              AI writes your merchant outreach &mdash; and nothing reaches a merchant until every
              claim is checked against <span className="lp-mark">their own data</span>.
            </h1>
            <p className="lp-lede">
              Each message is checked against <em>that merchant&rsquo;s own record</em>
              {" "}
              before it can send. A confident-sounding claim the data can&rsquo;t back is held for a
              person &mdash; never sent on its own.
            </p>
            <div className="lp-cta-row">
              <Link className="lp-btn primary" href="/console">
                See it run on the console <Icon name="arrow" />
              </Link>
              <a className="lp-btn ghost" href="#how">
                How the checking works
              </a>
            </div>
          </div>

          {/* the SHOWN catch — settled in SSR, replays only when motion is on */}
          <aside
            className="lp-hero-aside"
            aria-label="A recorded outreach draft, checked and held for approval"
          >
            <CatchPanel />
          </aside>
        </div>
      </section>

      {/* ===== TRUST ANCHOR — three checks ===== */}
      <section className="ds-wrap ds-section" id="checks" aria-labelledby="checks-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="shield" /> How a message earns the right to send
          </p>
          <h2 id="checks-h2" className="lp-h2">
            Three checks stand between the AI and a merchant.
          </h2>
        </Reveal>
        <Reveal stagger>
          <div className="lp-grid3">
            {CHECKS.map((c) => (
              <div className="lp-panel" key={c.title}>
                <Icon name={c.icon} className="lp-si" />
                <h3 className="lp-h3">{c.title}</h3>
                <p className="lp-ptext">{c.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="lp-foot">
            And we don&rsquo;t ask you to take it on faith: we measure{" "}
            <em>how often the AI reviewer agrees with human reviewers</em>, and tune it to err
            toward holding rather than letting something slip through.
          </p>
        </Reveal>
      </section>

      {/* ===== THE GAP — hallucination ===== */}
      <section className="ds-wrap ds-section" id="gap" aria-labelledby="gap-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="alert" /> Why an ordinary safety check isn&rsquo;t enough
          </p>
          <h2 id="gap-h2" className="lp-h2">
            An AI hallucination sounds just as confident as the truth.
          </h2>
          <p className="lp-lede lp-lede-wide">
            When AI states something that isn&rsquo;t true for a merchant, the industry calls it a{" "}
            <em>hallucination</em> &mdash; a fabrication that reads exactly as confident as a fact.
            Most AI safety checks read the <em>tone</em>
            {" "}
            of a message: is it rude, off-policy, leaking personal data? They don&rsquo;t check
            whether what it said is{" "}
            <em>true for this merchant</em>. So &ldquo;you&rsquo;ll be live by Friday,&rdquo; written
            for an account with no go-live date, sails straight through.
          </p>
        </Reveal>
      </section>

      {/* ===== HOW IT WORKS — the 5-stage hairline-connected flow (not numbered) ===== */}
      <section className="ds-wrap ds-section" id="how" aria-labelledby="how-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="filter" /> How it works
          </p>
          <h2 id="how-h2" className="lp-h2">
            The AI is checked, not trusted.
          </h2>
          <p className="lp-lede lp-lede-wide">
            Five stages. Cheap, exact checks run before the slower ones; an independent reviewer
            runs near the end; a person always has the last word.
          </p>
        </Reveal>
        <Reveal stagger>
          <div className="lp-flow" role="list" aria-label="The five-stage checking flow">
            {FLOW.map((s) => (
              <div className={`lp-step${s.gate ? " gate" : ""}`} role="listitem" key={s.title}>
                <Icon name={s.icon} className="lp-si" />
                <span className="lp-sk">{s.kicker}</span>
                <h3 className="lp-h4">{s.title}</h3>
                <p className="lp-ptext">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== DIFFERENTIATION — a safety filter vs the facts ===== */}
      <section className="ds-wrap ds-section" id="vs" aria-labelledby="vs-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="scale" /> What makes it different
          </p>
          <h2 id="vs-h2" className="lp-h2">
            A safety filter checks the message. We check the facts.
          </h2>
        </Reveal>
        <Reveal>
          <div className="lp-grid2">
            <div className="lp-panel">
              <div className="lp-role">an ordinary AI safety filter (&ldquo;guardrail&rdquo;)</div>
              <h3 className="lp-h3">&ldquo;Is this message appropriate?&rdquo;</h3>
              <p className="lp-ptext">Reads the message on its own.</p>
            </div>
            <div className="lp-panel ours">
              <div className="lp-role">{PLATFORM_NAME}</div>
              <h3 className="lp-h3">&ldquo;Is this message true for this merchant?&rdquo;</h3>
              <p className="lp-ptext">
                Every claim checked against the data row; an exact check, then an independent
                reviewer; evidence on every line, held for a person. Reads the message{" "}
                <em>against the record</em>.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== THE OBVIOUS QUESTION — method only, no figures ===== */}
      <section className="ds-wrap ds-section" id="reviewer" aria-labelledby="rev-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="spark" /> The obvious question
          </p>
          <h2 id="rev-h2" className="lp-h2">
            &ldquo;How do you know the AI reviewer is right?&rdquo;
          </h2>
          <p className="lp-lede lp-lede-wide">
            Fair question &mdash; so we don&rsquo;t ask you to assume it.{" "}
            <em>We check the reviewer against people.</em>
          </p>
        </Reveal>
        <Reveal stagger>
          <div className="lp-grid3">
            {QUESTIONS.map((q) => (
              <div className="lp-panel" key={q.head}>
                <div className="lp-qh">{q.head}</div>
                <p className="lp-ptext">{q.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== CLOSE — see it run + the honesty disclosure ===== */}
      <section className="ds-wrap ds-section" id="run" aria-labelledby="run-h2">
        <Reveal>
          <p className="lp-eyebrow">
            <Icon name="arrow" /> See it run
          </p>
          <h2 id="run-h2" className="lp-h2">
            Watch one draft get checked, line by line.
          </h2>
          <div className="lp-cta-row lp-cta-close">
            <Link className="lp-btn primary" href="/console">
              See it run on the console <Icon name="arrow" />
            </Link>
            <span className="lp-cta-note">a recorded, replayable run &mdash; not a sign-up.</span>
          </div>
          <p className="lp-note">
            A simulated prototype on de-identified, public open data. Merchant and reviewer names are
            fictional. Not affiliated with DoorDash, Uber Eats, Grubhub, or any marketplace. The
            walkthrough is a recorded, replayable run &mdash; labeled, not live &mdash; and accuracy
            figures are held until a larger validation run confirms them. Human-led, AI-assisted,
            professionally reviewed.
          </p>
          <p className="ds-mono lp-strip">
            SIMULATED &middot; FICTIONAL NAMES &middot; NO REAL MERCHANT DATA &middot; NOT AFFILIATED
            WITH ANY MARKETPLACE &middot; REPLAY / RECORDED &middot; FIGURES PENDING VALIDATION
            &middot; HUMAN-LED, AI-ASSISTED, PROFESSIONALLY REVIEWED
          </p>
        </Reveal>
      </section>
    </main>
  );
}
