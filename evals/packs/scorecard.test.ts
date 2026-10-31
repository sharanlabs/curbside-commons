import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ListingsInputError,
  PartnerOpsRecordError,
  SCORECARD_CARRIER,
  acpFeedToClaims,
  buildFaithfulFeed,
  runListingsVerification,
  scorePartner,
  serializeScorecard,
  type AcpFeed,
  type PartnerOpsRecord,
  type SyntheticCatalog,
} from "@/lib/packs/listings";

/**
 * PARTNER SCORECARD (S3 CP3; plan § 2 audience A, § 3, § 9 #5). Criteria shaped
 * like the public partner documentation of two delivery platforms (read
 * 2026-10-31), cited per row; synthetic inputs; not from either platform; never
 * called; not affiliated.
 *
 * Every state is re-derived HERE by separate arithmetic; "not measured here" is
 * never a pass; the edges of each published line are pinned (99.9 % exactly,
 * 99 % exactly, 1 % exactly).
 *
 * ── Mutation record (2026-10-31; each red observed, then restored) ──
 *  M1 scorecard.ts baseline line `successes * 1000 >= attempts * 999` → `>` →
 *     EDGES red, 1 failed / 15 passed — restored, 16/16.
 *  M2 scorecard.ts `notObservable(...)` state "not measured here" → "met" →
 *     NEVER A FAKE PASS red, 3 failed / 13 passed — restored, 16/16.
 */

const ROOT = process.cwd();
const SOR = JSON.parse(readFileSync(join(ROOT, "fixtures", "synthetic-restaurant", "sor.catalog.json"), "utf8")) as SyntheticCatalog;
const FAITHFUL = buildFaithfulFeed(SOR);
const CLEAN = runListingsVerification(acpFeedToClaims(FAITHFUL), SOR);

const ops = (patch: Partial<{ attempts: number; successes: number; opened: number; late: number; placed: number; failed: number }> = {}): PartnerOpsRecord => ({
  simulated: true,
  window: { from: "2026-06-03T00:00:00Z", to: "2026-07-03T00:00:00Z" },
  injections: { attempts: patch.attempts ?? 1000, successes: patch.successes ?? 1000 },
  visibleMenuIssues: { opened: patch.opened ?? 4, openPast48Hours: patch.late ?? 0 },
  orders: { placed: patch.placed ?? 1000, failedOrCancelled: patch.failed ?? 0 },
});
const stateOf = (card: ReturnType<typeof scorePartner>, prefix: string) => card.rows.find((r) => r.criterion.startsWith(prefix))!.state;

describe("ROWS — each criterion cited, each state derived", () => {
  it("nine rows in a fixed order; every source is a dated public-documentation citation with the carrier words", () => {
    const card = scorePartner(CLEAN, ops());
    expect(card.rows.map((r) => r.criterion.split(" ")[0])).toEqual(["Real-time", "Real-time", "Detailed", "At", "Certification", "Visible", "Order", "Menu", "Menu"]);
    for (const r of card.rows) {
      expect(r.source).toMatch(/public partner documentation/);
      expect(r.source).toMatch(/read 2026-10-31/);
      expect(r.source).toMatch(/not affiliated/);
    }
    expect(card.carrier).toBe(SCORECARD_CARRIER);
    for (const w of ["shaped like the public partner documentation", "not from either platform", "never called", "not affiliated", "synthetic"]) expect(card.carrier).toContain(w);
  });

  it("a clean feed check meets both menu rows; a drifted one does not, and the counts equal the report's own findings by category", () => {
    expect([stateOf(scorePartner(CLEAN, ops()), "Real-time menu"), stateOf(scorePartner(CLEAN, ops()), "Real-time 86")]).toEqual(["met", "met"]);
    const items = FAITHFUL.items.map((r, i) =>
      i === 0 ? { ...r, price: "99.99" } : i === 1 ? { ...r, title: `${r.title} (renamed)` } : i === 2 ? { ...r, availability: r.availability === "in_stock" ? ("out_of_stock" as const) : ("in_stock" as const) } : r,
    );
    const drifted = runListingsVerification(acpFeedToClaims({ ...FAITHFUL, items } as AcpFeed), SOR);
    const card = scorePartner(drifted, ops());
    const sync = drifted.findings.filter((f) => ["price", "identity", "existence", "encoding"].includes(f.category ?? "")).length;
    const avail = drifted.findings.filter((f) => f.category === "availability").length;
    expect(sync).toBe(2);
    expect(avail).toBe(1);
    const syncRow = card.rows.find((r) => r.criterion.startsWith("Real-time menu"))!;
    expect(syncRow.state).toBe("not met");
    expect(syncRow.measured).toMatch(new RegExp(`^${sync} disagreements with the supplied record`));
    expect(card.rows.find((r) => r.criterion.startsWith("Real-time 86"))!.measured).toMatch(/^1 disagreement with the supplied record on sold-out state/);
  });

  it("the tally is the count of each state", () => {
    const card = scorePartner(CLEAN, ops({ successes: 995, late: 1 }));
    const n = (s: string) => card.rows.filter((r) => r.state === s).length;
    expect(card.tally).toEqual({ met: n("met"), notMet: n("not met"), notMeasuredHere: n("not measured here") });
    expect(card.tally.met + card.tally.notMet + card.tally.notMeasuredHere).toBe(card.rows.length);
  });
});

