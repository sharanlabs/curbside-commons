/**
 * S2-crew CP3 — the two new registry tools: `explain_drift` (the deterministic
 * root-cause baseline; gap sheet 2026-10-12 page 2 as amended by Codex § 3
 * page 2 — evidence validity and abstention are GATING) and `size_impact`
 * (lib/impact, wired against the contract shared with the S2-impact lane).
 *
 * Scenario findings are computed by RUNNING THE ENGINE through the registry's
 * own `check_feed` on each scenario's inputs/feed.json + inputs/record.json —
 * never read from expected/report.json (another lane regenerates those).
 * The as-of is the record's own `asOf`; the event log is the scenario's
 * inputs/events.jsonl, read-only.
 *
 * MUTATION PROOF (recorded 2026-10-31):
 *  - M1: the events-item schema loosened to `additionalProperties: true` → 1 RED
 *    (the leak test: `events[i].cause` accepted); restored → 29/29 green.
 *  - M2: the "row EXPIRED ⇒ the merchant edit is what the missed sync failed to
 *    carry" precondition removed → 2 RED (sync-outage → sync-latency; the
 *    expired-row-no-sync-marker case); restored → green.
 *  - M3: the `t < asOf` filter disabled → 1 RED ("events at or after the as-of
 *    are ignored"); restored → green.
 *
 * Plain: the "why did the copy drift?" tool is run on the four menu scenarios
 * and must name the cause each scenario's evidence supports — or say
 * "unknown" when the evidence is not there. Take the evidence away and it must
 * say unknown every time; slip the answer into the question and it refuses.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TOOL_DESCRIPTIONS } from "@/lib/mcp/descriptions.ts";
import { TOOL_ORDER } from "@/lib/mcp/server.ts";
import { sizeImpact, type ImpactInput } from "@/lib/impact/index.ts";
import {
  callTool,
  EXPLAIN_DRIFT_CLASSES,
  EXPLAIN_DRIFT_LABEL,
  outputValidatorFor,
  TOOLS,
  ToolInputError,
  type ExplainDriftParams,
} from "@/lib/tools/registry.ts";

const root = process.cwd();

interface Scenario {
  readonly findings: ExplainDriftParams["findings"];
  readonly events: ExplainDriftParams["events"];
  readonly asOf: string;
}

/** Engine-computed findings + the scenario's own evidence (inputs only, read-only). */
function scenario(id: string): Scenario {
  const dir = join("fixtures", "scenarios", id, "inputs");
  const report = JSON.parse(
    callTool("check_feed", { feedPath: join(dir, "feed.json"), catalogPath: join(dir, "record.json"), surface: "acp" }).canonical,
  ) as { findings: Array<{ claim: { id: string }; ruleId: string; category: string; referenceRowId: string }> };
  const findings = report.findings.map((f) => ({ id: f.claim.id, ruleId: f.ruleId, category: f.category, referenceRowId: f.referenceRowId }));
  const events = readFileSync(join(root, dir, "events.jsonl"), "utf8")
    .split("\n")
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l) as ExplainDriftParams["events"][number]);
  const asOf = (JSON.parse(readFileSync(join(root, dir, "record.json"), "utf8")) as { asOf: string }).asOf;
  return { findings, events, asOf };
}

function explain(p: ExplainDriftParams): { class: string; citedEvents: number[]; reason: string; label: string } {
  const r = callTool("explain_drift", p);
  expect(outputValidatorFor("explain_drift")!(r), "envelope validates").toBe(true);
  return JSON.parse(r.canonical);
}

const EXPECTED: ReadonlyArray<readonly [string, string]> = [
  ["agent-86", "merchant-edit"],
  ["sync-outage", "sync-latency"],
  ["platform-override", "platform-override"],
  // DERIVED, not assumed: its drifted rows are last touched by integrator
  // price_edit/86 events and by actor "unknown" overrides — no rule row names
  // either pair, so every finding abstains and the run reads unknown.
  ["partner-onboarding", "unknown"],
];

