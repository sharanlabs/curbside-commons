/**
 * S2-crew CP2 — THE DETERMINISTIC ROUTE TABLE (gap sheet 2026-10-12 page 1 as
 * amended by Codex § 3 page 1; decision-log 2026-10-14).
 *
 * A table test pins every row; an exhaustive property test walks the whole
 * finite input space (5 triggers × 3 packs × 4 owners × 3 severities × 2
 * decisions × 3 anomaly counts × 3 category sets = 3,240 inputs) and proves
 * human-escalation DOMINATES whenever the reviewer escalated or an anomaly is
 * on record, that every input lands on exactly one row with that row's
 * artifact set, and that ownership is only ever read from the input.
 * The Reviewer's label: a turn that sees a computed route is the expanded
 * configuration — "requalification pending"; a legacy turn keeps the L-1 label.
 *
 * MUTATION PROOF (recorded 2026-10-31):
 *  - M1: row 0 (escalate/anomaly) moved below row 1 (fees) → 1 RED (the
 *    dominance property, on fees inputs that escalate); restored → 18/18 green.
 *  - M2: row 2's `ownership === "integrator"` clause deleted → 2 RED (the
 *    "integrator ownership on a sweep → partner" row and the pure-function
 *    property); restored → green.
 *
 * Plain: the printed routing table is checked line by line, then every
 * possible combination is tried to prove that "a person must look" always
 * wins when something is wrong.
 */
import { describe, expect, it } from "vitest";
import {
  REQUALIFICATION_PENDING_LABEL,
  REVIEWER_EARNED_LABEL,
  reviewerLabelStateFor,
} from "../../lib/crew/model.ts";
import { route, ROUTE_TABLE_LABEL, type RouteInput } from "../../lib/crew/route.ts";

const base: RouteInput = {
  pack: "listings",
  triggerKind: "sweep",
  findingCategories: ["price"],
  maxSeverity: "error",
  reviewerDecision: "approve",
  anomalies: 0,
  ownership: "merchant",
};

describe("route table — every row", () => {
  const rows: ReadonlyArray<{ name: string; input: Partial<RouteInput>; route: string; artifacts: string[]; row: string }> = [
    { name: "reviewer escalated → human-escalation", input: { reviewerDecision: "escalate" }, route: "human-escalation", artifacts: [], row: "Row 0" },
    { name: "an anomaly on record → human-escalation", input: { anomalies: 1 }, route: "human-escalation", artifacts: [], row: "Row 0" },
    { name: "fee pack → compliance {email, ledger}", input: { pack: "fees" }, route: "compliance", artifacts: ["email", "ledger"], row: "Row 1" },
    { name: "partner-onboarding trigger (owner established) → partner {partner-ticket, slack}", input: { triggerKind: "partner-onboarding", ownership: "integrator" }, route: "partner", artifacts: ["partner-ticket", "slack"], row: "Row 3" },
    { name: "integrator ownership on a sweep → partner", input: { ownership: "integrator" }, route: "partner", artifacts: ["partner-ticket", "slack"], row: "Row 3" },
    { name: "unknown ownership → human-escalation", input: { ownership: "unknown" }, route: "human-escalation", artifacts: [], row: "Row 2" },
    { name: "merchant ownership → merchant-ops {slack, email}", input: {}, route: "merchant-ops", artifacts: ["slack", "email"], row: "Row 4" },
    { name: "platform ownership → merchant-ops (no platform row exists)", input: { ownership: "platform" }, route: "merchant-ops", artifacts: ["slack", "email"], row: "Row 4" },
    { name: "fees beat unknown ownership (row 1 before row 2)", input: { pack: "fees", ownership: "unknown" }, route: "compliance", artifacts: ["email", "ledger"], row: "Row 1" },
    { name: "unknown ownership beats the partner-onboarding trigger (row 2 before row 3; Codex 2026-10-14 — unresolved responsibility goes to a person)", input: { triggerKind: "partner-onboarding", ownership: "unknown" }, route: "human-escalation", artifacts: [], row: "Row 2" },
  ];
  for (const r of rows) {
    it(r.name, () => {
      const out = route({ ...base, ...r.input });
      expect(out.route).toBe(r.route);
      expect([...out.artifacts]).toStrictEqual(r.artifacts);
      expect(out.reason.startsWith(`${r.row}`), out.reason).toBe(true);
      expect(out.reason.endsWith("."), "reason is one sentence").toBe(true);
      expect(Object.isFrozen(out) && Object.isFrozen(out.artifacts)).toBe(true);
    });
  }

  it("refuses a non-integer or negative anomaly count (never a guess)", () => {
    expect(() => route({ ...base, anomalies: -1 })).toThrow(/non-negative integer/);
    expect(() => route({ ...base, anomalies: 0.5 })).toThrow(/non-negative integer/);
  });

  it("carries the deterministic-workflow label", () => {
    expect(ROUTE_TABLE_LABEL).toBe("deterministic workflow");
  });
});

