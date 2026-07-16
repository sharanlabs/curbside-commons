/**
 * Landing grounding module (redesign slice C-REDO, 2026-07-14).
 *
 * Every count and every figure the landing renders is derived HERE, at build time,
 * from the engine measurables — never hand-typed into the page (which would drift).
 *   • the tally + verdict, the schema count, and the fee-rule split come from the
 *     ENGINE measurables (lib/dashboard/evidence.ts), which itself derives them from
 *     the same report + rule modules the /report and /eval surfaces render;
 *   • the single price specimen (the illustrative $2,150.00 vs $21.50 mismatch) is
 *     read out of the one price finding and its arithmetic is COMPUTED from that
 *     finding's own value, so the shown numbers cannot diverge from the record.
 *
 * This is a server module: app/page.tsx (a Server Component) imports it and passes
 * plain serializable objects down to the interactive client sections, so the engine
 * data never bundles into the browser.
 */

import expectedAcpReport from "@/fixtures/synthetic-restaurant/expected-report.acp.json";
import sorCatalog from "@/fixtures/synthetic-restaurant/sor.catalog.json";
import { ENGINE } from "@/lib/dashboard/evidence";

type Finding = {
  claim: { id: string; source: string; field: string; value: unknown };
  referenceRowId: string;
  ruleId: string;
  severity: string;
  plainLine: string;
};

const findings = expectedAcpReport.findings as Finding[];

function mustFind(ruleId: string, field: string): Finding {
  const f = findings.find((x) => x.ruleId === ruleId && x.claim.field === field);
  if (!f) throw new Error(`landing specimen: report finding missing (${ruleId}/${field})`);
  return f;
}

// The merchant's own recorded price (in cents), resolved from the reference-row id
// against the system-of-record — read INDEPENDENTLY from the record, never
// reconstructed from the claim (integrity: the comparison must use both sources).
type SorVariation = { id: string; priceCents: number };
type SorItem = { id: string; variations?: SorVariation[] };
const sorItems = (sorCatalog as { items: SorItem[] }).items;

function recordCentsFor(referenceRowId: string): number {
  for (const item of sorItems) {
    for (const v of item.variations ?? []) {
      if (v.id === referenceRowId) return v.priceCents;
    }
  }
  throw new Error(
    `landing specimen: reference row ${referenceRowId} not found in the SOR catalog`,
  );
}

// The lead price specimen — the served amount is one bare number that reads as
// $2,150.00 when treated as dollars but is $21.50 when read as the merchant's cents.
const price = mustFind("LST-PRICE-CENTS-AS-DECIMAL", "price.amount");
const raw = Number(price.claim.value); // 2150 — the served amount (read from the report claim)
const recordCents = recordCentsFor(price.referenceRowId); // 2150¢ — read from the SOR row, not the claim
// Integrity cross-check: the cents-as-decimal drift means the served bare number
// equals the merchant record's cent count. If the two independent sources ever
// disagree, the specimen is stale — fail the build rather than render a false pair.
if (raw !== recordCents) {
  throw new Error(
    `landing specimen: served value (${raw}) and SOR record (${recordCents}¢) disagree — regenerate`,
  );
}
const claimDollars = raw.toFixed(2); // "2150.00" — served number misread as dollars
const claimCents = raw * 100; // 215000¢ — dollars × 100
const recordDollars = (raw / 100).toFixed(2); // "21.50" — the correct dollar value
const idBase = price.claim.id.split("#")[0]; // item-001-v1
const ruleLabelUpper = price.ruleId.replace(/^LST-PRICE-/, ""); // CENTS-AS-DECIMAL

/** $2,150.00 — thousands-grouped currency (cents figures stay ungrouped). */
function money(dollars: string): string {
  const [int, frac] = dollars.split(".");
  return `$${Number(int).toLocaleString("en-US")}.${frac ?? "00"}`;
}

/** The verdict is FAIL when the report is not ok — read straight from the record. */
export const VERDICT_FAIL = expectedAcpReport.ok === false;

