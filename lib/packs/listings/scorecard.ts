/**
 * Partner scorecard — a deterministic rule table shaped like the published
 * partner criteria of two delivery platforms (S3 CP3; plan §§ 2 (A), 3, 9 #5).
 *
 * Each row names one published criterion, cites where it was read (public
 * partner documentation, read 2026-10-31 — nominative references only; not from
 * either platform; never called; not affiliated), and scores it from what THIS
 * tool can actually observe:
 *   - a feed check's report (disagreements with the supplied record), or
 *   - a supplied partner-operations record (synthetic: injection attempts and
 *     successes, visible menu issues and how many ran past 48 hours, orders
 *     placed and failed or cancelled).
 * A criterion neither source can observe is "not measured here" — never a pass.
 *
 * What a state means, exactly:
 *   met            this check's evidence shows no disagreement / the supplied
 *                  record clears the published line — never a platform's approval;
 *   not met        the evidence shows disagreement / the line is not cleared;
 *   not measured here  this tool cannot observe it (or the record holds no data).
 * Every state is decided by integer arithmetic on the inputs; every `measured`
 * string is derived from them (percentages floored to two decimals, shown only —
 * the state never reads the shown figure). A menu check is ONE snapshot: "met"
 * on a sync row means this snapshot disagrees with the supplied record nowhere,
 * not that the partner syncs in real time (Codex 2026-10-12 § 2 A: disagreement
 * with the supplied reference, never "truth").
 *
 * The rows are the criteria the research record itemizes (plan § 3 and
 * docs/research/external-references-2026-10-31.md "Top 5" #5). The rest of the
 * eight-criterion list is not itemized there, so it is not invented here.
 *
 * Plain: a report card for a new integration partner, each line copied from the
 * criteria the platforms publish, each scored only from evidence this tool has —
 * and "not measured here" wherever it has none.
 */
import type { VerifierReport } from "../../verifier-core/index.ts";
import { ListingsInputError } from "./reference.ts";

export type ScorecardState = "met" | "not met" | "not measured here";

export interface ScorecardRow {
  readonly criterion: string;
  readonly source: string;
  readonly measured: string;
  readonly threshold: string;
  readonly state: ScorecardState;
}

/** Synthetic partner-operations figures for one onboarding window. */
export interface PartnerOpsRecord {
  readonly simulated: true;
  readonly window: { readonly from: string; readonly to: string };
  readonly injections: { readonly attempts: number; readonly successes: number };
  readonly visibleMenuIssues: { readonly opened: number; readonly openPast48Hours: number };
  readonly orders: { readonly placed: number; readonly failedOrCancelled: number };
}

export interface PartnerScorecard {
  readonly simulated: true;
  readonly carrier: string;
  readonly criteriaRead: string;
  readonly rows: readonly ScorecardRow[];
  readonly tally: { readonly met: number; readonly notMet: number; readonly notMeasuredHere: number };
}

export const SCORECARD_CRITERIA_READ = "2026-10-31";

export const SCORECARD_CARRIER =
  "Scored against criteria shaped like the public partner documentation of DoorDash and Uber Eats (read 2026-10-31), cited per row — nominative references only; not from either platform; never called; not affiliated. All data is synthetic; \"met\" means this check found no disagreement or the supplied record clears the stated line, never a platform's decision.";

const SRC_DD_PROGRAM =
  "DoorDash Preferred Integrations criteria (merchants.doordash.com, page dated 2025-07-31) — public partner documentation, read 2026-10-31; nominative reference, not affiliated";
const SRC_DD_QUALITY =
  "DoorDash public partner documentation on integration quality and certification, read 2026-10-31 (as itemized in docs/research/external-references-2026-10-31.md, Top 5 #5); nominative reference, not affiliated";
const SRC_UBER_QUALITY =
  "Uber Eats integration quality program (developer.uber.com/docs/eats/quality-and-performance) — public partner documentation, read 2026-10-31; nominative reference, not affiliated";

/** Report categories a menu-sync row counts (names, existence, prices and add-ons). */
const SYNC_CATEGORIES: ReadonlySet<string> = new Set(["price", "identity", "existence", "encoding"]);

/** A partner-operations record the scorecard cannot read honestly. */
export class PartnerOpsRecordError extends ListingsInputError {
  constructor(problem: string) {
    super(`The partner-operations record was refused: ${problem} Nothing was scored.`);
    this.name = "PartnerOpsRecordError";
  }
}

function count(v: unknown, what: string): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0) throw new PartnerOpsRecordError(`${what} is ${JSON.stringify(v)}, not a whole non-negative count.`);
  return v;
}

/** n of d, floored to two decimals, as shown text ("1994 of 2000 (99.70 %)"). */
function ofText(n: number, d: number): string {
  const bp = Math.floor((n * 10_000) / d);
  return `${n} of ${d} (${Math.floor(bp / 100)}.${String(bp % 100).padStart(2, "0")} %)`;
}

function tallyRules(report: VerifierReport, keep: (category: string) => boolean): { n: number; rules: string } {
  const hits = report.findings.filter((f) => keep(f.category ?? ""));
  const by = new Map<string, number>();
  for (const f of hits) by.set(f.ruleId, (by.get(f.ruleId) ?? 0) + 1);
  const rules = [...by.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([r, k]) => `${r} ×${k}`).join(", ");
  return { n: hits.length, rules };
}

