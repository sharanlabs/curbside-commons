/**
 * Listings detectors — W1 (the §7 taxonomy turned into deterministic rules).
 *
 * Each rule: a stable ruleId (cited in every finding, C2), the §7 drift class it
 * catches (the report `category`, measured by C6), a deterministic predicate,
 * and a plain-words line (C4). Detectors are surface-agnostic: they read the
 * normalized claim language both adapters emit. Rules that need the whole-copy
 * view (ghost / ID-mismatch / missing) live in the completeness sweep (run.ts),
 * because a single claim cannot see absence.
 *
 * Plain: the actual checks — "price matches the till", "sold-out isn't shown as
 * orderable", "the variant label really identifies the variant" — written as
 * exact rules a machine applies the same way every time.
 */
import type { Detector } from "../../verifier-core/verify.ts";
import type { FindingInput } from "../../verifier-core/guard.ts";
import { centsToDecimal, type AcpFeedHoursWindow } from "./acp-feed.ts";
import type { AcpInvariantsValue } from "./adapters.ts";
import {
  minutesOfLocalTime,
  recordHours,
  recordModifierOptions,
  windowLabel,
  type ModifierOptionClaimValue,
  type ModifierSetClaimValue,
} from "./modifiers.ts";
import { INSTANT_FORMS, parseInstant } from "./instants.ts";
import { expectedTitle, type SorTruth } from "./reference.ts";

/** Deterministic mojibake transform (UTF-8 bytes read as Latin-1) — the
 * canonical double-encoding corruption the encoding detector recognizes. */
export function mojibake(s: string): string {
  return Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join("");
}

function isSorTruth(v: unknown): v is SorTruth {
  return typeof v === "object" && v !== null && "variation" in v && "item" in v;
}

/**
 * Sync-window grace for LST-HOURS-WINDOW, in minutes: a served window whose
 * open AND close each sit within this distance of the record's window is in
 * sync. A menu sync lands minutes after an hours edit; flagging that lag would
 * turn every routine edit into a warning, so a timing difference inside the
 * grace closes itself. A different window count on a day is never inside it.
 */
export const HOURS_WINDOW_GRACE_MINUTES = 15;

/**
 * LST-DATE-INVALID (S1.5) — a date the staleness rules must compare is not an
 * instant {@link parseInstant} can read. Reported as an error, never passed and
 * never a crash: a stale row carrying an unreadable expiry is exactly the row a
 * silent pass would hide. `side` says whose value it is — the copy's field, or
 * the catalog's own `asOf` (then the copy's value is quoted too).
 */
function dateInvalid(
  claim: Parameters<Detector>[0],
  match: NonNullable<Parameters<Detector>[1]>,
  side: "copy" | "catalog",
  raw: unknown,
): FindingInput {
  const field = claim.field;
  const plainLine =
    side === "copy"
      ? `The copy's ${field} is "${String(raw)}", which is not a readable date (${INSTANT_FORMS}) — its staleness cannot be checked, so it is reported, not passed.`
      : `The catalog's asOf is "${String(raw)}", which is not a readable date (${INSTANT_FORMS}) — the copy's ${field} "${String(claim.value)}" cannot be checked against it, so it is reported, not passed.`;
  return {
    claim,
    referenceRowId: side === "copy" ? match.referenceRowId : "catalog-meta",
    ruleId: "LST-DATE-INVALID",
    severity: "error",
    category: "staleness",
    plainLine,
  };
}

/**
 * Compare a copy date against the catalog's as-of AS INSTANTS. Returns
 * "invalid-copy" / "invalid-catalog" when a side is unreadable, else whether
 * the copy's instant is strictly before as-of. Raw strings stay in plainLines.
 */
function beforeAsOf(copyRaw: unknown, asOfRaw: string): "invalid-copy" | "invalid-catalog" | boolean {
  const copy = parseInstant(copyRaw);
  if (copy === null) return "invalid-copy";
  const asOf = parseInstant(asOfRaw);
  if (asOf === null) return "invalid-catalog";
  return copy < asOf;
}

/** Served windows of one day, ordered by opening time. */
function windowsOn(day: string, ws: readonly AcpFeedHoursWindow[]): readonly AcpFeedHoursWindow[] {
  return ws
    .filter((w) => w.day === day)
    .slice()
    .sort((a, b) => minutesOfLocalTime(a.open) - minutesOfLocalTime(b.open));
}

