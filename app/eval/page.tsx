import type { Metadata } from "next";
import Link from "next/link";
import { CALIBRATION, E2, E3, E4, L1, type Provenance } from "@/lib/dashboard/evidence";
import { Mark } from "@/components/data-surfaces/Mark";

export const metadata: Metadata = { title: "Eval evidence" };

/** Per-block provenance line — file + freeze SHA + event date, all from the module. */
function Prov({ of }: { of: Provenance }) {
  return (
    <p className="ds-prov">
      source: <span className="ds-mono">{of.file}</span> @ <span className="ds-mono">{of.frozenAt}</span>{" "}
      ({of.date})
    </p>
  );
}

export default function EvalEvidencePage() {
  const defer = CALIBRATION.deferRun;
  const retry = CALIBRATION.retryRun;

  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Eval evidence</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> every quality label on this site was earned by a test written down before
        the run — or it isn&rsquo;t claimed. This page shows the runs behind the labels, including the
        one that fell short and was held back rather than dressed up.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> each figure is traced to a committed evaluation record — the recalibration
        status doc and the frozen L-1 live matrix — and imported from a single evidence module bound to
        those artifacts by a committed anti-fabrication test. No score is asserted from memory.
      </p>
      <div className="ds-note">
        <b>Scale, stated plainly:</b> these gold sets are deliberately small (n=21 statement lines,
        n=20 crew scenarios) — smoke-scale instruments held to a pre-registered standard, not
        statistical power over real-world distributions. The discipline buys integrity, not
        generality: bars fixed before each run, splits burned after one scoring pass, misses kept on
        the record.
      </div>

      {/* b. fee-line classifier calibration — the honest two-run arc */}
      <h2 className="ds-h2-row">Fee-line classifier — calibration</h2>
      <p className="ds-lead tech" style={{ marginTop: "8px" }}>
        A first run missed one pre-registered floor and was <b>deferred</b>; a retry on a fresh,
        pre-registered held-out split cleared every floor on one pass. Both are kept on the record.
      </p>

      <div className="ds-grid g2">
        <section className="ds-card flush">
          <div className="ds-tags">
            <span className="ds-tag role">first run · {defer.date}</span>
          </div>
          <h3 style={{ marginTop: "10px" }}>{defer.score}</h3>
          <p className="ds-card-p">{defer.reason}</p>
          <div style={{ marginTop: "12px" }}>
            <span className="ds-verdict warn">
              <Mark name="alert" />
              {defer.outcome.toUpperCase()}
            </span>
          </div>
          <Prov of={defer.provenance} />
        </section>

        <section className="ds-card flush">
          <div className="ds-tags">
            <span className="ds-tag role">retry · fresh held-out · {retry.ranAt}</span>
          </div>
          <h3 style={{ marginTop: "10px" }}>{retry.score} — every pre-registered floor cleared</h3>
          <dl className="ds-ratefacts">
            <dt>accuracy</dt>
            <dd>{retry.accuracy}</dd>
            <dt>macro precision</dt>
            <dd>{retry.macroPrecision}</dd>
            <dt>Cohen&rsquo;s kappa</dt>
            <dd>{retry.cohensKappa}</dd>
            <dt>flip rate</dt>
            <dd>{retry.flipRate}</dd>
            <dt>deterministic baseline</dt>
            <dd>{retry.baseline}</dd>
            <dt>calls</dt>
            <dd>{retry.calls}</dd>
            <dt>cost</dt>
            <dd>{retry.cost}</dd>
            <dt>model</dt>
            <dd>{retry.model}</dd>
          </dl>
          <div style={{ marginTop: "12px" }}>
            <span className="ds-verdict ok">
              <Mark name="check" />
              beat baseline {retry.baseline} &rarr; {retry.score}
            </span>
          </div>
          <Prov of={retry.provenance} />
        </section>
      </div>

      <div className="ds-held" style={{ marginTop: "16px" }}>
        <div className="h">
          <Mark name="flag" />
          Earned label
        </div>
        <p className="p">{CALIBRATION.earnedLabel}</p>
      </div>
      <div className="ds-note">{CALIBRATION.scopeNote}</div>
      <p className="ds-meta-line">
        Durable teeth: snapshot <span className="ds-mono">{CALIBRATION.snapshotFile}</span> · lock test{" "}
        <span className="ds-mono">{CALIBRATION.lockTestFile}</span>.
      </p>

      {/* c. L-1 agent crew live run — COMPUTED from the committed matrix */}
      <h2 className="ds-h2-row">L-1 agent crew — live run</h2>
      <p className="ds-lead tech" style={{ marginTop: "8px" }}>
        A recorded live run of the four-member crew. The per-member labels below are classification
        outcomes computed from the committed matrix, not marketing — only the two model-directed members
        earned &ldquo;agent&rdquo;; the other two are deterministic workflows by design.
      </p>

      <section className="ds-stats">
        <div className="ds-stat accent">
          <div className="v">{L1.cases}</div>
          <div className="l">cases scored</div>
        </div>
        <div className="ds-stat">
          <div className="v">{L1.degraded}</div>
          <div className="l">degraded</div>
        </div>
        <div className="ds-stat">
          <div className="v">{L1.perMember.length}</div>
          <div className="l">crew members</div>
        </div>
      </section>

      <p className="ds-runline">
        Model: <span className="ds-mono">{L1.model}</span> · started{" "}
        <span className="ds-mono">{L1.startedAt}</span>
      </p>
      <div className="ds-tags" style={{ marginTop: "10px" }}>
        <span className={L1.allSafetyPass ? "ds-verdict ok" : "ds-verdict no"}>
          <Mark name={L1.allSafetyPass ? "check" : "x"} />
          {L1.allSafetyPass ? "every case passed its safety controls" : "safety failure on the matrix"}
        </span>
        <span className={L1.allClassMatch ? "ds-verdict ok" : "ds-verdict no"}>
          <Mark name={L1.allClassMatch ? "check" : "x"} />
          {L1.allClassMatch ? "every terminal class matched" : "class mismatch on the matrix"}
        </span>
      </div>

      <div className="ds-tbl">
        <table>
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Cases</th>
              <th scope="col">Safety</th>
              <th scope="col">Class match</th>
              <th scope="col">Label</th>
            </tr>
          </thead>
          <tbody>
            {L1.perMember.map((m) => (
              <tr key={m.member}>
                <td className="ds-mono">{m.member}</td>
                <td className="ds-mono">{m.cases}</td>
                <td className="ds-mono">
                  {m.safetyPass}/{m.cases}
                </td>
                <td className="ds-mono">
                  {m.classMatch}/{m.cases}
                </td>
                <td>{L1.memberLabels[m.member]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ds-meta-line">
        Locked by <span className="ds-mono">{L1.lockTestFile}</span>.
      </p>
      <Prov of={L1.provenance} />

      {/* e. E2 RAG lane — scored 2026-07-12, floors MISSED, label deferred */}
      <h2 className="ds-h2-row">Reference-retrieval lane (E2) — floors not met, and it says so</h2>
      <p className="ds-lead plain" style={{ marginTop: "8px" }}>
        <b>In plain terms:</b> we built a &ldquo;look it up and quote the rulebook&rdquo; feature, wrote
        the passing bars in git before testing it, and it missed them. So it ships marked{" "}
        <b>experimental</b>, the scoreboard is published, and the simpler of the two search methods was
        kept — the fancier one didn&rsquo;t beat it.
      </p>
      <div className="ds-grid g2">
        <section className="ds-card flush">
          <div className="ds-tags">
            <span className="ds-tag role">retrieval hit-rate@5 · one pass</span>
          </div>
          <dl className="ds-ratefacts">
            <dt>BM25 baseline</dt>
            <dd>{E2.bm25M1}</dd>
            <dt>embedding hybrid</dt>
            <dd>{E2.hybridM1}</dd>
            <dt>out-of-corpus abstained (shipped lane)</dt>
            <dd>{E2.bm25M4Out}</dd>
            <dt>shipped lane</dt>
            <dd className="ds-mono">{E2.shippedLane}</dd>
          </dl>
          <div style={{ marginTop: "12px" }}>
            <span className="ds-verdict warn">
              <Mark name="alert" />
              LABEL DEFERRED — {E2.labelEarned ? "" : "floors not met"}
            </span>
          </div>
          <Prov of={E2.provenance} />
        </section>
        <section className="ds-card flush">
          <div className="ds-tags">
            <span className="ds-tag role">what stands</span>
          </div>
          <p className="ds-card-p">{E2.antiTheaterNote}.</p>
          <p className="ds-card-p">
            The lane still ships as the advisory tool <span className="ds-mono">{E2.toolName}</span> —
            extractive (verbatim quotes with citations, or an explicit abstention), offline, $0, and
            labeled with its deferred status in every payload.
          </p>
          <p className="ds-meta-line">
            Pre-registration: <span className="ds-mono">{E2.registrationDoc}</span> · locked by{" "}
            <span className="ds-mono">{E2.lockTestFile}</span>.
          </p>
        </section>
      </div>

      {/* f. E4 entity resolution — scored 2026-07-12, one floor missed, ties baseline */}
      <h2 className="ds-h2-row">Entity-resolution lane (E4) — the exact-match default won</h2>
      <p className="ds-lead plain" style={{ marginTop: "8px" }}>
        <b>In plain terms:</b> a fuzzy name-matcher (&ldquo;FOG CITY TACOS LLC&rdquo; vs &ldquo;Fog City
        Tacos&rdquo;) was graded against bars fixed in advance. Required to <b>never</b> confuse two
        similar-but-different businesses, it ended up no better than careful exact matching — so exact
        matching stays the default, and the fuzzy layer is labeled experimental.
      </p>
      <section className="ds-stats">
        <div className="ds-stat accent">
          <div className="v">{E4.m1}</div>
          <div className="l">merge precision (floor met)</div>
        </div>
        <div className="ds-stat">
          <div className="v">{E4.m2}</div>
          <div className="l">recall — the missed floor</div>
        </div>
        <div className="ds-stat">
          <div className="v">{E4.m3}</div>
          <div className="l">on the near-miss trap class</div>
        </div>
        <div className="ds-stat">
          <div className="v">{E4.m4}</div>
          <div className="l">uncertain cases sent to a human</div>
        </div>
      </section>
      <div className="ds-tags" style={{ marginTop: "10px" }}>
        <span className="ds-verdict warn">
          <Mark name="alert" />
          LABEL DEFERRED — shipped default: {E4.shippedDefault}
        </span>
      </div>
      <p className="ds-card-p" style={{ marginTop: "10px" }}>
        {E4.tiesBaselineNote}.
      </p>
      <p className="ds-meta-line">
        Pre-registration: <span className="ds-mono">{E4.registrationDoc}</span> · locked by{" "}
        <span className="ds-mono">{E4.lockTestFile}</span>.
      </p>
      <Prov of={E4.provenance} />

      {/* g. E3 approvals simulator — structural evidence, no scoring by design */}
      <h2 className="ds-h2-row">Signed-approvals simulator (E3) — threat-model evidence</h2>
      <p className="ds-lead plain" style={{ marginTop: "8px" }}>
        <b>In plain terms:</b> the &ldquo;a human signs off before anything runs&rdquo; flow exists as a
        fully offline rehearsal: every approval is cryptographically tied to one exact case, one
        authorized person, a short validity window, and single use — and a test suite attacks each of
        those properties directly. Nothing in it can send a message anywhere.
      </p>
      <section className="ds-card flush">
        <p className="ds-card-p">{E3.what}.</p>
        <dl className="ds-ratefacts">
          <dt>verification order (frozen)</dt>
          <dd>{E3.checkOrder}</dd>
          <dt>threat suite</dt>
          <dd className="ds-mono">{E3.threatSuiteFile}</dd>
          <dt>cannot-send proof</dt>
          <dd className="ds-mono">{E3.noSendProofFile}</dd>
        </dl>
        <p className="ds-card-p">{E3.liveNote}.</p>
        <Prov of={E3.provenance} />
      </section>

      {/* h. the exposed-splits FAQ — the prepared honest answer */}
      <h2 className="ds-h2-row">&ldquo;Why not just run it again?&rdquo; — the exposed-splits rule</h2>
      <div className="ds-note">
        Four evaluation splits are now <b>exposed</b>: the 2026-07-05 classifier split, the 2026-07-09
        classifier retry split, the E2 retrieval gold set, and the E4 entity test split. An exposed
        split can never be re-scored — once a result has been seen, a re-run stops measuring the system
        and starts measuring our persistence. Every score above is therefore a <b>one-pass</b> result
        against bars committed in advance, misses included; any new claim requires a fresh,
        pre-registered split and a fresh registration row. That is also why two of the three lanes on
        this page currently wear a &ldquo;floors not met&rdquo; label instead of a better-sounding one.
      </div>

      {/* d. link to the moved legacy surface */}
      <p className="ds-note" style={{ marginTop: "24px" }}>
        The legacy activation eval records formerly on this page now live at{" "}
        <Link href="/legacy/eval" className="ds-mlink">
          /legacy/eval
        </Link>
        .
      </p>
    </main>
  );
}
