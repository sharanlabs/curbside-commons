/**
 * UCP catalog CONFORMANCE leg — W2 (plan §5 W2, §3 "own TS/ajv validation";
 * criteria C5 conformance-correctness, C10 spec-version pin).
 *
 * The verifier's SECOND question, kept cleanly separate from the truth leg: does
 * a UCP catalog-response document CONFORM to the published UCP JSON Schemas? This
 * is the "conformance" half of the program's core distinction — a spec-VALID
 * document can still LIE about the merchant's system-of-record (the truth leg,
 * run.ts, owns that). Conformance findings use a DISTINCT rule-ID family
 * (`LST-CONF-*`) and the `conformance` category, so the two families never blur
 * in a rule id, a category, or a report.
 *
 * Composition (followed per the UCP spec, read as reference 2026-07-03 — the
 * `ucp-schema` README + the `ucp` spec repo): UCP mandates CLIENT-SIDE schema
 * composition — schemas cross-reference by relative `$ref` against each file's
 * absolute `$id`. We register every pinned schema by its `$id` so ajv resolves
 * the whole graph locally; a catalog search/lookup response is validated against
 * the `{op}_response` `$defs` entry of its capability schema.
 *
 * HONESTY BOUND (documented, not hidden): the pinned schemas carry UCP vendor
 * vocabulary at schema level (`name` capability id; `ucp_request`/`ucp_response`/
 * `ucp_shared_request` visibility annotations). We run ajv `strict:false`, so
 * those are non-constraining annotations while EVERY standard validation keyword
 * (type/required/pattern/minItems/minimum/format) is enforced. Applying the
 * annotations to derive per-operation views (the official `resolve` step) is the
 * cargo-only Rust tool's job — our runtime does STRUCTURAL conformance only. The
 * `test:ucp-oracle` CI lane is the differential check on that boundary.
 *
 * $0 / offline: reads pinned JSON Schemas from disk, zero network, zero LLM,
 * zero clock reads (the pinned spec version is data). This module imports
 * `node:fs`, so — like cli.ts — it is intentionally NOT re-exported from the
 * browser-safe pack barrel (index.ts).
 *
 * Plain: this checks a UCP menu answer against the official rulebook for what such
 * an answer must look like. Passing this check means "correctly shaped" — NOT
 * "true". A perfectly-shaped answer can still quote the wrong price; that lie is
 * the truth leg's job. We keep the two kinds of catch clearly labeled apart.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";
import addFormatsModule from "ajv-formats";
import type { Claim, VerifierReport } from "../../verifier-core/index.ts";
import { makeFinding, type FindingInput } from "../../verifier-core/guard.ts";
import { buildReport } from "../../verifier-core/verify.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** Default pinned-schema base dir (cwd-relative; the shipped conformance corpus
 * and the CLI both use this — zero-config, C1). Spec version = dir name. */
export const DEFAULT_UCP_SCHEMA_DIR = join(
  "fixtures",
  "ucp-schemas",
  UCP_PINNED_VERSION,
  "schemas",
);

/** Catalog response operations → the pinned `{op}_response` schema `$id` ref
 * validated against. All three are product-catalog "answer" shapes. */
export const UCP_CATALOG_OPERATIONS = {
  search: "https://ucp.dev/schemas/shopping/catalog_search.json#/$defs/search_response",
  lookup: "https://ucp.dev/schemas/shopping/catalog_lookup.json#/$defs/lookup_response",
  get_product: "https://ucp.dev/schemas/shopping/catalog_lookup.json#/$defs/get_product_response",
} as const;

export type UcpCatalogOp = keyof typeof UCP_CATALOG_OPERATIONS;

/** Map an ajv keyword to a stable `LST-CONF-*` rule id (the spec-clause family).
 * Every conformance break is severity `error`: a wrong-shaped document is not a
 * matter of degree. Unknown keywords fall back to a generic rule id carrying the
 * keyword, so no error is ever silently unclassified. */
export function conformanceRuleId(keyword: string): string {
  switch (keyword) {
    case "required":
      return "LST-CONF-REQUIRED-MISSING";
    case "type":
      return "LST-CONF-TYPE";
    case "pattern":
      return "LST-CONF-PATTERN";
    case "format":
      return "LST-CONF-FORMAT";
    case "enum":
      return "LST-CONF-ENUM";
    case "const":
      return "LST-CONF-CONST";
    case "minItems":
    case "maxItems":
      return "LST-CONF-ARRAY-BOUNDS";
    case "minimum":
    case "maximum":
    case "exclusiveMinimum":
    case "exclusiveMaximum":
      return "LST-CONF-NUMBER-RANGE";
    case "minLength":
    case "maxLength":
      return "LST-CONF-STRING-LENGTH";
    case "minProperties":
    case "maxProperties":
      return "LST-CONF-OBJECT-SHAPE";
    case "additionalProperties":
    case "unevaluatedProperties":
      return "LST-CONF-ADDITIONAL-PROP";
    default:
      return `LST-CONF-SCHEMA-${keyword.toUpperCase()}`;
  }
}

interface LoadedValidator {
  readonly ajv: Ajv2020;
  readonly validators: Map<UcpCatalogOp, ValidateFunction>;
}