/** hours — the copy's served windows must match the record's category hours within the grace. */
export function hoursWindowDetector(graceMinutes: number = HOURS_WINDOW_GRACE_MINUTES): Detector {
  const near = (a: string, b: string): boolean =>
    Math.abs(minutesOfLocalTime(a) - minutesOfLocalTime(b)) <= graceMinutes;
  return (claim, match) => {
    if (claim.field !== "hours" || !match || !isSorTruth(match.value)) return [];
    const served = claim.value as readonly AcpFeedHoursWindow[];
    const category = match.value.item.category;
    const record = recordHours(match.value.catalog, category);
    const days = [...new Set([...record.map((w) => w.day), ...served.map((w) => w.day)])];
    const label = (ws: readonly AcpFeedHoursWindow[]): string => ws.map(windowLabel).join(", ") || "(none)";
    const diffs: string[] = [];
    for (const day of days) {
      const copy = windowsOn(day, served);
      const truth = windowsOn(day, record);
      const inSync =
        copy.length === truth.length &&
        copy.every((w, i) => near(w.open, truth[i].open) && near(w.close, truth[i].close));
      if (!inSync) diffs.push(`${day}: copy ${label(copy)} vs catalog ${label(truth)}`);
    }
    if (diffs.length === 0) return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-HOURS-WINDOW",
        severity: "warn",
        category: "staleness",
        plainLine: `The copy's hours for this item do not match the catalog's ${category} hours — ${diffs.join("; ")}.`,
      },
    ];
  };
}

/** All per-claim rules. Dispatch is by claim.field; unmatched claims are the
 * completeness sweep's job, so every rule here requires a resolved match. */
