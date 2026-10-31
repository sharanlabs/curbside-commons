/**
 * Platform-shaped inputs — the shared half (S3, plan §§ 4, 6, 9, 12).
 *
 * The two menu adapters beside this file read documents SHAPED LIKE the public
 * partner documentation of two delivery platforms (read 2026-10-31; field names
 * only, never their example text — docs/research/external-references-2026-10-31.md
 * § A and "Top 5"). Every input they read is synthetic. Nothing here was obtained
 * from, sent by, or checked with either platform; neither is ever called; this
 * project is not affiliated with either. The names are nominative references to
 * public documentation, nothing more (RULES §4).
 *
 * What is shared:
 *  - the `shapedLike` label and its carrier sentence, which travel on the produced
 *    feed, on every claim the adapters emit, and on the report wrapper;
 *  - the refusal type (typed, located by a path and a row number, a
 *    ListingsInputError — so `bin/check.mjs` maps it to exit 2 like every refusal);
 *  - the strict value readers that make the INGEST ALLOW-LIST hold: an adapter
 *    builds every output value from a named field read through one of these, so
 *    an unknown key at any depth (a planted `customer_email`, say) is never read,
 *    and a named field holding the wrong type is refused rather than passed on;
 *  - the claims step: the engine's own ACP adapter (so the S1.5 reserved-id,
 *    duplicate-row and shape guards run unchanged), minus the claims for fields a
 *    platform-shaped document does not state.
 *
 * Plain: the common rules for reading a menu written the way a delivery
 * platform's public developer pages describe one — read only the fields we name,
 * refuse anything malformed with its location, and label every result "shaped
 * like the public documentation, not from the platform".
 */
import type { Claim, VerifierReport } from "../../../verifier-core/index.ts";
import type { AcpFeed } from "../acp-feed.ts";
import { acpFeedToClaims } from "../adapters.ts";
import { ListingsInputError } from "../reference.ts";
import { runListingsVerification } from "../run.ts";
import type { SyntheticCatalog } from "../types.ts";

/** The two shapes the menu adapters read — label ids, dated by the read. */
export const SHAPED_LIKE_DOORDASH = "doordash-public-partner-docs-2026-10-31";
export const SHAPED_LIKE_UBER = "uber-eats-public-partner-docs-2026-10-31";
export type ShapedLike = typeof SHAPED_LIKE_DOORDASH | typeof SHAPED_LIKE_UBER;

/** The sentence a reader sees wherever a platform-shaped result is shown. */
export const CARRIER_SENTENCE: Readonly<Record<ShapedLike, string>> = {
  [SHAPED_LIKE_DOORDASH]:
    "Shaped like DoorDash's public partner documentation (read 2026-10-31), not from the platform; never called; not affiliated. All data is synthetic.",
  [SHAPED_LIKE_UBER]:
    "Shaped like Uber Eats' public partner documentation (read 2026-10-31), not from the platform; never called; not affiliated. All data is synthetic.",
};

/** A feed an adapter produced: the engine's ACP feed form, plus the shape it was read from. */
export interface PlatformShapedFeed extends AcpFeed {
  readonly shapedLike: ShapedLike;
}

/** A claim read from a platform-shaped document — it names the shape it came from. */
export interface PlatformClaim extends Claim {
  readonly shapedLike: ShapedLike;
}

/** Why a platform-shaped document was refused. */
export type PlatformRefusalKind = "envelope" | "missing-key" | "type" | "price" | "reference" | "duplicate" | "depth" | "option";

/**
 * A platform-shaped document the adapter cannot read honestly. Never a finding:
 * the engine gives no verdict on it. `path` locates the value in the document
 * (`menus[0].menu.categories[1].items[2].price`); `row` is the 1-based position
 * of the menu row it sits in, in document order, when it sits in one.
 */
export class PlatformShapeError extends ListingsInputError {
  readonly shapedLike: ShapedLike;
  readonly kind: PlatformRefusalKind;
  readonly path: string;
  readonly row: number | null;
  constructor(shapedLike: ShapedLike, kind: PlatformRefusalKind, path: string, row: number | null, problem: string) {
    const where = row === null ? path : `${path} (row ${row})`;
    super(`The ${shapedLike} document was refused at ${where}: ${problem} Nothing was verified.`);
    this.name = "PlatformShapeError";
    this.shapedLike = shapedLike;
    this.kind = kind;
    this.path = path;
    this.row = row;
  }
}

export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * The strict readers. Each reads ONE named key of an object and refuses a wrong
 * type with its path; none ever copies an object through. `ctx` carries the
 * shape label and the current row so a refusal names both.
 */
export interface ReadCtx {
  readonly shapedLike: ShapedLike;
  row: number | null;
}

export function fail(ctx: ReadCtx, kind: PlatformRefusalKind, path: string, problem: string): never {
  throw new PlatformShapeError(ctx.shapedLike, kind, path, ctx.row, problem);
}

