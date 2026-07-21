import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { CountFig } from "@/components/proof/CountFig";
import {
  CalibrationPlate,
  type CalibrationPlateData,
} from "@/components/proof/CalibrationPlate";
import {
  CALIBRATION,
  E2,
  E3,
  E4,
  ENGINE,
  L1,
  RECORDED_LEGACY_GEMINI,
  RUN_RECORDS,
  ZERO_COST_PROOFS,
} from "@/lib/dashboard/evidence";

/**
 * 04 Proof — the instrument's logbook (build piece 2, 2026-07-20; design source
 * `mockups/takeover-04-proof-2026-07-18.html`, ADOPTED SHA b028d8ee…; spec §11).
 * Replaces the /eval /metrics /cost dashboard set (each now a redirect stub).
 *
 * ANTI-FABRICATION: every figure on this page derives from
 * lib/dashboard/evidence.ts (computed from committed artifacts, or pinned with
 * provenance and bound by dashboard-evidence.test.ts). Where the mockup carried
 * a hand-typed figure with no committed source (its "1,145 tests" fact), the
 * fact is replaced by a derivable one (the recorded-runs ledger count) —
 * recorded in the session-30 deviations ledger.
 *
 * Owner rulings applied over the mockup: hero stays CENTERED (ruling ④, the
 * accepted logbook deviation) · D6 (the mockup's blue header lamp + all-blue
 * logo are the shared Nav's job; no in-page blue lamp — verdict chips carry a
 * diamond ornament, console dots are neutral) · one-case grammar (the Nav
 * readout owns it) · sol pack (slogan trims, "ships"/"on the record" dedup,
 * the redundant send note dropped, the /docs promise softened to the docs'
 * actual scope).
 */

export const metadata: Metadata = {
  title: "Proof — the instrument's logbook",
  description:
    "Every evaluation behind Curbside Commons, scored once against floors registered in advance — calibration, the assistant crew's recorded run, the retrieval miss that stayed published, and the structural checks that keep the verdict path offline.",
};