export const listingsDetectors: readonly Detector[] = [
  // availability/hidden — any served row whose truth row is hidden (fires once,
  // on the row's existence claim).
  (claim, match) => {
    if (claim.field !== "existence" || !match || !isSorTruth(match.value)) return [];
    if (match.value.variation.stock !== "hidden") return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-AVAIL-HIDDEN-SHOWN",
        severity: "error",
        category: "availability",
        plainLine: "This item is hidden in the merchant's own catalog but is served on the copy.",
      } satisfies FindingInput,
    ];
  },

  // title — encoding drifts first (mojibake, truncation), then generic identity.
  (claim, match) => {
    if (claim.field !== "title" || !match || !isSorTruth(match.value)) return [];
    const expected = expectedTitle(match.value.item, match.value.variation);
    const actual = String(claim.value);
    if (actual === expected) return [];
    const base = { claim, referenceRowId: match.referenceRowId } as const;
    if (actual === mojibake(expected)) {
      return [
        {
          ...base,
          ruleId: "LST-ENC-UTF8",
          severity: "warn",
          category: "encoding",
          plainLine: `The name is garbled by a text-encoding error: served "${actual}" vs the record's "${expected}".`,
        },
      ];
    }
    if (actual.endsWith("…") && expected.startsWith(actual.slice(0, -1))) {
      return [
        {
          ...base,
          ruleId: "LST-ENC-TRUNC",
          severity: "warn",
          category: "encoding",
          plainLine: `The name is cut off in the feed: "${actual}" vs the record's "${expected}".`,
        },
      ];
    }
    return [
      {
        ...base,
        ruleId: "LST-IDENT-NAME",
        severity: "error",
        category: "identity",
        plainLine: `The served name "${actual}" does not match the catalog name "${expected}".`,
      },
    ];
  },

  // price.amount — cents-vs-decimal recognized specifically, else value drift.
  (claim, match) => {
    if (claim.field !== "price.amount" || !match || !isSorTruth(match.value)) return [];
    const cents = match.value.variation.priceCents;
    const expected = centsToDecimal(cents);
    const actual = String(claim.value);
    if (actual === expected) return [];
    const base = { claim, referenceRowId: match.referenceRowId } as const;
    if (actual === String(cents)) {
      return [
        {
          ...base,
          ruleId: "LST-PRICE-CENTS-AS-DECIMAL",
          severity: "error",
          category: "price",
          plainLine: `The price is serialized in cents (${actual}) where dollars are expected (${expected}) — a 100× overstatement.`,
        },
      ];
    }
    return [
      {
        ...base,
        ruleId: "LST-PRICE-VALUE",
        severity: "error",
        category: "price",
        plainLine: `The served price ${actual} does not match the catalog price ${expected}.`,
      },
    ];
  },

  // price.currency — exact ISO-4217 match required; case-mangled recognized.
  (claim, match) => {
    if (claim.field !== "price.currency" || !match || !isSorTruth(match.value)) return [];
    const expected = match.value.catalog.currency;
    const actual = String(claim.value);
    if (actual === expected) return [];
    const base = { claim, referenceRowId: match.referenceRowId } as const;
    if (actual.toUpperCase() === expected) {
      return [
        {
          ...base,
          ruleId: "LST-PRICE-CURRENCY-FORM",
          severity: "warn",
          category: "price",
          plainLine: `The currency code is malformed: "${actual}" instead of ISO-4217 "${expected}".`,
        },
      ];
    }
    return [
      {
        ...base,
        ruleId: "LST-PRICE-CURRENCY",
        severity: "error",
        category: "price",
        plainLine: `The served currency "${actual}" does not match the catalog currency "${expected}".`,
      },
    ];
  },

  // availability — served state must map from the SOR stock state.
  (claim, match) => {
    if (claim.field !== "availability" || !match || !isSorTruth(match.value)) return [];
    const stock = match.value.variation.stock;
    if (stock === "hidden") return []; // LST-AVAIL-HIDDEN-SHOWN owns hidden rows.
    const expected = stock === "soldout_86" ? "out_of_stock" : "in_stock";
    const actual = String(claim.value);
    if (actual === expected) return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-AVAIL-STATE",
        severity: "error",
        category: "availability",
        plainLine: `The copy says "${actual}" but the catalog state is ${stock === "soldout_86" ? "86'd/sold out" : "in stock"} (expected "${expected}").`,
      },
    ];
  },

  // staleness — expired expiration_date still being served.
  (claim, match) => {
    if (claim.field !== "expiration_date" || !match || !isSorTruth(match.value)) return [];
    const asOf = match.value.catalog.asOf;
    const actual = String(claim.value);
    // Instants, not strings (S1.5): "…00.100Z" sorts before "…00Z" as text, and
    // a +02:00 offset sorts by its literal digits.
    const before = beforeAsOf(claim.value, asOf);
    if (before === "invalid-copy") return [dateInvalid(claim, match, "copy", claim.value)];
    if (before === "invalid-catalog") return [dateInvalid(claim, match, "catalog", asOf)];
    if (!before) return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-STALE-EXPIRED",
        severity: "warn",
        category: "staleness",
        plainLine: `This row expired ${actual} but is still served (catalog as-of ${asOf}).`,
      },
    ];
  },

  // staleness + conditional — pre_order rows must carry a future availability_date.
  (claim, match) => {
    if (claim.field !== "availability_date" || !match || !isSorTruth(match.value)) return [];
    const asOf = match.value.catalog.asOf;
    const base = { claim, referenceRowId: match.referenceRowId } as const;
    if (claim.value === null) {
      return [
        {
          ...base,
          ruleId: "LST-XF-PREORDER-DATE-MISSING",
          severity: "error",
          category: "cross-field-invariant",
          plainLine: "The row is pre_order but carries no availability_date (required-if conditional violated).",
        },
      ];
    }
    const actual = String(claim.value);
    const before = beforeAsOf(claim.value, asOf);
    if (before === "invalid-copy") return [dateInvalid(claim, match, "copy", claim.value)];
    if (before === "invalid-catalog") return [dateInvalid(claim, match, "catalog", asOf)];
    if (!before) return [];
    return [
      {
        ...base,
        ruleId: "LST-STALE-AVAILDATE",
        severity: "warn",
        category: "staleness",
        plainLine: `The pre-order availability date ${actual} already passed (catalog as-of ${asOf}) — the promise is stale.`,
      },
    ];
  },

  // identity — the variant label must identify THIS variation.
  (claim, match) => {
    if (claim.field !== "variant_dict" || !match || !isSorTruth(match.value)) return [];
    const dictValue = claim.value as { readonly dict?: Readonly<Record<string, string>> };
    const label = dictValue.dict?.["variation"];
    const expected = match.value.variation.name;
    if (label === expected) return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-IDENT-MODIFIER-AMBIG",
        severity: "error",
        category: "identity",
        plainLine: `The variant label says "${label ?? "(none)"}" but this row is the "${expected}" variation — variants of this item can no longer be told apart.`,
      },
    ];
  },

  // cross-field — extracted ACP invariants (sale_price ≤ price is a PRICE-class drift per §7).
  (claim, match) => {
    if (claim.field !== "invariants" || !match) return [];
    const v = claim.value as AcpInvariantsValue;
    const out: FindingInput[] = [];
    const base = { claim, referenceRowId: match.referenceRowId } as const;
    if (v.sale_price !== undefined && Number(v.sale_price) > Number(v.price)) {
      out.push({
        ...base,
        ruleId: "LST-PRICE-SALE-GT",
        severity: "error",
        category: "price",
        plainLine: `The sale price ${v.sale_price} is higher than the regular price ${v.price} — a "sale" that costs more.`,
      });
    }
    if (v.is_eligible_checkout && !v.is_eligible_search) {
      out.push({
        ...base,
        ruleId: "LST-XF-CHECKOUT-SEARCH",
        severity: "error",
        category: "cross-field-invariant",
        plainLine: "The row is checkout-eligible but not search-eligible — the extracted invariant requires checkout ⇒ search.",
      });
    }
    return out;
  },

  // spec-version skew — the responder's supported versions must include the pin.
  (claim, match) => {
    if (claim.field !== "spec.supported_versions" || !match) return [];
    const pinned = (match.value as { readonly pinnedSpecVersion: string }).pinnedSpecVersion;
    const versions = claim.value as readonly string[];
    if (versions.includes(pinned)) return [];
    return [
      {
        claim,
        referenceRowId: match.referenceRowId,
        ruleId: "LST-SPECVER-MISMATCH",
        severity: "warn",
        category: "spec-version-skew",
        plainLine: `The serving surface speaks spec version(s) [${versions.join(", ")}] but the verifier pins ${pinned} — field semantics may have skewed.`,
      },
    ];
  },

  // modifier price — a served add-on must cost what the record's option costs.
  (claim, match) => {
    if (claim.field !== "modifier.option" || !match || !isSorTruth(match.value)) return [];
    const served = claim.value as ModifierOptionClaimValue;
    const rec = recordModifierOptions(match.value.item).find((o) => o.option.id === served.id);
    if (!rec) return [];
    const expected = centsToDecimal(rec.option.priceDeltaCents);
    const actual = String(served.price_delta);
    if (actual === expected) return [];
    return [
      {
        claim,
        referenceRowId: rec.option.id,
        ruleId: "LST-MOD-PRICE-VALUE",
        severity: "error",
        category: "price",
        plainLine: `The "${rec.option.name}" option (${rec.list.name}) is served at +${actual} but the catalog modifier price is +${expected}.`,
      },
    ];
  },

  // modifier existence — every orderable record option must be on the copy's row.
  // An 86'd option the copy leaves out is not drift: nobody can order it either way.
  (claim, match) => {
    if (claim.field !== "modifiers" || !match || !isSorTruth(match.value)) return [];
    const set = claim.value as ModifierSetClaimValue;
    const servedIds = new Set(set.served.map((s) => s.id));
    const servedNames = set.served.map((s) => s.name).join(", ") || "(none)";
    const rowId = claim.id.split("#")[0];
    return recordModifierOptions(match.value.item)
      .filter(({ option }) => option.soldOut !== true && !servedIds.has(option.id))
      .map(({ list, option }): FindingInput => ({
        // The copy's implicit claim of omission, per option, so absence carries receipts.
        claim: { id: `${rowId}#modifier.${option.id}`, source: claim.source, field: "modifier.option", value: false },
        referenceRowId: option.id,
        ruleId: "LST-MOD-MISSING",
        severity: "error",
        category: "existence",
        plainLine: `The catalog offers "${option.name}" (+${centsToDecimal(option.priceDeltaCents)}) in "${list.name}" for this item, but the copy's options are [${servedNames}] — it is missing.`,
      }));
  },

  hoursWindowDetector(HOURS_WINDOW_GRACE_MINUTES),
];
