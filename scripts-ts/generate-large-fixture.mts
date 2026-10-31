/**
 * Large synthetic restaurant generator — Wave 3 / lane W3-d (docs/plan-wave3-2026-10-31.md § 1
 * item 6; docs/plan-wave2-gap-sheet-2026-10-12.md "Page 4").
 *
 * Builds fixtures/synthetic-restaurant-large/:
 *   record.json · feeds/day-01.json … day-07.json · manifest.json · README.md
 *
 * One synthetic restaurant at menu scale (about three hundred items, with size
 * variations and modifier GROUPS), one record, and a daily series of marketplace
 * copies. Each day's copy is the previous day's copy plus seeded drift, applied at
 * DECLARED per-day rates (the named constants below). The existing listings engine
 * is run on every day at generation, and every figure the manifest and the README
 * state is read from that run — never typed. evals/packs/large-fixture.test.ts
 * regenerates in memory, byte-compares, and re-derives every figure independently.
 *
 * Independent of every other generator: its own seed, its OWN PRNG instances (the
 * record stream and one stream per day), never the scenario or corpus streams. It
 * reads nothing under fixtures/ and writes only fixtures/synthetic-restaurant-large/.
 *
 * The drift rates are ASSUMPTIONS, declared here and copied into the manifest. This
 * measures the instrument at those rates; it states nothing about any market.
 *
 * Run: node scripts-ts/generate-large-fixture.mts   (Node >= 24; writes the folder, prints engine wall time per day)
 * Import: `buildLargeFixtureFiles()` is pure (writes nothing).
 *
 * Plain: one recipe that rebuilds a full-size made-up restaurant and a week of slowly
 * drifting menu copies, then records how many findings the checker raises on each day.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  HOURS_WINDOW_GRACE_MINUTES,
  LISTINGS_SPEC_VERSION,
  acpFeedToClaims,
  buildFaithfulMenuFeed,
  centsToDecimal,
  expectedTitle,
  indexCatalog,
  mojibake,
  mulberry32,
  recordHours,
  recordModifierOptions,
  runListingsVerification,
  type AcpFeed,
  type AcpFeedItem,
  type SorItem,
  type SorModifierList,
  type SorVariation,
  type SyntheticCatalog,
} from "../lib/packs/listings/index.ts";
import type { VerifierReport } from "../lib/verifier-core/report.ts";

export const GENERATOR_VERSION = "1.0.0";
/** This fixture's own seed — distinct from the corpus (20260703), the scenarios (2026100x) and the orders (20261031). */
export const LARGE_SEED = 20261101;
/** Fixed "now" for the record — data, never a clock read. */
export const LARGE_AS_OF = "2026-11-01T00:00:00Z";
export const DAYS = 7;
export const FIXTURE_DIR = "fixtures/synthetic-restaurant-large";

// ── Record shape (about three hundred items) ─────────────────────────────────

/** Single-word categories only: the category name is part of the hours-window ids. */
export const CATEGORIES = [
  "Appetizers",
  "Salads",
  "Soups",
  "Mains",
  "Pizzas",
  "Sandwiches",
  "Sides",
  "Desserts",
  "Drinks",
  "Breakfast",
] as const;
export const ITEMS_PER_CATEGORY = 30;
export const ITEM_TARGET = CATEGORIES.length * ITEMS_PER_CATEGORY;
/** The declared scale band: a menu of "about three hundred items" is within this percentage of the target. */
export const ITEM_BAND_PERCENT = 10;
export const ITEM_COUNT_BAND = {
  min: Math.floor((ITEM_TARGET * (100 - ITEM_BAND_PERCENT)) / 100),
  max: Math.ceil((ITEM_TARGET * (100 + ITEM_BAND_PERCENT)) / 100),
} as const;

