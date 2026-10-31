import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import {
  BEFORE_AFTER,
  BUNDLED,
  CONTROLS,
  COST,
  LIBRARY,
  M1,
  STATE,
  TIERS,
  formatValue,
} from "@/lib/landing/pilot-figures";

/**
 * /pilot — the executive page (plan § 12 S4; decision-log 2026-10-12 item 3,
 * the executive layer). The delivery point, the before/after, the cost model,
 * the one pre-registered number, governance and the scenario library — every
 * one stated as a PROPOSAL or a HYPOTHESIS, never as an established effect
 * (Codex cross-check 2026-10-12 § 5, adopted 2026-10-14).
 *
 * Outside the navigation by design: reachable by URL and from
 * docs/pilot-kit/README.md, so the nav's pinned link set (canonical.spec.ts)
 * does not move. It wears the /docs reference layer (`docs-main`, whose
 * element-scoped tokens already carry a dark branch) and adds only `pilot-*`
 * classes inside it; no new font, no new token.
 *
 * EVERY FIGURE IS A FIELD of lib/landing/pilot-figures.ts and carries a
 * `data-pilot` key. evals/packs/pilot-page.test.ts reads the BUILT page and
 * fails if a data-pilot value differs from the module, or if any digit in the
 * page's visible text is not a data-pilot field or an allow-listed name (a
 * date, a slice label, a section reference, §20-563.3). No section numerals:
 * numbered chapter chrome is a DESIGN.md anti-pattern.
 */
export const metadata: Metadata = {
  title: "Pilot proposal — delivery point, cost model, governance",
  description:
    "A pilot proposal for a US delivery platform's menu-integrity workflow: the delivery point stated as a hypothesis, an illustrative cost model with every figure derived, the governance tiers and the scenario library's state. Synthetic data throughout; not affiliated with any delivery platform.",
};

const A = COST.assumptions;
const D = COST.derived;

