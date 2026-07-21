"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { useMounted } from "@/components/client-flags";
import {
  FEE_CASES,
  type FeeStatementCase,
  type FeeStatementKey,
  type FeeFindingRow,
} from "./fee-report-data";

/**
 * The chapter-02 example months (build piece 3, 2026-07-20; design source
 * `mockups/takeover-02-fees-2026-07-17.html`, translated in ultramarine — D1).
 * Four committed months behind folder-tab month tabs; every finding renders as
 * a paper examination receipt (the v9 receipt kit) with the statement line,
 * the clause, the rule, and the arithmetic kept attached.
 *
 * One-case grammar (owner ruling ③): the fee file is FILE B of the one
 * continuing case — receipts say "FILE B", never a second case number.
 *
 * Floors held at source: the SSR state renders ALL four months sequentially
 * (no-JS reads everything); after hydration the tabs page between months;
 * print shows every month (the print CSS unhides them). Tabs are honest
 * aria-pressed buttons, hidden under no-JS via <noscript> CSS.
 */

const CASE_ORDER: FeeStatementKey[] = ["drifted", "faithful", "cured", "conditional"];

const DOT: Record<FeeStatementKey, string> = {
  drifted: "ember",
  faithful: "graphite",
  cured: "graphite",
  conditional: "gold",
};

function monthVerdict(c: FeeStatementCase): "fail" | "cond" | "pass" {
  if (!c.view.ok) return "fail";
  if (c.view.tally["conditional-pending-refund-window"] > 0) return "cond";
  return "pass";
}

function monthChip(c: FeeStatementCase): { cls: string; text: string } {
  const v = c.view;
  if (!v.ok) return { cls: "vio", text: `FAIL · ${v.findingCount} FINDINGS` };
  if (v.tally["conditional-pending-refund-window"] > 0)
    return { cls: "cond", text: `PASS · ${v.tally["conditional-pending-refund-window"]} CONDITIONAL` };
  if (v.tally["cured-by-refund"] > 0)
    return { cls: "cured", text: `PASS · ${v.tally["cured-by-refund"]} CURED` };
  return { cls: "pass", text: "PASS · NO FINDINGS" };
}

function stampFor(row: FeeFindingRow): { cls: string; text: string } {
  switch (row.verdict) {
    case "violation":
      return { cls: "", text: "VIOLATION" };
    case "conditional-pending-refund-window":
      return { cls: " goldst", text: "CONDITIONAL — refund window open" };
    case "cured-by-refund":
      return { cls: " graphitest", text: "CURED BY REFUND — not a violation" };
    default:
      return { cls: " goldst", text: "FLAGGED — asserted pass-through, unverified" };
  }
}

function Receipt({ row, full, staged }: { row: FeeFindingRow; full: boolean; staged: boolean }) {
  const stamp = stampFor(row);
  return (
    <article
      className={`receipt${full ? " full" : ""}`}
      aria-label={`Finding: ${row.plain}`}
    >
      <div className="rc-head">
        <p className="rc-title">EXAMINATION RECEIPT · FEE AUDIT</p>
        <p className="rc-case">
          FILE B · {row.severity.toUpperCase()}{" "}
          {staged ? <span className="f-mark">STAGED ABOVE</span> : null}
        </p>
      </div>
      <ol className="rc-steps">
        <li className="rc-step">
          <span className="rc-num">01</span>
          <span className="rc-key">STATEMENT</span>
          <span className="rc-val">
            {row.statementLine}
            <small>claim id {row.claimId}</small>
          </span>
        </li>
        <li className="rc-step">
          <span className="rc-num">02</span>
          <span className="rc-key">CLAUSE</span>
          <span className="rc-val">{row.clause}</span>
        </li>
        <li className="rc-step">
          <span className="rc-num">03</span>
          <span className="rc-key">RULE</span>
          <span className="rc-val">{row.ruleId}</span>
        </li>
        <li className="rc-step">
          <span className="rc-num">04</span>
          <span className="rc-key">ARITHMETIC</span>
          <span className="rc-val">
            {row.arithmetic}
            {row.provisional ? (
              <small>provisional — depends on the assumed fee basis</small>
            ) : null}
          </span>
        </li>
        <li className="rc-step">
          <span className="rc-num">05</span>
          <span className="rc-key">PLAIN</span>
          <span className="rc-val">
            {row.plain}
            <small>{row.professional}</small>
          </span>
        </li>
      </ol>
      <div className="rc-stamp">
        <span className={`stamp${stamp.cls}`}>{stamp.text}</span>
        <span className="rc-attach">STATEMENT · CLAUSE · RULE — KEPT ATTACHED</span>
      </div>
    </article>
  );
}