/** Six dishes per category × five qualifiers = the thirty items of a category. Some names are non-ASCII on purpose (encoding drift needs targets). */
const DISHES: Readonly<Record<(typeof CATEGORIES)[number], readonly string[]>> = {
  Appetizers: ["Crispy Calamari", "Jalapeño Poppers", "Stuffed Mushrooms", "Spring Rolls", "Pâté Board", "Mozzarella Sticks"],
  Salads: ["Garden Salad", "Caesar Salad", "Niçoise Salad", "Greek Salad", "Cobb Salad", "Quinoa Salad"],
  Soups: ["Tomato Bisque", "French Onion Soup", "Miso Soup", "Chicken Noodle Soup", "Minestrone", "Lentil Soup"],
  Mains: ["Smoked Brisket Plate", "Pad Thai", "Grilled Salmon", "Mushroom Risotto", "Chicken Piccata", "Short Rib Ragù"],
  Pizzas: ["Margherita Pizza", "Pepperoni Pizza", "Quattro Formaggi Pizza", "Funghi Pizza", "Diavola Pizza", "Prosciutto Pizza"],
  Sandwiches: ["Bánh Mì Sandwich", "Club Sandwich", "Reuben Sandwich", "Falafel Wrap", "Croque Monsieur", "Philly Cheesesteak"],
  Sides: ["Truffle Fries", "Coleslaw", "Roasted Broccoli", "Mac and Cheese", "Onion Rings", "Sweet Potato Wedges"],
  Desserts: ["Crème Brûlée", "Chocolate Torte", "Tiramisu", "Açaí Bowl", "Cheesecake", "Churros"],
  Drinks: ["Café Latte", "Lemonade", "Iced Tea", "Cold Brew", "Matcha Latte", "Sparkling Water"],
  Breakfast: ["Eggs Benedict", "Pancake Stack", "Avocado Toast", "Granola Bowl", "Huevos Rancheros", "Breakfast Burrito"],
};
const QUALIFIERS = ["Classic", "House", "Spiced", "Seasonal", "Signature"] as const;

/** Variation sets and their draw weights (cumulative thresholds are derived from these). */
const VARIATION_SETS: readonly { readonly names: readonly string[]; readonly weight: number }[] = [
  { names: ["Regular"], weight: 0.6 },
  { names: ["Small", "Large"], weight: 0.25 },
  { names: ["Small", "Medium", "Large"], weight: 0.15 },
];
const BASE_PRICE_MIN_CENTS = 400;
const BASE_PRICE_STEPS = 40; // steps of 50 cents above the minimum
const SIZE_STEP_CENTS = 300; // each larger variation costs this much more
const SHARE_VARIATION_SOLDOUT = 0.06;
const SHARE_VARIATION_HIDDEN = 0.03;
const SHARE_ITEMS_WITH_MODIFIERS = 0.35;
const SHARE_ITEMS_WITH_TWO_GROUPS = 0.3; // of those that carry modifiers
const SHARE_OPTIONS_SOLDOUT = 0.1;
const OPTION_PRICE_CHOICES_CENTS = [0, 50, 100, 150, 200, 250] as const;

/** Modifier GROUPS: a named list with its options (an item attaches one or two distinct groups). */
const MODIFIER_GROUPS: readonly { readonly name: string; readonly options: readonly string[] }[] = [
  { name: "Spice Level", options: ["Mild", "Medium", "Hot"] },
  { name: "Add-ons", options: ["Extra Cheese", "Avocado", "Bacon", "Fried Egg"] },
  { name: "Milk", options: ["Whole", "Oat", "Almond"] },
  { name: "Sauce", options: ["Garlic Aioli", "Chipotle Mayo", "Ranch"] },
  { name: "Side Choice", options: ["Fries", "Side Salad", "Fruit Cup"] },
  { name: "Toppings", options: ["Mushrooms", "Olives", "Onions", "Peppers"] },
  { name: "Doneness", options: ["Medium Rare", "Medium", "Well Done"] },
  { name: "Dressing", options: ["Vinaigrette", "Ranch", "Caesar"] },
];