describe("explain_drift + size_impact — registered, described, refused when malformed, not yet on MCP", () => {
  it("both tools are registered with input + output schemas and committed descriptions", () => {
    for (const name of ["explain_drift", "size_impact"]) {
      const meta = TOOLS.get(name);
      expect(meta, name).toBeDefined();
      expect(meta!.inputSchema).toBeTypeOf("object");
      expect(outputValidatorFor(name)).toBeDefined();
      expect(TOOL_DESCRIPTIONS[name], name).toMatch(/SIMULATED/);
    }
    expect(TOOL_DESCRIPTIONS.explain_drift).toMatch(/DETERMINISTIC BASELINE/);
    expect(TOOL_DESCRIPTIONS.explain_drift).toMatch(/DEFER/);
  });

  it("the MCP surface still advertises exactly the original seven (S2 advertisement is an OPEN merge item)", () => {
    expect(TOOL_ORDER).not.toContain("explain_drift");
    expect(TOOL_ORDER).not.toContain("size_impact");
    expect(TOOL_ORDER.length).toBe(7);
  });

  it("explain_drift refuses malformed input: missing asOf, bad actor, bad action, non-instant timestamps", () => {
    const ok: ExplainDriftParams = { findings: [], events: [], asOf: "2026-07-03T00:00:00Z" };
    expect(() => callTool("explain_drift", { findings: [], events: [] })).toThrow(ToolInputError);
    const ev = { at: "2026-07-02T00:00:00Z", actor: "merchant", action: "86", target: "item-001-v1" };
    expect(() => callTool("explain_drift", { ...ok, events: [{ ...ev, actor: "robot" }] })).toThrow(ToolInputError);
    expect(() => callTool("explain_drift", { ...ok, events: [{ ...ev, action: "delete" }] })).toThrow(ToolInputError);
    expect(() => callTool("explain_drift", { ...ok, events: [{ ...ev, at: "yesterday" }] })).toThrow(ToolInputError);
    expect(() => callTool("explain_drift", { ...ok, asOf: "2026-07-03" })).toThrow(ToolInputError); // date, not an instant
  });

  it("size_impact refuses malformed input: bad channel, negative cents, share > 1, zero window, extra field", () => {
    const order = {
      order_id: "o-1",
      placed_at: "2026-07-02T12:00:00Z",
      channel: "app",
      lines: [{ variation_id: "item-001-v1", modifier_option_ids: [], qty: 1, unit_price_cents_charged: 2150 }],
      status: "fulfilled",
      refund_cents: 0,
      refund_allocation: [],
      reason: "none",
    };
    const ok = { findings: [], orders: [order], windowDays: 30, errorChargeShare: 0.5 };
    expect(() => callTool("size_impact", { ...ok, orders: [{ ...order, channel: "phone" }] })).toThrow(ToolInputError);
    expect(() => callTool("size_impact", { ...ok, orders: [{ ...order, refund_cents: -1 }] })).toThrow(ToolInputError);
    expect(() => callTool("size_impact", { ...ok, errorChargeShare: 1.5 })).toThrow(ToolInputError);
    expect(() => callTool("size_impact", { ...ok, windowDays: 0 })).toThrow(ToolInputError);
    expect(() => callTool("size_impact", { ...ok, rootCause: "x" })).toThrow(ToolInputError);
  });

  it("size_impact over a small orders array equals a direct lib/impact sizeImpact call (figures non-trivial, labeled simulated)", () => {
    const line = (variation_id: string, cents: number, qty = 1, modifier_option_ids: string[] = []) => ({ variation_id, modifier_option_ids, qty, unit_price_cents_charged: cents });
    const input: ImpactInput = {
      findings: [
        { id: "item-005-v1#availability", ruleId: "LST-AVAIL-STATE", category: "availability", referenceRowId: "item-005-v1" },
        { id: "item-001-v3#price.amount", ruleId: "LST-PRICE-VALUE", category: "", referenceRowId: "item-001-v3" },
      ],
      orders: [
        { order_id: "t-1", placed_at: "2026-07-01T12:00:00Z", channel: "agent", lines: [line("item-005-v1", 1900)], status: "cancelled", refund_cents: 0, refund_allocation: [], reason: "none" },
        { order_id: "t-2", placed_at: "2026-07-02T12:00:00Z", channel: "app", lines: [line("item-001-v3", 2850, 2), line("item-002-v1", 900)], status: "refunded", refund_cents: 2850, refund_allocation: [{ variation_id: "item-001-v3", cents: 2850 }], reason: "menu" },
        { order_id: "t-3", placed_at: "2026-07-02T13:00:00Z", channel: "app", lines: [line("item-001-v3", 2850)], status: "fulfilled", refund_cents: 0, refund_allocation: [], reason: "none" },
        { order_id: "t-4", placed_at: "2026-07-02T14:00:00Z", channel: "app", lines: [line("item-002-v1", 900)], status: "fulfilled", refund_cents: 0, refund_allocation: [], reason: "none" },
      ],
      windowDays: 30,
      errorChargeShare: 0.5,
    };
    const direct = sizeImpact(input);
    const r = callTool("size_impact", input);
    expect(outputValidatorFor("size_impact")!(r)).toBe(true);
    expect(JSON.parse(r.canonical)).toStrictEqual(JSON.parse(JSON.stringify(direct)));
    expect(direct.label).toBe("simulated");
    expect(direct.ordersAtRiskDistinct).toBe(3); // t-1, t-2, t-3 touch a flagged row; t-4 does not
    expect(direct.observedMenuRefundCents).toBe(2850);
  });
});

