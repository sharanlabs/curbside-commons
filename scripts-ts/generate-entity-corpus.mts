/**
 * E4 — synthetic adversarial name-corpus GENERATOR (pre-reg
 * `docs/e4-entity-resolution-preregistration.md` §2/§3 + AMENDMENT A1).
 *
 * Deterministic (fixed seed, no clock, no Math.random): generates the
 * tune/test pair corpus from the project's existing FICTIONAL merchant names
 * (legacy dummy directory + the crew's Fog City Tacos — never real
 * businesses), with DISJOINT base-merchant sets between splits, and writes
 * `evals/entity/gold/entity-pairs.json`. A freeze test re-runs this script
 * and byte-compares, so the committed corpus provably came from this recipe.
 *
 * Variant classes (§2): case-punct-ws · legal-suffix · typo · unicode ·
 * word-order-abbrev · (trap = near-miss DIFFERENT). AMBIGUOUS pairs are
 * hand-templated branch/expansion cases where even a careful human would
 * need more evidence.
 *
 * Floors machine-checked by the composition test BEFORE scoring: §3 test-split
 * minimums (≥60 pairs · ≥6 per variant class · **≥12 near-miss traps** · ≥8
 * ambiguous) CONJUNCTIVE with AMENDMENT A1's denominator minimums (≥30 SAME ·
 * ≥30 general DIFFERENT · ≥8 trap · ≥8 AMBIGUOUS) — the BINDING trap floor is
 * max(12, 8) = 12. Exactly one label per pair.
 *
 * Run: node scripts-ts/generate-entity-corpus.mts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ── deterministic PRNG (mulberry32, fixed registered seed) ──────────────────
const SEED = 20260712_02; // batch-D: FRESH seed — the 20260712 split was VOID (10 traps < the §3 ≥12 minimum) and is exposed; this is a new registered split
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

// ── base merchants (all FICTIONAL — legacy dummy directory + crew fixture) ──
const TUNE_BASES = [
  "Maria's Tacos",
  "Golden Dragon",
  "Fresh Market Co",
  "Quick Mart",
  "Bella Italia",
  "Metro Pharmacy",
  "Sunrise Bakery",
] as const;
const TEST_BASES = [
  "Fog City Tacos",
  "Burger Kingdom",
  "Corner Store 24/7",
  "Downtown Deli",
  "Fashion Forward",
  "Green Leaf Cafe",
  "Healthy Bites",
  "Organic Foods Hub",
  "Pizza Palace",
  "Spice Garden",
  "Sports Gear Pro",
  "Taco Express",
  "Tech Gadgets Plus",
  "Urban Grocery",
] as const;

type Label = "SAME" | "DIFFERENT" | "AMBIGUOUS";
interface Pair {
  id: string;
  a: string;
  b: string;
  label: Label;
  variantClass: string;
  trap: boolean;
  baseA: string;
  baseB: string;
}

// ── variant makers (each deterministic given the PRNG stream) ───────────────
const SUFFIXES = ["LLC", "Inc", "Corp", "Co.", "Ltd", "d.b.a."];
function casePunctWs(name: string): string {
  const forms = [
    name.toUpperCase(),
    name.toLowerCase(),
    name.replace(/'/g, ""),
    `${name.replace(/ /g, "  ")}`,
    ` ${name} `,
    name.replace(/ /g, " - "),
  ];
  const f = pick(forms);
  return f === name ? ` ${name} ` : f; // in-class guaranteed change (ws)
}
function legalSuffix(name: string): string {
  const s = pick(SUFFIXES);
  return rand() < 0.5 ? `${name} ${s}` : `${name.replace(/'s/, "s")} ${s}`;
}
function typo(name: string): string {
  const i = 1 + Math.floor(rand() * (name.length - 2));
  const forms = [
    name.slice(0, i) + name.slice(i + 1), // deletion
    name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2), // transposition
    `${name.slice(0, i)}${name[i]}${name.slice(i)}`, // doubling
  ];
  const f = pick(forms);
  return f.trim().length > 2 ? f : `${name}x`;
}
function unicodeConfusable(name: string): string {
  const forms = [
    name.replace(/a/, "а"), // Cyrillic a
    name.replace(/e/, "е"), // Cyrillic e
    name.replace(/o/, "о"), // Cyrillic o
    name.replace(/ /, " "), // NBSP
    name.replace(/ /, " "), // thin space
    `${name}​`, // ZWSP tail (always a change)
  ];
  const f = pick(forms);
  return f === name ? `${name}​` : f; // in-class guaranteed change (ZWSP)
}
function wordOrderAbbrev(name: string): string {
  const words = name.split(" ");
  if (words.length >= 2) {
    const forms = [
      `${words.slice(1).join(" ")}, ${words[0]}`,
      words.map((w, i) => (i < words.length - 1 ? w[0] : w)).join(" "), // "F C Tacos"
      `${words[0]} ${words.slice(1).map((w) => w[0]).join("")}`,
    ];
    return pick(forms);
  }
  return `${name} Shop`;
}

const VARIANT_MAKERS: Record<string, (n: string) => string> = {
  "case-punct-ws": casePunctWs,
  "legal-suffix": legalSuffix,
  typo,
  unicode: unicodeConfusable,
  "word-order-abbrev": wordOrderAbbrev,
};
const CLASSES = Object.keys(VARIANT_MAKERS);

// Trap near-misses: high lexical overlap, DISTINCT fictional entities.
const TRAP_TEMPLATES: ((n: string) => string)[] = [
  (n) => n.replace(/Tacos/, "Taqueria"),
  (n) => n.replace(/Cafe/, "Coffee"),
  (n) => n.replace(/Deli/, "Diner"),
  (n) => `${n.split(" ").slice(0, -1).join(" ")} ${pick(["House", "Brothers", "West"])}`,
  (n) => `New ${n}`,
  (n) => n.replace(/(\w+)$/, (m) => `${m}land`),
];

// AMBIGUOUS: branch/expansion forms — a careful human would need more evidence.
const AMBIG_TEMPLATES: ((n: string) => string)[] = [
  (n) => `${n} #2`,
  (n) => `${n} Downtown`,
  (n) => `${n} & Grill`,
  (n) => `${n} Catering`,
  (n) => `${n} NYC`,
  (n) => `${n} Express`,
  (n) => `The ${n} Group`,
  (n) => `${n} II`,
];

function generateSplit(bases: readonly string[], prefix: string, counts: { same: number; diff: number; trap: number; ambig: number }): Pair[] {
  const pairs: Pair[] = [];
  let n = 0;
  const id = () => `${prefix}-${String(++n).padStart(3, "0")}`;

  // SAME: cycle bases × classes evenly so every class gets ≥ counts.same/5.
  for (let i = 0; i < counts.same; i += 1) {
    const base = bases[i % bases.length];
    const cls = CLASSES[i % CLASSES.length];
    pairs.push({ id: id(), a: base, b: VARIANT_MAKERS[cls](base), label: "SAME", variantClass: cls, trap: false, baseA: base, baseB: base });
  }
  // general DIFFERENT: distinct bases, one side possibly varied (still labeled by its class).
  for (let i = 0; i < counts.diff; i += 1) {
    const a = bases[i % bases.length];
    const b = bases[(i + 1 + (i % (bases.length - 1))) % bases.length];
    if (a === b) throw new Error("generator bug: identical bases in DIFFERENT pair");
    const cls = CLASSES[i % CLASSES.length];
    pairs.push({ id: id(), a, b: i % 2 === 0 ? VARIANT_MAKERS[cls](b) : b, label: "DIFFERENT", variantClass: cls, trap: false, baseA: a, baseB: b });
  }
  // traps: near-miss DIFFERENT. A template may be a no-op for some names
  // (e.g. the Tacos→Taqueria swap on "Golden Dragon") — deterministically
  // fall through to the next template until one actually changes the name.
  for (let i = 0; i < counts.trap; i += 1) {
    const base = bases[i % bases.length];
    let t = base;
    for (let k = 0; k < TRAP_TEMPLATES.length && t === base; k += 1) {
      t = TRAP_TEMPLATES[(i + k) % TRAP_TEMPLATES.length](base);
    }
    if (t === base) throw new Error(`generator bug: no trap template changes "${base}"`);
    pairs.push({ id: id(), a: base, b: t, label: "DIFFERENT", variantClass: "trap-near-miss", trap: true, baseA: base, baseB: `${base} (distinct trap entity)` });
  }
  // ambiguous.
  for (let i = 0; i < counts.ambig; i += 1) {
    const base = bases[i % bases.length];
    pairs.push({ id: id(), a: base, b: AMBIG_TEMPLATES[i % AMBIG_TEMPLATES.length](base), label: "AMBIGUOUS", variantClass: "ambiguous-branch", trap: false, baseA: base, baseB: `${base} (branch/expansion?)` });
  }
  return pairs;
}

const corpus = {
  _doc: "E4 synthetic adversarial entity-resolution corpus — generated by scripts-ts/generate-entity-corpus.mts (seed 20260712, deterministic), FROZEN before scoring per docs/e4-entity-resolution-preregistration.md §2-§3 + A1. All names FICTIONAL (legacy dummy directory + the crew's Fog City Tacos). Tune/test base merchants are DISJOINT; thresholds may be tuned on the tune split ONLY; the test split is scored ONCE then exposed.",
  seed: SEED,
  registration: { doc: "docs/e4-entity-resolution-preregistration.md", commit: "31bd66d" },
  tuneBases: TUNE_BASES,
  testBases: TEST_BASES,
  tune: generateSplit(TUNE_BASES, "tune", { same: 20, diff: 12, trap: 6, ambig: 4 }),
  // trap: 14 — §3 binds at >=12 near-miss traps (AMENDMENT A1's >=8 is an
  // ADDITIONAL denominator floor, never a relaxation). The first run used 10
  // and was VOID; this split satisfies max(12, 8) = 12 with headroom.
  test: generateSplit(TEST_BASES, "test", { same: 35, diff: 32, trap: 14, ambig: 10 }),
};

const out = join(process.cwd(), "evals/entity/gold/entity-pairs.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(corpus, null, 2)}\n`);
console.log(
  JSON.stringify({
    tune: corpus.tune.length,
    test: corpus.test.length,
    testSame: corpus.test.filter((p) => p.label === "SAME").length,
    testDiff: corpus.test.filter((p) => p.label === "DIFFERENT" && !p.trap).length,
    testTrap: corpus.test.filter((p) => p.trap).length,
    testAmbig: corpus.test.filter((p) => p.label === "AMBIGUOUS").length,
  }),
);
