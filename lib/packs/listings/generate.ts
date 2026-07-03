/**
 * Seeded synthetic-SOR generator (W1, plan §8: "generator seeded/deterministic").
 *
 * Pure function of the seed: same seed → byte-identical catalog. Uses a local
 * mulberry32 PRNG (no dependency, no Math.random, no Date). The frozen corpus in
 * fixtures/synthetic-restaurant/ is this generator's output at the pinned seed;
 * a freeze-integrity eval asserts fixture == generate(pinned seed) so the corpus
 * can never silently diverge from its generator.
 *
 * Plain: the fake menu is built by a recipe with a fixed random-looking-but-
 * repeatable dice roll, so anyone can rebuild the exact same menu and check
 * nothing was hand-tampered.
 */
import type {
  SorItem,
  SorModifierList,
  SorVariation,
  SyntheticCatalog,
} from "./types.ts";

/** mulberry32 — tiny deterministic PRNG (public-domain construction). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = ["Appetizers", "Mains", "Sides", "Desserts", "Drinks"] as const;

/** Name pools — includes non-ASCII on purpose (encoding drift needs targets). */
const ITEM_NAMES = [
  "Crispy Calamari",
  "Garden Salad",
  "Café Latte",
  "Jalapeño Poppers",
  "Margherita Pizza",
  "Smoked Brisket Plate",
  "Pad Thai",
  "Crème Brûlée",
  "Lemonade",
  "Truffle Fries",
  "Bánh Mì Sandwich",
  "Açaí Bowl",
] as const;

const VARIATION_SETS = [
  ["Regular"],
  ["Small", "Large"],
  ["Small", "Medium", "Large"],
] as const;

const MODIFIER_SETS: readonly { name: string; options: readonly string[] }[] = [
  { name: "Spice Level", options: ["Mild", "Medium", "Hot"] },
  { name: "Add-ons", options: ["Extra Cheese", "Avocado"] },
  { name: "Milk", options: ["Whole", "Oat", "Almond"] },
];

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Generate the synthetic restaurant SOR. Pure in (seed, asOf). */
export function generateCatalog(seed: number, asOf: string): SyntheticCatalog {
  const rand = mulberry32(seed);
  const items: SorItem[] = ITEM_NAMES.map((name, i) => {
    const itemId = `item-${String(i + 1).padStart(3, "0")}`;
    const variationNames = pick(rand, VARIATION_SETS);
    const baseCents = 400 + Math.floor(rand() * 40) * 50; // $4.00–$23.50 steps of $0.50
    const variations: SorVariation[] = variationNames.map((vName, vi) => ({
      id: `${itemId}-v${vi + 1}`,
      name: vName,
      priceCents: baseCents + vi * 300,
      // Deterministic sprinkle of availability states across the catalog.
      stock: rand() < 0.12 ? "soldout_86" : rand() < 0.08 ? "hidden" : "in_stock",
    }));
    const modifierLists: SorModifierList[] =
      rand() < 0.5
        ? [
            (() => {
              const m = pick(rand, MODIFIER_SETS);
              return {
                id: `${itemId}-m1`,
                name: m.name,
                options: m.options.map((o, oi) => ({
                  id: `${itemId}-m1-o${oi + 1}`,
                  name: o,
                  priceDeltaCents: oi * 50,
                })),
              };
            })(),
          ]
        : [];
    return {
      id: itemId,
      name,
      description: `${name} — a simulated menu item for the synthetic corpus (not a real product).`,
      category: CATEGORIES[i % CATEGORIES.length],
      variations,
      modifierLists,
    };
  });
  return {
    simulated: true,
    generator: { name: "synthetic-restaurant", seed, version: "1.0.0" },
    currency: "USD",
    asOf,
    merchantName: "Curbside Commons Test Kitchen (simulated)",
    items,
  };
}

/** The pinned corpus parameters — the frozen fixtures are exactly this run. */
export const CORPUS_SEED = 20260703;
export const CORPUS_AS_OF = "2026-07-03T00:00:00Z";
