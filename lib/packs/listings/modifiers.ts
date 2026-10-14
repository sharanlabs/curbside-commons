/**
 * Menu-model projection — modifier options, their 86'd state, and hours
 * windows, on both sides of a check (S1-engine, plan §§ 4, 9, 12).
 *
 * RECORD side (Square-catalog-shaped, simulated): modifier options carry a
 * price in cents and an optional sold-out flag (≈ CatalogModifier.price_money ·
 * ModifierLocationOverrides.sold_out); hours hang off the category
 * (≈ CatalogCategory.availability_period_ids → CatalogAvailabilityPeriod).
 * COPY side (AcpFeed): the `modifiers` / `hours` row fields are a labeled menu
 * extension — the extracted ACP surface has no menu model, so the field names
 * here are our interpretation, not spec text.
 *
 * Claim language (the detectors read only this):
 * - `<row>#modifier.<optionId>` · field `modifier.option` — one served option;
 * - `<row>#modifiers` · field `modifiers` — the set of options the row serves,
 *   so a detector can see an option the copy left out;
 * - `<row>#hours` · field `hours` — the served windows.
 * A row that carries neither field emits none of these, which is why every
 * pre-existing feed produces byte-identical claims.
 *
 * Plain: the add-ons ("extra cheese +$1.00"), the add-ons that are sold out
 * today, and the hours an item is sold — read from the till and from the copy
 * in one shared vocabulary so the referee can compare them.
 */
import type { Claim } from "../../verifier-core/index.ts";
import {
  buildFaithfulFeed,
  centsToDecimal,
  type AcpFeed,
  type AcpFeedHoursWindow,
  type AcpFeedItem,
  type AcpFeedModifier,
} from "./acp-feed.ts";
import type {
  SorItem,
  SorModifierList,
  SorModifierOption,
  SyntheticCatalog,
} from "./types.ts";

/** Value of a `modifier.option` claim — exactly what the copy serves for one option. */
export type ModifierOptionClaimValue = AcpFeedModifier;

/** Value of a `modifiers` claim — the options the row serves, in served order. */
export interface ModifierSetClaimValue {
  readonly served: readonly { readonly id: string; readonly name: string }[];
}

/** One record option with the list it belongs to. */
export interface RecordModifierOption {
  readonly list: SorModifierList;
  readonly option: SorModifierOption;
}

/** Every modifier option the record attaches to an item, in record order. */
export function recordModifierOptions(item: SorItem): readonly RecordModifierOption[] {
  return item.modifierLists.flatMap((list) => list.options.map((option) => ({ list, option })));
}

/** Record → copy projection of one option (the faithful convention). */
export function projectModifier(list: SorModifierList, option: SorModifierOption): AcpFeedModifier {
  return {
    id: option.id,
    list_id: list.id,
    list_name: list.name,
    name: option.name,
    price_delta: centsToDecimal(option.priceDeltaCents),
    availability: option.soldOut === true ? "out_of_stock" : "in_stock",
  };
}

/** Record → copy projection of a category's hours; [] when the record states none. */
export function recordHours(sor: SyntheticCatalog, category: string): readonly AcpFeedHoursWindow[] {
  const entry = sor.categoryAvailability?.find((c) => c.category === category);
  return (entry?.periods ?? []).map((p) => ({
    day: p.dayOfWeek,
    open: p.startLocalTime,
    close: p.endLocalTime,
  }));
}

/** "HH:MM:SS" (or "H:MM:SS") → minutes since local midnight; NaN if malformed. */
export function minutesOfLocalTime(t: string): number {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t);
  if (!m) return Number.NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** A window as a reader sees it: "11:00–22:00" (seconds dropped — always :00 here). */
export function windowLabel(w: AcpFeedHoursWindow): string {
  return `${w.open.slice(0, 5)}–${w.close.slice(0, 5)}`;
}

/**
 * The FAITHFUL menu-model copy: the faithful feed (unchanged rows) with each
 * row's item modifiers and category hours attached. Rows of an item with no
 * modifier lists carry `modifiers: []` — an explicit "no add-ons" claim; `hours`
 * is attached only when the record states hours for the category.
 */
export function buildFaithfulMenuFeed(sor: SyntheticCatalog): AcpFeed {
  const base = buildFaithfulFeed(sor);
  const byItemId = new Map(sor.items.map((i) => [i.id, i]));
  const items = base.items.map((row): AcpFeedItem => {
    const item = byItemId.get(row.group_id);
    if (!item) return row;
    const hours = recordHours(sor, item.category);
    return {
      ...row,
      modifiers: recordModifierOptions(item).map(({ list, option }) => projectModifier(list, option)),
      ...(hours.length > 0 ? { hours } : {}),
    };
  });
  return { ...base, items };
}

/** Copy → claims for the menu-model fields of one row (none when the row carries neither). */
export function menuModelClaims(row: AcpFeedItem, source: Claim["source"]): readonly Claim[] {
  const claims: Claim[] = [];
  if (row.modifiers !== undefined) {
    for (const m of row.modifiers) {
      claims.push({
        id: `${row.item_id}#modifier.${m.id}`,
        source,
        field: "modifier.option",
        value: m satisfies ModifierOptionClaimValue,
      });
    }
    const set: ModifierSetClaimValue = { served: row.modifiers.map((m) => ({ id: m.id, name: m.name })) };
    claims.push({ id: `${row.item_id}#modifiers`, source, field: "modifiers", value: set });
  }
  if (row.hours !== undefined) {
    claims.push({ id: `${row.item_id}#hours`, source, field: "hours", value: row.hours });
  }
  return claims;
}
