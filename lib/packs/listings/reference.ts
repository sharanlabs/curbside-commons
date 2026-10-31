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

/** Where one variation sits in a catalog document: `items[i].variations[v]`. */
export interface VariationLocation {
  readonly itemIndex: number;
  readonly variationIndex: number;
  readonly itemId: string;
}

/** A variation id the catalog uses twice, with both rows it sits on. */
export interface DuplicateVariationId {
  readonly id: string;
  readonly first: VariationLocation;
  readonly second: VariationLocation;
}

const at = (l: VariationLocation): string =>
  `items[${l.itemIndex}].variations[${l.variationIndex}] (item "${l.itemId}")`;

/**
 * THE duplicate-variation-id predicate (S1.5, Codex cross-check 2026-10-12 § 4).
 *
 * {@link indexCatalog} keys a Map by variation id, so a second row with the
 * same id silently OVERWRITES the first: a feed row is then checked against
 * whichever record came last, and the report cannot say which. Codex's probe —
 * two record rows sharing one id at $10 and $20, against a $20 feed — returned
 * PASS. A verdict on an ambiguous reference is a wrong verdict wearing a clean
 * face, so the engine refuses the catalog instead (see
 * {@link assertUniqueVariationIds}, called by `runListingsVerification`).
 *
 * Returns the FIRST id seen twice (document order), or null when every id is
 * unique. Rows without an `id` string or items without a `variations` array
 * are skipped here — shape is the parsers' job; this answers one question.
 *
 * Plain: "does this catalog use the same row id twice?" — and if so, which id
 * and which two rows.
 */
export function findDuplicateVariationId(items: readonly SorItem[]): DuplicateVariationId | null {
  const seen = new Map<string, VariationLocation>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as SorItem | undefined;
    const variations = item?.variations;
    if (!Array.isArray(variations)) continue;
    for (let v = 0; v < variations.length; v++) {
      const id = (variations[v] as SorVariation | undefined)?.id;
      if (typeof id !== "string") continue;
      const here: VariationLocation = { itemIndex: i, variationIndex: v, itemId: String(item?.id ?? "") };
      const first = seen.get(id);
      if (first) return { id, first, second: here };
      seen.set(id, here);
    }
  }
  return null;
}

/** The one refusal message for a duplicate id — names the id and both rows. */
export function duplicateVariationIdMessage(d: DuplicateVariationId): string {
  return (
    `The catalog uses the variation id "${d.id}" twice: ${at(d.first)} and ${at(d.second)}. ` +
    `Ids identify the record a claim is checked against, so a duplicate makes the verdict ambiguous — ` +
    `no report could say which of the two rows it used. Nothing was verified.`
  );
}

/** Thrown when a catalog repeats a variation id; the CLI maps any throw to exit 2. */
export class DuplicateVariationIdError extends Error {
  readonly duplicate: DuplicateVariationId;
  constructor(duplicate: DuplicateVariationId) {
    super(duplicateVariationIdMessage(duplicate));
    this.name = "DuplicateVariationIdError";
    this.duplicate = duplicate;
  }
}

/** Refuse a catalog that repeats a variation id (throws {@link DuplicateVariationIdError}). */
export function assertUniqueVariationIds(sor: SyntheticCatalog): void {
  const d = findDuplicateVariationId(sor.items);
  if (d) throw new DuplicateVariationIdError(d);
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
