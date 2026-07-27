/**
 * Listings verification runner — W1 (composes engine + adapters + detectors).
 *
 * Adds the whole-copy COMPLETENESS SWEEP no single claim can express:
 * - unresolved rows → deterministic entity resolution (exact expected-title
 *   match, unique) decides ID-MISMATCH (identity) vs GHOST (existence);
 * - SOR rows never claimed → MISSING (existence), expressed as the copy's
 *   implicit claim-of-omission (a constructed `existence:false` claim, so even
 *   absence carries C2 receipts).
 *
 * Plain: after checking every statement the copy makes, we also check what it
 * DOESN'T say — items it invented, items it renamed, items it silently dropped.
 */
import type {
  Claim,
  Finding,
  MatchingMode,
  Reference,
  VerifierReport,
} from "../../verifier-core/index.ts";
import { makeFinding } from "../../verifier-core/guard.ts";
import { buildReport, verifyClaims } from "../../verifier-core/verify.ts";
import { listingsDetectors } from "./detectors.ts";
import { expectedTitle, indexCatalog, sorReference, type SorTruth } from "./reference.ts";
import type { SyntheticCatalog } from "./types.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** The pinned spec/taxonomy line stamped into every W1 report header (C10). */
export const LISTINGS_SPEC_VERSION = `taxonomy-v1+acp-extract-2026-07-02+ucp-pin-${UCP_PINNED_VERSION}`;

/**
 * A Reference that answers EVERY claim with one already-resolved truth row.
 *
 * The ordinary `sorReference` matches by variation id, which is exactly what a
 * title-resolved row cannot do — its id is stale. Once resolution has settled
 * identity, the remaining claims still need judging, so they are re-run against
 * a reference pinned to the record resolution chose (gate finding 8).
 *
 * `matching` stays `synthetic-controlled` because that is what the C3 label
 * means in this engine — exact matching on shared ids, here on the truth side
 * of an established identity. It is NOT a claim that entity resolution was the
 * matching mechanism; the ID-MISMATCH finding beside it is what records that.
 */
function pinnedReference(truth: SorTruth): Reference {
  return {
    kind: "pos-catalog",
    resolve() {
      return {
        referenceRowId: truth.variation.id,
        matching: "synthetic-controlled",
        value: truth,
      };
    },
  };
}

