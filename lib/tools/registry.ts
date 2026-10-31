/**
 * A0 TOOL REGISTRY — the ONE seam over the gated engine's existing entry
 * points (plan `docs/plan-agentic-extension.md` §3–§6, §5 row A0).
 *
 * Seven typed JSON-in/JSON-out tools: six wrapping UNCHANGED engine entry
 * points (`lib/packs/listings/cli.ts`, `lib/packs/fees/*`) plus the E2
 * advisory retrieval lane (`lookup_reference`, added 2026-07-12 post-scoring
 * per its pre-registration §6) — each with a committed input/output JSON
 * Schema and a named canonical serializer. `callTool` is
 * the ONE call surface every later consumer (A1 MCP server, A2 agent crew,
 * A4 n8n lane) is meant to use: it validates `params` against the tool's
 * committed input schema via ajv BEFORE running the tool, and never swallows
 * a runtime failure — the engine's own typed errors (`StatementParseError`,
 * plain `Error`s from `readFileSync`/`JSON.parse`) pass straight through.
 *
 * ZERO LLM / network imports below this file (enforced by the import-graph
 * eval `evals/tools/registry-ac3-import-graph.test.ts`, same pattern as the
 * existing `cli-c1`/`demo-blindness` $0-LLM proofs) — every tool here calls
 * only deterministic, $0, offline engine code.
 *
 * Plain: this is the one panel of six clearly-labeled buttons that every
 * future robot (an MCP tool client, an agent crew, an automation workflow)
 * will press instead of reaching into the checker's engine room directly —
 * press a button with the wrong-shaped input and it refuses loudly instead of
 * guessing.
 */
import { compileSchema, type ValidateFunction } from "./ajv.ts";
import { loadSchema } from "./schema-loader.ts";
import {
  freezeToolResult,
  ToolInputError,
  ToolNotFoundError,
  type ToolDefinition,
  type ToolMetadata,
  type ToolResult,
} from "./types.ts";

import { runCheckFeedTool, type CheckFeedParams } from "./tools/check-feed.ts";
import { runCheckConformanceTool, type CheckConformanceParams } from "./tools/check-conformance.ts";
import { runAuditStatementTool, type AuditStatementParams } from "./tools/audit-statement.ts";
import { runClassifyAndAuditTool, type ClassifyAndAuditParams } from "./tools/classify-and-audit.ts";
import { runGetRuleTool, type GetRuleParams } from "./tools/get-rule.ts";
import { runLookupReferenceTool, type LookupReferenceParams } from "./tools/lookup-reference.ts";
import { runRunDemoTool, type RunDemoParams } from "./tools/run-demo.ts";
import { sizeImpact, type ImpactInput, type ImpactResult } from "../impact/index.ts";

// Re-export every tool's params type — the one place a consumer imports them from.
export type {
  CheckFeedParams,
  CheckConformanceParams,
  AuditStatementParams,
  ClassifyAndAuditParams,
  GetRuleParams,
  LookupReferenceParams,
  RunDemoParams,
};
export type { ToolResult, ToolMetadata } from "./types.ts";
export {
  assertDecisionGrade,
  ToolInputError,
  ToolNotFoundError,
  RuleNotFoundError,
} from "./types.ts";

// ---------------------------------------------------------------------------
// S2-crew · explain_drift — the DETERMINISTIC root-cause baseline
// (gap sheet 2026-10-12 page 2 as amended by Codex § 3 page 2: evidence
// validity and abstention are GATING). Label: "deterministic baseline".
//
// Input: the engine's findings (id, ruleId, category, referenceRowId), the
// scenario's event log ({at, actor, action, target}) and the as-of instant.
// Output: one class of {sync-latency, merchant-edit, integrator-bug,
// platform-override, encoding, unknown}, the indices of the events it rests
// on, one sentence of reason, and the label.
//
// THE CLASS IS THE HIDDEN LABEL — never an input. Every object in the input
// schema is `additionalProperties: false`, so a field named like a class
// ("rootCause", "class", "cause", …) anywhere in the input is refused by
// `callTool` before this code runs.
//
// RULES, tried in this order for each finding (events at or after asOf are
// ignored; instants are compared as instants, never as strings — Codex § 4):
//  1. ruleId LST-PRICE-CENTS-AS-DECIMAL (a 100× price) or LST-PRICE-CURRENCY-FORM
//     (a case-mangled currency) → encoding. The finding is the evidence; no event cited.
//  2. Events that TOUCH the finding's row: target = the row id, or the row's
//     item (`item-005` touches `item-005-v1`), or a prefix of the claim id
//     (`ORD-7#transaction_fee` touches `ORD-7#transaction_fee#L21`). A scope-wide
//     sync (`catalog`, a category name) touches no row; it is a SYNC MARKER.
//     The LATEST touching event decides; two different (actor, action) pairs at
//     that same instant are CONFLICTING → unknown.
//       platform + override                 → platform-override
//       merchant + price_edit | 86 | un86   → merchant-edit, UNLESS the engine
//                                             reports the row EXPIRED (LST-STALE-EXPIRED):
//                                             the copy missed its refresh, so the
//                                             edit is what the missed sync failed to
//                                             carry → sync-latency (needs a sync
//                                             marker on record; none → unknown)
//       integrator + sync (copy still wrong) → integrator-bug
//       any other (actor, action)           → unknown (the table has no row; never guess)
//  3. No touching event: the row is EXPIRED and a sync marker is on record →
//     sync-latency (citing the last sync); otherwise → unknown (no evidence).
// RUN LEVEL: one class only when EVERY finding reads the same non-unknown
// class; any disagreement or any unknown → unknown with no events cited
// (abstention is an answer, not a failure).
// ---------------------------------------------------------------------------

