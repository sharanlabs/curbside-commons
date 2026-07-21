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
import type { Claim, Finding, VerifierReport } from "../../verifier-core/index.ts";
import { makeFinding } from "../../verifier-core/guard.ts";
import { buildReport, verifyClaims } from "../../verifier-core/verify.ts";
import { listingsDetectors } from "./detectors.ts";
import { expectedTitle, indexCatalog, sorReference } from "./reference.ts";
import type { SyntheticCatalog } from "./types.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** The pinned spec/taxonomy line stamped into every W1 report header (C10). */
export const LISTINGS_SPEC_VERSION = `taxonomy-v1+acp-extract-2026-07-02+ucp-pin-${UCP_PINNED_VERSION}`;

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

/** Run the full listings verification for one surface's claims. */
export function runListingsVerification(
  claims: readonly Claim[],
  sor: SyntheticCatalog,
): VerifierReport {
  const reference = sorReference(sor);
  const detected = verifyClaims(claims, reference, listingsDetectors);
  const completeness = completenessSweep(claims, sor);
  return buildReport([...detected, ...completeness], {
    specVersion: LISTINGS_SPEC_VERSION,
    matchingMode: "synthetic-controlled",
    simulated: true,
  });
}
