"use client";

import { useState } from "react";
import {
  FEE_CASES,
  RULE_TABLE_FRESHNESS,
  CLASSIFICATION_DISPLAY,
  type FeeStatementKey,
} from "./fee-report-data";

/**
 * The /fees audit renderer (NYC showcase N1) — renders the four example months'
 * audits from the committed goldens, in the report Ledger structure re-skinned
 * to the v8 language. Zero LLM, zero network, $0: the whole rendering path is
 * static imports of committed records (evals/packs/fees-surface.test.ts binds
 * the rendered figures to the answer key and the rule registry).
 *
 * Plain: the page that shows a delivery bill checked against the law's caps —
 * one month at a time, every catch with its receipts.
 */

const CASE_ORDER: FeeStatementKey[] = ["drifted", "faithful", "cured", "conditional"];

export function FeesView() {
  const [caseKey, setCaseKey] = useState<FeeStatementKey>("drifted");
  const active = FEE_CASES.find((c) => c.key === caseKey) ?? FEE_CASES[0];
  const view = active.view;

  return (
    <div className="rpt-wrap fee-wrap" id="fee-report">
      {/* Example-month toggle — honest aria-pressed buttons (the /report pattern). */}
      <div className="rpt-toolbar" role="group" aria-label="Example month">
        {CASE_ORDER.map((key) => {
          const c = FEE_CASES.find((x) => x.key === key)!;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={caseKey === key}
              className={`rpt-tab ${caseKey === key ? "active" : ""}`}
              onClick={() => setCaseKey(key)}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".fee-wrap .rpt-toolbar{display:none}" }} />
        <p className="rpt-intro">
          Scripting is off, so this static view shows the &ldquo;{active.label}&rdquo; example
          month; the other three example months are available with scripting on.
        </p>
      </noscript>
      <p className="fee-case-plain">{active.plain}</p>

      {/* Verdict */}
      <section className="rpt-sec" aria-labelledby="fee-rail-verdict">
        <h2 id="fee-rail-verdict" className="rpt-rail">
          Verdict
        </h2>
        <div className="rpt-bodycol">
          <div className={`rpt-verdict ${view.ok ? "ok" : "fail"}`}>
            <span className="rpt-verdict-flag">{view.ok ? "PASS" : "FAIL"}</span>
            <span className="rpt-verdict-count">
              {view.findingCount === 0
                ? "no findings"
                : `${view.findingCount} finding${view.findingCount === 1 ? "" : "s"}`}
            </span>
            <span className="rpt-verdict-tally">{view.tallyLine}</span>
          </div>
        </div>
      </section>

      {/* Meta — the audit's basis, dated */}
      <section className="rpt-sec" aria-labelledby="fee-rail-meta">
        <h2 id="fee-rail-meta" className="rpt-rail">
          Basis
        </h2>
        <div className="rpt-bodycol">
          <dl className="rpt-meta">
            <div className="rpt-mrow">
              <dt>statement month</dt>
              <dd>
                {view.monthDisplay}{" "}
                <span className="rpt-rc-sub">(evaluated as of {view.evaluatedAsOf})</span>
              </dd>
            </div>
            <div className="rpt-mrow">
              <dt>governing law</dt>
              <dd>
                {RULE_TABLE_FRESHNESS.statute}
                <span className="rpt-rc-sub">
                  {RULE_TABLE_FRESHNESS.primarySource}; rule table verified current as of{" "}
                  {RULE_TABLE_FRESHNESS.verifiedAsOf}
                </span>
              </dd>
            </div>
            <div className="rpt-mrow">
              <dt>categories</dt>
              <dd>
                <span className="rpt-rc-sub">{CLASSIFICATION_DISPLAY}</span>
              </dd>
            </div>
            <div className="rpt-mrow">
              <dt>fee basis</dt>
              <dd>
                <span className="rpt-rc-sub">
                  {view.assumedBaseDisplay} &mdash; a conclusion that depends on this base stays
                  provisional until the definition is supported by inspectable evidence.
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Findings */}
      <section className="rpt-sec" aria-labelledby="fee-rail-findings">
        <h2 id="fee-rail-findings" className="rpt-rail">
          Findings
        </h2>
        <div className="rpt-bodycol">
          {view.rows.length === 0 ? (
            <>
              <p className="fee-clean">
                No findings &mdash; every fee line on this statement is within its cap as
                declared.
              </p>
              <p className="fee-clean-boundary">
                A clean month is a clean statement, not a lawfulness certificate: the duties that
                need evidence beyond the statement stay unresolved either way.
              </p>
            </>
          ) : (
            <ol className="rpt-findings">
              {view.rows.map((row, i) => (
                <li key={row.key} className="rpt-finding">
                  <div className="rpt-finding-lead">
                    <span className="rpt-idx">{String(i + 1).padStart(2, "0")}</span>
                    <p className="rpt-plain">{row.plain}</p>
                    <span className={`rpt-sev ${row.severity}`}>{row.severity}</span>
                  </div>
                  <p className={`fee-vtag ${row.verdict}`}>{row.verdictTag}</p>
                  {row.provisional ? (
                    <p className="fee-provisional">
                      provisional &mdash; depends on the assumed fee basis above
                    </p>
                  ) : null}
                  <dl className="rpt-receipts" aria-label="evidence">
                    <div className="rpt-rc">
                      <dt>statement line</dt>
                      <dd>
                        <span className="rpt-mono">{row.statementLine}</span>
                        <span className="rpt-mono-sub">{row.claimId}</span>
                      </dd>
                    </div>
                    <div className="rpt-rc">
                      <dt>the clause</dt>
                      <dd className="rpt-mono">{row.clause}</dd>
                    </div>
                    <div className="rpt-rc">
                      <dt>rule</dt>
                      <dd className="rpt-mono">{row.ruleId}</dd>
                    </div>
                    <div className="rpt-rc">
                      <dt>the arithmetic</dt>
                      <dd className="rpt-mono">{row.arithmetic}</dd>
                    </div>
                  </dl>
                  <p className="fee-professional">{row.professional}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <footer className="rpt-sec rpt-foot">
        <div className="rpt-rail" aria-hidden="true" />
        <div className="rpt-bodycol">
          <p>
            The statements audited here are invented examples; the caps are real, codified law.
            No real platform statement was audited &mdash; the findings illustrate how the audit
            reads a bill, with the claim, the clause, the rule, and the arithmetic kept attached
            to every conclusion. No language model runs in this audit: the same statement always
            produces this same result.
          </p>
        </div>
      </footer>
    </div>
  );
}
