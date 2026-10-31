/**
 * Surface adapters — W1 (C3: "one comparator, two adapters").
 *
 * Each adapter normalizes a serving surface into the SAME claim language
 * (field paths + value forms), so the comparator and detectors are truly
 * surface-agnostic: the ACP static feed and the constructed UCP catalog
 * response produce comparable claims, and the C3 differential test can assert
 * the same drift is caught from both.
 *
 * Claim id convention: `<servingRowId>#<fieldPath>`. Row-level context needed by
 * cross-field rules travels on a dedicated `invariants` claim; group-level
 * variant ambiguity travels on `variant_dict` claims.
 *
 * Plain: two translators turn "what the feed says" and "what the live answer
 * says" into the same list of checkable statements, so one referee can judge
 * both.
 */
import type { Claim } from "../../verifier-core/index.ts";
import type { AcpFeed, AcpFeedItem } from "./acp-feed.ts";
import { menuModelClaims } from "./modifiers.ts";
import { ListingsInputError, ReservedIdError, reservedIdProblem } from "./reference.ts";
import type { UcpCatalogResponseFixture } from "./ucp.ts";

/** A feed row the adapter cannot read as a row (S1.5; security review 2026-10-31 F7). */
export class FeedShapeError extends ListingsInputError {
  constructor(message: string) {
    super(message);
    this.name = "FeedShapeError";
  }
}

/**
 * The same row id served twice on one copy (S1.5; security review F6). Claims
 * are keyed by row id, so the two rows would be judged as one and whichever
 * disagreed with the record could hide behind the one that agreed. Refused.
 */
export class DuplicateFeedRowError extends ListingsInputError {
  readonly id: string;
  constructor(id: string, first: number, second: number) {
    super(
      `The copy serves the row id "${id}" twice: items[${first}] and items[${second}]. Claims are keyed by row id, ` +
        `so the two rows would be judged as one and no report could say which it meant. Nothing was verified.`,
    );
    this.name = "DuplicateFeedRowError";
    this.id = id;
  }
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Refuse rows the engine would misread BEFORE any claim exists (S1.5): a
 * non-object row, a non-string id, a reserved id (F1), a repeated id (F6), and
 * — on the ACP surface — a `modifiers` / `hours` value that is not an array of
 * objects (F7, which used to die as an opaque TypeError inside the projection).
 */
function guardRows(rows: readonly unknown[], idKey: "item_id" | "id", menuFields: boolean): void {
  const seen = new Map<string, number>();
  rows.forEach((row, i) => {
    if (!isPlainObject(row)) throw new FeedShapeError(`Feed row items[${i}] is not an object — every row must be a JSON object.`);
    const id = row[idKey];
    if (typeof id !== "string" || id === "") {
      throw new FeedShapeError(`Feed row items[${i}] has no string \`${idKey}\` — every row needs one so its findings can name it.`);
    }
    const problem = reservedIdProblem(id);
    if (problem) throw new ReservedIdError(`Feed row items[${i}]`, id, problem);
    const first = seen.get(id);
    if (first !== undefined) throw new DuplicateFeedRowError(id, first, i);
    seen.set(id, i);
    if (!menuFields) return;
    for (const field of ["modifiers", "hours"] as const) {
      const v = row[field];
      if (v === undefined) continue;
      if (!Array.isArray(v) || !v.every(isPlainObject)) {
        throw new FeedShapeError(
          `Feed row items[${i}] (item_id "${id}") has a \`${field}\` value that is not an array of objects — ` +
            `the menu extension lists ${field === "modifiers" ? "one object per served option" : "one object per served window"}.`,
        );
      }
    }
  });
}

/**
 * The variant label a claim carries — DECLARED KEYS ONLY (S1.5; security
 * review F4): the detectors read `variation`, so nothing else a copy planted
 * in `variant_dict` (a customer field, say) can travel into a report.
 */
function variantDictValue(dict: unknown): Readonly<Record<string, string>> {
  const v = isPlainObject(dict) ? dict.variation : undefined;
  return v === undefined ? {} : { variation: v as string };
}

/** Cross-field tuple carried by the per-row `invariants` claim (ACP surface). */
export interface AcpInvariantsValue {
  readonly price: string;
  readonly sale_price?: string;
  readonly is_eligible_search: boolean;
  readonly is_eligible_checkout: boolean;
}

function rowClaims(
  source: Claim["source"],
  rowId: string,
  fields: readonly (readonly [string, unknown])[],
): Claim[] {
  return fields.map(([field, value]) => ({
    id: `${rowId}#${field}`,
    source,
    field,
    value,
  }));
}

/** Normalize an ACP feed into claims. */
export function acpFeedToClaims(feed: AcpFeed): readonly Claim[] {
  guardRows(feed.items, "item_id", true);
  return feed.items.flatMap((r: AcpFeedItem) => {
    const invariants: AcpInvariantsValue = {
      price: r.price,
      ...(r.sale_price !== undefined ? { sale_price: r.sale_price } : {}),
      is_eligible_search: r.is_eligible_search,
      is_eligible_checkout: r.is_eligible_checkout,
    };
    return rowClaims("acp-feed", r.item_id, [
      ["existence", true],
      ["title", r.title],
      ["price.amount", r.price],
      ["price.currency", r.currency],
      ["availability", r.availability],
      ["variant_dict", { group: r.group_id, dict: variantDictValue(r.variant_dict) }],
      ...(r.expiration_date !== undefined
        ? ([["expiration_date", r.expiration_date]] as const)
        : []),
      ...(r.availability === "pre_order"
        ? ([["availability_date", r.availability_date ?? null]] as const)
        : []),
      ["invariants", invariants],
    ]).concat(menuModelClaims(r, "acp-feed"));
  });
}

/**
 * Normalize a (constructed) UCP catalog response into claims. Availability
 * vocabulary is normalized to the shared enum (interpretation, documented:
 * available → in_stock, unavailable → out_of_stock). The response-level
 * `supported_versions` becomes a catalog-meta claim (§7 spec-version skew).
 */
export function ucpResponseToClaims(resp: UcpCatalogResponseFixture): readonly Claim[] {
  const meta: Claim = {
    id: "catalog#spec.supported_versions",
    source: "ucp-catalog",
    field: "spec.supported_versions",
    value: resp.supported_versions,
  };
  guardRows(resp.items, "id", false);
  const perItem = resp.items.flatMap((it) =>
    rowClaims("ucp-catalog", it.id, [
      ["existence", true],
      ["title", it.title],
      ["price.amount", it.price.amount],
      ["price.currency", it.price.currency],
      ["availability", it.availability === "available" ? "in_stock" : "out_of_stock"],
      ["variant_dict", { group: it.group_id, dict: variantDictValue(it.variant) }],
    ]),
  );
  return [meta, ...perItem];
}