export type BenchSpecimen = {
  tally: { total: number; errors: number; warns: number };
  verdictFail: boolean;
  claim: { field: string; money: string; unit: string };
  record: { field: string; cents: string; money: string };
  rule: { id: string; label: string; factor: string; plain: string };
  arithmetic: { left: string; right: string; break: string; factor: string };
  finding: {
    severity: string;
    plain: string;
    index: string;
    total: string;
    claimId: string;
    idBase: string;
  };
};

export const BENCH: BenchSpecimen = {
  tally: { total: ENGINE.demoFindings, errors: ENGINE.demoErrors, warns: ENGINE.demoWarns },
  verdictFail: VERDICT_FAIL,
  claim: {
    field: "offers.price",
    money: money(claimDollars), // $2,150.00
    unit: `${claimDollars} USD`, // 2150.00 USD
  },
  record: {
    field: "price_cents",
    cents: String(recordCents), // 2150
    money: money(recordDollars), // $21.50
  },
  rule: {
    id: price.ruleId, // LST-PRICE-CENTS-AS-DECIMAL
    label: ruleLabelUpper, // CENTS-AS-DECIMAL
    factor: "×100",
    plain: "decimal dollars × 100 = integer cents",
  },
  arithmetic: {
    left: `${claimDollars} × 100 = ${claimCents}¢`, // 2150.00 × 100 = 215000¢
    right: `merchant record = ${recordCents}¢`, // merchant record = 2150¢
    break: `${claimCents}¢ ≠ ${recordCents}¢ (×100)`, // 215000¢ ≠ 2150¢ (×100)
    factor: "100×",
  },
  finding: {
    severity: price.severity, // error
    plain: "Claim is 100× the merchant record.",
    // The price finding's REAL position in the report (derived, not hard-typed) —
    // it is the 11th of 16 findings, so the receipt reads "finding 11 of 16".
    index: String(findings.indexOf(price) + 1).padStart(2, "0"), // 11
    total: String(ENGINE.demoFindings), // 16
    claimId: price.claim.id, // item-001-v1#price.amount
    idBase, // item-001-v1
  },
};

export type MethodDetail = { key: string; label: string; value: string; note: string };

export const METHOD: MethodDetail[] = [
  {
    key: "claim",
    label: "CLAIM",
    value: `${idBase}#price.amount · ${raw}`, // item-001-v1#price.amount · 2150
    note: "The machine-readable field and the value as served.",
  },
  {
    key: "record",
    label: "RECORD",
    value: `${idBase} · price.amount · ${recordDollars}`, // item-001-v1 · price.amount · 21.50
    note: "The same field in the merchant's own system.",
  },
  {
    key: "rule",
    label: "RULE",
    value: `${ruleLabelUpper.toLowerCase()} · ${"×100"}`, // cents-as-decimal · ×100
    note: "The relationship the two values are held to.",
  },
  {
    key: "verdict",
    label: "VERDICT",
    value: `${price.severity} · price · 100×`, // error · price · 100×
    note: "Claim, record, and rule kept attached to the conclusion.",
  },
];

export const COVERAGE = {
  findingsTotal: ENGINE.demoFindings, // 16
  errors: ENGINE.demoErrors, // 11
  warns: ENGINE.demoWarns, // 5
  verdict: VERDICT_FAIL ? "FAIL" : "PASS",
  schemas: ENGINE.ucpSchemaCount, // 78
  feeRulesTotal: ENGINE.feeRulesTotal, // 17
  feeExecutable: ENGINE.feeRulePredicates, // 11
  feeExternal: ENGINE.feeRulesNonCheckable, // 6
} as const;

/** The peripheral field fragments for the hero background (illustrative specimen). */
export const HERO_FRAGMENTS = {
  claim: `price.amount · ${raw}`, // price.amount · 2150
  record: `record · ${recordDollars}`, // record · 21.50
} as const;
