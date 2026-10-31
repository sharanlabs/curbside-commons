/**
 * Seeded orders fixture — S2-impact CP2 (plan §§ 5, 12; Codex cross-check § 2 B).
 *
 * Writes fixtures/synthetic-restaurant/orders.jsonl: ~400 INVENTED orders over a
 * 30-day window ending at the corpus as-of, one JSON object per line in the
 * lib/impact OrderRecord shape. It exists so the Impact arithmetic has something
 * to size; it states no order volume, refunds or merchant beyond this invented corpus.
 *
 * Determinism: its OWN mulberry32 stream at seed 20261031 (a fresh instance — the
 * wedge generator's seed 20260703 stream is never read or advanced). Reads
 * sor.catalog.json read-only for variation / modifier-option ids and prices.
 * Freeze-locked by evals/packs/impact-orders.test.ts.
 *
 * Run from the repo root: node scripts-ts/generate-orders.mts   (Node >= 24)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CORPUS_AS_OF, mulberry32 } from "../lib/packs/listings/index.ts";
import type { SyntheticCatalog } from "../lib/packs/listings/types.ts";
import type { OrderLine, OrderRecord } from "../lib/impact/index.ts";

export const ORDERS_SEED = 20261031;
export const ORDER_COUNT = 400;
export const WINDOW_DAYS = 30;
export const AGENT_SHARE = 0.15;
/** Variation ids the drifted feed carries a finding on (the rows of acp-feed.drifted.json that the manifest plants). */
export const DRIFT_ROWS: readonly string[] = [
  "item-001-v1", "item-001-v2", "item-001-v3", "item-002-v1", "item-002-v2", "item-003-v1",
  "item-003-v2", "item-003-v3", "item-004-v1", "item-004-v2", "item-004-v3", "item-005-v2",
  "item-006-v1", "item-008-v1",
];
/** Record says 86'd, drifted feed says available: the row agent orders are forced onto. */
export const AGENT_86_ROW = "item-008-v1";

const DAY_MS = 86_400_000;

interface Orderable {
  variationId: string;
  priceCents: number;
  optionDeltas: { id: string; delta: number }[];
}

export function generateOrders(catalog: SyntheticCatalog): OrderRecord[] {
  const rand = mulberry32(ORDERS_SEED);
  const all: Orderable[] = catalog.items.flatMap((it) =>
    it.variations.map((v) => ({
      variationId: v.id,
      priceCents: v.priceCents,
      optionDeltas: it.modifierLists.flatMap((l) => l.options.map((o) => ({ id: o.id, delta: o.priceDeltaCents }))),
    })),
  );
  const byId = new Map(all.map((o) => [o.variationId, o]));
  const driftPool = DRIFT_ROWS.map((id) => byId.get(id)).filter((o): o is Orderable => o !== undefined);
  const plainPool = all.filter((o) => !DRIFT_ROWS.includes(o.variationId));
  const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)] as T;

  const end = Date.parse(CORPUS_AS_OF);
  const start = end - WINDOW_DAYS * DAY_MS;
  const stamps = Array.from({ length: ORDER_COUNT }, () => start + Math.floor((rand() * WINDOW_DAYS * DAY_MS) / 1000) * 1000).sort((a, b) => a - b);

  let agentSeen = 0;
  return stamps.map((t, i): OrderRecord => {
    const channel: OrderRecord["channel"] = rand() < AGENT_SHARE ? "agent" : "app";
    const r = rand();
    const nLines = r < 0.4 ? 1 : r < 0.75 ? 2 : r < 0.95 ? 3 : 4;
    const rows: Orderable[] = [];
    if (channel === "agent") {
      if (agentSeen % 4 === 0) rows.push(byId.get(AGENT_86_ROW) as Orderable);
      agentSeen += 1;
    }
    for (let guard = 0; rows.length < nLines && guard < 40; guard++) {
      const row = rand() < 0.35 ? pick(driftPool) : pick(plainPool);
      if (!rows.includes(row)) rows.push(row);
    }
    const lines: OrderLine[] = rows.map((row) => {
      const q = rand();
      const qty = q < 0.6 ? 1 : q < 0.9 ? 2 : 3;
      const mods: string[] = [];
      let delta = 0;
      if (row.optionDeltas.length > 0 && rand() < 0.4) {
        const opt = pick(row.optionDeltas);
        mods.push(opt.id);
        delta = opt.delta;
      }
      return { variation_id: row.variationId, modifier_option_ids: mods, qty, unit_price_cents_charged: row.priceCents + delta };
    });
    const touchesDrift = lines.some((l) => DRIFT_ROWS.includes(l.variation_id));

    const s = rand();
    const status: OrderRecord["status"] = s < 0.12 ? "refunded" : s < 0.18 ? "cancelled" : "fulfilled";
    let reason: OrderRecord["reason"] = "none";
    let refund_cents = 0;
    const refund_allocation: OrderRecord["refund_allocation"] = [];
    if (status !== "fulfilled") reason = rand() < (touchesDrift ? 0.8 : 0.25) ? "menu" : "other";
    if (status === "refunded") {
      const first = Math.floor(rand() * lines.length);
      lines.forEach((l, li) => {
        if (li !== first && rand() < 0.5) return;
        const value = l.unit_price_cents_charged * l.qty;
        const share = rand() < 0.5 ? 1 : 0.3 + rand() * 0.6;
        const cents = Math.min(value, Math.max(1, Math.round(value * share)));
        refund_allocation.push({ variation_id: l.variation_id, cents });
        refund_cents += cents;
      });
    }
    return {
      order_id: `ord-${String(i + 1).padStart(4, "0")}`,
      placed_at: new Date(t).toISOString().replace(".000Z", "Z"),
      channel,
      lines,
      status,
      refund_cents,
      refund_allocation,
      reason,
    };
  });
}

export function ordersToJsonl(orders: readonly OrderRecord[]): string {
  return orders.map((o) => JSON.stringify(o)).join("\n") + "\n";
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const dir = join(root, "fixtures", "synthetic-restaurant");
  const catalog = JSON.parse(readFileSync(join(dir, "sor.catalog.json"), "utf8")) as SyntheticCatalog;
  writeFileSync(join(dir, "orders.jsonl"), ordersToJsonl(generateOrders(catalog)));
  process.stdout.write(`wrote orders.jsonl (${ORDER_COUNT} orders)\n`);
}