describe("explain_drift — the four menu scenarios (engine-computed findings, the scenario's own events)", () => {
  for (const [id, cls] of EXPECTED) {
    it(`${id} → ${cls}`, () => {
      const out = explain(scenario(id));
      expect(out.class, out.reason).toBe(cls);
      expect(out.label).toBe(EXPLAIN_DRIFT_LABEL);
      expect(out.reason.endsWith(".")).toBe(true);
    });

    it(`${id}: EVIDENCE VALIDITY — every cited event exists, is before the as-of, and either touches a finding's row or is a sync`, () => {
      const s = scenario(id);
      const out = explain(s);
      if (out.class === "unknown") expect(out.citedEvents).toStrictEqual([]);
      else expect(out.citedEvents.length).toBeGreaterThan(0);
      for (const i of out.citedEvents) {
        const e = s.events[i];
        expect(e, `cited index ${i}`).toBeDefined();
        expect(Date.parse(e.at)).toBeLessThan(Date.parse(s.asOf));
        const touchesARow = s.findings.some(
          (f) => f.referenceRowId === e.target || new RegExp(`^${e.target}-v\\d+$`).test(f.referenceRowId ?? "") || f.id.startsWith(`${e.target}#`),
        );
        expect(touchesARow || e.action === "sync", `cited event ${i} (${JSON.stringify(e)}) supports nothing`).toBe(true);
      }
    });

    it(`${id}: LEAK TEST — with the event log stripped the answer is unknown (unknown, not chance)`, () => {
      const out = explain({ ...scenario(id), events: [] });
      expect(out.class).toBe("unknown");
      expect(out.citedEvents).toStrictEqual([]);
    });
  }

  it("LEAK TEST — a field named like the class anywhere in the input is refused, and the error names it", () => {
    const s = scenario("agent-86");
    const attempts: ReadonlyArray<readonly [string, unknown]> = [
      ["rootCause", { ...s, rootCause: "merchant-edit" }],
      ["class", { ...s, class: "merchant-edit" }],
      ["cause", { ...s, findings: [{ ...s.findings[0], cause: "merchant-edit" }, ...s.findings.slice(1)] }],
      ["class", { ...s, findings: [{ ...s.findings[0], class: "merchant-edit" }] }],
      ["cause", { ...s, events: [{ ...s.events[0], cause: "merchant-edit" }, ...s.events.slice(1)] }],
      ["rootCause", { ...s, events: [{ ...s.events[0], rootCause: "merchant-edit" }] }],
    ];
    for (const [key, params] of attempts) {
      try {
        callTool("explain_drift", params);
        expect.unreachable(`a "${key}" field was accepted`);
      } catch (err) {
        expect(err).toBeInstanceOf(ToolInputError);
        const named = (err as ToolInputError).ajvErrors.some(
          (e) => (e.params as { additionalProperty?: string }).additionalProperty === key,
        );
        expect(named, `the refusal names "${key}"`).toBe(true);
      }
    }
  });

  it("the scenario inputs themselves carry no class-shaped field (the hidden label is not in the evidence)", () => {
    for (const [id] of EXPECTED) {
      const dir = join(root, "fixtures", "scenarios", id, "inputs");
      for (const f of readdirSync(dir)) {
        const text = readFileSync(join(dir, f), "utf8");
        expect(/"(rootCause|root_cause|cause|class)"\s*:/.test(text), `${id}/${f}`).toBe(false);
        for (const cls of EXPLAIN_DRIFT_CLASSES.filter((c) => c !== "unknown")) {
          expect(text.includes(`"${cls}"`), `${id}/${f} names class ${cls}`).toBe(false);
        }
      }
    }
  });
});