/** Local hours by category — every day, one or two windows. */
const CATEGORY_HOURS: Readonly<Record<(typeof CATEGORIES)[number], readonly (readonly [string, string])[]>> = {
  Appetizers: [["11:00:00", "22:00:00"]],
  Salads: [["11:00:00", "21:00:00"]],
  Soups: [["11:00:00", "21:00:00"]],
  Mains: [["11:00:00", "15:00:00"], ["17:00:00", "22:00:00"]],
  Pizzas: [["11:30:00", "23:00:00"]],
  Sandwiches: [["10:30:00", "20:00:00"]],
  Sides: [["11:00:00", "22:00:00"]],
  Desserts: [["12:00:00", "23:00:00"]],
  Drinks: [["07:00:00", "23:00:00"]],
  Breakfast: [["06:30:00", "11:00:00"]],
};
const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

// ── DECLARED drift assumptions (copied into the manifest) ────────────────────

/**
 * Chance, per day, that a unit still in sync with the record drifts. The units:
 * price / availability / title / hours — one served row; modifierPrice /
 * modifierDrop — one modifier option on one served row. These are assumptions
 * set by us for this measurement; they are not measurements of any market.
 */
export const DRIFT_RATES = {
  price: 0.006,
  availability: 0.008,
  title: 0.004,
  modifierPrice: 0.006,
  modifierDrop: 0.004,
  hours: 0.01,
} as const;
export type DriftKind = keyof typeof DRIFT_RATES;
export const DRIFT_KINDS = Object.keys(DRIFT_RATES) as readonly DriftKind[];

/** Share of title drift by kind (the three kinds sum to one; a name with no accented letter cannot garble and is truncated instead). */
export const TITLE_DRIFT_SHARES = { mojibake: 0.4, truncation: 0.3, rename: 0.3 } as const;
/** A price drifts by one of these steps, in cents. */
export const PRICE_DRIFT_STEPS_CENTS = [-200, -100, -50, 50, 100, 200] as const;
/** A modifier option's price drifts up by one of these steps, in cents. */
export const MODIFIER_DRIFT_STEPS_CENTS = [50, 100, 150] as const;
/** An hours window's opening time moves by one of these many minutes, earlier or later. */
export const HOURS_SHIFT_MINUTES = [5, 10, 20, 30, 45, 60] as const;
/** The fraction of a name a truncation keeps. */
const TRUNCATION_KEEP = 0.6;

// ── helpers ──────────────────────────────────────────────────────────────────