export function objectAt(ctx: ReadCtx, v: unknown, path: string): Record<string, unknown> {
  if (!isPlainObject(v)) fail(ctx, "type", path, "expected an object.");
  return v;
}

export function arrayAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string, required: boolean): readonly unknown[] {
  const v = obj[key];
  if (v === undefined) {
    if (required) fail(ctx, "missing-key", `${path}.${key}`, `the required \`${key}\` list is absent.`);
    return [];
  }
  if (!Array.isArray(v)) fail(ctx, "type", `${path}.${key}`, `\`${key}\` must be a list.`);
  return v;
}

export function stringAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string, required: boolean): string | undefined {
  const v = obj[key];
  if (v === undefined) {
    if (required) fail(ctx, "missing-key", `${path}.${key}`, `the required \`${key}\` text is absent.`);
    return undefined;
  }
  if (typeof v !== "string") fail(ctx, "type", `${path}.${key}`, `\`${key}\` must be text.`);
  return v;
}

export function idAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string): string {
  const v = stringAt(ctx, obj, key, path, true) as string;
  if (v === "") fail(ctx, "missing-key", `${path}.${key}`, `\`${key}\` is empty — every row and option needs an id its findings can name.`);
  return v;
}

export function booleanAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string, dflt: boolean): boolean {
  const v = obj[key];
  if (v === undefined) return dflt;
  if (typeof v !== "boolean") fail(ctx, "type", `${path}.${key}`, `\`${key}\` must be true or false.`);
  return v;
}

/** A non-negative integer price field; absent → undefined (the caller decides whether that refuses). */
export function integerPriceAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string): number | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0) {
    fail(ctx, "price", `${path}.${key}`, `\`${key}\` is ${JSON.stringify(v)}, not a whole non-negative number — a price this adapter cannot read exactly.`);
  }
  return v;
}

/** "11:00" or "11:00:00" → "11:00:00" (the record's local-time form); anything else refuses. */
export function localTimeAt(ctx: ReadCtx, obj: Record<string, unknown>, key: string, path: string): string {
  const raw = stringAt(ctx, obj, key, path, true) as string;
  const m = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(raw);
  if (!m) fail(ctx, "type", `${path}.${key}`, `\`${key}\` is "${raw}", not a local time of the form HH:MM or HH:MM:SS.`);
  return `${m[1]}:${m[2]}:${m[3] ?? "00"}`;
}

/** Whole cents → the feed's decimal-string form. */
export const centsText = (cents: number): string => (cents / 100).toFixed(2);

/**
 * Fields an ACP feed row states that a platform-shaped document does NOT, so the
 * claims step leaves them out rather than judging what the document never said:
 *  - `variant_dict` — neither shape carries a variant label: each sellable size is
 *    its own item, named in full;
 *  - `price.currency` — neither menu document states a currency;
 *  - `invariants` — the search/checkout eligibility flags and the sale price are
 *    ACP fields, not menu-document fields.
 */
export const UNSTATED_FIELDS: ReadonlySet<string> = new Set(["variant_dict", "price.currency", "invariants"]);

/** Claims for a platform-shaped feed: the ACP adapter's claims, minus unstated fields, each naming its shape. */
export function platformFeedToClaims(feed: PlatformShapedFeed): readonly PlatformClaim[] {
  return acpFeedToClaims(feed)
    .filter((c) => !UNSTATED_FIELDS.has(c.field))
    .map((c): PlatformClaim => ({ ...c, shapedLike: feed.shapedLike }));
}

/** A check run on a platform-shaped feed: the engine report, wrapped in its label. */
export interface PlatformShapedReport {
  readonly simulated: true;
  readonly shapedLike: ShapedLike;
  readonly carrier: string;
  readonly report: VerifierReport;
}

/** Run the listings engine on a platform-shaped feed against a record. */
export function runPlatformShapedCheck(feed: PlatformShapedFeed, record: SyntheticCatalog): PlatformShapedReport {
  return {
    simulated: true,
    shapedLike: feed.shapedLike,
    carrier: CARRIER_SENTENCE[feed.shapedLike],
    report: runListingsVerification(platformFeedToClaims(feed), record),
  };
}

/** The one serializer for the wrapper (carrier first, then the engine report). */
export function serializePlatformShapedReport(r: PlatformShapedReport): string {
  return `${JSON.stringify(r, null, 2)}\n`;
}

/**
 * The ACP-form fields a platform-shaped document has no counterpart for. They are
 * filled with constants that make no claim (url, brand, image and seller fields
 * are never read by a rule; currency and eligibility are dropped by
 * {@link UNSTATED_FIELDS}).
 */
export const UNSTATED_ROW_FIELDS = {
  url: "",
  brand: "",
  image_url: "",
  currency: "USD",
  seller_name: "",
  seller_url: "",
  is_eligible_search: false,
  is_eligible_checkout: false,
  target_countries: ["US"] as readonly string[],
  store_country: "US",
  variant_dict: {} as Readonly<Record<string, string>>,
} as const;