/** The six classes, in the order the plan names them. */
export const EXPLAIN_DRIFT_CLASSES = [
  "sync-latency",
  "merchant-edit",
  "integrator-bug",
  "platform-override",
  "encoding",
  "unknown",
] as const;
export type ExplainDriftClass = (typeof EXPLAIN_DRIFT_CLASSES)[number];

/** The label every explain_drift answer carries. */
export const EXPLAIN_DRIFT_LABEL = "deterministic baseline";

/** Params for `explain_drift` (schema: {@link EXPLAIN_DRIFT_INPUT_SCHEMA}). */
export interface ExplainDriftParams {
  readonly findings: ReadonlyArray<{
    readonly id: string;
    readonly ruleId: string;
    readonly category: string | null;
    readonly referenceRowId: string | null;
  }>;
  readonly events: ReadonlyArray<{
    readonly at: string;
    readonly actor: "merchant" | "integrator" | "platform" | "unknown";
    readonly action: "price_edit" | "86" | "un86" | "sync" | "override";
    readonly target: string;
  }>;
  readonly asOf: string;
}

/** The explain_drift canonical payload. */
export interface ExplainDriftResult {
  readonly class: ExplainDriftClass;
  readonly citedEvents: readonly number[];
  readonly reason: string;
  readonly label: typeof EXPLAIN_DRIFT_LABEL;
}

const EXPLAIN_DRIFT_INPUT_SCHEMA: Readonly<Record<string, unknown>> = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://activationops.local/tools/explain_drift.input.schema.json",
  title: "explain_drift input",
  type: "object",
  additionalProperties: false,
  required: ["findings", "events", "asOf"],
  properties: {
    findings: {
      type: "array",
      maxItems: 5000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "ruleId", "category", "referenceRowId"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 500 },
          ruleId: { type: "string", minLength: 1, maxLength: 100 },
          category: { type: ["string", "null"], maxLength: 100 },
          referenceRowId: { type: ["string", "null"], maxLength: 500 },
        },
      },
    },
    events: {
      type: "array",
      maxItems: 10000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["at", "actor", "action", "target"],
        properties: {
          at: { type: "string", format: "date-time" },
          actor: { type: "string", enum: ["merchant", "integrator", "platform", "unknown"] },
          action: { type: "string", enum: ["price_edit", "86", "un86", "sync", "override"] },
          target: { type: "string", minLength: 1, maxLength: 500 },
        },
      },
    },
    asOf: { type: "string", format: "date-time" },
  },
});

const ENCODING_RULE_IDS: ReadonlySet<string> = new Set(["LST-PRICE-CENTS-AS-DECIMAL", "LST-PRICE-CURRENCY-FORM"]);
const STALE_RULE_ID = "LST-STALE-EXPIRED";
const MERCHANT_EDITS: ReadonlySet<string> = new Set(["price_edit", "86", "un86"]);

const CLASS_SENTENCE: Readonly<Record<Exclude<ExplainDriftClass, "unknown">, string>> = {
  "sync-latency": "each row's copy is past its refresh and a sync is on record before it, so the copy missed a refresh",
  "merchant-edit": "the latest event on each row is the merchant's own edit, made while the copy was inside its refresh window",
  "integrator-bug": "the latest event on each row is an integrator sync, yet the copy still disagrees with the record",
  "platform-override": "the latest event on each row is a platform-side override of the integration feed",
  encoding: "each finding is a serialization fault the engine names itself (a 100x cents price or a case-mangled currency)",
};