const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const sortKeys = <T,>(rec: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(rec).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
const pick = <T,>(rand: () => number, arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

function shuffled<T>(rand: () => number, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const round = (n: number, places: number): number => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};
export const per100 = (findings: number, items: number): number => round((findings / items) * 100, 2);
export const share = (part: number, whole: number): number => (whole === 0 ? 0 : round(part / whole, 4));

// ── the record ───────────────────────────────────────────────────────────────

if (Object.values(DISHES).some((d) => d.length * QUALIFIERS.length !== ITEMS_PER_CATEGORY)) {
  throw new Error("every category needs dishes × qualifiers = ITEMS_PER_CATEGORY");
}

function pickVariationNames(rand: () => number): readonly string[] {
  let r = rand();
  for (const set of VARIATION_SETS) {
    if (r < set.weight) return set.names;
    r -= set.weight;
  }
  return VARIATION_SETS[VARIATION_SETS.length - 1].names;
}

/** The record. Pure in the seed: its own PRNG instance, never a shared stream. */
export function buildLargeRecord(): SyntheticCatalog {
  const rand = mulberry32(LARGE_SEED);
  const items: SorItem[] = [];
  CATEGORIES.forEach((category, ci) => {
    const names = shuffled(rand, DISHES[category].flatMap((dish) => QUALIFIERS.map((q) => `${q} ${dish}`)));
    names.forEach((name, k) => {
      const itemId = `item-${String(ci * ITEMS_PER_CATEGORY + k + 1).padStart(3, "0")}`;
      const base = BASE_PRICE_MIN_CENTS + Math.floor(rand() * BASE_PRICE_STEPS) * 50;
      const variations: SorVariation[] = pickVariationNames(rand).map((vName, vi) => {
        const r = rand();
        return {
          id: `${itemId}-v${vi + 1}`,
          name: vName,
          priceCents: base + vi * SIZE_STEP_CENTS,
          stock: r < SHARE_VARIATION_SOLDOUT ? "soldout_86" : r < SHARE_VARIATION_SOLDOUT + SHARE_VARIATION_HIDDEN ? "hidden" : "in_stock",
        };
      });
      const modifierLists: SorModifierList[] = [];
      if (rand() < SHARE_ITEMS_WITH_MODIFIERS) {
        const groupCount = rand() < SHARE_ITEMS_WITH_TWO_GROUPS ? 2 : 1;
        shuffled(rand, MODIFIER_GROUPS).slice(0, groupCount).forEach((g, gi) => {
          modifierLists.push({
            id: `${itemId}-m${gi + 1}`,
            name: g.name,
            options: g.options.map((o, oi) => ({
              id: `${itemId}-m${gi + 1}-o${oi + 1}`,
              name: o,
              priceDeltaCents: pick(rand, OPTION_PRICE_CHOICES_CENTS),
              ...(rand() < SHARE_OPTIONS_SOLDOUT ? { soldOut: true } : {}),
            })),
          });
        });
      }
      items.push({
        id: itemId,
        name,
        description: `${name} — a simulated menu item.`,
        category,
        variations,
        modifierLists,
      });
    });
  });
  return {
    simulated: true,
    generator: { name: "synthetic-restaurant-large", seed: LARGE_SEED, version: GENERATOR_VERSION },
    currency: "USD",
    asOf: LARGE_AS_OF,
    merchantName: "Curbside Commons Large Test Kitchen (simulated)",
    items,
    categoryAvailability: CATEGORIES.map((category) => ({
      category,
      periods: WEEK.flatMap((day) =>
        CATEGORY_HOURS[category].map(([start, end], wi) => ({
          id: `hours-${category.toLowerCase()}-${day.toLowerCase()}-${wi + 1}`,
          dayOfWeek: day,
          startLocalTime: start,
          endLocalTime: end,
        })),
      ),
    })),
  };
}

// ── the drift series ─────────────────────────────────────────────────────────

type Mut<T> = { -readonly [K in keyof T]: Mut<T[K]> };
export type DriftCounts = Record<DriftKind, number>;

const emptyCounts = (): DriftCounts => ({ price: 0, availability: 0, title: 0, modifierPrice: 0, modifierDrop: 0, hours: 0 });

const toHms = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};
const toMinutes = (hms: string): number => Number(hms.slice(0, 2)) * 60 + Number(hms.slice(3, 5));

/** One PRNG stream per day, derived from the seed — independent of the record's and of every other day's. */
const dayRand = (day: number): (() => number) => mulberry32((LARGE_SEED ^ (0x44524654 + day)) >>> 0);

/** Apply one day of drift to the previous day's copy. Only units still in sync with the record can drift; nothing is corrected. */
export function driftDay(prev: AcpFeed, record: SyntheticCatalog, day: number): { feed: AcpFeed; applied: DriftCounts } {
  const rand = dayRand(day);
  const { byVariationId } = indexCatalog(record);
  const applied = emptyCounts();
  const rows = (structuredClone(prev.items) as Mut<AcpFeedItem>[]).map((row) => {
    const truth = byVariationId.get(row.item_id);
    if (!truth) throw new Error(`row ${row.item_id} is not in the record`);
    const { item, variation } = truth;

    if (row.price === centsToDecimal(variation.priceCents) && rand() < DRIFT_RATES.price) {
      const next = Math.max(50, variation.priceCents + pick(rand, PRICE_DRIFT_STEPS_CENTS));
      row.price = centsToDecimal(next === variation.priceCents ? next + 50 : next);
      applied.price++;
    }

    const expectedAvailability = variation.stock === "soldout_86" ? "out_of_stock" : "in_stock";
    if (row.availability === expectedAvailability && rand() < DRIFT_RATES.availability) {
      row.availability = expectedAvailability === "in_stock" ? "out_of_stock" : "in_stock";
      applied.availability++;
    }

    const title = expectedTitle(item, variation);
    if (row.title === title && rand() < DRIFT_RATES.title) {
      const r = rand();
      const garbled = mojibake(title);
      if (r < TITLE_DRIFT_SHARES.mojibake && garbled !== title) row.title = garbled;
      else if (r < TITLE_DRIFT_SHARES.mojibake + TITLE_DRIFT_SHARES.truncation || garbled === title && r < TITLE_DRIFT_SHARES.mojibake) {
        row.title = `${title.slice(0, Math.floor(title.length * TRUNCATION_KEEP)).trimEnd()}…`;
      } else row.title = `New ${title}`;
      applied.title++;
    }

    if (row.modifiers !== undefined) {
      const record = new Map(recordModifierOptions(item).map((o) => [o.option.id, o.option]));
      const kept: typeof row.modifiers = [];
      for (const m of row.modifiers) {
        const opt = record.get(m.id);
        if (opt === undefined) {
          kept.push(m);
          continue;
        }
        if (opt.soldOut !== true && rand() < DRIFT_RATES.modifierDrop) {
          applied.modifierDrop++;
          continue;
        }
        if (m.price_delta === centsToDecimal(opt.priceDeltaCents) && rand() < DRIFT_RATES.modifierPrice) {
          m.price_delta = centsToDecimal(opt.priceDeltaCents + pick(rand, MODIFIER_DRIFT_STEPS_CENTS));
          applied.modifierPrice++;
        }
        kept.push(m);
      }
      row.modifiers = kept;
    }

    if (row.hours !== undefined) {
      const truthHours = recordHours(record, item.category);
      const inSync = JSON.stringify(row.hours) === JSON.stringify(truthHours);
      if (inSync && rand() < DRIFT_RATES.hours) {
        const w = row.hours[Math.floor(rand() * row.hours.length)];
        const shift = pick(rand, HOURS_SHIFT_MINUTES) * (rand() < 0.5 ? -1 : 1);
        w.open = toHms(toMinutes(w.open) + shift);
        applied.hours++;
      }
    }
    return row;
  });
  return { feed: { ...prev, items: rows }, applied };
}

export interface DailySeries {
  readonly feeds: readonly AcpFeed[];
  readonly applied: readonly DriftCounts[];
}

/** Seven daily copies: day N is day N-1 plus drift; day 0 (not written) is the faithful copy. */
export function buildDailySeries(record: SyntheticCatalog): DailySeries {
  const faithful = buildFaithfulMenuFeed(record);
  // Hours are an item-level fact (they hang off the category): the copy states them once per item, on its first served row.
  const seen = new Set<string>();
  let prev: AcpFeed = {
    ...faithful,
    items: faithful.items.map((row) => {
      if (seen.has(row.group_id)) {
        const rest: Partial<AcpFeedItem> = { ...row };
        delete rest.hours;
        return rest as AcpFeedItem;
      }
      seen.add(row.group_id);
      return row;
    }),
  };
  const feeds: AcpFeed[] = [];
  const applied: DriftCounts[] = [];
  for (let day = 1; day <= DAYS; day++) {
    const r = driftDay(prev, record, day);
    feeds.push(r.feed);
    applied.push(r.applied);
    prev = r.feed;
  }
  return { feeds, applied };
}

// ── the measurement (the existing engine, run at generation) ─────────────────

export interface DayMeasure {
  readonly findings: number;
  readonly errors: number;
  readonly warnings: number;
  readonly byRuleId: Record<string, number>;
  readonly findingsPer100Items: number;
  readonly warnShare: number;
}

export function measureReport(report: VerifierReport, items: number): DayMeasure {
  const byRule: Record<string, number> = {};
  for (const f of report.findings) byRule[f.ruleId] = (byRule[f.ruleId] ?? 0) + 1;
  const errors = report.findings.filter((f) => f.severity === "error").length;
  const warnings = report.findings.filter((f) => f.severity === "warn").length;
  return {
    findings: report.findings.length,
    errors,
    warnings,
    byRuleId: sortKeys(byRule),
    findingsPer100Items: per100(report.findings.length, items),
    warnShare: share(warnings, report.findings.length),
  };
}

/** Runs the engine on one day's copy. */
export const runDay = (feed: AcpFeed, record: SyntheticCatalog): VerifierReport =>
  runListingsVerification(acpFeedToClaims(feed), record);

// ── serialization ────────────────────────────────────────────────────────────

const dayName = (day: number): string => `day-${String(day).padStart(2, "0")}`;

/** A feed is one JSON document with one row per line — the rows are wide, and this keeps the folder small and the diff readable. */
export function serializeFeed(feed: AcpFeed): string {
  const head = JSON.stringify({ simulated: feed.simulated, spec: feed.spec });
  return `${head.slice(0, -1)},"items":[\n${feed.items.map((r) => JSON.stringify(r)).join(",\n")}\n]}\n`;
}

// ── the README (every figure a placeholder) ──────────────────────────────────

const tally = (byRuleId: Record<string, number>): string =>
  Object.entries(byRuleId).map(([r, n]) => `${r} ×${n}`).join(", ");
export const fixed2 = (n: number): string => n.toFixed(2);
export const pct1 = (n: number): string => `${(n * 100).toFixed(1)}%`;

const DRIFT_ROWS: readonly (readonly [DriftKind, string, string])[] = [
  ["price", "served price", "a served row"],
  ["availability", "in-stock / sold-out state", "a served row"],
  ["title", "name (garbled, cut off or renamed)", "a served row"],
  ["modifierPrice", "modifier option price", "one option on one served row"],
  ["modifierDrop", "modifier option left off the copy", "one option on one served row"],
  ["hours", "opening time of one hours window", "an item's first served row"],
];
const RATE_KEY: Record<DriftKind, string> = {
  price: "rate_price",
  availability: "rate_availability",
  title: "rate_title",
  modifierPrice: "rate_modifier_price",
  modifierDrop: "rate_modifier_drop",
  hours: "rate_hours",
};

function buildReadmeTemplate(): string {
  const dayRows = Array.from({ length: DAYS }, (_, i) => {
    const d = `d${String(i + 1).padStart(2, "0")}`;
    return `| \`${dayName(i + 1)}\` | {{${d}_findings}} | {{${d}_errors}} | {{${d}_warnings}} | {{${d}_per100}} | {{${d}_warn_share}} | {{${d}_rules}} |`;
  }).join("\n");
  const rateRows = DRIFT_ROWS.map(([k, what, unit]) => `| ${what} | ${unit} | {{${RATE_KEY[k]}}} |`).join("\n");
  return `# synthetic-restaurant-large — a menu-scale synthetic restaurant with a daily drift series

**Plain-English:** a made-up restaurant with {{items}} menu items, a record of what it sells, and {{days}} daily copies of its menu that slowly drift away from that record. It exists to measure one thing: how many findings the checker raises on a full-size menu, and how many of them are only warnings. Every file is **synthetic and simulated** — an invented restaurant, with invented items and prices.

**Professional register:** a seeded, deterministic fixture. The record is generated from a seed; each daily feed is the previous day's feed plus drift applied at **declared assumption rates**; the existing listings engine is run on every day at generation, and every figure below is read from that run. A freeze test regenerates the folder in memory and compares it byte for byte.

## Contents

| File | What it is |
| --- | --- |
| \`record.json\` | The system of record, in the same simulated catalog shape as \`../synthetic-restaurant/sor.catalog.json\`: {{categories}} categories, {{items}} items, {{variations}} variations ({{feed_rows}} served on the feed; the rest are hidden), {{groups}} modifier groups carrying {{options}} options, and hours windows per category. |
| \`feeds/day-01.json\` … \`feeds/day-07.json\` | The marketplace copy on each day, in the ACP feed shape with the menu extension (modifier options on every row; hours once per item, on its first row). One row per line. Day one is the faithful copy plus one day of drift. |
| \`manifest.json\` | Machine-readable: the seed, the counts, the declared assumptions, and per day the drift applied and the engine's findings. |

## What the checker found

| Day | Findings | Errors | Warnings | Per hundred items | Warn share | Rules that fired |
| --- | --- | --- | --- | --- | --- | --- |
${dayRows}

"Per hundred items" is the day's findings divided by the {{items}} catalog items, times one hundred. "Warn share" is the day's warnings divided by its findings. By the last day the series stands at {{last_per100}} findings per hundred items, {{last_warn_share}} of them warnings.

## Declared assumptions

The drift rates are **assumptions we set for this measurement**. They are not measurements of any market, platform or merchant, and nothing here states how often any menu drifts.

Each day, every unit that is still in sync with the record has this chance of drifting:

| What drifts | Unit | Chance per day |
| --- | --- | --- |
${rateRows}

Drift accumulates: nothing is corrected between days, so a later day carries every earlier day's findings. The figures are the instrument's output at these rates and say nothing about other rates. The hours check allows {{grace}} minutes of sync lag before it warns.

## Regenerate

\`\`\`
node scripts-ts/generate-large-fixture.mts
\`\`\`

Seed {{seed}}, record as-of {{as_of}}. The generator uses its own random streams and reads nothing from the other fixtures. \`evals/packs/large-fixture.test.ts\` regenerates in memory and compares every file byte for byte, re-runs the engine on each day independently of the manifest, and checks every figure in this file against it.

## Honesty box

- All data is synthetic and simulated; the restaurant, items, prices and drift are invented.
- The drift rates are declared assumptions, not findings about any market.
- No platform is named, called or implied; no platform data or access is claimed.
- Human-led, AI-assisted, professionally reviewed.
`;
}
export const README_TEMPLATE = buildReadmeTemplate();

export interface LargeManifest {
  readonly id: string;
  readonly simulated: true;
  readonly generator: string;
  readonly seed: number;
  readonly asOf: string;
  readonly engine: { readonly specVersion: string; readonly hoursWindowGraceMinutes: number };
  readonly counts: {
    readonly categories: number;
    readonly items: number;
    readonly variations: number;
    readonly feedRows: number;
    readonly modifierGroups: number;
    readonly modifierOptions: number;
  };
  readonly itemBand: { readonly target: number; readonly min: number; readonly max: number };
  readonly assumptions: {
    readonly note: string;
    readonly accumulation: string;
    readonly ratesPerDay: Record<DriftKind, number>;
    readonly titleDriftShares: typeof TITLE_DRIFT_SHARES;
    readonly priceDriftStepsCents: readonly number[];
    readonly modifierDriftStepsCents: readonly number[];
    readonly hoursShiftMinutes: readonly number[];
  };
  readonly days: readonly ({ readonly day: number; readonly file: string; readonly driftApplied: DriftCounts } & DayMeasure)[];
}

export interface LargeBuild {
  readonly files: Map<string, string>;
  readonly manifest: LargeManifest;
  readonly figures: Record<string, string | number>;
}

export function readmeFigures(m: LargeManifest): Record<string, string | number> {
  const f: Record<string, string | number> = {
    items: m.counts.items,
    categories: m.counts.categories,
    variations: m.counts.variations,
    feed_rows: m.counts.feedRows,
    groups: m.counts.modifierGroups,
    options: m.counts.modifierOptions,
    days: m.days.length,
    seed: m.seed,
    as_of: m.asOf,
    grace: m.engine.hoursWindowGraceMinutes,
  };
  for (const k of DRIFT_KINDS) f[RATE_KEY[k]] = pct1(m.assumptions.ratesPerDay[k]);
  for (const d of m.days) {
    const p = `d${String(d.day).padStart(2, "0")}`;
    f[`${p}_findings`] = d.findings;
    f[`${p}_errors`] = d.errors;
    f[`${p}_warnings`] = d.warnings;
    f[`${p}_per100`] = fixed2(d.findingsPer100Items);
    f[`${p}_warn_share`] = pct1(d.warnShare);
    f[`${p}_rules`] = tally(d.byRuleId);
  }
  const last = m.days[m.days.length - 1];
  f.last_per100 = fixed2(last.findingsPer100Items);
  f.last_warn_share = pct1(last.warnShare);
  return f;
}

/** Fill {{placeholders}}; an unknown key is an error, never a silent blank. */
function render(template: string, figures: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    if (!(key in figures)) throw new Error(`placeholder {{${key}}} has no figure`);
    return String(figures[key]);
  });
}

