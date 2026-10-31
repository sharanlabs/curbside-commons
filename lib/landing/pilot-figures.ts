import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GUIDE } from "@/lib/landing/test-guide";

/**
 * EVERY FIGURE THE /pilot PAGE SHOWS — derived, never typed (plan § 12 S4:
 * "every figure on /pilot derived"; § 7 the cost-benefit model; decision-log
 * 2026-10-12 item 3, the executive layer).
 *
 * /pilot is the page a platform executive reads. It carries numbers, and a
 * number on an executive page is a claim. This repo has already paid twice for
 * a figure maintained by memory (see lib/landing/test-guide.ts), so the page
 * renders FIELDS of the objects below and types none. Four kinds of figure:
 *
 *  (a) COST MODEL — plan § 7's illustrative fill, as DECLARED CONSTANTS, each
 *      labeled ASSUMPTION with its source, and the ARITHMETIC that turns them
 *      into orders, drift-caused errors and monthly refund exposure. Rates are
 *      held as integer basis points and money as integer cents, so every step
 *      is exact integer arithmetic: a float path can render "107999.99…", and
 *      a test that recomputed it the same way would agree with itself and
 *      prove nothing. A non-whole result throws at build time rather than
 *      rendering a rounded figure nobody chose. Nothing here is a measurement.
 *  (b) THE BUNDLED PAIR — imported from GUIDE (test-guide.ts), never re-typed.
 *  (c) THE SCENARIO LIBRARY — read from fixtures/scenarios/<id>/manifest.json
 *      at build time. The page shows whichever folders exist, so a scenario
 *      that lands later flips from ARRIVES to BUILT without an edit here. A
 *      folder whose manifest is not `"simulated": true` THROWS: RULES §4 is a
 *      build failure, not a rendering choice.
 *  (d) GOVERNANCE — the action tiers and the control register as structured
 *      text (no figures), so the page and its test read one source.
 *
 * Every state word that depends on a Wave 2 lane still in flight on
 * 2026-10-31 lives in STATE below, so the orchestrator flips one constant at
 * merge instead of hunting through JSX.
 *
 * Reads only node:fs and node:path; imports no model client, no SDK, no
 * network module. evals/packs/pilot-figures.test.ts walks the import graph
 * (fail-closed allowlist) and holds every arithmetic figure equal to an
 * independent recomputation written in the test.
 */

// ---------------------------------------------------------------------------
// STATE — the labels that move when a lane merges. Today's truth, 2026-10-31.
// ---------------------------------------------------------------------------

export const STATE = {
  engine: "BUILT",
  modifierChecks: "BUILT (S1)",
  explainAndRoute: "ARRIVES S2 (in progress)",
  impactArithmetic: "MERGED 2026-10-31 as a library; shown in a run when S2 lands",
  ledger: "library MERGED 2026-10-31, and a run that writes to it ARRIVES S2 (in progress)",
  signing: "BUILT as an offline simulator",
  rootCauseSeat: "ARRIVES S2 (in progress); shows DEFER until it passes an exam",
  intakeReviewer: "BUILT; examined on one model only",
  slackEmail: "BUILT, not sent",
  partnerTicket: "ARRIVES S4",
  orderErrorTrigger: "ARRIVES S3",
  preflightTool: "PROPOSED; not built",
  picker: "ARRIVES S4",
  csvIngestDrop: "BUILT; it reads named columns only",
  jsonIngestDrop: "ARRIVES S1.5 (in progress)",
  adapters: "ARRIVES S3",
} as const;

// ---------------------------------------------------------------------------
// Formatting — exported so the page and the test print the same text.
// ---------------------------------------------------------------------------

/** 900000 → "900,000". Integers only: a fraction here is a derivation bug. */
export function formatCount(n: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`formatCount expects a whole, non-negative number, got ${n}`);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 150 basis points → "1.5%"; 4000 → "40%". Exact: no float division. */
export function formatBp(bp: number): string {
  if (!Number.isInteger(bp) || bp < 0) throw new Error(`formatBp expects whole basis points, got ${bp}`);
  const whole = Math.floor(bp / 100);
  const frac = String(bp % 100).padStart(2, "0").replace(/0+$/, "");
  return frac === "" ? `${formatCount(whole)}%` : `${formatCount(whole)}.${frac}%`;
}