function instantOf(value: string, where: string): number {
  const t = Date.parse(value);
  if (Number.isNaN(t)) throw new Error(`explain_drift: ${where} is not a valid instant: "${value}"`);
  return t;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Does an event target touch this finding's row? (exact row · the row's item · a claim-id prefix) */
function touches(f: ExplainDriftParams["findings"][number], target: string): boolean {
  if (f.referenceRowId !== null) {
    if (f.referenceRowId === target) return true;
    if (new RegExp(`^${escapeRe(target)}-v\\d+$`).test(f.referenceRowId)) return true;
  }
  return f.id.startsWith(`${target}#`);
}

function explainDrift(p: ExplainDriftParams): ExplainDriftResult {
  const asOf = instantOf(p.asOf, "asOf");
  const events = p.events.map((e, index) => ({ ...e, index, t: instantOf(e.at, `events[${index}].at`) })).filter((e) => e.t < asOf);
  const syncs = events.filter((e) => e.action === "sync");
  const lastSync = syncs.reduce<(typeof events)[number] | null>((best, e) => (best === null || e.t > best.t ? e : best), null);
  const expiredRows = new Set(p.findings.filter((f) => f.ruleId === STALE_RULE_ID && f.referenceRowId !== null).map((f) => f.referenceRowId as string));

  const perFinding: Array<{ cls: ExplainDriftClass; cites: number[] }> = p.findings.map((f) => {
    if (ENCODING_RULE_IDS.has(f.ruleId)) return { cls: "encoding", cites: [] };
    const expired = f.referenceRowId !== null && expiredRows.has(f.referenceRowId);
    const touching = events.filter((e) => touches(f, e.target));
    if (touching.length === 0) {
      return expired && lastSync !== null ? { cls: "sync-latency", cites: [lastSync.index] } : { cls: "unknown", cites: [] };
    }
    const latestT = Math.max(...touching.map((e) => e.t));
    const latest = touching.filter((e) => e.t === latestT);
    if (new Set(latest.map((e) => `${e.actor}|${e.action}`)).size > 1) return { cls: "unknown", cites: [] };
    const e = latest[0];
    if (e.actor === "platform" && e.action === "override") return { cls: "platform-override", cites: [e.index] };
    if (e.actor === "merchant" && MERCHANT_EDITS.has(e.action)) {
      if (!expired) return { cls: "merchant-edit", cites: [e.index] };
      return lastSync !== null ? { cls: "sync-latency", cites: [lastSync.index, e.index] } : { cls: "unknown", cites: [] };
    }
    if (e.actor === "integrator" && e.action === "sync") return { cls: "integrator-bug", cites: [e.index] };
    return { cls: "unknown", cites: [] };
  });

  const n = perFinding.length;
  const tally = new Map<ExplainDriftClass, number>();
  for (const r of perFinding) tally.set(r.cls, (tally.get(r.cls) ?? 0) + 1);
  const breakdown = EXPLAIN_DRIFT_CLASSES.filter((c) => tally.has(c)).map((c) => `${c} x${tally.get(c)}`).join(", ");

  if (n === 0) {
    return freezeExplanation("unknown", [], "Abstained: there are no findings to explain.");
  }
  if (tally.size === 1 && !tally.has("unknown")) {
    const cls = perFinding[0].cls as Exclude<ExplainDriftClass, "unknown">;
    const cites = [...new Set(perFinding.flatMap((r) => r.cites))].sort((a, b) => a - b);
    return freezeExplanation(cls, cites, `All ${n} finding(s) read as ${cls}: ${CLASS_SENTENCE[cls]}.`);
  }
  if (tally.size === 1) {
    return freezeExplanation(
      "unknown",
      [],
      `Abstained: no rule row explains any of the ${n} finding(s) from the events before the as-of, so no cause is claimed.`,
    );
  }
  return freezeExplanation(
    "unknown",
    [],
    `Abstained: the ${n} finding(s) do not agree (${breakdown}), and the baseline never picks between causes.`,
  );
}

function freezeExplanation(cls: ExplainDriftClass, citedEvents: readonly number[], reason: string): ExplainDriftResult {
  return Object.freeze({ class: cls, citedEvents: Object.freeze([...citedEvents]), reason, label: EXPLAIN_DRIFT_LABEL });
}

/** Run `explain_drift`. `params` must already be ajv-validated by `callTool`. Always exit 0: an explanation, never a verdict. */
function runExplainDriftTool(params: unknown): ToolResult {
  const result = explainDrift(params as ExplainDriftParams);
  return freezeToolResult({ tool: "explain_drift", ok: true, exitCode: 0, canonical: `${JSON.stringify(result, null, 2)}\n` });
}

