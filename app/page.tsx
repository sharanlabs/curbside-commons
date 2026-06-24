import Link from "next/link";
import { CatchPanel } from "@/components/landing/CatchPanel";
import { Reveal } from "@/components/landing/Reveal";

export const metadata = {
  title: "ActivationOps — Merchant Activation review, with the facts checked",
  description:
    "A governed activation review surface for Merchant Operations: AI drafts merchant outreach, every claim is checked against that merchant's own record, and nothing false reaches a merchant without a person signing off. Simulated prototype; not affiliated with any marketplace.",
};

/** Small inline glyphs — no icon library on the landing, no emoji. */
function ArrowRight({ stroke = "#fff" }: { stroke?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h9M9 4.5L12.5 8 9 11.5"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5L8.5 6.5L4.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PIPELINE: Array<{ n: string; title: string; plain: string; gate?: boolean }> = [
  {
    n: "01",
    title: "Your data",
    plain: "The merchant's own record is the only thing a message is allowed to be true against.",
  },
  {
    n: "02",
    title: "AI drafts from it",
    plain:
      "The AI writes the outreach using that record — not the open web, and not the merchant's own typed-in text.",
  },
  {
    n: "03",
    title: "An exact automatic check",
    plain:
      "Every fact the message states has to match a field in the record, exactly. Anything that doesn't is flagged.",
    gate: true,
  },
  {
    n: "04",
    title: "An independent second reviewer",
    plain:
      "A separate AI reviewer re-reads the message and flags anything the data can't back — including facts slipped in casually.",
    gate: true,
  },
  {
    n: "05",
    title: "A person approves",
    plain:
      "Your reviewer approves, edits, or holds. Nothing sends itself, and every decision lands on the audit trail.",
  },
];

function BulletOpen() {
  return (
    <svg className="gl" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.4" fill="none" stroke="#9a9aa3" strokeWidth="1.4" />
    </svg>
  );
}
function BulletFilled() {
  return (
    <svg className="gl" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#0a0a0c" />
      <path
        d="M4.6 8.2l2.3 2.3L11.4 5.8"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Landing() {
  return (
    <main>
      {/* ===== BEAT 1 — HERO · outcome/gain first, the FIXED honest headline ===== */}
      <section className="ds-wrap lp-hero" aria-labelledby="hero-h1">
        <div className="lp-hero-grid">
          <div>
            <p className="ds-eyebrow">
              <span className="idx">A</span> Merchant Activation &middot; review &amp; approval
            </p>
            <h1 id="hero-h1">
              AI writes your merchant outreach &mdash; and nothing reaches a merchant until every
              claim is checked against <span className="mark-word">their own data</span>.
            </h1>
            <p className="sub">
              Each message is checked against <em>that merchant&rsquo;s own record</em>{" "}
              before it can be sent. A confident-sounding claim that the data doesn&rsquo;t back is
              held for a person &mdash; never sent on its own.
            </p>
            <div className="lp-hero-cta">
              <Link className="ds-cta" href="/console">
                See it run on the console
                <ArrowRight />
              </Link>
              <a className="lp-howlink" href="#how">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5.4" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M6.5 5.6v3.2M6.5 4.1v.1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                How the checking works
              </a>
            </div>
          </div>

          {/* supporting visual: the SHOWN catch — settled in SSR, replays only when motion is on */}
          <aside className="lp-hero-aside" aria-label="Example of a checked outreach draft, held for approval">
            <CatchPanel />
          </aside>
        </div>
      </section>

      {/* ===== BEAT 2 — TRUST ANCHOR · honest credibility, early. No logo wall. ===== */}
      <section className="ds-wrap ds-section" id="trust" aria-labelledby="trust-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">B</span> How a message earns the right to send
          </p>
          <h2 id="trust-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "18ch" }}>
            Three checks stand between the AI and a merchant.
          </h2>
        </Reveal>
        <Reveal>
          <div className="lp-anchor">
            <div className="lp-anchor-grid">
              <div className="lp-astep">
                <span className="an">
                  <span className="dot" />
                  Step one
                </span>
                <h3 className="ds-h3">An exact, automatic check</h3>
                <p>
                  Every fact the message states is matched, exactly, against the merchant&rsquo;s
                  record. No match, no pass.
                </p>
              </div>
              <div className="lp-astep">
                <span className="an">
                  <span className="dot" />
                  Step two
                </span>
                <h3 className="ds-h3">An independent second reviewer</h3>
                <p>
                  A separate AI reviewer re-reads the message looking for anything the record
                  can&rsquo;t back &mdash; it doesn&rsquo;t grade its own work.
                </p>
              </div>
              <div className="lp-astep">
                <span className="an signal">
                  <span className="dot" />
                  Step three
                </span>
                <h3 className="ds-h3">A person signs off</h3>
                <p>
                  Anything in question is held for your team. A person approves, edits, or holds.
                  Nothing sends itself.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <p className="lp-anchor-foot">
            And we don&rsquo;t ask you to take it on faith: we measure{" "}
            <em>how often the AI reviewer agrees with human reviewers</em>, and tune it to err
            toward holding rather than letting something slip through.
          </p>
        </Reveal>
      </section>

      {/* ===== BEAT 3 — THE GAP · introduce "hallucination" professionally ===== */}
      <section className="ds-wrap ds-section" id="gap" aria-labelledby="gap-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">C</span> Why an ordinary safety check isn&rsquo;t enough
          </p>
          <h2 id="gap-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "17ch" }}>
            An AI hallucination sounds just as confident as the truth.
          </h2>
          <p className="ds-lede" style={{ marginTop: 24 }}>
            When AI states something that isn&rsquo;t true for a merchant, the industry calls it a{" "}
            <em>hallucination</em> &mdash; a fabrication that reads exactly as confident as a real
            fact. Most AI safety checks read the <em>tone</em> of a message &mdash; is it rude,
            off-policy, leaking personal data? They don&rsquo;t check whether what it said is
            actually <em>true for this merchant</em>. So &ldquo;you&rsquo;ll be live by
            Friday,&rdquo; written for an account with no go-live date, sails straight through.
          </p>
          <details className="ds-tech">
            <summary>
              <Chevron /> Why a tone/safety filter structurally can&rsquo;t catch this
            </summary>
            <div className="tech-body">
              <p>
                A guardrail evaluates the text in isolation &mdash; toxicity, jailbreak patterns,
                regex for personal data. Faithfulness isn&rsquo;t a property of the text; it&rsquo;s
                a <em>relation</em> between the text and a record.
              </p>
              <p>
                It can only be checked by reconciling each asserted fact against the structured
                source of truth &mdash; the data row, not a retrieved passage. That reconciliation
                is exactly what a style/safety filter does not do.
              </p>
            </div>
          </details>
        </Reveal>
      </section>

      {/* ===== BEAT 4 — THE SHOWN CATCH (centerpiece) ===== */}
      <section className="ds-wrap ds-section" id="catch" aria-labelledby="catch-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">D</span> Caught and held
          </p>
          <h2 id="catch-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "21ch" }}>
            One made-up claim, held &mdash; checked against the merchant&rsquo;s own record.
          </h2>
          <p className="ds-lede" style={{ marginTop: 20 }}>
            A recorded draft, line by line. Two claims match the merchant&rsquo;s data and pass on
            their own; the one the record can&rsquo;t back &mdash; a go-live date that simply
            isn&rsquo;t there &mdash; is caught and held for a person. The reviewer&rsquo;s buttons
            are shown disabled because this is a recorded walkthrough.
          </p>
        </Reveal>
        <Reveal>
          <div style={{ marginTop: "var(--s6)", maxWidth: 560 }}>
            <CatchPanel />
          </div>
        </Reveal>
        <Reveal>
          <p className="lp-anchor-foot" style={{ marginTop: 24 }}>
            The same check runs on every draft in the queue. See it on a real example &mdash;{" "}
            <Link
              href="/console"
              style={{
                color: "var(--signal-text)",
                fontWeight: 600,
                textUnderlineOffset: 2,
              }}
            >
              open the console
            </Link>
            .
          </p>
          <details className="ds-tech">
            <summary>
              <Chevron /> For technical reviewers &middot; what &ldquo;checked&rdquo; means here
            </summary>
            <div className="tech-body">
              <p>
                Each declared claim is verified by per-claim <em>entailment</em> against the
                merchant&rsquo;s claimable fields, forward (claim&nbsp;&rarr;&nbsp;field): a
                supported claim cites its backing field; an unsupported one is held. A
                confident-sounding sentence with no field behind it &mdash; the go-live date &mdash;
                has nothing to entail against, so it fails.
              </p>
              <p>
                A second, <em>cross-family</em> reviewer then reads the prose in reverse
                (prose&nbsp;&rarr;&nbsp;data) to catch facts asserted in passing but never declared
                as claims. It runs on a different model family so the verifier isn&rsquo;t grading
                its own family&rsquo;s output &mdash; maker&nbsp;&ne;&nbsp;judge at the model layer.
              </p>
              <p className="mono-line">
                <span className="k">gate:</span> deterministic forward claim&rarr;field,
                byte-reproducible, eval-locked &nbsp;&middot;&nbsp; <span className="k">judge:</span>{" "}
                cross-family entailment, reverse prose&rarr;data, recall-favoring
              </p>
            </div>
          </details>
        </Reveal>
      </section>

      {/* ===== BEAT 5 — HOW IT WORKS · plain on top, technical opt-in ===== */}
      <section className="ds-wrap ds-section" id="how" aria-labelledby="how-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">E</span> How it works
          </p>
          <h2 id="how-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "20ch" }}>
            The AI is checked, not trusted.
          </h2>
          <p className="ds-lede" style={{ marginTop: 20 }}>
            Five stages. Cheap, exact checks run before the slower ones; an independent reviewer
            runs near the end; a person always has the last word.
          </p>
        </Reveal>
        <Reveal stagger>
          <div className="lp-pipe" role="list">
            {PIPELINE.map((p) => (
              <div className={`lp-prow${p.gate ? " gate" : ""}`} role="listitem" key={p.n}>
                <div className="pn">{p.n}</div>
                <div className="pmain">
                  <div className="ptop">
                    <h3 className="ds-h3">{p.title}</h3>
                    {p.gate ? <span className="check-tag">check</span> : null}
                  </div>
                  <p className="pl">{p.plain}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <details className="ds-tech">
            <summary>
              <Chevron /> For technical reviewers &middot; the real pipeline
            </summary>
            <div className="tech-body">
              <p>
                Stage 3 is a <em>deterministic</em> forward gate: declared claims are checked
                claim&nbsp;&rarr;&nbsp;field and the output is byte-for-byte reproducible &mdash; the
                fast, exact floor, pinned and eval-locked against a golden differential oracle. The
                merchant&rsquo;s untrusted name never enters the model prompt (an injection cut), so
                a hostile name can&rsquo;t steer the draft.
              </p>
              <p>
                Stage 4 is a <em>cross-family entailment</em> judge that closes the gap from the
                other direction (prose&nbsp;&rarr;&nbsp;data) &mdash; catching facts asserted in
                prose but never declared as claims. Running it on a different model family keeps
                maker&nbsp;&ne;&nbsp;judge at the model layer; it&rsquo;s tuned recall-favoring,
                because a false hold costs a glance and a missed fabrication costs trust.
              </p>
            </div>
          </details>
        </Reveal>
      </section>

      {/* ===== BEAT 6 — DIFFERENTIATION · plain ===== */}
      <section className="ds-wrap ds-section" id="vs" aria-labelledby="vs-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">F</span> What makes it different
          </p>
          <h2 id="vs-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "18ch" }}>
            A safety filter checks the message. We check the facts.
          </h2>
        </Reveal>
        <Reveal>
          <div className="lp-compare">
            <div className="lp-ccol them">
              <div className="crole">an ordinary AI safety filter (&ldquo;guardrail&rdquo;)</div>
              <h3 className="ds-h3">Is this message appropriate?</h3>
              <ul>
                <li>
                  <BulletOpen /> Tone, rudeness, off-policy language
                </li>
                <li>
                  <BulletOpen /> Safety and policy classification
                </li>
                <li>
                  <BulletOpen /> Scans for leaked personal data
                </li>
              </ul>
              <p className="cq">Reads the message on its own.</p>
            </div>
            <div className="lp-ccol ours">
              <div className="crole">ActivationOps</div>
              <h3 className="ds-h3">Is this message true for this merchant?</h3>
              <ul>
                <li>
                  <BulletFilled /> Every claim checked against the data row
                </li>
                <li>
                  <BulletFilled /> An exact check, then an independent reviewer
                </li>
                <li>
                  <BulletFilled /> Evidence on every line, held for a person
                </li>
              </ul>
              <p className="cq">
                Reads the message <em>against the record</em>.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== BEAT 7 — OBJECTION · "is the reviewer right?" — METHOD ONLY ===== */}
      <section className="ds-wrap ds-section" id="reviewer" aria-labelledby="rev-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">G</span> The obvious question
          </p>
          <h2 id="rev-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "20ch" }}>
            &ldquo;How do you know the AI reviewer is right?&rdquo;
          </h2>
          <p className="ds-lede" style={{ marginTop: 20 }}>
            Fair question &mdash; so we don&rsquo;t ask you to assume it.{" "}
            <em>We check the reviewer against people.</em>
          </p>
        </Reveal>
        <Reveal stagger>
          <div className="lp-qa">
            <div className="lp-qrow">
              <div className="qh">We measure it against human judgment.</div>
              <div className="qb">
                Human reviewers label a set of real examples by hand, then we measure how often the
                AI reviewer agrees with them &mdash; and tune it to catch more rather than miss.
                <div className="lp-pending">
                  <span className="ring" />
                  calibration run in progress &middot; figures published when it clears the bar
                </div>
              </div>
            </div>
            <div className="lp-qrow">
              <div className="qh">It&rsquo;s tuned to hold, not to over-block.</div>
              <div className="qb">
                When it&rsquo;s unsure, it holds for a person &mdash; it never auto-rejects.{" "}
                <em>A false hold costs a glance; a shipped falsehood costs trust.</em> So we accept a
                few extra holds to avoid a single thing slipping through.
              </div>
            </div>
            <div className="lp-qrow">
              <div className="qh">The exact check underneath is locked.</div>
              <div className="qb">
                The automatic, exact check is pinned &mdash; it produces the same result every time
                on the same input, so the floor the whole tool stands on can&rsquo;t quietly drift.
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <details className="ds-tech">
            <summary>
              <Chevron /> For technical reviewers &middot; what we measure
            </summary>
            <div className="tech-body">
              <p>
                The judge is calibrated on a labeled gold set: <em>recall</em> on the gate-passing
                subset is the primary objective, with the <em>precision</em> cost reported at the
                operating point, on held-out data &mdash; recall-favoring by design.
              </p>
              <p className="mono-line">
                <span className="k">reported:</span> precision / recall / F1 &nbsp;&middot;&nbsp;
                inter-rater agreement (Cohen&rsquo;s &kappa;) &nbsp;&middot;&nbsp; test-retest
                flip-rate &nbsp;&middot;&nbsp; held-out
              </p>
              <p>
                These are the metrics the calibration report will carry. Figures appear only once
                the run completes and clears the acceptance bar &mdash; until then, the method
                stands; the numbers are pending, not assumed.
              </p>
            </div>
          </details>
        </Reveal>
      </section>

      {/* ===== BEAT 8 — CLOSE · "See it run" → /console ===== */}
      <section className="ds-wrap ds-section" id="run" aria-labelledby="run-h2">
        <Reveal>
          <p className="ds-eyebrow">
            <span className="idx">H</span> See it run
          </p>
          <h2 id="run-h2" className="ds-h2 ds-h2big" style={{ maxWidth: "20ch" }}>
            Watch one draft get checked, line by line.
          </h2>
          <p className="ds-lede" style={{ marginTop: 20 }}>
            A recorded walkthrough on a single onboarding draft &mdash; the same checks, the same
            hold, the same audit entry. On your data, the records and drafts would be yours.
          </p>
          <div className="lp-cta-wrap">
            <Link className="ds-cta" href="/console">
              See it run on the console
              <ArrowRight />
            </Link>
            <span className="lp-cta-note">a recorded, replayable run &mdash; not a sign-up</span>
          </div>
        </Reveal>
      </section>

      {/* ===== BEAT 9 — HONESTY (in-page; the global contentinfo footer lives in layout) ===== */}
      <section className="ds-wrap ds-section" id="honesty" aria-label="Honesty disclosure">
        <p style={{ fontSize: 13.5, lineHeight: 1.62, color: "var(--body)", maxWidth: "76ch" }}>
          A simulated prototype on de-identified, public open data. Merchant and reviewer names are
          fictional. Not affiliated with DoorDash, Uber Eats, Grubhub, or any marketplace. The
          walkthrough is a recorded, replayable run &mdash; labeled, not live &mdash; and accuracy
          figures are pending until the calibration run completes. Human-led, AI-assisted,
          professionally reviewed.
        </p>
        <p
          className="ds-mono"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
            fontSize: 11,
            color: "var(--faint)",
            letterSpacing: "0.005em",
            lineHeight: 1.8,
          }}
        >
          SIMULATED &middot; FICTIONAL NAMES &middot; NO REAL MERCHANT DATA &middot; NOT AFFILIATED
          WITH ANY MARKETPLACE &middot; REPLAY / RECORDED &middot; FIGURES PENDING CALIBRATION
          &middot; HUMAN-LED, AI-ASSISTED, PROFESSIONALLY REVIEWED
        </p>
      </section>
    </main>
  );
}