/** 10800000 cents → "$108,000"; 1999 → "$19.99". */
export function formatUsd(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) throw new Error(`formatUsd expects whole cents, got ${cents}`);
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? `$${formatCount(dollars)}` : `$${formatCount(dollars)}.${String(rest).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// (a) THE COST MODEL — plan § 7, illustrative.
// ---------------------------------------------------------------------------

/** The formula, exactly as plan § 7 and docs/pilot-kit/pilot-proposal.md § 6 state it. */
export const COST_FORMULA =
  "Benefit per month ≈ orders × error rate × menu-data share × average refund × measured catch rate + dispute minutes avoided × loaded hourly cost + agent cancellations avoided × their cost.";

type Unit = "count" | "bp" | "cents";

export interface Assumption {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: Unit;
  readonly basis: "ASSUMPTION";
  readonly source: string;
}

const SRC = "plan § 7, illustrative fill (synthetic; not a measurement)";

/** The declared inputs. Every one is an ASSUMPTION; none was measured. */
export const ASSUMPTIONS = {
  stores: { key: "stores", label: "Stores", value: 1000, unit: "count", basis: "ASSUMPTION", source: SRC },
  ordersPerStorePerDay: {
    key: "ordersPerStorePerDay",
    label: "Orders per store per day",
    value: 30,
    unit: "count",
    basis: "ASSUMPTION",
    source: SRC,
  },
  days: { key: "days", label: "Days in the month", value: 30, unit: "count", basis: "ASSUMPTION", source: SRC },
  errorRateBp: {
    key: "errorRateBp",
    label: "Order-error rate",
    value: 150,
    unit: "bp",
    basis: "ASSUMPTION",
    source: SRC,
  },
  menuShareBp: {
    key: "menuShareBp",
    label: "Menu-data share of those errors",
    value: 4000,
    unit: "bp",
    basis: "ASSUMPTION",
    source: SRC,
  },
  avgRefundCents: {
    key: "avgRefundCents",
    label: "Average refund",
    value: 2000,
    unit: "cents",
    basis: "ASSUMPTION",
    source: SRC,
  },
} as const satisfies Record<string, Assumption>;

export function formatValue(value: number, unit: Unit): string {
  return unit === "bp" ? formatBp(value) : unit === "cents" ? formatUsd(value) : formatCount(value);
}

const BP = 10_000;

/** a × num / BP, refusing a fraction (the page never prints a figure nobody chose). */
function share(a: number, bp: number, what: string): number {
  const scaled = a * bp;
  if (scaled % BP !== 0) throw new Error(`${what}: ${a} × ${bp} bp is not a whole number — change the declared assumptions`);
  return scaled / BP;
}

export interface Derived {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: Unit;
  readonly basis: "ARITHMETIC";
  /** The arithmetic in words, as the page prints it beside the figure. */
  readonly how: string;
}

/** Exported for the test's mutation teeth; the page reads COST.derived. */
export function deriveCost(a: { readonly [K in keyof typeof ASSUMPTIONS]: { readonly value: number } }) {
  const ordersPerMonth = a.stores.value * a.ordersPerStorePerDay.value * a.days.value;
  const orderErrorsPerMonth = share(ordersPerMonth, a.errorRateBp.value, "order errors");
  const driftErrorsPerMonth = share(orderErrorsPerMonth, a.menuShareBp.value, "drift-caused errors");
  const refundExposureCents = driftErrorsPerMonth * a.avgRefundCents.value;
  return {
    ordersPerMonth: {
      key: "ordersPerMonth",
      label: "Orders per month",
      value: ordersPerMonth,
      unit: "count",
      basis: "ARITHMETIC",
      how: "stores × orders per store per day × days",
    },
    orderErrorsPerMonth: {
      key: "orderErrorsPerMonth",
      label: "Order errors per month",
      value: orderErrorsPerMonth,
      unit: "count",
      basis: "ARITHMETIC",
      how: "orders per month × order-error rate",
    },
    driftErrorsPerMonth: {
      key: "driftErrorsPerMonth",
      label: "Drift-caused errors per month",
      value: driftErrorsPerMonth,
      unit: "count",
      basis: "ARITHMETIC",
      how: "order errors per month × menu-data share",
    },
    refundExposureCents: {
      key: "refundExposureCents",
      label: "Refund flow exposed to this class per month, before any catch rate",
      value: refundExposureCents,
      unit: "cents",
      basis: "ARITHMETIC",
      how: "drift-caused errors per month × average refund",
    },
  } as const satisfies Record<string, Derived>;
}

export const COST = {
  label: "ILLUSTRATIVE" as const,
  formula: COST_FORMULA,
  assumptions: ASSUMPTIONS,
  derived: deriveCost(ASSUMPTIONS),
  /** No catch rate is assumed. The formula multiplies by one; the pilot would measure it. */
  catchRate: { label: "Measured catch rate", value: null, display: "Not measured; none is assumed" },
  notAMeasurement: "No dollar figure on this page is a measurement.",
} as const;

// ---------------------------------------------------------------------------
// (b) THE BUNDLED PAIR — the front page's run, from GUIDE (never re-typed).
// ---------------------------------------------------------------------------

export const BUNDLED = {
  verdict: GUIDE.bundled.verdict,
  findings: GUIDE.bundled.findings,
  errors: GUIDE.bundled.errors,
  warnings: GUIDE.bundled.warnings,
  rowsRead: GUIDE.bundled.rowsRead,
} as const;

// ---------------------------------------------------------------------------
// (c) THE SCENARIO LIBRARY — the folders that exist, read at build time.
// ---------------------------------------------------------------------------

/** The plan's eight stories (plan § 9), in the plan's order. Text, not figures. */
export const PLAN_SCENARIOS: ReadonlyArray<{ readonly id: string; readonly story: string; readonly arrives: string | null }> = [
  { id: "agent-86", story: "An agent order lands on an item the record shows sold out while the copy still offers it", arrives: null },
  { id: "modifier-drift", story: "A modifier option’s price differs between the record and the copy", arrives: "S1.5 (in progress)" },
  { id: "sync-outage", story: "A whole category goes stale after a sync-vendor outage", arrives: null },
  { id: "platform-override", story: "A manual platform-side edit wins over the feed", arrives: null },
  { id: "partner-onboarding", story: "A new integration partner’s feed, a chosen mix of clean and drifted rows", arrives: null },
  { id: "spec-valid-lie", story: "A response that passes conformance and still states a wrong price", arrives: "S1.5 (in progress)" },
  { id: "fee-precheck", story: "A draft fee statement pre-checked against NYC §20-563.3 for a legal team", arrives: null },
  { id: "injected-artifact", story: "A prompt-injected artifact tries to steer the crew", arrives: "S3" },
];

export interface ScenarioRow {
  readonly id: string;
  readonly story: string;
  readonly state: "BUILT" | "ARRIVES" | "NOT BUILT";
  readonly arrives: string | null;
  readonly pack: string | null;
  readonly verdict: string | null;
  readonly findings: number | null;
  /** What the manifest says is deliberately absent until a later slice (root-cause, impact, …). */
  readonly later: readonly string[];
}

const SCENARIO_DIR = join(process.cwd(), "fixtures", "scenarios");

interface Manifest {
  readonly id: string;
  readonly simulated: unknown;
  readonly pack?: string;
  readonly figures?: { readonly verdict?: string; readonly findings?: number };
  readonly absentUntilS2?: readonly string[];
}

function readManifest(dir: string, id: string): Manifest {
  const m = JSON.parse(readFileSync(join(dir, id, "manifest.json"), "utf8")) as Manifest;
  if (m.simulated !== true) {
    throw new Error(`fixtures/scenarios/${id}/manifest.json is not "simulated": true — /pilot renders synthetic scenarios only (RULES §4)`);
  }
  if (m.id !== id) throw new Error(`fixtures/scenarios/${id}/manifest.json names id "${m.id}"`);
  if (typeof m.figures?.verdict !== "string" || typeof m.figures?.findings !== "number") {
    throw new Error(`fixtures/scenarios/${id}/manifest.json carries no figures.verdict / figures.findings`);
  }
  return m;
}

/** Folder ids that hold a manifest, sorted. Whatever exists is what renders. */
export function scenarioFolders(dir: string = SCENARIO_DIR): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "manifest.json")))
    .map((d) => d.name)
    .sort();
}

/** The brief's heading after its em dash: "# agent-86 — <title>". Used only for a folder the plan does not name. */
function briefTitle(dir: string, id: string): string {
  const p = join(dir, id, "brief.md");
  const first = existsSync(p) ? (readFileSync(p, "utf8").split("\n")[0] ?? "") : "";
  const at = first.indexOf("—");
  return at > -1 ? first.slice(at + 1).trim() : id;
}

/** Exported so the test can point it at a temporary folder (the BUILT-flip and §4 teeth). */
export function buildLibrary(dir: string = SCENARIO_DIR) {
  const folders = new Set(scenarioFolders(dir));
  const row = (id: string, story: string, arrives: string | null): ScenarioRow => {
    if (!folders.has(id)) {
      return { id, story, state: arrives ? "ARRIVES" : "NOT BUILT", arrives, pack: null, verdict: null, findings: null, later: [] };
    }
    const m = readManifest(dir, id);
    return {
      id,
      story,
      state: "BUILT",
      arrives: null,
      pack: m.pack ?? null,
      verdict: m.figures!.verdict!,
      findings: m.figures!.findings!,
      later: Array.isArray(m.absentUntilS2) ? [...m.absentUntilS2] : [],
    };
  };
  const planned = new Set(PLAN_SCENARIOS.map((s) => s.id));
  const rows: ScenarioRow[] = [
    ...PLAN_SCENARIOS.map((s) => row(s.id, s.story, s.arrives)),
    ...[...folders].filter((id) => !planned.has(id)).map((id) => row(id, briefTitle(dir, id), null)),
  ];
  return {
    rows,
    builtCount: rows.filter((r) => r.state === "BUILT").length,
    plannedCount: PLAN_SCENARIOS.length,
  } as const;
}

export const LIBRARY = buildLibrary();

// ---------------------------------------------------------------------------
// (d) GOVERNANCE — tiers and controls, as text (plan § 6; docs/governance-model.md §§ 3–4).
// ---------------------------------------------------------------------------

export const TIERS: ReadonlyArray<{ readonly tier: number; readonly name: string; readonly covers: string; readonly state: string }> = [
  {
    tier: 0,
    name: "Notify",
    covers: "Slack, email and partner-ticket artifacts. A transport, if ever wired, is per channel, allow-listed and armed by the owner.",
    state: `Slack and email ${STATE.slackEmail}; partner ticket ${STATE.partnerTicket}`,
  },
  {
    tier: 1,
    name: "Propose",
    covers:
      "Hold an item on the agent surface, force a re-sync, mark an item sold out, open a partner ticket. Proposed with receipts; needs a signed human decision; \"executed\" means a ledger record.",
    state: `Signing ${STATE.signing}; the ledger ${STATE.ledger}`,
  },
  {
    tier: 2,
    name: "Act",
    covers: "Act on a completed audit a human has signed off, such as calling a platform API. Never from inside an audit.",
    state: "Out of scope for this pilot; not built",
  },
  {
    tier: 3,
    name: "Never",
    covers: "Amend a merchant record, issue a credit, or file a dispute or complaint on anyone’s behalf.",
    state: "Prohibited",
  },
];

export const CONTROLS: ReadonlyArray<{ readonly control: string; readonly today: string; readonly next: string }> = [
  {
    control: "Evidence",
    today: "Claim, reference row, rule id and severity on every finding, by construction.",
    next: "The id-mapping sheet cited as a reference row when it resolves an identity (ARRIVES S3).",
  },
  {
    control: "Model risk",
    today: "A model pinned per seat; a pre-call budget guard; an injection tripwire before any model turn; locks that re-derive every earned label.",
    next: "A re-exam on any model change (written in the model-risk register); a provider canary (ARRIVES S5).",
  },
  {
    control: "Data",
    today: "Nothing leaves the tab or the machine in site mode, held by import-graph tests; the spreadsheet path reads named columns only.",
    next: `Customer fields dropped on the JSON path too: ${STATE.jsonIngestDrop}.`,
  },
  {
    control: "Audit trail",
    today: "A report hash and the receipts bundle on every run.",
    next: `A hash-chained run ledger, exportable as JSON-lines: ${STATE.ledger}.`,
  },
  {
    control: "Operational",
    today: "Started by hand only; no scheduler; no standing process.",
    next: "An incident and rollback note, an escalation path and a RACI, written in the governance model.",
  },
];

// ---------------------------------------------------------------------------
// The before / after, as hypothesis — text with its state.
// ---------------------------------------------------------------------------

export const BEFORE_AFTER: ReadonlyArray<{ readonly step: string; readonly before: string; readonly after: string; readonly state: string }> = [
  {
    step: "Discovery",
    before: "Order errors are reported, refunded and charged back after the order.",
    after: "A run names each wrong price, missing option, phantom or unavailable item, with its receipt.",
    state: STATE.engine,
  },
  {
    step: "Why",
    before: "Argued case by case.",
    after: "A deterministic explanation of who changed what, and when.",
    state: STATE.explainAndRoute,
  },
  {
    step: "Size",
    before: "Known after refunds are issued.",
    after: "Orders touched, refunds observed and exposure ahead, with the arithmetic shown.",
    state: STATE.impactArithmetic,
  },
  {
    step: "Routing",
    before: "By hand.",
    after: "A readable rule table would name the team: merchant-ops, integrations or compliance.",
    state: STATE.explainAndRoute,
  },
  {
    step: "Action",
    before: "Advice to merchants, and integration thresholds.",
    after: "A proposal with receipts. A human signs a proposal; nothing acts.",
    state: STATE.signing,
  },
  {
    step: "For an AI agent",
    before: "It reads whatever the copy says.",
    after: "A pre-flight check an agent stack would call before ordering, answering \"safe to order\" or \"hold\".",
    state: STATE.preflightTool,
  },
];

// ---------------------------------------------------------------------------
// The one pre-registered number — text held equal to docs/pilot-kit/success-metrics.md.
// ---------------------------------------------------------------------------

export const M1 = {
  id: "M1",
  name: "Menu-data-caused order-error adjustments per 1,000 orders",
  instrument: "The platform’s own order-error report",
  floor: "TBD at pilot start — set before the first run",
  when: "measured later, with the platform’s own instruments, after a separate deployment decision",
} as const;