// ---------------------------------------------------------------------------
// S2-crew · size_impact — the Impact seat's arithmetic (lib/impact), wired as
// a registry tool against the contract shared with the S2-impact lane. The
// schema mirrors that module's own input checks (channel/status/reason enums,
// integer cents, positive window, share in [0, 1]) so ajv and `sizeImpact`
// agree; any failure inside `sizeImpact` passes straight through, like every
// engine error here. Every figure is labeled "simulated" by the module.
// ---------------------------------------------------------------------------

/** Params for `size_impact` — the lib/impact contract, verbatim. */
export type SizeImpactParams = ImpactInput;
export type { ImpactResult };

const CENTS = { type: "integer", minimum: 0 } as const;

const SIZE_IMPACT_INPUT_SCHEMA: Readonly<Record<string, unknown>> = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://activationops.local/tools/size_impact.input.schema.json",
  title: "size_impact input",
  type: "object",
  additionalProperties: false,
  required: ["findings", "orders", "windowDays", "errorChargeShare"],
  properties: {
    findings: {
      type: "array",
      maxItems: 5000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "ruleId", "category", "referenceRowId"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 500 },
          ruleId: { type: "string", minLength: 1, maxLength: 100 },
          category: { type: "string", minLength: 1, maxLength: 100 },
          referenceRowId: { type: ["string", "null"], maxLength: 500 },
        },
      },
    },
    orders: {
      type: "array",
      maxItems: 100000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["order_id", "placed_at", "channel", "lines", "status", "refund_cents", "refund_allocation", "reason"],
        properties: {
          order_id: { type: "string", minLength: 1, maxLength: 200 },
          placed_at: { type: "string", format: "date-time" },
          channel: { type: "string", enum: ["app", "agent"] },
          lines: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["variation_id", "modifier_option_ids", "qty", "unit_price_cents_charged"],
              properties: {
                variation_id: { type: "string", minLength: 1, maxLength: 200 },
                modifier_option_ids: { type: "array", items: { type: "string", minLength: 1, maxLength: 200 } },
                qty: { type: "integer", minimum: 1 },
                unit_price_cents_charged: CENTS,
              },
            },
          },
          status: { type: "string", enum: ["fulfilled", "refunded", "cancelled"] },
          refund_cents: CENTS,
          refund_allocation: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["variation_id", "cents"],
              properties: { variation_id: { type: "string", minLength: 1, maxLength: 200 }, cents: CENTS },
            },
          },
          reason: { type: "string", enum: ["menu", "other", "none"] },
        },
      },
    },
    windowDays: { type: "number", exclusiveMinimum: 0 },
    errorChargeShare: { type: "number", minimum: 0, maximum: 1 },
  },
});

/** Run `size_impact`. `params` must already be ajv-validated by `callTool`. A failure inside lib/impact is never caught here. */
function runSizeImpactTool(params: unknown): ToolResult {
  const result = sizeImpact(params as ImpactInput);
  return freezeToolResult({ tool: "size_impact", ok: true, exitCode: 0, canonical: `${JSON.stringify(result, null, 2)}\n` });
}

/** The output ENVELOPE schema for a tool that always exits 0 (the S2 tools). */
function envelopeSchema(name: string): Readonly<Record<string, unknown>> {
  return Object.freeze({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://activationops.local/tools/${name}.output.schema.json`,
    title: `${name} output envelope`,
    type: "object",
    additionalProperties: false,
    required: ["tool", "ok", "exitCode", "canonical"],
    properties: {
      tool: { const: name },
      ok: { const: true },
      exitCode: { const: 0 },
      demoOnly: { type: "boolean", const: false },
      advisory: { type: "boolean", const: false },
      earnsLabel: { type: "boolean" },
      canonical: { type: "string", minLength: 1 },
    },
  });
}

