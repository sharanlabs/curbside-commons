import { describe, expect, it } from "vitest";
import {
  buildFaithfulFeed,
  generateCatalog,
  acpFeedToClaims,
  mulberry32,
  runListingsVerification,
  centsToDecimal,
} from "@/lib/packs/listings";
import type { AcpFeed } from "@/lib/packs/listings";

/**
 * Property-style invariants over a seeded PRNG loop (no PBT dependency — the
 * loop is deterministic and replayable by seed):
 *   P1  the faithful copy of ANY generated catalog produces zero findings;
 *   P2  a random price mutation is always caught as a price-class finding
 *       citing the mutated row;
 *   P3  dropping a random in-stock row is always caught as existence/missing
 *       citing the dropped row;
 *   P4  flipping a random 86'd row to in_stock is always caught as
 *       availability-class citing the flipped row.
 *
 * Plain: not just the shipped demo menu — for a whole family of generated
 * menus, a truthful copy always passes and each planted lie is always caught
 * and pinned to the right row.
 */

const SEEDS = Array.from({ length: 12 }, (_, i) => 1000 + i);
const AS_OF = "2026-07-03T00:00:00Z";

function mutateRow(feed: AcpFeed, index: number, patch: Partial<AcpFeed["items"][number]>): AcpFeed {
  return {
    ...feed,
    items: feed.items.map((r, i) => (i === index ? { ...r, ...patch } : r)),
  };
}

describe("P1: faithful copies are always clean", () => {
  it.each(SEEDS)("seed %i → zero findings", (seed) => {
    const sor = generateCatalog(seed, AS_OF);
    const report = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor);
    expect(report.findings).toHaveLength(0);
  });
});

describe("P2: a planted price lie is always caught on the right row", () => {
  it.each(SEEDS)("seed %i", (seed) => {
    const sor = generateCatalog(seed, AS_OF);
    const faithful = buildFaithfulFeed(sor);
    const rand = mulberry32(seed ^ 0x5eed);
    const idx = Math.floor(rand() * faithful.items.length);
    const target = faithful.items[idx];
    const lied = mutateRow(faithful, idx, {
      price: centsToDecimal(Math.round(Number(target.price) * 100) + 150),
    });
    const report = runListingsVerification(acpFeedToClaims(lied), sor);
    const hit = report.findings.find(
      (f) => f.category === "price" && f.claim.id.startsWith(`${target.item_id}#`),
    );
    expect(hit, `price lie on ${target.item_id} not caught`).toBeTruthy();
  });
});

describe("P3: a silently dropped row is always caught as missing", () => {
  it.each(SEEDS)("seed %i", (seed) => {
    const sor = generateCatalog(seed, AS_OF);
    const faithful = buildFaithfulFeed(sor);
    const rand = mulberry32(seed ^ 0xd407);
    const inStock = faithful.items.filter((r) => r.availability === "in_stock");
    const target = inStock[Math.floor(rand() * inStock.length)];
    const dropped: AcpFeed = {
      ...faithful,
      items: faithful.items.filter((r) => r.item_id !== target.item_id),
    };
    const report = runListingsVerification(acpFeedToClaims(dropped), sor);
    const hit = report.findings.find(
      (f) => f.ruleId === "LST-EXIST-MISSING" && f.referenceRowId === target.item_id,
    );
    expect(hit, `dropped ${target.item_id} not reported missing`).toBeTruthy();
  });
});

describe("P4: an 86'd row served as orderable is always caught", () => {
  it.each(SEEDS)("seed %i", (seed) => {
    const sor = generateCatalog(seed, AS_OF);
    const faithful = buildFaithfulFeed(sor);
    const soldOut = faithful.items
      .map((r, i) => [r, i] as const)
      .filter(([r]) => r.availability === "out_of_stock");
    if (soldOut.length === 0) return; // seed generated no 86'd rows — vacuous for P4
    const rand = mulberry32(seed ^ 0xabcd);
    const [target, idx] = soldOut[Math.floor(rand() * soldOut.length)];
    const lied = mutateRow(faithful, idx, { availability: "in_stock" });
    const report = runListingsVerification(acpFeedToClaims(lied), sor);
    const hit = report.findings.find(
      (f) => f.category === "availability" && f.claim.id.startsWith(`${target.item_id}#`),
    );
    expect(hit, `86'd ${target.item_id} served in_stock not caught`).toBeTruthy();
  });
});