/** Score one partner from a feed check's report and a supplied (synthetic) operations record. */
export function scorePartner(report: VerifierReport, ops: PartnerOpsRecord): PartnerScorecard {
  if (ops?.simulated !== true) throw new PartnerOpsRecordError('it is not marked "simulated": true — the scorecard reads synthetic records only (RULES §4).');
  const attempts = count(ops.injections?.attempts, "injections.attempts");
  const successes = count(ops.injections?.successes, "injections.successes");
  const opened = count(ops.visibleMenuIssues?.opened, "visibleMenuIssues.opened");
  const late = count(ops.visibleMenuIssues?.openPast48Hours, "visibleMenuIssues.openPast48Hours");
  const placed = count(ops.orders?.placed, "orders.placed");
  const failed = count(ops.orders?.failedOrCancelled, "orders.failedOrCancelled");
  if (successes > attempts) throw new PartnerOpsRecordError("injections.successes exceeds injections.attempts.");
  if (late > opened) throw new PartnerOpsRecordError("visibleMenuIssues.openPast48Hours exceeds visibleMenuIssues.opened.");
  if (failed > placed) throw new PartnerOpsRecordError("orders.failedOrCancelled exceeds orders.placed.");

  const notObservable = (criterion: string, source: string, threshold: string, why: string): ScorecardRow => ({
    criterion,
    source,
    measured: why,
    threshold,
    state: "not measured here",
  });
  const fromReport = (criterion: string, keep: (c: string) => boolean, what: string): ScorecardRow => {
    const { n, rules } = tallyRules(report, keep);
    return {
      criterion,
      source: SRC_DD_PROGRAM,
      measured: n === 0 ? `0 disagreements with the supplied record on ${what} in this check` : `${n} disagreement${n === 1 ? "" : "s"} with the supplied record on ${what} in this check (${rules})`,
      threshold: `0 disagreements on ${what} in this check — one snapshot; how fast the partner syncs is not measured here`,
      state: n === 0 ? "met" : "not met",
    };
  };
  const rate = (criterion: string, source: string, n: number, d: number, threshold: string, ok: boolean, what: string): ScorecardRow =>
    d === 0
      ? notObservable(criterion, source, threshold, `the supplied record holds no ${what}`)
      : { criterion, source, measured: `${ofText(n, d)} ${what}, from the supplied partner-operations record`, threshold, state: ok ? "met" : "not met" };

  const rows: ScorecardRow[] = [
    fromReport("Real-time menu syncing — menu updates, pricing and modifiers", (c) => SYNC_CATEGORIES.has(c), "names, items, prices and add-ons"),
    fromReport("Real-time 86'ing (sold-out state)", (c) => c === "availability", "sold-out state"),
    notObservable("Detailed order error reporting", SRC_DD_PROGRAM, "the partner reports order errors in detail", "not observable from a menu check"),
    notObservable("At least 250 stores on the integration", SRC_DD_PROGRAM, "at least 250 stores", "not observable from one merchant's menu"),
    notObservable(
      "Certification demonstrations — menu pull, deactivate and reactivate, failed-order message",
      SRC_DD_QUALITY,
      "each demonstration completed",
      "not observable from a menu check",
    ),
    opened === 0
      ? notObservable("Visible menu issues resolved within 48 hours", SRC_DD_QUALITY, "0 visible menu issues open past 48 hours", "the supplied record holds no visible menu issues")
      : {
          criterion: "Visible menu issues resolved within 48 hours",
          source: SRC_DD_QUALITY,
          measured: `${late} of ${opened} visible menu issues open past 48 hours, from the supplied partner-operations record`,
          threshold: "0 visible menu issues open past 48 hours",
          state: late === 0 ? "met" : "not met",
        },
    rate("Order failure and cancellation below 1 %", SRC_DD_QUALITY, failed, placed, "below 1 % of orders failed or cancelled", failed * 100 < placed, "orders failed or cancelled"),
    rate("Menu injection success at the 99.9 % baseline", SRC_UBER_QUALITY, successes, attempts, "at least 99.9 % of menu injections succeed", successes * 1000 >= attempts * 999, "menu injections succeeded"),
    rate(
      "Menu injection success at or above 99 % (below it, API access \"can be subject to\" revocation — conditional, not automatic)",
      SRC_UBER_QUALITY,
      successes,
      attempts,
      "at least 99 % of menu injections succeed",
      successes * 100 >= attempts * 99,
      "menu injections succeeded",
    ),
  ];
  return {
    simulated: true,
    carrier: SCORECARD_CARRIER,
    criteriaRead: SCORECARD_CRITERIA_READ,
    rows,
    tally: {
      met: rows.filter((r) => r.state === "met").length,
      notMet: rows.filter((r) => r.state === "not met").length,
      notMeasuredHere: rows.filter((r) => r.state === "not measured here").length,
    },
  };
}

/** The one serializer (expected/scorecard.json in the scenario library). */
export function serializeScorecard(s: PartnerScorecard): string {
  return `${JSON.stringify(s, null, 2)}\n`;
}