const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  {
    name: "check_feed",
    inputSchema: loadSchema("check_feed.input.schema.json"),
    outputSchema: loadSchema("check_feed.output.schema.json"),
    run: runCheckFeedTool,
  },
  {
    name: "check_conformance",
    inputSchema: loadSchema("check_conformance.input.schema.json"),
    outputSchema: loadSchema("check_conformance.output.schema.json"),
    run: runCheckConformanceTool,
  },
  {
    name: "audit_statement",
    inputSchema: loadSchema("audit_statement.input.schema.json"),
    outputSchema: loadSchema("audit_statement.output.schema.json"),
    run: runAuditStatementTool,
  },
  {
    name: "classify_and_audit",
    inputSchema: loadSchema("classify_and_audit.input.schema.json"),
    outputSchema: loadSchema("classify_and_audit.output.schema.json"),
    run: runClassifyAndAuditTool,
  },
  {
    name: "get_rule",
    inputSchema: loadSchema("get_rule.input.schema.json"),
    outputSchema: loadSchema("get_rule.output.schema.json"),
    run: runGetRuleTool,
  },
  {
    // E2 (pre-reg §6, wired post-scoring): advisory extractive retrieval over
    // the pin-verified corpus — BM25 lane (the floors' pick), permanently
    // advisory, label deferred (floors not met, RESULTS section).
    name: "lookup_reference",
    inputSchema: loadSchema("lookup_reference.input.schema.json"),
    outputSchema: loadSchema("lookup_reference.output.schema.json"),
    run: runLookupReferenceTool,
  },
  {
    name: "run_demo",
    demoOnly: true,
    inputSchema: loadSchema("run_demo.input.schema.json"),
    outputSchema: loadSchema("run_demo.output.schema.json"),
    run: runRunDemoTool,
  },
  // S2-crew (2026-10-31): two deterministic seats' tools. Schemas are committed
  // INLINE below (this lane may not add files under schemas/ or tools/); moving
  // them to schema files is an OPEN item for the merge, together with MCP
  // advertisement (lib/mcp/server.ts keeps them off tools/list until then).
  {
    name: "explain_drift",
    inputSchema: EXPLAIN_DRIFT_INPUT_SCHEMA,
    outputSchema: envelopeSchema("explain_drift"),
    run: runExplainDriftTool,
  },
  {
    name: "size_impact",
    inputSchema: SIZE_IMPACT_INPUT_SCHEMA,
    outputSchema: envelopeSchema("size_impact"),
    run: runSizeImpactTool,
  },
];

// The RUNNABLE registry stays module-PRIVATE: exposing `run` would let a
// consumer bypass `callTool`'s ajv input validation (Codex A0 review,
// finding 1). `callTool` below is the ONE execution path.
const RUNNABLE: ReadonlyMap<string, ToolDefinition> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, t]),
);

/**
 * The PUBLIC registry view — metadata only (name, `demoOnly` marker, committed
 * input/output schemas), deliberately with NO `run` function. Listing surfaces
 * (the A1 MCP server's tools/list, docs, tests) read this; execution goes
 * through {@link callTool} exclusively.
 */
export const TOOLS: ReadonlyMap<string, ToolMetadata> = new Map(
  TOOL_DEFINITIONS.map((t) => [
    t.name,
    Object.freeze({
      name: t.name,
      ...(t.demoOnly === true ? { demoOnly: true as const } : {}),
      inputSchema: t.inputSchema,
      outputSchema: t.outputSchema,
    }),
  ]),
);

// One compiled ajv validator per tool per schema half, built once at module
// load (compile is the expensive step; `callTool` reuses these).
const inputValidators: ReadonlyMap<string, ValidateFunction> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, compileSchema(t.inputSchema)]),
);
const outputValidators: ReadonlyMap<string, ValidateFunction> = new Map(
  TOOL_DEFINITIONS.map((t) => [t.name, compileSchema(t.outputSchema)]),
);

/** The compiled output-envelope validator for one tool (tests use this to assert AC-1's envelope-schema requirement). */
export function outputValidatorFor(name: string): ValidateFunction | undefined {
  return outputValidators.get(name);
}

/**
 * The ONE call surface: validate `params` against the tool's committed input
 * schema, THEN run it. Throws {@link ToolNotFoundError} for an unregistered
 * `name`, {@link ToolInputError} (carrying the ajv errors) for input that
 * fails schema validation. A runtime failure inside `run` (e.g. an unreadable
 * file, a malformed statement, an unknown `ruleId`) is the engine's or the
 * tool's own typed error and passes straight through — never caught here.
 */
export function callTool(name: string, params: unknown): ToolResult {
  const tool = RUNNABLE.get(name);
  if (!tool) {
    throw new ToolNotFoundError(name);
  }
  const validate = inputValidators.get(name);
  if (!validate) {
    // Unreachable in practice (every RUNNABLE entry has a compiled input
    // validator built above) — a defensive guard, not a silent fallback.
    throw new Error(`registry: no compiled input validator for tool "${name}"`);
  }
  if (!validate(params)) {
    throw new ToolInputError(name, validate.errors ?? []);
  }
  return tool.run(params);
}