// One compiled ajv per schema dir (compile is the expensive step; episodic runs
// + the eval suite call this many times). Keyed by resolved dir.
const cache = new Map<string, LoadedValidator>();

function walkJson(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkJson(p));
    else if (p.endsWith(".json")) out.push(p);
  }
  return out.sort();
}

/** Build (or reuse) an ajv with every pinned schema registered by `$id`, plus
 * the `{op}_response` validators compiled. See the file header for `strict:false`
 * and the vendor-annotation honesty bound. */
export function loadUcpValidators(schemaDir: string = DEFAULT_UCP_SCHEMA_DIR): LoadedValidator {
  const cached = cache.get(schemaDir);
  if (cached) return cached;

  const ajv = new Ajv2020({ strict: false, allErrors: true, verbose: true });
  // ajv-formats is CJS; tolerate both default and namespace interop shapes.
  const addFormats =
    (addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ??
    addFormatsModule;
  addFormats(ajv);

  for (const file of walkJson(schemaDir)) {
    ajv.addSchema(JSON.parse(readFileSync(file, "utf8")));
  }

  const validators = new Map<UcpCatalogOp, ValidateFunction>();
  for (const [op, ref] of Object.entries(UCP_CATALOG_OPERATIONS) as [UcpCatalogOp, string][]) {
    const v = ajv.getSchema(ref);
    if (!v) throw new Error(`ucp conformance: could not compile validator for ${op} (${ref})`);
    validators.set(op, v);
  }
  const loaded: LoadedValidator = { ajv, validators };
  cache.set(schemaDir, loaded);
  return loaded;
}

/** A failing value worth citing in the report — primitives only, so a
 * document-level object does not bloat the one-page report. */
function citeValue(data: unknown): unknown {
  const t = typeof data;
  if (data === null || t === "string" || t === "number" || t === "boolean") return data;
  return undefined;
}

/** Turn one ajv error into a C2-complete finding input. A conformance finding's
 * "claim" is the offending document node (source `ucp-catalog`, field = its JSON
 * pointer — never empty: the document root is `/`), the "reference row" is the
 * exact schema clause it violated, and the rule id is its `LST-CONF-*` class.
 * This satisfies the C2 guard's four-field contract for a DOCUMENT-LEVEL finding
 * with no extension of the guard needed. */
export function errorToFinding(op: UcpCatalogOp, err: ErrorObject): FindingInput {
  const loc = err.instancePath === "" ? "/" : err.instancePath;
  const missing =
    err.keyword === "required" && typeof err.params.missingProperty === "string"
      ? `${err.instancePath}/${err.params.missingProperty}`
      : loc;
  const claim: Claim = {
    id: `${loc} (${err.keyword})`,
    source: "ucp-catalog",
    field: missing,
    value: citeValue((err as ErrorObject & { data?: unknown }).data),
  };
  return {
    claim,
    // The spec-clause id cited for C2: the operation + the schema JSON pointer
    // (post-composition) that rejected the document.
    referenceRowId: `ucp-catalog:${op}${err.schemaPath}`,
    ruleId: conformanceRuleId(err.keyword),
    severity: "error",
    category: "conformance",
    plainLine: `Conformance: the document ${loc === "/" ? "root" : `at ${loc}`} ${err.message ?? `violates ${err.keyword}`} (UCP ${op} schema, ${UCP_PINNED_VERSION}).`,
  };
}

/** Options for a conformance run. */
export interface ConformanceOptions {
  /** Which catalog response shape to validate against (default `search`). */
  readonly op?: UcpCatalogOp;
  /** Pinned-schema base dir (default {@link DEFAULT_UCP_SCHEMA_DIR}). */
  readonly schemaDir?: string;
  /** Honesty surface (C10): true for the synthetic corpus (default true). */
  readonly simulated?: boolean;
}

/**
 * Validate a UCP catalog-response document against the pinned schemas and return
 * an evidence-cited {@link VerifierReport} of `LST-CONF-*` findings. `ok:true`
 * means the document is spec-shaped — which, per this program's whole thesis, is
 * NOT a claim that it is true. The report header pins the UCP spec version (C10).
 */
export function runUcpConformance(
  doc: unknown,
  opts: ConformanceOptions = {},
): VerifierReport {
  const op: UcpCatalogOp = opts.op ?? "search";
  const { validators } = loadUcpValidators(opts.schemaDir ?? DEFAULT_UCP_SCHEMA_DIR);
  const validate = validators.get(op);
  if (!validate) throw new Error(`ucp conformance: unknown op ${op}`);

  const valid = validate(doc);
  // Every conformance finding is admitted by the SAME C2 guard the truth leg
  // uses (makeFinding throws on any missing receipt); buildReport re-asserts it.
  const findings = valid
    ? []
    : (validate.errors ?? []).map((e) => makeFinding(errorToFinding(op, e)));

  return buildReport(findings, {
    specVersion: `ucp-catalog-${op}@${UCP_PINNED_VERSION}`,
    // Conformance has no entity-resolution step; the label reflects the corpus
    // provenance (the shipped corpus is synthetic-controlled), not a matching claim.
    matchingMode: "synthetic-controlled",
    simulated: opts.simulated ?? true,
  });
}