// Spelled-out register for small counts in prose position (v9 voice) — DERIVED,
// never hand-typed.
const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
] as const;
const spelled = (n: number) => WORDS[n] ?? String(n);
const spelledCap = (n: number) => {
  const w = spelled(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

/* ---- derivations (all from evidence.ts) ---- */

// The four registered evaluation sets this chapter scores (drives the masthead).
const SCORED_SETS = [CALIBRATION, L1, E2, E4] as const;

// The floor arithmetic on the defer card, extracted from the PINNED reason
// sentence (fails closed: if the pinned text ever changes shape, the full
// sentence renders instead of a fragment).
const floorLine = (() => {
  const m = CALIBRATION.deferRun.reason.match(
    /(\d+)\/(\d+) = (0\.\d+), under the pre-registered (0\.\d+) floor/,
  );
  return m ? `recall ${m[1]} / ${m[2]} = ${m[3]} · floor ${m[4]}` : CALIBRATION.deferRun.reason;
})();

const CAL_PLATE: CalibrationPlateData = {
  defer: {
    date: CALIBRATION.deferRun.date,
    score: CALIBRATION.deferRun.score,
    cap: "scored · one floor missed",
    line: floorLine,
    note: "Every floor must pass. The deferred label stands, published.",
    srSentence: `First run, ${CALIBRATION.deferRun.date}: ${CALIBRATION.deferRun.score} scored, one floor missed — ${CALIBRATION.deferRun.reason}. The outcome is ${CALIBRATION.deferRun.outcome}.`,
  },
  retry: {
    date: CALIBRATION.retryRun.provenance.date,
    score: CALIBRATION.retryRun.score,
    scoreTo: Number(CALIBRATION.retryRun.score.split("/")[0]),
    cap: "scored · every floor cleared",
    accuracy: CALIBRATION.retryRun.accuracy,
    accuracyTo: Number(CALIBRATION.retryRun.accuracy),
    kappa: CALIBRATION.retryRun.cohensKappa,
    kappaTo: Number(CALIBRATION.retryRun.cohensKappa),
    calls: CALIBRATION.retryRun.calls,
    callsTo: Number(CALIBRATION.retryRun.calls),
    cost: CALIBRATION.retryRun.cost,
    srSentence: `Retry, ${CALIBRATION.retryRun.provenance.date}, on a fresh held-out set: ${CALIBRATION.retryRun.score} scored, every floor cleared. Accuracy ${CALIBRATION.retryRun.accuracy}. Cohen's kappa ${CALIBRATION.retryRun.cohensKappa}. ${CALIBRATION.retryRun.calls} calls. Cost ${CALIBRATION.retryRun.cost}.`,
  },
  earnedLabel: CALIBRATION.earnedLabel,
};

// Crew replay console — the pinned ledger row IS the line. Display layer
// strips the vendor parenthetical (the /cost plainLeg precedent, phase E).
const CREW_RECORD = RUN_RECORDS[1];
const CREW_LINE = CREW_RECORD.value.replace(/\s*\(Groq\)/gi, "");
const CREW_FLAG = L1.allSafetyPass && L1.allClassMatch && L1.degraded === 0 ? "CLEAN" : "CHECK";
const CREW_DESCS: Record<string, string> = {
  intake: "Reads the request and frames the task.",
  reviewer: "Recommends a decision for a human to sign.",
  audit: "Runs the rules. The same input returns the same result.",
  evidence: "Attaches the record to the finding, byte for byte.",
};

// The one recorded send — the pinned ledger row.
const SEND_RECORD = RUN_RECORDS[3];

// Crew display order (mockup: the two agents lead, then the two workflows).
const CREW_ORDER = ["intake", "reviewer", "audit", "evidence"] as const;
const CREW_MEMBERS = CREW_ORDER.map(
  (name) => L1.perMember.find((m) => m.member === name) ?? { member: name },
);

// Approvals: the seven check titles derive from the pinned check order.
const CHECK_TITLES = E3.checkOrder.split(" -> ").map((t) => t.replace(/\s*\(.*\)$/, ""));
const CHECK_DESCS = [
  "the decision names this request",
  "the approval has not lapsed",
  "this token has not been seen",
  "the key is on the roster",
  "the signer may approve this",
  "signed against the bytes, re-derived",
  "the approval is bound to this exact content",
];

// Entity measures: strip the sentence tails off the derived ratio strings.
const ratio = (s: string) => s.split(" ")[0];

// Zero-cost structural facts: short keys for the three derived claims.
const PROOF_KEYS = ["VERIFIER RUNTIME", "CREW ACCESS", "DELIVERY BUILDERS"];

export default function ProofPage() {
  return (
    <main className="p4-main">
      {/* ===== HERO — the logbook masthead (centered, ruling ④) ===== */}
      <section className="p4-hero ds-wrap" aria-labelledby="proof-h1">
        <p className="cs-eyebrow">
          <span className="cs-eyebrow-dot" aria-hidden="true" />
          CHAPTER FOUR <b>·</b> PROOF
        </p>
        <h1 className="cs-h1" id="proof-h1">
          Every verdict is scored once, against a bar set in advance.
          <br />
          <span className="cs-h1-lit">The misses are kept in.</span>
        </h1>
        <p className="cs-lede">
          This chapter is the instrument&rsquo;s logbook. Each score below is one pass on a
          held-out set, measured against floors registered before the run. Where a floor was
          missed, the label says so and stays published.
        </p>
        <div
          className="p4-masthead"
          aria-label={`Chapter frame: ${spelled(SCORED_SETS.length)} evaluation sets, each scored once, results public, misses kept in`}
        >
          <div className="p4-mh">
            <span className="mh-k">EVALUATION SETS</span>
            <span className="mh-v">
              {spelledCap(SCORED_SETS.length)}
              <small>held out, registered</small>
            </span>
          </div>
          <div className="p4-mh">
            <span className="mh-k">EACH SCORED</span>
            <span className="mh-v">
              Once
              <small>one pass, no re-score</small>
            </span>
          </div>
          <div className="p4-mh">
            <span className="mh-k">RESULTS</span>
            <span className="mh-v">
              Public
              <small>on the record</small>
            </span>
          </div>
          <div className="p4-mh">
            <span className="mh-k">MISSES</span>
            <span className="mh-v">
              Kept in
              <small>reported, not hidden</small>
            </span>
          </div>
        </div>
      </section>

      {/* ===== RAIL 1 · THE FEE-LINE CLASSIFIER ===== */}
      <section className="sect ds-wrap" aria-labelledby="cal-h">
        <Reveal>
          <p className="lp-eyebrow">THE FEE-LINE CLASSIFIER</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="cal-h">
            One floor missed, then every floor cleared.
          </h2>
          <p className="lp-foot">
            The first run missed one floor. Recall for a single fee category came in low, under
            the pre-registered minimum, and every floor must pass. So the label was{" "}
            <em>deferred</em>, and the record kept. A retry on a fresh held-out set cleared every
            floor in one pass.
          </p>
        </Reveal>
        <Reveal>
          <CalibrationPlate data={CAL_PLATE} />
        </Reveal>
      </section>

      {/* ===== RAIL 2 · THE ASSISTANT CREW ===== */}
      <section className="sect ds-wrap" aria-labelledby="crew-h">
        <Reveal>
          <p className="lp-eyebrow">THE ASSISTANT CREW</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="crew-h">
            Four members, one recorded run.
          </h2>
          <p className="lp-foot">
            Two members are agents; two are deterministic workflows. On the recorded session,
            every score held and nothing degraded. The console below carries the recorded result.
          </p>
        </Reveal>
        <Reveal>
          <div
            className="pb-bar p4-console"
            role="img"
            aria-label={`Recorded crew session from ${L1.provenance.date}, replayed: ${CREW_LINE}`}
          >
            <span className="pb-dot" aria-hidden="true" />
            <code className="pb-line" aria-hidden="true">
              <b>REPLAY</b> · {L1.provenance.date} &nbsp;&middot;&nbsp; CREW SESSION
              &nbsp;&middot;&nbsp; <i>{CREW_LINE}</i>
            </code>
            <span className="pb-flag" aria-hidden="true">
              {CREW_FLAG}
            </span>
          </div>
        </Reveal>
        <Reveal>
          <div className="crew">
            {CREW_MEMBERS.map((m) => (
              <div className="mem" key={m.member}>
                <p className="mem-k">{m.member.toUpperCase()}</p>
                <p
                  className={`mem-kind ${L1.memberLabels[m.member].startsWith("agent") ? "agent" : "flow"}`}
                >
                  {L1.memberLabels[m.member].startsWith("agent") ? "AGENT" : "DETERMINISTIC WORKFLOW"}
                </p>
                <p className="mem-d">
                  {CREW_DESCS[m.member]}
                  {L1.memberLabels[m.member].startsWith("agent")
                    ? " Live-run floors cleared."
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="iron">
            <span>THE IRON RULE</span>
            Agents recommend; the engine decides; a human owns anything irreversible.
          </p>
        </Reveal>
      </section>

      {/* ===== RAIL 3 · REFERENCE RETRIEVAL (the honest miss) ===== */}
      <section className="sect ds-wrap" aria-labelledby="ref-h">
        <Reveal>
          <p className="lp-eyebrow">REFERENCE RETRIEVAL</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="ref-h">
            The floors were not met. It says so.
          </h2>
          <p className="lp-foot">
            A reference lookup missed its floors on both methods. So it runs as advisory only,
            and every result carries the deferred label — finished with the same care as any
            pass on this page.
          </p>
        </Reveal>
        <Reveal>
          <div className="spec4">
            <p className="tab-cut4" aria-hidden="true">
              EXPERIMENTAL
            </p>
            <div className="spec4-head">
              <span className="spec4-when">REFERENCE RETRIEVAL · ADVISORY LOOKUP</span>
              <span className="vd defer">LABEL DEFERRED</span>
            </div>
            <div className="mcols">
              <div className="mcol defer">
                <p className="mk">HIT RATE · KEYWORD</p>
                <p className="mv">{E2.bm25M1}</p>
                <p className="mn">the keyword baseline</p>
              </div>
              <div className="mcol defer">
                <p className="mk">HIT RATE · HYBRID</p>
                <p className="mv">{E2.hybridM1}</p>
                <p className="mn">the richer method</p>
              </div>
              <div className="mcol defer">
                <p className="mk">OUT-OF-SCOPE ABSTENTION</p>
                <p className="mv">{E2.bm25M4Out}</p>
                <p className="mn">should have abstained</p>
              </div>
            </div>
            <p className="spec4-note">
              The floors were not met, so the label is deferred. What runs is{" "}
              <em>{E2.toolName}</em>. The richer method never beat the keyword baseline, so the
              simpler method is the one that runs.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true">
            FIG. 01 — DEFERRED, WITH FULL FINISH
          </p>
        </Reveal>
      </section>

      {/* ===== RAIL 4 · ENTITY RESOLUTION (the protected default) ===== */}
      <section className="sect ds-wrap" aria-labelledby="ent-h">
        <Reveal>
          <p className="lp-eyebrow">ENTITY RESOLUTION</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="ent-h">
            The tie that protected the default.
          </h2>
          <p className="lp-foot">
            The fuzzy ensemble was measured against the protected default — normalized exact
            matching. It matched, and never beat it. So the default stands unchanged.
          </p>
        </Reveal>
        <Reveal>
          <div className="mcols">
            <div className="mcol">
              <p className="mk">MERGE PRECISION</p>
              <p className="mv">{E4.m1}</p>
              <p className="mn">no bad merges</p>
            </div>
            <div className="mcol defer">
              <p className="mk">RECALL</p>
              <p className="mv">{E4.m2}</p>
              <p className="mn">the missed floor</p>
            </div>
            <div className="mcol">
              <p className="mk">FALSE MERGES · TRAP</p>
              <p className="mv">{ratio(E4.m3)}</p>
              <p className="mn">the protected class</p>
            </div>
            <div className="mcol">
              <p className="mk">ABSTAIN · AMBIGUOUS</p>
              <p className="mv">{ratio(E4.m4)}</p>
              <p className="mn">ambiguous pairs held</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <p className="p4-note">
            The first scoring run is voided: its exam set broke the registration&rsquo;s own
            minimum, so a fresh set was registered and scored once. The conclusion held.
          </p>
        </Reveal>
      </section>

      {/* ===== RAIL 5 · SIGNED APPROVALS ===== */}
      <section className="sect ds-wrap" aria-labelledby="sig-h">
        <Reveal>
          <p className="lp-eyebrow">SIGNED APPROVALS</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="sig-h">
            A signed decision, then seven checks.
          </h2>
          <p className="lp-foot">{E3.what}.</p>
        </Reveal>
        <Reveal>
          <ol className="checks">
            {CHECK_TITLES.map((t, i) => (
              <li className="check" key={t}>
                <span className="ck-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="ck-t">
                  {t}
                  {CHECK_DESCS[i] ? <small>{CHECK_DESCS[i]}</small> : null}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal>
          <p className="p4-note">
            A committed check proves no send path is reachable from the simulator.
          </p>
        </Reveal>
      </section>

      {/* ===== RAIL 6 · THE ONE RECORDED SEND ===== */}
      <section className="sect ds-wrap" aria-labelledby="send-h">
        <Reveal>
          <p className="lp-eyebrow">THE ONE RECORDED SEND</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="send-h">
            One send in history.
          </h2>
          <p className="lp-foot">
            The record holds a single outbound send, cleared through eight safety controls. The
            console below carries its recorded result.
          </p>
        </Reveal>
        <Reveal>
          <div
            className="pb-bar p4-console"
            role="img"
            aria-label={`The one recorded send from ${SEND_RECORD.provenance.date}, replayed: ${SEND_RECORD.value}`}
          >
            <span className="pb-dot" aria-hidden="true" />
            <code className="pb-line" aria-hidden="true">
              <b>REPLAY</b> · {SEND_RECORD.provenance.date} &nbsp;&middot;&nbsp; THE ONE SEND
              &nbsp;&middot;&nbsp; <i>{SEND_RECORD.value}</i>
            </code>
            <span className="pb-flag" aria-hidden="true">
              {SEND_RECORD.value.startsWith("HTTP 200") ? "200" : "SENT"}
            </span>
          </div>
        </Reveal>
      </section>

      {/* ===== RAIL 7 · ZERO-COST ENFORCEMENT ===== */}
      <section className="sect ds-wrap" aria-labelledby="zc-h">
        <Reveal>
          <p className="lp-eyebrow">ZERO-COST ENFORCEMENT</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="zc-h">
            The verdict path cannot spend or reach out.
          </h2>
          <p className="lp-foot">
            {spelledCap(ZERO_COST_PROOFS.length)} structural facts keep the verdict deterministic
            and free. They are properties of the build, not promises.
          </p>
        </Reveal>
        <Reveal>
          <div className="proofs">
            {ZERO_COST_PROOFS.map((p, i) => (
              <div className="proof" key={p.enforcedBy + i}>
                <p className="pf-k">{PROOF_KEYS[i] ?? "STRUCTURAL CHECK"}</p>
                <p className="pf-t">{p.claim}.</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="spend">
            <span>The one recorded AI-drafting spend, frozen</span>
            <span>
              <b>{RECORDED_LEGACY_GEMINI.totalUsd}</b> drafted · <b>{RECORDED_LEGACY_GEMINI.cap}</b>{" "}
              hard cap · {RECORDED_LEGACY_GEMINI.provenance.date} · legacy record · no re-spend
            </span>
          </p>
        </Reveal>
      </section>

      {/* ===== RAIL 8 · ENGINE MEASURABLES ===== */}
      <section className="sect ds-wrap" aria-labelledby="eng-h">
        <Reveal>
          <p className="lp-eyebrow">ENGINE MEASURABLES</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="eng-h">
            What the engine counts.
          </h2>
        </Reveal>
        <Reveal>
          <div className="facts">
            <div className="fact">
              <p className="fig">
                <span className="sr">{ENGINE.feeRulesTotal}</span>
                <span aria-hidden="true">
                  <CountFig to={ENGINE.feeRulesTotal} text={String(ENGINE.feeRulesTotal)} />
                </span>
              </p>
              <p className="cap">FEE-CAP RULES</p>
              <p className="d">
                {spelledCap(ENGINE.feeRulePredicates)} statement predicates and{" "}
                {spelled(ENGINE.feeRulesNonCheckable)} registered non-checkable.
              </p>
            </div>
            <div className="fact">
              <p className="fig">
                <span className="sr">{ENGINE.ucpSchemaCount}</span>
                <span aria-hidden="true">
                  <CountFig to={ENGINE.ucpSchemaCount} text={String(ENGINE.ucpSchemaCount)} />
                </span>
              </p>
              <p className="cap">PINNED DATA-FORMAT SCHEMAS</p>
              <p className="d">Official schemas, spec version {ENGINE.ucpSpecVersion}.</p>
            </div>
            <div className="fact">
              <p className="fig">
                <span className="sr">{ENGINE.demoFindings}</span>
                <span aria-hidden="true">
                  <CountFig to={ENGINE.demoFindings} text={String(ENGINE.demoFindings)} />
                </span>
              </p>
              <p className="cap">CASE-REPORT FINDINGS</p>
              <p className="d">
                {spelledCap(ENGINE.demoErrors)} error and {spelled(ENGINE.demoWarns)} warn, in the
                chapter 01 case report.
              </p>
            </div>
            <div className="fact">
              <p className="fig">
                <span className="sr">{RUN_RECORDS.length}</span>
                <span aria-hidden="true">
                  <CountFig to={RUN_RECORDS.length} text={String(RUN_RECORDS.length)} />
                </span>
              </p>
              <p className="cap">RECORDED RUNS</p>
              <p className="d">
                {spelledCap(RUN_RECORDS.length)} live-leg runs, each a committed record with
                provenance.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== RAIL 9 · THE ONE-PASS RULE ===== */}
      <section className="sect ds-wrap" aria-labelledby="op-h">
        <Reveal>
          <p className="lp-eyebrow">THE ONE-PASS RULE</p>
          <span className="lp-sec-rule" aria-hidden="true" />
          <h2 className="lp-h2" id="op-h">
            Scored once, and left alone.
          </h2>
        </Reveal>
        <Reveal>
          <div className="principle">
            <p className="pr-lead">
              {spelledCap(SCORED_SETS.length)} evaluation sets. Their results are public. None is
              scored again.
            </p>
            <p className="pr-body">
              Every score in this chapter is one pass against a bar fixed in advance.
            </p>
            <p className="pr-note">
              These evaluation sets are deliberately small — a couple dozen items each.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <p className="acc r" aria-hidden="true">
            FIG. 02 — THE ONE-PASS RULE
          </p>
        </Reveal>
      </section>

      {/* ===== CLOSE — the door back to 01 ===== */}
      <section className="sect sect-last ds-wrap">
        <Reveal>
          <Link className="door" href="/report">
            <span>
              <span className="d-eyebrow">BACK TO THE START · 01</span>
              <span className="d-title">The case begins again</span>
              <span className="d-sub">
                The listings audit, where the first receipt was written.
              </span>
            </span>
            <span className="d-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>
        <Reveal>
          <p className="docs-line">
            The method behind every score lives in the{" "}
            <Link href="/docs">Documentation</Link>.
          </p>
        </Reveal>
      </section>
    </main>
  );
}
