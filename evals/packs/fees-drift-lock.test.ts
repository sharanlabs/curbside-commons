import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BASE_DERIVED_RULE_IDS,
  FEE_RULES,
  NON_STATEMENT_CHECKABLE,
  normalizeTwinDriftClasses,
} from "@/lib/packs/fees";

/**
 * DRIFT-LOCK (load-bearing, plan F1a item 4): the codified TS predicates cannot
 * silently diverge from the JSON twin rule table. Every twin rule id is EITHER
 * implemented as a TS predicate whose cap_pct / base / drift_classes match the
 * twin 1:1, OR registered in NON_STATEMENT_CHECKABLE with a written reason. The
 * eval asserts set-equality BOTH directions: an unimplemented-and-unregistered id
 * fails, and a TS rule absent from the twin fails.
 */

interface TwinRule {
  readonly id: string;
  readonly cap_pct?: number;
  readonly base?: string;
  readonly drift_classes: readonly string[];
}
interface Twin {
  readonly rules: readonly TwinRule[];
}

const twin = JSON.parse(
  readFileSync(join(process.cwd(), "docs", "research", "uc1-rule-table.draft.json"), "utf8"),
) as Twin;

const twinIds = new Set(twin.rules.map((r) => r.id));
const implementedIds = new Set(FEE_RULES.map((r) => r.id));
const nonCheckableIds = new Set(NON_STATEMENT_CHECKABLE.keys());
const twinById = new Map(twin.rules.map((r) => [r.id, r]));

describe("drift-lock: every twin rule is implemented XOR registered non-checkable", () => {
  it(`the twin has 17 rules (got ${twinIds.size})`, () => {
    expect(twinIds.size).toBe(17);
  });

  it("each twin id is EITHER an implemented predicate OR non-checkable (exactly one)", () => {
    for (const id of twinIds) {
      const impl = implementedIds.has(id);
      const nonCheck = nonCheckableIds.has(id);
      expect(impl !== nonCheck, `${id}: implemented=${impl} nonCheckable=${nonCheck} (must be exactly one)`).toBe(true);
    }
  });

  it("no implemented TS rule is absent from the twin (reverse direction)", () => {
    for (const id of implementedIds) {
      expect(twinIds.has(id), `implemented ${id} not in the JSON twin`).toBe(true);
    }
  });

  it("no non-checkable id is absent from the twin, and each carries a written reason", () => {
    for (const [id, reason] of NON_STATEMENT_CHECKABLE) {
      expect(twinIds.has(id), `non-checkable ${id} not in the JSON twin`).toBe(true);
      expect(reason.trim().length, `non-checkable ${id} has an empty reason`).toBeGreaterThan(20);
    }
  });

  it("set-equality: implemented ∪ non-checkable === twin ids (no gaps, no extras)", () => {
    const union = new Set([...implementedIds, ...nonCheckableIds]);
    expect(union.size).toBe(twinIds.size);
    for (const id of twinIds) expect(union.has(id)).toBe(true);
  });

  it("the expected non-checkable set (a-3, f-1, l-1, g-1-iv, g-3, h-1)", () => {
    expect([...nonCheckableIds].sort()).toEqual(
      ["NYC-563.3-a-3", "NYC-563.3-f-1", "NYC-563.3-g-1-iv", "NYC-563.3-g-3", "NYC-563.3-h-1", "NYC-563.3-l-1"].sort(),
    );
  });
});

describe("drift-lock: implemented rules match the twin field-for-field (1:1)", () => {
  it.each(FEE_RULES.map((r) => [r.id, r] as const))("%s matches cap_pct / base / drift_classes", (_id, rule) => {
    const t = twinById.get(rule.id)!;
    expect(rule.capPct).toBe(t.cap_pct);
    expect(rule.base).toBe(t.base);
    expect(rule.driftClasses).toEqual(normalizeTwinDriftClasses(t.drift_classes));
  });
});

describe("drift-lock: base-derived set is DERIVED from the twin's `base` field (item 5.ii)", () => {
  it("BASE_DERIVED_RULE_IDS === the twin rules that carry a `base` field", () => {
    const twinBaseIds = new Set(twin.rules.filter((r) => r.base !== undefined).map((r) => r.id));
    expect([...BASE_DERIVED_RULE_IDS].sort()).toEqual([...twinBaseIds].sort());
  });

  it("the base-derived set is exactly {a-1,a-2,b-1,b-2,c-1,d-2,d-3}", () => {
    expect([...BASE_DERIVED_RULE_IDS].sort()).toEqual(
      ["NYC-563.3-a-1", "NYC-563.3-a-2", "NYC-563.3-b-1", "NYC-563.3-b-2", "NYC-563.3-c-1", "NYC-563.3-d-2", "NYC-563.3-d-3"].sort(),
    );
  });
});
