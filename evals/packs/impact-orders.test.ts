/**
 * The seeded orders fixture and the figures it yields — S2-impact CP2.
 *
 *  FREEZE   fixtures/synthetic-restaurant/orders.jsonl is exactly the output of
 *           scripts-ts/generate-orders.mts (seed 20261031, its own PRNG stream);
 *           regenerate in memory and byte-compare. sha256 of the committed file
 *           at authoring: 6e34d68ea075702ac88ab29a2b01c35608c761ab3730a8dc78fb9d5e25a0c071
 *  SHAPE    every line parses and validates against the OrderRecord shape;
 *           every refunded order carries an explicit allocation summing to
 *           refund_cents; window, channel mix, reason mix, multi-line orders,
 *           modifier lines, drifted-row orders and agent orders on the 86'd row
 *           all hold.
 *  DERIVED  sizeImpact over the bundled drifted pair's findings — the ENGINE is
 *           run here (never a committed expected report) — equals a recomputation
 *           written in this file with a different formulation (touch sets per
 *           finding, unioned; Map aggregation), for two window lengths.
 *
 * MUTATION PROOF (FREEZE tooth): flip one byte of orders.jsonl (e.g. "fulfilled"
 * -> "fulfillex" on line 1) -> the byte-compare goes RED; run
 * `node scripts-ts/generate-orders.mts` -> GREEN. Recorded in the return packet.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AGENT_86_ROW,
  AGENT_SHARE,
  DRIFT_ROWS,
  ORDER_COUNT,
  WINDOW_DAYS,
  generateOrders,
  ordersToJsonl,
} from "../../scripts-ts/generate-orders.mts";
import { sizeImpact, type ImpactFinding, type OrderRecord } from "@/lib/impact/index.ts";
import { CORPUS_AS_OF, acpFeedToClaims, runListingsVerification } from "@/lib/packs/listings/index.ts";
import type { AcpFeed } from "@/lib/packs/listings/acp-feed.ts";
import type { SyntheticCatalog } from "@/lib/packs/listings/types.ts";

const FIX = join(process.cwd(), "fixtures", "synthetic-restaurant");
const catalog = JSON.parse(readFileSync(join(FIX, "sor.catalog.json"), "utf8")) as SyntheticCatalog;
const drifted = JSON.parse(readFileSync(join(FIX, "acp-feed.drifted.json"), "utf8")) as AcpFeed;
const committed = readFileSync(join(FIX, "orders.jsonl"), "utf8");
const orders = committed.trimEnd().split("\n").map((l) => JSON.parse(l) as OrderRecord);

const DAY = 86_400_000;
const variationIds = new Set(catalog.items.flatMap((i) => i.variations.map((v) => v.id)));
const optionIds = new Set(catalog.items.flatMap((i) => i.modifierLists.flatMap((l) => l.options.map((o) => o.id))));

describe("FREEZE — orders.jsonl is its generator's output", () => {
  it("regenerating in memory reproduces the committed bytes", () => {
    expect(ordersToJsonl(generateOrders(catalog))).toBe(committed);
  });
  it("regenerating twice is identical (no hidden state)", () => {
    expect(ordersToJsonl(generateOrders(catalog))).toBe(ordersToJsonl(generateOrders(catalog)));
  });
});

describe("SHAPE — every record is a valid OrderRecord and the stated invariants hold", () => {
  it("has the stated number of orders and unique ids", () => {
    expect(orders).toHaveLength(ORDER_COUNT);
    expect(new Set(orders.map((o) => o.order_id)).size).toBe(ORDER_COUNT);
  });

  it("validates every record against the OrderRecord shape, with catalog ids only", () => {
    const keys = ["order_id", "placed_at", "channel", "lines", "status", "refund_cents", "refund_allocation", "reason"];
    for (const o of orders) {
      expect(Object.keys(o), o.order_id).toEqual(keys);
      expect(["app", "agent"]).toContain(o.channel);
      expect(["fulfilled", "refunded", "cancelled"]).toContain(o.status);
      expect(["menu", "other", "none"]).toContain(o.reason);
      expect(Number.isFinite(Date.parse(o.placed_at)), o.order_id).toBe(true);
      expect(Number.isInteger(o.refund_cents) && o.refund_cents >= 0).toBe(true);
      expect(o.lines.length).toBeGreaterThan(0);
      const seen = new Set<string>();
      for (const l of o.lines) {
        expect(variationIds.has(l.variation_id), l.variation_id).toBe(true);
        expect(seen.has(l.variation_id)).toBe(false);
        seen.add(l.variation_id);
        for (const m of l.modifier_option_ids) expect(optionIds.has(m), m).toBe(true);
        expect(Number.isInteger(l.qty) && l.qty >= 1).toBe(true);
        expect(Number.isInteger(l.unit_price_cents_charged) && l.unit_price_cents_charged > 0).toBe(true);
      }
    }
  });

  it("every refunded order carries an explicit allocation summing exactly to refund_cents; nothing else carries a refund", () => {
    for (const o of orders) {
      const sum = o.refund_allocation.reduce((t, a) => t + a.cents, 0);
      if (o.status === "refunded") {
        expect(o.refund_allocation.length, o.order_id).toBeGreaterThan(0);
        expect(sum, o.order_id).toBe(o.refund_cents);
        for (const a of o.refund_allocation) {
          const l = o.lines.find((x) => x.variation_id === a.variation_id);
          expect(l, o.order_id).toBeDefined();
          expect(a.cents).toBeLessThanOrEqual((l?.unit_price_cents_charged ?? 0) * (l?.qty ?? 0));
        }
      } else {
        expect([o.refund_cents, sum, o.refund_allocation.length]).toEqual([0, 0, 0]);
      }
    }
  });

  it("sits inside the 30-day window ending at the corpus as-of, in time order", () => {
    const end = Date.parse(CORPUS_AS_OF);
    const ts = orders.map((o) => Date.parse(o.placed_at));
    expect(Math.min(...ts)).toBeGreaterThanOrEqual(end - WINDOW_DAYS * DAY);
    expect(Math.max(...ts)).toBeLessThanOrEqual(end);
    expect([...ts].sort((a, b) => a - b)).toEqual(ts);
  });

  it("has roughly 85/15 app/agent, all three reasons, multi-line and modifier orders", () => {
    const agent = orders.filter((o) => o.channel === "agent").length / orders.length;
    expect(agent).toBeGreaterThan(AGENT_SHARE - 0.05);
    expect(agent).toBeLessThan(AGENT_SHARE + 0.05);
    for (const reason of ["menu", "other", "none"] as const) expect(orders.some((o) => o.reason === reason), reason).toBe(true);
    expect(orders.filter((o) => o.lines.length >= 2).length).toBeGreaterThan(orders.length / 3);
    expect(orders.filter((o) => o.lines.some((l) => l.modifier_option_ids.length > 0)).length).toBeGreaterThan(20);
    expect(orders.filter((o) => o.status === "refunded").length).toBeGreaterThan(20);
  });

  it("a real share of orders touches the drifted rows, and agent orders sit on the row the record 86'd while the feed shows it available", () => {
    const touching = orders.filter((o) => o.lines.some((l) => DRIFT_ROWS.includes(l.variation_id))).length;
    expect(touching / orders.length).toBeGreaterThan(0.3);
    expect(catalog.items.flatMap((i) => i.variations).find((v) => v.id === AGENT_86_ROW)?.stock).toBe("soldout_86");
    expect(drifted.items.find((r) => r.item_id === AGENT_86_ROW)?.availability).toBe("in_stock");
    expect(orders.filter((o) => o.channel === "agent" && o.lines.some((l) => l.variation_id === AGENT_86_ROW)).length).toBeGreaterThanOrEqual(5);
  });
});

/** Independent recomputation — different formulation from lib/impact (touch sets per finding, unioned). */
function recompute(findings: ImpactFinding[], all: OrderRecord[], windowDays: number, share: number) {
  const latest = Math.max(...all.map((o) => Date.parse(o.placed_at)));
  const inWindow = all.filter((o) => latest - Date.parse(o.placed_at) <= windowDays * DAY);
  const lineKey = (o: OrderRecord, i: number) => `${o.order_id}/${i}`;
  const touchSet = (f: ImpactFinding): Set<string> => {
    const out = new Set<string>();
    const optFromId = f.id.includes("#modifier.") ? f.id.split("#modifier.")[1] : null;
    for (const o of inWindow) {
      o.lines.forEach((l, i) => {
        const hit =
          (f.referenceRowId !== null && (l.variation_id === f.referenceRowId || l.modifier_option_ids.includes(f.referenceRowId))) ||
          (optFromId !== null && l.modifier_option_ids.includes(optFromId));
        if (hit) out.add(lineKey(o, i));
      });
    }
    return out;
  };
  const touched = new Set<string>();
  findings.forEach((f) => touchSet(f).forEach((k) => touched.add(k)));
  const availTouched = new Set<string>();
  findings.filter((f) => f.ruleId.startsWith("LST-AVAIL-")).forEach((f) => touchSet(f).forEach((k) => availTouched.add(k)));

  const orderIds = new Set<string>();
  let observed = 0;
  let prospective = 0;
  let agentCancel = 0;
  for (const o of inWindow) {
    const mine = o.lines.map((l, i) => ({ l, k: lineKey(o, i) })).filter((x) => touched.has(x.k));
    if (mine.length > 0) orderIds.add(o.order_id);
    const touchedVars = new Set(mine.map((x) => x.l.variation_id));
    if (o.reason === "menu") observed += o.refund_allocation.filter((a) => touchedVars.has(a.variation_id)).reduce((t, a) => t + a.cents, 0);
    if (o.status === "fulfilled") prospective += mine.reduce((t, x) => t + x.l.qty * x.l.unit_price_cents_charged, 0);
    if (o.channel === "agent") {
      agentCancel += o.lines.map((l, i) => ({ l, k: lineKey(o, i) })).filter((x) => availTouched.has(x.k)).reduce((t, x) => t + x.l.qty * x.l.unit_price_cents_charged, 0);
    }
  }
  return {
    ordersAtRiskDistinct: orderIds.size,
    observedMenuRefundCents: observed,
    prospectiveExposureCents: prospective,
    agentCancelExposureCents: agentCancel,
    errorChargeExposureCents: Math.round(observed * share),
  };
}