export function FeesView() {
  const [caseKey, setCaseKey] = useState<FeeStatementKey>("drifted");
  // SSR renders every month (the no-JS floor); paging starts after hydration.
  const paged = useMounted();

  // Same-document View Transition on the month swap — Baseline Newly Available
  // (motion-currency sweep 2026-07-20); feature-detected + reduced-motion-gated,
  // instant swap as the base path.
  const pickMonth = (key: FeeStatementKey) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (
      typeof doc.startViewTransition === "function" &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      doc.startViewTransition(() => flushSync(() => setCaseKey(key)));
    } else {
      setCaseKey(key);
    }
  };

  return (
    <div className="fee-months" id="fee-report">
      <div className="mtabs" role="group" aria-label="Example month">
        {CASE_ORDER.map((key) => {
          const c = FEE_CASES.find((x) => x.key === key)!;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={caseKey === key}
              className="mtab"
              onClick={() => pickMonth(key)}
            >
              <span className={`mdot ${DOT[key]}`} aria-hidden="true" />
              {c.label}
            </button>
          );
        })}
      </div>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".fee-months .mtabs{display:none}" }} />
      </noscript>

      {CASE_ORDER.map((key) => {
        const c = FEE_CASES.find((x) => x.key === key)!;
        const chip = monthChip(c);
        const view = c.view;
        return (
          <article
            key={key}
            className="fee-month"
            data-verdict={monthVerdict(c)}
            hidden={paged && caseKey !== key}
          >
            <div className="fm-head">
              <h3 className="fm-title">{c.label}</h3>
              <span className="fm-id">
                {view.monthDisplay.toUpperCase()} · STATEMENT AUDIT
              </span>
              <span className={`vtag ${chip.cls}`}>{chip.text}</span>
            </div>
            <p className="fm-lede">
              {view.rows.length > 0
                ? "Every finding keeps the statement line, the clause, the rule, and the arithmetic attached. Each one is a receipt."
                : "Eleven statement-readable rules ran against this month. Nothing to report: every fee sits inside its cap, every category is one the law names, and the enhanced tier was offered beside a plain basic plan."}
            </p>
            {view.rows.length > 0 ? (
              <div className="rgrid">
                {view.rows.map((row) => (
                  <Receipt
                    key={row.key}
                    row={row}
                    full={row.ruleId === "NYC-563.3-a-2" || view.rows.length === 1}
                    staged={key === "drifted" && row.ruleId === "NYC-563.3-a-2"}
                  />
                ))}
              </div>
            ) : (
              <ul className="passrows">
                <li>
                  <span className="pk">DELIVERY · PER ORDER + AVERAGE</span>
                  <span className="pv">within the delivery cap</span>
                  <span className="vtag pass">PASS</span>
                </li>
                <li>
                  <span className="pk">ORDER-TAKING · THE (b) FEE</span>
                  <span className="pv">within the order-taking cap</span>
                  <span className="vtag pass">PASS</span>
                </li>
                <li>
                  <span className="pk">CARD PROCESSING</span>
                  <span className="pv">within the flat card cap</span>
                  <span className="vtag pass">PASS</span>
                </li>
                <li>
                  <span className="pk">ENHANCED TIER · CATEGORY LOCK</span>
                  <span className="pv">four named types only · basic plan offered</span>
                  <span className="vtag pass">PASS</span>
                </li>
              </ul>
            )}
            <p className="rc-acc acc r" aria-hidden="true">
              {view.rows.length > 0
                ? `SPECIMEN — ${view.rows.length === 1 ? "ONE RECEIPT" : "RECEIPTS"} · PAPER · FILE B`
                : "SPECIMEN — A CLEAN MONTH · FILE B"}
            </p>
          </article>
        );
      })}
    </div>
  );
}