function completenessSweep(
  claims: readonly Claim[],
  sor: SyntheticCatalog,
): readonly Finding[] {
  const { byVariationId, byExpectedTitle } = indexCatalog(sor);
  const findings: Finding[] = [];
  const source = claims[0]?.source ?? "acp-feed";

  // Group claims by serving row (skip catalog-level meta claims).
  const rows = new Map<string, Map<string, unknown>>();
  for (const c of claims) {
    const rowId = c.id.split("#")[0];
    if (rowId === "catalog") continue;
    const fields = rows.get(rowId) ?? new Map<string, unknown>();
    fields.set(c.field, c.value);
    rows.set(rowId, fields);
  }

  const resolvedTruthIds = new Set<string>();
  for (const [rowId, fields] of rows) {
    if (byVariationId.has(rowId)) {
      resolvedTruthIds.add(rowId);
      continue;
    }
    // Unresolved row: entity resolution by exact expected-title match.
    const title = String(fields.get("title") ?? "");
    const titleMatches = byExpectedTitle.get(title) ?? [];
    const existenceClaim: Claim = {
      id: `${rowId}#existence`,
      source,
      field: "existence",
      value: true,
    };
    if (titleMatches.length === 1) {
      const truth = titleMatches[0];
      resolvedTruthIds.add(truth.variation.id);
      findings.push(
        makeFinding({
          claim: existenceClaim,
          referenceRowId: truth.variation.id,
          ruleId: "LST-IDENT-ID-MISMATCH",
          severity: "error",
          category: "identity",
          plainLine: `The copy keys this row as "${rowId}" but the catalog row is "${truth.variation.id}" — same item, mismatched identity (resolved by exact name).`,
        }),
      );
      // AUDIT THE REST OF THE ROW (cross-model gate finding 8, 2026-07-27).
      // Resolution used to END here: every per-claim detector runs off
      // `reference.resolve()`, which is keyed by variation id and returns null
      // for this row, so price, availability, title and the hidden-item rule
      // all silently no-opped. A merchant who renamed an id AND served a
      // hidden item — or a wrong price — got one finding about the id and
      // SILENCE about the rest, which is the more serious half.
      //
      // Now that identity is established, re-run the row's own claims against
      // the resolved record. `pinnedReference` answers every claim with this
      // one truth row, so each finding cites the RESOLVED id rather than the
      // feed's stale one.
      //
      // The `existence` claim is INCLUDED deliberately: the hidden-item rule
      // fires only on it (detectors.ts:36-37), so excluding it would leave the
      // exact hole this fix exists to close — a hidden item sold under a
      // renamed id. Re-emission is not a risk: the ID-MISMATCH finding above
      // comes from this sweep, not from a detector, so no detector can produce
      // it twice.
      findings.push(
        ...verifyClaims(
          claims.filter((c) => c.id.split("#")[0] === rowId),
          pinnedReference(truth),
          listingsDetectors,
        ),
      );
    } else if (titleMatches.length > 1) {
      // AMBIGUOUS, NOT ABSENT (cross-model gate finding 9, 2026-07-27). Several
      // catalog rows share this expected title, so resolution cannot pick one.
      // This used to fall into the branch below and report "no such item
      // exists" — the OPPOSITE of the truth, on data the engine can describe
      // precisely. Name the candidates so a reader can settle it; the row is
      // deliberately NOT marked resolved, so every candidate still reports
      // missing (none of them was actually served under its own id).
      const candidates = titleMatches.map((m) => m.variation.id);
      findings.push(
        makeFinding({
          claim: existenceClaim,
          referenceRowId: "catalog-meta",
          ruleId: "LST-IDENT-TITLE-AMBIGUOUS",
          severity: "error",
          category: "identity",
          plainLine: `The copy keys this row as "${rowId}", which the catalog does not use, and its name "${title}" matches ${candidates.length} catalog rows (${candidates.join(", ")}) — identity cannot be resolved.`,
        }),
      );
    } else {
      findings.push(
        makeFinding({
          claim: existenceClaim,
          // A ghost has no truth row; the reference row cited is the catalog
          // itself — the row set it was (absently) checked against.
          referenceRowId: "catalog-meta",
          ruleId: "LST-EXIST-GHOST",
          severity: "error",
          category: "existence",
          plainLine: `The copy serves "${title || rowId}" but no such item exists in the merchant's catalog.`,
        }),
      );
    }
  }

  // Missing: non-hidden SOR variations never claimed by the copy.
  for (const item of sor.items) {
    for (const variation of item.variations) {
      if (variation.stock === "hidden") continue;
      if (resolvedTruthIds.has(variation.id)) continue;
      findings.push(
        makeFinding({
          claim: {
            id: `${variation.id}#existence`,
            source,
            field: "existence",
            value: false, // the copy's implicit claim: "this item is not listed"
          },
          referenceRowId: variation.id,
          ruleId: "LST-EXIST-MISSING",
          severity: "error",
          category: "existence",
          plainLine: `"${expectedTitle(item, variation)}" exists in the merchant's catalog but is missing from the feed.`,
        }),
      );
    }
  }

  return findings;
}

/**
 * Who the data belonged to on THIS run — the two C3/C10 honesty labels a
 * caller may set, and nothing else.
 *
 * Both were hardcoded until 2026-07-27, which was true of every caller then in
 * existence (all fed the committed synthetic catalog) and becomes false the
 * moment a reader supplies their own records: stamping a reader's real catalog
 * `simulated: true`, and asserting shared-synthetic-ID matching that never
 * happened, is a claim broader than the thing backing it (RULES §4).
 *
 * `specVersion` is deliberately NOT here. A caller may describe WHOSE data it
 * ran on; it may never restate WHICH RULES ran — that stays pinned to
 * {@link LISTINGS_SPEC_VERSION} by the engine (C10), proven by the T3 tooth in
 * evals/packs/listings-provenance-labels.test.ts.
 */
export interface ListingsRunProvenance {
  /** C3: shared synthetic IDs, or real-world entity resolution. */
  readonly matchingMode?: MatchingMode;
  /** C10: true when any synthetic artifact is involved in this run. */
  readonly simulated?: boolean;
}

/**
 * Run the full listings verification for one surface's claims.
 *
 * `provenance` is optional and defaults to the committed-corpus values, so
 * every pre-existing two-argument call site produces a byte-identical report
 * (the golden + drift-lock suites are the proof, and they were not touched).
 * The labels describe the run; they never steer it — identical inputs yield
 * identical findings under either label (T4 tooth), because the engine reads
 * only `sor.items` and `sor.asOf` from a catalog.
 */
export function runListingsVerification(
  claims: readonly Claim[],
  sor: SyntheticCatalog,
  provenance: ListingsRunProvenance = {},
): VerifierReport {
  const reference = sorReference(sor);
  const detected = verifyClaims(claims, reference, listingsDetectors);
  const completeness = completenessSweep(claims, sor);
  return buildReport([...detected, ...completeness], {
    specVersion: LISTINGS_SPEC_VERSION,
    matchingMode: provenance.matchingMode ?? "synthetic-controlled",
    simulated: provenance.simulated ?? true,
  });
}