describe("DERIVED — the bundled drifted pair, engine run in this test", () => {
  const report = runListingsVerification(acpFeedToClaims(drifted), catalog);
  const findings: ImpactFinding[] = report.findings.map((f) => ({
    id: f.claim.id,
    ruleId: f.ruleId,
    category: f.category ?? "",
    referenceRowId: f.referenceRowId ?? null,
  }));

  it("the engine yields findings on rows the orders touch, including availability-family findings", () => {
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.ruleId.startsWith("LST-AVAIL-"))).toBe(true);
  });

  for (const windowDays of [30, 7]) {
    it(`equals the independent recomputation over a ${windowDays}-day window, and every headline figure is non-zero`, () => {
      const got = sizeImpact({ findings, orders, windowDays, errorChargeShare: 0.35 });
      const want = recompute(findings, orders, windowDays, 0.35);
      expect({
        ordersAtRiskDistinct: got.ordersAtRiskDistinct,
        observedMenuRefundCents: got.observedMenuRefundCents,
        prospectiveExposureCents: got.prospectiveExposureCents,
        agentCancelExposureCents: got.agentCancelExposureCents,
        errorChargeExposureCents: got.errorChargeExposureCents,
      }).toEqual(want);
      expect(got.ordersAtRiskDistinct).toBeGreaterThan(0);
      expect(got.observedMenuRefundCents).toBeGreaterThan(0);
      expect(got.prospectiveExposureCents).toBeGreaterThan(0);
      expect(got.agentCancelExposureCents).toBeGreaterThan(0);
      expect(got.errorChargeExposureCents).toBeGreaterThan(0);
      expect(got.label).toBe("simulated");
    });
  }
});