describe("route table — exhaustive property: human-escalation dominates every row", () => {
  const packs = ["listings", "fees", "conformance"] as const;
  const triggers = ["sweep", "order-errors", "complaint", "partner-onboarding", "agent-preflight"] as const;
  const owners = ["merchant", "integrator", "platform", "unknown"] as const;
  const severities = ["error", "warn", "none"] as const;
  const decisions = ["approve", "escalate"] as const;
  const anomalyCounts = [0, 1, 3] as const;
  const categorySets: ReadonlyArray<readonly string[]> = [[], ["price"], ["identity", "availability", "staleness"]];
  const all: RouteInput[] = [];
  for (const pack of packs)
    for (const triggerKind of triggers)
      for (const ownership of owners)
        for (const maxSeverity of severities)
          for (const reviewerDecision of decisions)
            for (const anomalies of anomalyCounts)
              for (const findingCategories of categorySets)
                all.push({ pack, triggerKind, ownership, maxSeverity, reviewerDecision, anomalies, findingCategories });

  it("walks the whole space (3,240 inputs)", () => {
    expect(all.length).toBe(3240);
  });

  it("escalate OR anomalies > 0 ⇒ human-escalation with no artifacts, whatever else holds", () => {
    for (const input of all) {
      if (input.reviewerDecision === "escalate" || input.anomalies > 0) {
        const out = route(input);
        expect(out.route, JSON.stringify(input)).toBe("human-escalation");
        expect(out.artifacts.length).toBe(0);
        expect(out.reason.startsWith("Row 0")).toBe(true);
      }
    }
  });

  it("with no escalate and no anomaly, the route is a pure function of (pack, trigger, ownership) — categories and severity never move it", () => {
    for (const input of all) {
      if (input.reviewerDecision === "escalate" || input.anomalies > 0) continue;
      const expected =
        input.pack === "fees"
          ? "compliance"
          : input.ownership === "unknown"
            ? "human-escalation"
            : input.triggerKind === "partner-onboarding" || input.ownership === "integrator"
              ? "partner"
              : "merchant-ops";
      expect(route(input).route, JSON.stringify(input)).toBe(expected);
    }
  });

  it("every route has exactly its row's artifact set", () => {
    const sets: Record<string, string[]> = {
      "merchant-ops": ["slack", "email"],
      partner: ["partner-ticket", "slack"],
      compliance: ["email", "ledger"],
      "human-escalation": [],
    };
    for (const input of all) {
      const out = route(input);
      expect([...out.artifacts], JSON.stringify(input)).toStrictEqual(sets[out.route]);
    }
  });
});

describe("Reviewer label — the earned label does not transfer to the expanded configuration", () => {
  it("a turn WITHOUT a computed route (every recorded legacy case) keeps the L-1 label", () => {
    expect(reviewerLabelStateFor({})).toBe(REVIEWER_EARNED_LABEL);
    expect(REVIEWER_EARNED_LABEL).toBe("agent (live-run floors cleared)");
  });

  it("a turn WITH a computed route renders requalification pending", () => {
    expect(reviewerLabelStateFor({ computedRoute: route(base) })).toBe(REQUALIFICATION_PENDING_LABEL);
    expect(REQUALIFICATION_PENDING_LABEL).toBe("requalification pending");
  });
});