describe("explain_drift — every rule row on constructed evidence", () => {
  const asOf = "2026-07-03T00:00:00Z";
  const f = (row: string, ruleId = "LST-PRICE-VALUE", field = "price.amount") => ({
    id: `${row}#${field}`,
    ruleId,
    category: "price",
    referenceRowId: row,
  });
  const ev = (at: string, actor: string, action: string, target: string) => ({ at, actor, action, target }) as ExplainDriftParams["events"][number];

  it("encoding: a 100x cents price and a case-mangled currency read as encoding with no event needed", () => {
    const out = explain({
      findings: [f("item-001-v1", "LST-PRICE-CENTS-AS-DECIMAL"), f("item-002-v1", "LST-PRICE-CURRENCY-FORM", "price.currency")],
      events: [],
      asOf,
    });
    expect(out.class).toBe("encoding");
    expect(out.citedEvents).toStrictEqual([]);
  });

  it("integrator-bug: the latest event on the row is an integrator sync and the copy still disagrees", () => {
    const out = explain({ findings: [f("item-001-v1")], events: [ev("2026-07-02T10:00:00Z", "integrator", "sync", "item-001-v1")], asOf });
    expect(out.class).toBe("integrator-bug");
    expect(out.citedEvents).toStrictEqual([0]);
  });

  it("the LATEST touching event decides (a later platform override beats an earlier merchant edit)", () => {
    const out = explain({
      findings: [f("item-001-v1")],
      events: [ev("2026-07-01T10:00:00Z", "merchant", "price_edit", "item-001-v1"), ev("2026-07-02T10:00:00Z", "platform", "override", "item-001")],
      asOf,
    });
    expect(out.class).toBe("platform-override");
    expect(out.citedEvents).toStrictEqual([1]);
  });

  it("instants, not strings: +02:00 offsets order correctly", () => {
    // 2026-07-02T11:00:00+02:00 = 09:00Z, which is BEFORE the 10:00Z merchant edit.
    const out = explain({
      findings: [f("item-001-v1")],
      events: [ev("2026-07-02T10:00:00Z", "merchant", "price_edit", "item-001-v1"), ev("2026-07-02T11:00:00+02:00", "platform", "override", "item-001-v1")],
      asOf,
    });
    expect(out.class).toBe("merchant-edit");
  });

  it("CONFLICTING events at the same latest instant on one row → unknown (abstain)", () => {
    const out = explain({
      findings: [f("item-001-v1")],
      events: [ev("2026-07-02T10:00:00Z", "merchant", "price_edit", "item-001-v1"), ev("2026-07-02T10:00:00Z", "platform", "override", "item-001-v1")],
      asOf,
    });
    expect(out.class).toBe("unknown");
  });

  it("events at or after the as-of are ignored", () => {
    const out = explain({ findings: [f("item-001-v1")], events: [ev(asOf, "merchant", "price_edit", "item-001-v1")], asOf });
    expect(out.class).toBe("unknown");
  });

  it("an expired row with a merchant edit but NO sync marker on record → unknown (no sync to measure the miss against)", () => {
    const out = explain({
      findings: [f("item-001-v1"), f("item-001-v1", "LST-STALE-EXPIRED", "expiration_date")],
      events: [ev("2026-07-02T10:00:00Z", "merchant", "86", "item-001-v1")],
      asOf,
    });
    expect(out.class).toBe("unknown");
  });

  it("a row-level scope sync is a marker, not a touch: catalog sync + untouched non-expired drift → unknown", () => {
    const out = explain({ findings: [f("item-001-v1")], events: [ev("2026-07-02T00:00:00Z", "integrator", "sync", "catalog")], asOf });
    expect(out.class).toBe("unknown");
  });

  it("findings that disagree → unknown, and the reason names the breakdown; no findings → unknown", () => {
    const out = explain({
      findings: [f("item-001-v1"), f("item-002-v1")],
      events: [ev("2026-07-02T10:00:00Z", "merchant", "price_edit", "item-001-v1"), ev("2026-07-02T10:00:00Z", "platform", "override", "item-002")],
      asOf,
    });
    expect(out.class).toBe("unknown");
    expect(out.reason).toMatch(/merchant-edit x1, platform-override x1/);
    expect(out.citedEvents).toStrictEqual([]);
    expect(explain({ findings: [], events: [], asOf }).class).toBe("unknown");
  });
});

describe("import-walk tooth — lib/impact stays egress-free and engine-free (like lib/crew)", () => {
  it("no file under lib/impact imports lib/packs/**, lib/verifier-core/**, lib/agents/** or a network module", () => {
    const dir = join(root, "lib", "impact");
    const files = readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(join(dir, file), "utf8");
      const specs = [...text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g)].map((m) => m[1]);
      for (const spec of specs) {
        expect(/packs\/|verifier-core\/|agents\/|node:https?|node:net|node:tls|undici|@ai-sdk|^ai$/.test(spec), `${file}: ${spec}`).toBe(false);
      }
    }
  });
});
