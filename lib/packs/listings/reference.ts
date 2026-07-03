/**
 * SOR reference resolver — W1 (the swappable Reference, kind "pos-catalog").
 *
 * Resolves claim ids back to synthetic-catalog truth rows. Matching is
 * SYNTHETIC-CONTROLLED (C3 label): the faithful feed reuses SOR variation ids,
 * so resolution is a direct id lookup. Rows the id lookup cannot resolve are the
 * identity/existence cases — the pack's completeness sweep applies a
 * deterministic entity-resolution heuristic (exact expected-title match) to tell
 * an ID-MISMATCH from a GHOST.
 *
 * Plain: the lookup that answers "what does the till actually say about this
 * row?" — and when the row's id is unknown, the detective step that decides
 * "renamed id" vs "item that doesn't exist at all".
 */
import type { Claim, Reference, ReferenceMatch } from "../../verifier-core/index.ts";
import type { SorItem, SorVariation, SyntheticCatalog } from "./types.ts";
import { UCP_PINNED_VERSION } from "./ucp.ts";

/** Truth-row payload the detectors read (variation + owning item + catalog). */
export interface SorTruth {
  readonly item: SorItem;
  readonly variation: SorVariation;
  readonly catalog: SyntheticCatalog;
}

/** The expected serving title for a variation (the faithful-feed convention). */
export function expectedTitle(item: SorItem, variation: SorVariation): string {
  return item.variations.length > 1 ? `${item.name} (${variation.name})` : item.name;
}

/** Index a catalog by variation id, expected title, and item id. */
export function indexCatalog(sor: SyntheticCatalog): {
  readonly byVariationId: ReadonlyMap<string, SorTruth>;
  readonly byExpectedTitle: ReadonlyMap<string, readonly SorTruth[]>;
} {
  const byVariationId = new Map<string, SorTruth>();
  const byExpectedTitle = new Map<string, SorTruth[]>();
  for (const item of sor.items) {
    for (const variation of item.variations) {
      const truth: SorTruth = { item, variation, catalog: sor };
      byVariationId.set(variation.id, truth);
      const t = expectedTitle(item, variation);
      byExpectedTitle.set(t, [...(byExpectedTitle.get(t) ?? []), truth]);
    }
  }
  return { byVariationId, byExpectedTitle };
}

/**
 * Build the pos-catalog Reference over the synthetic SOR. Claim ids are
 * `<rowId>#<field>`; `catalog#...` meta claims resolve to the catalog-meta row
 * (carrying the pinned spec version for §7 version-skew checks).
 */
export function sorReference(sor: SyntheticCatalog): Reference {
  const { byVariationId } = indexCatalog(sor);
  return {
    kind: "pos-catalog",
    resolve(claim: Claim): ReferenceMatch | null {
      const rowId = claim.id.split("#")[0];
      if (rowId === "catalog") {
        return {
          referenceRowId: "catalog-meta",
          matching: "synthetic-controlled",
          value: { pinnedSpecVersion: UCP_PINNED_VERSION, asOf: sor.asOf },
        };
      }
      const truth = byVariationId.get(rowId);
      if (!truth) return null;
      return {
        referenceRowId: truth.variation.id,
        matching: "synthetic-controlled",
        value: truth,
      };
    },
  };
}