describe("EDGES — the published lines, exactly", () => {
  it("injection success: 99.9 % exactly meets the baseline; one fewer does not; 99 % exactly clears the revocation line", () => {
    expect(stateOf(scorePartner(CLEAN, ops({ attempts: 1000, successes: 999 })), "Menu injection success at the 99.9")).toBe("met");
    expect(stateOf(scorePartner(CLEAN, ops({ attempts: 1000, successes: 998 })), "Menu injection success at the 99.9")).toBe("not met");
    expect(stateOf(scorePartner(CLEAN, ops({ attempts: 100, successes: 99 })), "Menu injection success at or above 99")).toBe("met");
    expect(stateOf(scorePartner(CLEAN, ops({ attempts: 100, successes: 98 })), "Menu injection success at or above 99")).toBe("not met");
  });

  it("order failure: exactly 1 % is not below 1 %; just under is", () => {
    expect(stateOf(scorePartner(CLEAN, ops({ placed: 100, failed: 1 })), "Order failure")).toBe("not met");
    expect(stateOf(scorePartner(CLEAN, ops({ placed: 10_000, failed: 99 })), "Order failure")).toBe("met");
  });

  it("48 hours: any issue open past 48 hours is not met; none is met", () => {
    expect(stateOf(scorePartner(CLEAN, ops({ opened: 6, late: 1 })), "Visible menu")).toBe("not met");
    expect(stateOf(scorePartner(CLEAN, ops({ opened: 6, late: 0 })), "Visible menu")).toBe("met");
  });

  it("shown percentages are floored to two decimals and derived from the counts", () => {
    const card = scorePartner(CLEAN, ops({ attempts: 3, successes: 2 }));
    expect(card.rows.find((r) => r.criterion.startsWith("Menu injection success at the"))!.measured).toBe("2 of 3 (66.66 %) menu injections succeeded, from the supplied partner-operations record");
  });
});

describe("NEVER A FAKE PASS — what this tool cannot observe is 'not measured here'", () => {
  it("order-error reporting, store count and the certification demonstrations are never met", () => {
    const card = scorePartner(CLEAN, ops());
    for (const p of ["Detailed order error", "At least 250", "Certification"]) expect(stateOf(card, p)).toBe("not measured here");
  });

  it("a record with no data for a line leaves that line unmeasured, never met", () => {
    const card = scorePartner(CLEAN, ops({ attempts: 0, successes: 0, opened: 0, late: 0, placed: 0, failed: 0 }));
    for (const p of ["Visible menu", "Order failure", "Menu injection success at the", "Menu injection success at or above"]) expect(stateOf(card, p)).toBe("not measured here");
  });

  it("no row is 'met' unless its evidence is a count this tool computed (met rows are the two report rows plus the four record rows)", () => {
    const card = scorePartner(CLEAN, ops());
    expect(card.rows.filter((r) => r.state === "met").map((r) => r.criterion.split(" ")[0])).toEqual(["Real-time", "Real-time", "Visible", "Order", "Menu", "Menu"]);
  });
});

describe("REFUSALS — a record the scorecard cannot read honestly", () => {
  it.each([
    ["not simulated", { ...ops(), simulated: false }],
    ["successes above attempts", ops({ attempts: 10, successes: 11 })],
    ["a negative count", ops({ placed: -1 })],
    ["a fractional count", ops({ attempts: 10.5 })],
    ["late issues above opened", ops({ opened: 1, late: 2 })],
  ])("%s", (_n, record) => {
    expect(() => scorePartner(CLEAN, record as PartnerOpsRecord)).toThrow(PartnerOpsRecordError);
    expect(() => scorePartner(CLEAN, record as PartnerOpsRecord)).toThrow(ListingsInputError);
  });

  it("the serializer is the one byte form (stable twice)", () => {
    const card = scorePartner(CLEAN, ops());
    expect(serializeScorecard(card)).toBe(serializeScorecard(scorePartner(CLEAN, ops())));
    expect(serializeScorecard(card).endsWith("}\n")).toBe(true);
  });
});