export default function PilotPage() {
  return (
    <main className="docs-main pilot-main">
      <div className="docs-wrap">
        {/* ===== INTRO + WHAT THIS IS AND IS NOT ===== */}
        <section className="sect intro" aria-labelledby="pilot-h1">
          <Reveal>
            <p className="lp-eyebrow">THE PILOT</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h1 id="pilot-h1">A pilot proposal, with the arithmetic attached.</h1>
            <p className="lede">
              This page is for a delivery platform&rsquo;s executive sponsor. It sets out what a
              six-week pilot would try to show, what it would cost, who decides what, and the one
              number a platform would measure later with its own instruments.
            </p>
          </Reveal>
          <Reveal>
            <div className="pilot-note" role="note" aria-labelledby="pilot-isnot">
              <p className="k" id="pilot-isnot">
                WHAT THIS IS, AND IS NOT
              </p>
              <ul className="pilot-list">
                <li>
                  <b>Synthetic throughout.</b> Every merchant, menu, order and statement here is
                  invented and labeled. This project never holds, receives or renders a
                  platform&rsquo;s data.
                </li>
                <li>
                  <b>Shaped like the public integration docs, not from the platform.</b> Platform
                  names are nominative references to public documentation. Not affiliated with any
                  delivery platform: no endorsement, partnership, access or business impact is
                  claimed or implied.
                </li>
                <li>
                  <b>Nothing acts.</b> The pilot stops at a proposal that a named person signs. No
                  menu, record or order is changed, and no message is sent.
                </li>
                <li>
                  <b>A prototype run on demand,</b> not an operated service. Human-led, AI-assisted,
                  professionally reviewed.
                </li>
              </ul>
            </div>
          </Reveal>
        </section>

        {/* ===== THE DELIVERY POINT ===== */}
        <section className="sect" id="delivery-point" aria-labelledby="point-h2">
          <Reveal>
            <p className="lp-eyebrow">THE DELIVERY POINT</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="point-h2">A proposal: name the drift before it costs anyone.</h2>
            <p className="prose">
              A platform&rsquo;s copy of a merchant&rsquo;s menu drifts in small ways: a price, a
              missing option, an item still offered after it sold out. The workflow is{" "}
              <b>designed to</b> catch, explain, size and route that drift inside the
              platform&rsquo;s own workflow, before it <b>would likely</b> become a refund, an
              error-charge dispute, a cancelled agent order or a partner-quality enforcement, and
              to leave an audit trail. That effect is a <b>hypothesis</b>. It could only be shown
              by a separate deployment, measured separately; nothing on this page has been
              measured on any platform.
            </p>
            <p className="pilot-tech">
              Technical: a sequential, human-gated workflow. A deterministic engine decides each
              verdict; bounded model seats recommend in a separate envelope and cannot flip a
              verdict; a signed human decision is the only path to a recorded action (plan § 6,
              § 7).
            </p>
          </Reveal>
        </section>

        {/* ===== BEFORE AND AFTER ===== */}
        <section className="sect" id="before-after" aria-labelledby="ba-h2">
          <Reveal>
            <p className="lp-eyebrow">BEFORE AND AFTER</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="ba-h2">What would change, stated as a hypothesis.</h2>
            <p className="prose">
              The left column is how the platforms&rsquo; public documentation describes the
              problem today (read 2026-10-09, re-read 2026-10-31). The right column is what the
              workflow is designed to do, with the state of each part beside it. A part marked
              ARRIVES is a plan item, not a capability.
            </p>
          </Reveal>
          <Reveal>
            <div className="pilot-scroll">
              <table className="pilot-table">
                <caption className="sr">Before and after, with the build state of each part</caption>
                <thead>
                  <tr>
                    <th scope="col">Step</th>
                    <th scope="col">Before</th>
                    <th scope="col">After, as designed</th>
                    <th scope="col">State</th>
                  </tr>
                </thead>
                <tbody>
                  {BEFORE_AFTER.map((r) => (
                    <tr key={r.step}>
                      <th scope="row">{r.step}</th>
                      <td>{r.before}</td>
                      <td>{r.after}</td>
                      <td className="pilot-state">{r.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* ===== THE COST MODEL ===== */}
        <section className="sect" id="cost-model" aria-labelledby="cost-h2">
          <Reveal>
            <p className="lp-eyebrow">THE COST MODEL</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="cost-h2">The cost model, with every input declared.</h2>
            <p className="prose">
              The model multiplies the orders a platform handles by the share that go wrong
              because of menu data, then by what each one costs. The fill below is{" "}
              <b>{COST.label}</b>: every input is an assumption, and a platform would replace each
              one with its own measured figure only after a separate deployment decision.
            </p>
            <blockquote className="pilot-formula">
              <p>{COST.formula}</p>
            </blockquote>
          </Reveal>
          <Reveal>
            <div className="pilot-cols">
              <div className="pilot-scroll">
                <table className="pilot-table" data-pilot-block="assumptions">
                  <caption className="sr">Declared assumptions</caption>
                  <thead>
                    <tr>
                      <th scope="col">Assumption</th>
                      <th scope="col">Value</th>
                      <th scope="col">Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(A).map((a) => (
                      <tr key={a.key}>
                        <th scope="row">{a.label}</th>
                        <td className="pilot-fig" data-pilot={`assumption.${a.key}`}>
                          {formatValue(a.value, a.unit)}
                        </td>
                        <td className="pilot-state">{a.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pilot-scroll">
                <table className="pilot-table" data-pilot-block="derived">
                  <caption className="sr">Figures derived from the assumptions</caption>
                  <thead>
                    <tr>
                      <th scope="col">Derived figure</th>
                      <th scope="col">Value</th>
                      <th scope="col">Arithmetic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(D).map((d) => (
                      <tr key={d.key}>
                        <th scope="row">{d.label}</th>
                        <td className="pilot-fig" data-pilot={`derived.${d.key}`}>
                          {formatValue(d.value, d.unit)}
                        </td>
                        <td className="pilot-how">{d.how}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">{COST.catchRate.label}</th>
                      <td className="pilot-fig">{COST.catchRate.display}</td>
                      <td className="pilot-how">the pilot would measure it; the model assumes none</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="closer stack">
              <span className="flamp" aria-hidden="true" />
              <span>
                {COST.notAMeasurement} Each is arithmetic on declared assumptions, labeled{" "}
                {COST.label}. Replay costs nothing to run, and live runs use free tiers only (owner
                decision 2026-10-12; each tier&rsquo;s terms are re-verified at use).
              </span>
            </p>
            <p className="pilot-tech">
              Technical: inputs held as integer basis points and cents, so each step is exact;
              derived in <code>lib/landing/pilot-figures.ts</code> and held equal to an independent
              recomputation and to the plan&rsquo;s own fill (plan § 7) by{" "}
              <code>evals/packs/pilot-figures.test.ts</code>.
            </p>
          </Reveal>
        </section>

        {/* ===== THE ONE NUMBER ===== */}
        <section className="sect" id="the-number" aria-labelledby="m1-h2">
          <Reveal>
            <p className="lp-eyebrow">THE ONE PRE-REGISTERED NUMBER</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="m1-h2">One number, written down first, measured later.</h2>
            <div className="pilot-m1">
              <p className="pilot-m1-name">
                <code data-pilot="m1.id">{M1.id}</code>{" "}
                <span data-pilot="m1.name">{M1.name}</span>
              </p>
              <p className="prose">
                On a cohort versus its baseline window, {M1.when}. It is <b>not scored inside this
                pilot</b>. Its instrument is {M1.instrument.toLowerCase()}, and its pass mark reads{" "}
                <span className="pilot-state" data-pilot="m1.floor">
                  {M1.floor}
                </span>
                , on purpose.
              </p>
            </div>
            <p className="pilot-tech">
              Technical: pre-registered in <code>docs/pilot-kit/success-metrics.md</code>; the
              pilot itself is decided by workflow and adoption metrics on the scenario library,
              with safety stop conditions that are never traded against M1.
            </p>
          </Reveal>
        </section>

        {/* ===== GOVERNANCE ===== */}
        <section className="sect" id="governance" aria-labelledby="gov-h2">
          <Reveal>
            <p className="lp-eyebrow">GOVERNANCE</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="gov-h2">The engine decides, agents recommend, a person signs.</h2>
            <p className="prose">
              Verdicts come from versioned rule tables, with no clock, no model and no network.
              Model seats only recommend, and each shows DEFER on any model that has not passed its
              exam. <b>A human signs a proposal; nothing acts.</b> The pilot stops at Tier 1.
            </p>
          </Reveal>
          <Reveal>
            <div className="pilot-scroll">
              <table className="pilot-table">
                <caption className="sr">Action tiers</caption>
                <thead>
                  <tr>
                    <th scope="col">Tier</th>
                    <th scope="col">Name</th>
                    <th scope="col">What it covers</th>
                    <th scope="col">State in this prototype</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((t) => (
                    <tr key={t.tier}>
                      <td className="pilot-fig" data-pilot={`tier.${t.tier}`}>
                        {t.tier}
                      </td>
                      <th scope="row">{t.name}</th>
                      <td>{t.covers}</td>
                      <td className="pilot-state">{t.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pilot-scroll">
              <table className="pilot-table">
                <caption className="sr">Control register</caption>
                <thead>
                  <tr>
                    <th scope="col">Control</th>
                    <th scope="col">In place today</th>
                    <th scope="col">To add</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROLS.map((c) => (
                    <tr key={c.control}>
                      <th scope="row">{c.control}</th>
                      <td>{c.today}</td>
                      <td>{c.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pilot-tech">
              In full, in the project repository: <code>docs/governance-model.md</code> (decision
              rights, the crew roster, tiers, the control register, a RACI, a NIST AI RMF crosswalk
              that is a mapping, not a conformance claim) and <code>docs/model-risk-register.md</code>{" "}
              (which model seat has sat which exam, on which model).
            </p>
          </Reveal>
        </section>

        {/* ===== THE SCENARIO LIBRARY ===== */}
        <section className="sect" id="scenario-library" aria-labelledby="lib-h2">
          <Reveal>
            <p className="lp-eyebrow">THE SCENARIO LIBRARY</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="lib-h2">The scenario library, as it stands today.</h2>
            <p className="prose">
              Each scenario is a small, invented story about a menu going wrong, with its inputs
              and the engine&rsquo;s own report. This table is read from the folders at build time,
              so it shows what exists:{" "}
              <b>
                <span data-pilot="library.built">{LIBRARY.builtCount}</span> of{" "}
                <span data-pilot="library.planned">{LIBRARY.plannedCount}</span>
              </b>{" "}
              planned scenarios are built. The pair the front page runs returns{" "}
              <b data-pilot="bundled.verdict">{BUNDLED.verdict}</b> with{" "}
              <b data-pilot="bundled.findings">{BUNDLED.findings}</b> findings (
              <span data-pilot="bundled.errors">{BUNDLED.errors}</span> errors,{" "}
              <span data-pilot="bundled.warnings">{BUNDLED.warnings}</span> warnings) over{" "}
              <span data-pilot="bundled.rowsRead">{BUNDLED.rowsRead}</span> rows.
            </p>
          </Reveal>
          <Reveal>
            <div className="pilot-scroll">
              <table className="pilot-table">
                <caption className="sr">Scenario library</caption>
                <thead>
                  <tr>
                    <th scope="col">Scenario</th>
                    <th scope="col">Story</th>
                    <th scope="col">State</th>
                    <th scope="col">Verdict</th>
                    <th scope="col">Findings</th>
                    <th scope="col">Arrives later</th>
                  </tr>
                </thead>
                <tbody>
                  {LIBRARY.rows.map((r) => (
                    <tr key={r.id}>
                      <th scope="row">
                        <code data-pilot={`scenario.${r.id}.id`}>{r.id}</code>
                      </th>
                      <td data-pilot={`scenario.${r.id}.story`}>{r.story}</td>
                      <td className="pilot-state" data-pilot={`scenario.${r.id}.state`}>
                        {r.state === "ARRIVES" ? `ARRIVES ${r.arrives}` : r.state}
                      </td>
                      <td className="pilot-fig" data-pilot={`scenario.${r.id}.verdict`}>
                        {r.verdict ?? "—"}
                      </td>
                      <td className="pilot-fig" data-pilot={`scenario.${r.id}.findings`}>
                        {r.findings ?? "—"}
                      </td>
                      <td className="pilot-how" data-pilot={`scenario.${r.id}.later`}>
                        {r.later.length > 0 ? r.later.join(", ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pilot-tech">
              Technical: BUILT means <code>fixtures/scenarios/&lt;id&gt;/</code> holds the
              synthetic inputs and the engine&rsquo;s report, held by{" "}
              <code>evals/packs/scenarios.test.ts</code>. The crew&rsquo;s explanation and
              routing: {STATE.explainAndRoute}. The on-site picker: {STATE.picker}.
            </p>
          </Reveal>
        </section>

        {/* ===== DATA AND SECURITY ===== */}
        <section className="sect" id="data-security" aria-labelledby="data-h2">
          <Reveal>
            <p className="lp-eyebrow">DATA AND SECURITY</p>
            <span className="lp-sec-rule" aria-hidden="true" />
            <h2 id="data-h2">What a platform hands over: nothing, in this pilot.</h2>
            <ul className="pilot-list">
              <li>
                <b>This pilot asks for no data.</b> It runs on the scenario library, synthetic
                throughout.
              </li>
              <li>
                <b>Nothing leaves the tab or the machine.</b> The engine has no network or model
                dependency, held by import-graph tests; the Slack and email builders produce
                payloads and no transport is wired.
              </li>
              <li>
                <b>Customer fields are dropped at ingest.</b> Spreadsheet path:{" "}
                {STATE.csvIngestDrop}. JSON path, where a customer field nested inside an option
                could pass through today: {STATE.jsonIngestDrop}.
              </li>
              <li>
                <b>A later deployment on a platform&rsquo;s own data</b> would be a separate
                decision, with its own data boundary and security assessment. It would use replay
                or a local model only, so no model host would receive anything.
              </li>
            </ul>
            <p className="pilot-tech">
              In full, in the project repository: <code>docs/pilot-kit/data-request-spec.md</code>{" "}
              (fields, classification, what is never needed, retention) and{" "}
              <code>docs/pilot-kit/security-one-pager.md</code> (the data path, sub-processors,
              controls and the evidence for each, known gaps).
            </p>
          </Reveal>
        </section>

        {/* ===== WHAT IS REAL ===== */}
        <section className="sect" aria-label="The site's honesty statement">
          <Reveal>
            <p className="prose">
              The statement for the whole site lives on the documentation page:{" "}
              <Link href="/docs">What is real, and what is invented</Link>.{" "}
              <Link href="/">Back to the front page</Link>, where the instrument runs.
            </p>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
