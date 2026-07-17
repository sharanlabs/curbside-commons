import type { Metadata } from "next";
import Link from "next/link";
import { CALIBRATION, E2, E3, E4, L1, type Provenance } from "@/lib/dashboard/evidence";
import { Mark } from "@/components/data-surfaces/Mark";
import { SectionRail } from "@/components/data-surfaces/SectionRail";

export const metadata: Metadata = { title: "Eval evidence" };

/** Per-block provenance line — every figure traces to a record kept in the project (the
 *  record's exact location and freeze reference are kept in the project itself). */
function Prov({ of }: { of: Provenance }) {
  return <p className="ds-prov">Traced to a record kept in the project ({of.date}).</p>;
}

export default function EvalEvidencePage() {
  const defer = CALIBRATION.deferRun;
  const retry = CALIBRATION.retryRun;

  return (
    <main className="ds-data ds-wrap ds-view">
      <h1>Eval evidence</h1>
      <p className="ds-lead plain">
        <b>In plain terms:</b> every quality label on this site was earned by a check written down before
        the run — or it isn&rsquo;t claimed. This page shows the runs behind the labels, including the
        one that fell short and was held back rather than dressed up.
      </p>
      <p className="ds-lead tech">
        <b>Technically:</b> each figure traces to a record kept in the project and is recomputed from it — never
        asserted from memory. A standing check re-derives every number from its source, so a figure
        here cannot drift from the record behind it.
      </p>
      <div className="ds-note">
        <b>Scale, stated plainly:</b> these evaluation sets are deliberately small — a couple dozen
        items each — held to a standard fixed in advance, not statistical power over real-world
        distributions. The discipline buys integrity, not generality: the bar is fixed before each
        run, each set is scored once and then retired, and misses are kept on the record.
      </div>

      <SectionRail
        items={[
          { id: "calibration", label: "Calibration" },
          { id: "crew-run", label: "Crew run" },
          { id: "retrieval", label: "Retrieval" },
          { id: "entity-resolution", label: "Entity resolution" },
          { id: "approvals", label: "Approvals" },
          { id: "one-pass", label: "One-pass rule" },
        ]}
      />

      {/* b. fee-line classifier calibration — the honest two-run arc */}
      <h2 className="ds-h2-row" id="calibration">Fee-line classifier — calibration</h2>
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
        A recorded snapshot and a standing check preserve this result.
      </p>

      {/* c. assistant crew live run — COMPUTED from the committed matrix */}
      <h2 className="ds-h2-row" id="crew-run">Assistant crew — recorded run</h2>
      <p className="ds-lead tech" style={{ marginTop: "8px" }}>
        A recorded run of the four-member assistant crew. The per-member labels below are
        classification outcomes computed from the record kept in the project, not marketing — only the two
        model-directed members earned &ldquo;agent&rdquo;; the other two are deterministic workflows
        by design.
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
        Recorded run · started <span className="ds-mono">{L1.startedAt}</span>
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
      <p className="ds-meta-line">Locked by a standing check that re-derives this matrix from the record.</p>
      <Prov of={L1.provenance} />

      {/* e. reference-retrieval lane — scored 2026-07-12, floors MISSED, label deferred */}
      <h2 className="ds-h2-row" id="retrieval">Reference-retrieval lane — floors not met, and it says so</h2>
      <p className="ds-lead plain" style={{ marginTop: "8px" }}>
        <b>In plain terms:</b> we built a &ldquo;look it up and quote the rulebook&rdquo; feature, wrote
        the passing bars into the record before the scoring run, and it missed them. So it ships marked{" "}
        <b>experimental</b>, the scoreboard is published, and the simpler of the two search methods was
        kept — the more complex method didn&rsquo;t beat it.
      </p>
      <div className="ds-grid g2">
        <section className="ds-card flush">
          <div className="ds-tags">
            <span className="ds-tag role">retrieval hit-rate@5 · one pass</span>
          </div>
          <dl className="ds-ratefacts">
            <dt>keyword-search baseline</dt>
            <dd>{E2.bm25M1}</dd>
            <dt>embedding-based method</dt>
            <dd>{E2.hybridM1}</dd>
            <dt>out-of-scope abstention (shipped method)</dt>
            <dd>{E2.bm25M4Out}</dd>
            <dt>shipped method</dt>
            <dd className="ds-mono">keyword search</dd>
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
            The lane still ships as {E2.toolName} — it returns verbatim quotes with citations, or an
            explicit &ldquo;I don&rsquo;t know,&rdquo; offline and at $0, carrying its experimental
            status in every result.
          </p>
          <p className="ds-meta-line">
            The passing bars were recorded in advance, and a standing lock holds this result.
          </p>
        </section>
      </div>

      {/* f. entity resolution — scored 2026-07-12, one floor missed, ties baseline */}
      <h2 className="ds-h2-row" id="entity-resolution">Entity-resolution lane — the exact-match default won</h2>
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
          <div className="l">ambiguous cases returned ABSTAIN — human review required</div>
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
      <div className="ds-note">
        <b>We voided the first exam ourselves, on the record.</b> {E4.voidedFirstRunNote}. A
        cross-model review caught that our own exam set broke our own registered minimum; keeping the
        convenient number and calling the difference immaterial was the one option not available.
      </div>
      <p className="ds-meta-line">
        The passing bars were recorded in advance, and a standing lock holds this result.
      </p>
      <Prov of={E4.provenance} />

      {/* g. approvals simulator — structural evidence, no scoring by design */}
      <h2 className="ds-h2-row" id="approvals">Signed-approvals simulator — threat-model evidence</h2>
      <p className="ds-lead plain" style={{ marginTop: "8px" }}>
        <b>In plain terms:</b> the &ldquo;a human signs off before anything runs&rdquo; flow exists as a
        fully offline rehearsal: every approval is cryptographically tied to one exact case, one
        authorized person, a short validity window, and single use — and a battery of recorded attacks
        challenges each of those properties directly. Nothing in it can send a message anywhere.
      </p>
      <section className="ds-card flush">
        <p className="ds-card-p">{E3.what}.</p>
        <dl className="ds-ratefacts">
          <dt>verification order (frozen)</dt>
          <dd>{E3.checkOrder}</dd>
          <dt>attacked directly</dt>
          <dd>a recorded attack battery tries to forge, reuse, expire, and tamper with each approval</dd>
          <dt>cannot-send proof</dt>
          <dd>a committed check proves no send path is reachable from it</dd>
        </dl>
        <p className="ds-card-p">{E3.liveNote}.</p>
        <Prov of={E3.provenance} />
      </section>

      {/* h. the one-pass FAQ — the prepared honest answer */}
      <h2 className="ds-h2-row" id="one-pass">&ldquo;Why not just run it again?&rdquo; — the one-pass rule</h2>
      <div className="ds-note">
        Four evaluation sets have now been used and their results shown. Once a set&rsquo;s results are
        public, it is never scored again — a re-run would stop measuring the system and start measuring
        our persistence. Every score above is therefore a <b>one-pass</b> result against bars fixed in
        advance, misses included; any new claim requires a fresh set, fixed in advance. That is also
        why two of the three lanes on this page currently wear a &ldquo;floors not met&rdquo; label
        instead of a better-sounding one.
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