/** Every file of the fixture as repo-relative path → exact bytes. Pure (runs the engine; writes nothing). */
export function buildLargeFixtureFiles(): LargeBuild {
  const record = buildLargeRecord();
  const { feeds, applied } = buildDailySeries(record);
  const variations = record.items.flatMap((i) => i.variations);
  const counts = {
    categories: CATEGORIES.length,
    items: record.items.length,
    variations: variations.length,
    feedRows: variations.filter((v) => v.stock !== "hidden").length,
    modifierGroups: record.items.reduce((n, i) => n + i.modifierLists.length, 0),
    modifierOptions: record.items.reduce((n, i) => n + recordModifierOptions(i).length, 0),
  };
  const manifest: LargeManifest = {
    id: "synthetic-restaurant-large",
    simulated: true,
    generator: `generate-large-fixture.mts@${GENERATOR_VERSION}`,
    seed: LARGE_SEED,
    asOf: LARGE_AS_OF,
    engine: { specVersion: LISTINGS_SPEC_VERSION, hoursWindowGraceMinutes: HOURS_WINDOW_GRACE_MINUTES },
    counts,
    itemBand: { target: ITEM_TARGET, min: ITEM_COUNT_BAND.min, max: ITEM_COUNT_BAND.max },
    assumptions: {
      note: "Declared assumptions set for this measurement; not measurements of any market, platform or merchant.",
      accumulation: "Only units still in sync with the record can drift; nothing is corrected between days, so later days carry earlier days' drift.",
      ratesPerDay: { ...DRIFT_RATES },
      titleDriftShares: TITLE_DRIFT_SHARES,
      priceDriftStepsCents: PRICE_DRIFT_STEPS_CENTS,
      modifierDriftStepsCents: MODIFIER_DRIFT_STEPS_CENTS,
      hoursShiftMinutes: HOURS_SHIFT_MINUTES,
    },
    days: feeds.map((feed, i) => ({
      day: i + 1,
      file: `feeds/${dayName(i + 1)}.json`,
      driftApplied: applied[i],
      ...measureReport(runDay(feed, record), counts.items),
    })),
  };
  const figures = readmeFigures(manifest);
  const files = new Map<string, string>();
  const dir = FIXTURE_DIR;
  files.set(`${dir}/record.json`, asJson(record));
  feeds.forEach((feed, i) => files.set(`${dir}/feeds/${dayName(i + 1)}.json`, serializeFeed(feed)));
  files.set(`${dir}/manifest.json`, asJson(manifest));
  files.set(`${dir}/README.md`, render(README_TEMPLATE, figures));
  return { files: new Map([...files.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), manifest, figures };
}

// Run as a script: write the folder, then report engine wall time per day (informational; never written to a file).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { files } = buildLargeFixtureFiles();
  for (const [rel, bytes] of files) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, bytes);
    process.stdout.write(`wrote ${rel}\n`);
  }
  const record = buildLargeRecord();
  buildDailySeries(record).feeds.forEach((feed, i) => {
    const t0 = performance.now();
    runDay(feed, record);
    process.stdout.write(`engine ${dayName(i + 1)}: ${(performance.now() - t0).toFixed(1)} ms\n`);
  });
}
