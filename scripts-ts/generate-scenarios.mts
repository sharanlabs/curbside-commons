/**
 * Scenario-library generator — Wave 1 / lane 3 (docs/plan-menu-integrity-crew-2026-10-09.md
 * §9 + Appendix W1c; events.jsonl per docs/plan-wave2-gap-sheet-2026-10-12.md p.2).
 *
 * Builds fixtures/scenarios/<id>/ for the seven scenarios built so far:
 *   agent-86 · modifier-drift · sync-outage · platform-override ·
 *   partner-onboarding · spec-valid-lie · fee-precheck
 * (modifier-drift and spec-valid-lie added by Wave 2 lane S1.5, 2026-10-31, on
 * the S1 menu model and the UCP wire builder; generator 1.0.0 → 1.1.0, the five
 * earlier scenarios' PRNG consumption untouched.)
 * Each folder: brief.md · inputs/ (feed+record+events | statement+events; plus
 * the UCP wire document for spec-valid-lie) · expected/ (the engine report
 * only) · manifest.json.
 *
 * Every input is a deterministic, seeded transformation of the committed
 * fixtures/synthetic-restaurant corpus (READ-ONLY here — never written). Inputs
 * reuse the existing AcpFeed / SyntheticCatalog / fee-statement shapes exactly.
 * The existing engine (listings pack; fee audit) is run at generation, and every
 * figure a brief states is a {{placeholder}} filled from that run — never typed.
 * evals/packs/scenarios.test.ts regenerates in memory, byte-compares, and
 * re-derives the figures independently.
 *
 * Out of scope here, by design: root-cause · impact · route · turns (S2) and
 * `injected-artifact` (S3).
 *
 * Run: node scripts-ts/generate-scenarios.mts        (Node ≥ 24; writes fixtures/scenarios/)
 * Import: `buildScenarioFiles()` is pure (reads the base corpus, writes nothing).
 *
 * Plain: one recipe that rebuilds seven labeled, synthetic test cases — each a
 * small story, the data behind it, and what the existing checker says about it.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  LISTINGS_SPEC_VERSION,
  acpFeedToClaims,
  applyModifierPriceDrift,
  buildUcpSearchResponse,
  centsToDecimal,
  mulberry32,
  projectModifier,
  recordModifierOptions,
  runListingsVerification,
  ucpSearchResponseToClaims,
  type AcpFeed,
  type SyntheticCatalog,
  type UcpSearchResponse,
} from "../lib/packs/listings/index.ts";
import { runUcpConformance } from "../lib/packs/listings/conformance.ts";
import {
  FEES_SPEC_VERSION,
  auditStatement,
  parseStatement,
  serializeFeeReport,
  type MonthlyStatement,
} from "../lib/packs/fees/index.ts";
import { serializeReport } from "../lib/verifier-core/verify.ts";
import type { VerifierReport } from "../lib/verifier-core/report.ts";

export const GENERATOR_VERSION = "1.1.0";
export const SCENARIO_IDS = [
  "agent-86",
  "modifier-drift",
  "sync-outage",
  "platform-override",
  "partner-onboarding",
  "spec-valid-lie",
  "fee-precheck",
] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

/** Plan §9 numbering (agent-86 = 1 … fee-precheck = 7). */
const NUMBER: Record<ScenarioId, number> = {
  "agent-86": 1,
  "modifier-drift": 2,
  "sync-outage": 3,
  "platform-override": 4,
  "partner-onboarding": 5,
  "spec-valid-lie": 6,
  "fee-precheck": 7,
};
/** One pinned seed per scenario (distinct from the corpus seed 20260703). */
const SEED: Record<ScenarioId, number> = {
  "agent-86": 20261001,
  "modifier-drift": 20261002,
  "sync-outage": 20261003,
  "platform-override": 20261004,
  "partner-onboarding": 20261005,
  "spec-valid-lie": 20261006,
  "fee-precheck": 20261007,
};

// Scenario parameters — knobs of the transformation, recorded in each manifest.
const N_ITEMS_86 = 3; // agent-86: items the record marks sold out
const OUTAGE_HOURS = 36; // sync-outage: how long before as-of the last sync ran
const REFRESH_HOURS = 24; // sync-outage: a synced row's expiry stamp is last-sync + this
const OVERRIDE_HOURS = 48; // platform-override: how long before as-of the manual edit happened
const N_ITEMS_EDITED = 6; // platform-override: items edited by hand
const N_ROWS_DRIFTED = 6; // partner-onboarding: rows of the partner feed that drift
const N_EXTRA_ORDERS = 5; // fee-precheck: orders added to the faithful two
const N_ITEMS_MOD = 2; // modifier-drift: items whose add-on the merchant repriced
const RECORD_OPTION_CENTS = 150; // modifier-drift: the record's new add-on price (+$1.50)
const COPY_OPTION_CENTS = 200; // modifier-drift: the add-on price the stale copy still serves (+$2.00)
const MOD_SYNC_HOURS = 24; // modifier-drift: the copy's last sync, before the reprice
const N_LIE_ROWS = 2; // spec-valid-lie: answered rows whose price the record does not have
const LIE_STEP_CENTS = 100; // spec-valid-lie: each lie lifts a price by 1–3 of these

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseDir = join(root, "fixtures", "synthetic-restaurant");
const readJson = <T,>(rel: string): T => JSON.parse(readFileSync(join(baseDir, rel), "utf8")) as T;

type Mut<T> = { -readonly [K in keyof T]: Mut<T[K]> };
const clone = <T,>(v: T): Mut<T> => structuredClone(v) as Mut<T>;

type Figures = Record<string, string | number>;
const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

// ── helpers ──────────────────────────────────────────────────────────────────

const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const shiftMin = (isoTime: string, minutes: number): string => iso(Date.parse(isoTime) + minutes * 60_000);
const hours = (h: number): number => h * 60;

function shuffled<T>(rand: () => number, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Ev = { at: string; actor: "merchant" | "integrator" | "platform" | "unknown"; action: "price_edit" | "86" | "un86" | "sync" | "override"; target: string };

/** events.jsonl — evidence, not a label: no scenario id, no cause field. Sorted by time, then target. */
function eventsText(events: readonly Ev[]): string {
  const sorted = [...events].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.target < b.target ? -1 : a.target > b.target ? 1 : 0));
  return sorted.map((e) => JSON.stringify({ at: e.at, actor: e.actor, action: e.action, target: e.target })).join("\n") + "\n";
}

function tally(ruleIds: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const r of ruleIds) counts.set(r, (counts.get(r) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([r, n]) => `${r} ×${n}`)
    .join(", ");
}
const rowOf = (claimId: string): string => claimId.split("#")[0];

function itemOfRow(record: SyntheticCatalog, rowId: string) {
  const it = record.items.find((i) => i.variations.some((v) => v.id === rowId));
  if (!it) throw new Error(`row ${rowId} is not in the record`);
  return it;
}

function runListings(feed: AcpFeed, record: SyntheticCatalog): VerifierReport {
  return runListingsVerification(acpFeedToClaims(feed), record);
}

function commonFigures(feed: AcpFeed, report: VerifierReport): Figures {
  return {
    verdict: report.ok ? "PASS" : "FAIL",
    findings: report.findings.length,
    errors: report.findings.filter((f) => f.severity === "error").length,
    warnings: report.findings.filter((f) => f.severity === "warn").length,
    rows_read: feed.items.length,
    rules: tally(report.findings.map((f) => f.ruleId)),
  };
}

function recordProvenance(id: ScenarioId): { name: string; seed: number; version: string } {
  return { name: `scenario:${id}`, seed: SEED[id], version: GENERATOR_VERSION };
}

// ── the base corpus (read-only) ──────────────────────────────────────────────

const SOR = readJson<SyntheticCatalog>("sor.catalog.json");
const FAITHFUL = readJson<AcpFeed>("acp-feed.faithful.json");
const FAITHFUL_STATEMENT = readJson<MonthlyStatement>("fees/statement.faithful.json");

interface Built {
  readonly id: ScenarioId;
  readonly pack: "listings" | "fees";
  readonly engine: string;
  readonly inputs: Readonly<Record<string, string>>;
  readonly report: string;
  readonly figures: Figures;
  readonly transform: Readonly<Record<string, unknown>>;
}

// ── 1 · agent-86 ─────────────────────────────────────────────────────────────

function buildAgent86(): Built {
  const id = "agent-86";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  const feed = clone(FAITHFUL);
  // Items whose every variation is in stock in the record: an 86 is of the whole item.
  const eligible = record.items.filter((it) => it.variations.every((v) => v.stock === "in_stock"));
  const picked = shuffled(rand, eligible).slice(0, N_ITEMS_86);
  const rows: string[] = [];
  for (const it of picked) {
    for (const v of it.variations) {
      v.stock = "soldout_86";
      rows.push(v.id);
    }
  }
  record.generator = recordProvenance(id);

  const events: Ev[] = [{ at: shiftMin(record.asOf, -hours(24)), actor: "integrator", action: "sync", target: "catalog" }];
  rows.forEach((row, k) => {
    events.push({ at: shiftMin(record.asOf, -(120 + k * 7 + Math.floor(rand() * 5))), actor: "merchant", action: "86", target: row });
  });

  const report = runListings(feed, record);
  const first = rowOf(report.findings[0].claim.id);
  const firstRow = feed.items.find((r) => r.item_id === first)!;
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: { "feed.json": asJson(feed), "record.json": asJson(record), "events.jsonl": eventsText(events) },
    report: serializeReport(report),
    figures: {
      ...commonFigures(feed, report),
      items86: new Set(report.findings.map((f) => itemOfRow(record, rowOf(f.claim.id)).id)).size,
      order_row: first,
      order_title: firstRow.title,
      order_price: `$${firstRow.price}`,
    },
    transform: { itemsMarkedSoldOutInRecord: N_ITEMS_86, feed: "faithful copy, unchanged", pickedItems: picked.map((i) => i.id) },
  };
}

// ── 3 · sync-outage ──────────────────────────────────────────────────────────

function buildSyncOutage(): Built {
  const id = "sync-outage";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  const feed = clone(FAITHFUL);
  record.generator = recordProvenance(id);
  const asOf = record.asOf;

  const category = shuffled(rand, [...new Set(record.items.map((i) => i.category))])[0];
  const lastSync = shiftMin(asOf, -hours(OUTAGE_HOURS));
  const lapsed = shiftMin(lastSync, hours(REFRESH_HOURS)); // last sync + refresh window: already past
  const fresh = shiftMin(asOf, hours(REFRESH_HOURS)); // synced as-of: expires a refresh window later

  // The copy: every row carries refresh stamps; the outage category's stopped at the last sync.
  const catRowIds: string[] = [];
  for (const row of feed.items) {
    if (itemOfRow(record, row.item_id).category === category) {
      row.updated_at = lastSync;
      row.expiration_date = lapsed;
      catRowIds.push(row.item_id);
    } else {
      row.expiration_date = fresh;
    }
  }

  // The record: while the copy was frozen, the merchant kept editing.
  const events: Ev[] = [
    { at: shiftMin(asOf, -hours(60)), actor: "integrator", action: "sync", target: "catalog" },
    { at: lastSync, actor: "integrator", action: "sync", target: category },
  ];
  const when = (): string => shiftMin(asOf, -(180 + Math.floor(rand() * (hours(OUTAGE_HOURS - 3) - 180))));
  const bumped: string[] = [];
  const soldOut: string[] = [];
  const catVariations = record.items.filter((i) => i.category === category).flatMap((i) => i.variations).filter((v) => catRowIds.includes(v.id));
  for (const v of catVariations) {
    if (rand() < 0.5) {
      v.priceCents += 50 * (1 + Math.floor(rand() * 4));
      bumped.push(v.id);
    }
    if (v.stock === "in_stock" && rand() < 0.35) {
      v.stock = "soldout_86";
      soldOut.push(v.id);
    }
  }
  if (bumped.length === 0) {
    catVariations[0].priceCents += 100;
    bumped.push(catVariations[0].id);
  }
  if (soldOut.length === 0) {
    const v = [...catVariations].reverse().find((x) => x.stock === "in_stock");
    if (!v) throw new Error("sync-outage: no in-stock row to sell out in the chosen category");
    v.stock = "soldout_86";
    soldOut.push(v.id);
  }
  for (const r of bumped) events.push({ at: when(), actor: "merchant", action: "price_edit", target: r });
  for (const r of soldOut) events.push({ at: when(), actor: "merchant", action: "86", target: r });

  const report = runListings(feed, record);
  const by = (rule: string) => report.findings.filter((f) => f.ruleId === rule);
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: { "feed.json": asJson(feed), "record.json": asJson(record), "events.jsonl": eventsText(events) },
    report: serializeReport(report),
    figures: {
      ...commonFigures(feed, report),
      category,
      rows_stale: by("LST-STALE-EXPIRED").length,
      price_drifts: by("LST-PRICE-VALUE").length,
      newly_86: by("LST-AVAIL-STATE").length,
      outage_hours: (Date.parse(asOf) - Date.parse(lastSync)) / 3_600_000,
    },
    transform: {
      category,
      lastSyncHoursBeforeAsOf: OUTAGE_HOURS,
      refreshWindowHours: REFRESH_HOURS,
      feed: "outage-category rows: updated_at = last sync, expiration_date = last sync + refresh window; other rows: expiration_date = as-of + refresh window",
      record: "outage-category rows: seeded price increases and sell-outs",
    },
  };
}

// ── 4 · platform-override ────────────────────────────────────────────────────

function buildPlatformOverride(): Built {
  const id = "platform-override";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  const feed = clone(FAITHFUL);
  record.generator = recordProvenance(id);
  const asOf = record.asOf;
  const editStamp = shiftMin(asOf, -hours(OVERRIDE_HOURS));

  // Items whose every served variation is in stock in the record, so any switch-off is a real difference.
  const eligible = record.items.filter((it) => it.variations.filter((v) => v.stock !== "hidden").every((v) => v.stock === "in_stock"));
  const picked = shuffled(rand, eligible).slice(0, N_ITEMS_EDITED);
  const KINDS = ["name", "description", "active"] as const;
  const SUFFIXES = ["Combo", "Deluxe", "Family Size", "Chef Special"] as const;
  const events: Ev[] = [{ at: shiftMin(asOf, -60), actor: "integrator", action: "sync", target: "catalog" }];

  picked.forEach((it, i) => {
    const kind = KINDS[i % KINDS.length];
    const newName = `${it.name} ${SUFFIXES[Math.floor(rand() * SUFFIXES.length)]}`;
    for (const row of feed.items.filter((r) => r.group_id === it.id)) {
      const variation = it.variations.find((v) => v.id === row.item_id)!;
      if (kind === "name") row.title = it.variations.length > 1 ? `${newName} (${variation.name})` : newName;
      if (kind === "description") row.description = `${it.name} — description rewritten in the platform portal (synthetic text).`;
      if (kind === "active") row.availability = "out_of_stock";
      row.updated_at = editStamp;
    }
    events.push({ at: shiftMin(editStamp, -Math.floor(rand() * 20)), actor: "platform", action: "override", target: it.id });
  });

  const report = runListings(feed, record);
  const by = (rule: string) => report.findings.filter((f) => f.ruleId === rule);
  const descRows = feed.items.filter((r) => r.description !== itemOfRow(record, r.item_id).description);
  const edited = new Set([
    ...report.findings.map((f) => itemOfRow(record, rowOf(f.claim.id)).id),
    ...descRows.map((r) => itemOfRow(record, r.item_id).id),
  ]);
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: { "feed.json": asJson(feed), "record.json": asJson(record), "events.jsonl": eventsText(events) },
    report: serializeReport(report),
    figures: {
      ...commonFigures(feed, report),
      items_edited: edited.size,
      name_rows: by("LST-IDENT-NAME").length,
      active_rows: by("LST-AVAIL-STATE").length,
      description_rows: descRows.length,
      override_hours: OVERRIDE_HOURS,
    },
    transform: {
      itemsEditedByHand: N_ITEMS_EDITED,
      kinds: [...KINDS],
      editHoursBeforeAsOf: OVERRIDE_HOURS,
      record: "unchanged copy of the base record (it is the newer side)",
      feed: "picked items' rows: name, description or availability switched; updated_at = the edit time",
      pickedItems: picked.map((i) => i.id),
    },
  };
}

// ── 5 · partner-onboarding ───────────────────────────────────────────────────

function buildPartnerOnboarding(): Built {
  const id = "partner-onboarding";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  const feed = clone(FAITHFUL);
  record.generator = recordProvenance(id);
  const asOf = record.asOf;
  const KINDS = ["price", "availability", "name"] as const;

  const events: Ev[] = [{ at: shiftMin(asOf, -60), actor: "integrator", action: "sync", target: "catalog" }];
  const picked = shuffled(rand, feed.items.map((r) => r.item_id)).slice(0, N_ROWS_DRIFTED);
  picked.forEach((rowId, i) => {
    const row = feed.items.find((r) => r.item_id === rowId)!;
    const item = itemOfRow(record, rowId);
    const variation = item.variations.find((v) => v.id === rowId)!;
    const at = shiftMin(asOf, -(5 + Math.floor(rand() * 50)));
    const kind = KINDS[i % KINDS.length];
    if (kind === "price") {
      row.price = centsToDecimal(variation.priceCents + 100 * (1 + Math.floor(rand() * 3)));
      events.push({ at, actor: "integrator", action: "price_edit", target: rowId });
    } else if (kind === "availability") {
      const nowOut = row.availability === "in_stock";
      row.availability = nowOut ? "out_of_stock" : "in_stock";
      events.push({ at, actor: "integrator", action: nowOut ? "86" : "un86", target: rowId });
    } else {
      row.title = `${row.title} – Partner Label`;
      events.push({ at, actor: "unknown", action: "override", target: rowId });
    }
  });

  const report = runListings(feed, record);
  const drifted = new Set(report.findings.map((f) => rowOf(f.claim.id))).size;
  const clean = feed.items.length - drifted;
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: { "feed.json": asJson(feed), "record.json": asJson(record), "events.jsonl": eventsText(events) },
    report: serializeReport(report),
    figures: {
      ...commonFigures(feed, report),
      clean_rows: clean,
      drifted_rows: drifted,
      clean_pct: `${((clean * 100) / feed.items.length).toFixed(1)}%`,
    },
    transform: {
      driftedRowsChosen: N_ROWS_DRIFTED,
      kinds: [...KINDS],
      record: "unchanged copy of the base record",
      feed: "faithful feed with the chosen rows drifted one way each (price · availability · name)",
    },
  };
}

// ── 2 · modifier-drift ───────────────────────────────────────────────────────

function buildModifierDrift(): Built {
  const id = "modifier-drift";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  record.generator = recordProvenance(id);
  const asOf = record.asOf;

  // Items orderable in every size that carry at least one priced add-on.
  const eligible = record.items.filter(
    (it) => it.variations.every((v) => v.stock === "in_stock") && it.modifierLists.some((l) => l.options.some((o) => o.priceDeltaCents > 0)),
  );
  const picked = shuffled(rand, eligible).slice(0, N_ITEMS_MOD);
  if (picked.length < N_ITEMS_MOD) throw new Error("modifier-drift: not enough items with a priced add-on");
  const optionIds = picked.map((it) => {
    const priced = it.modifierLists.flatMap((l) => l.options.filter((o) => o.priceDeltaCents > 0));
    const option = priced[Math.floor(rand() * priced.length)];
    option.priceDeltaCents = RECORD_OPTION_CENTS; // the merchant's reprice, in the record
    return option.id;
  });

  // The copy: the bundled faithful feed with every row's add-ons projected from the
  // record (the S1 menu model), then the stale add-on price on the repriced options.
  const byItemId = new Map(record.items.map((i) => [i.id, i]));
  let feed: AcpFeed = {
    ...clone(FAITHFUL),
    items: FAITHFUL.items.map((row) => ({
      ...row,
      modifiers: recordModifierOptions(byItemId.get(row.group_id)!).map(({ list, option }) => projectModifier(list, option)),
    })),
  };
  for (const optionId of optionIds) feed = applyModifierPriceDrift(feed, optionId, COPY_OPTION_CENTS - RECORD_OPTION_CENTS).feed;

  const events: Ev[] = [{ at: shiftMin(asOf, -hours(MOD_SYNC_HOURS)), actor: "integrator", action: "sync", target: "catalog" }];
  optionIds.forEach((optionId, k) => {
    events.push({ at: shiftMin(asOf, -(120 + k * 11 + Math.floor(rand() * 7))), actor: "merchant", action: "price_edit", target: optionId });
  });

  const report = runListings(feed, record);
  const mod = report.findings.filter((f) => f.ruleId === "LST-MOD-PRICE-VALUE");
  const options = record.items.flatMap((it) => recordModifierOptions(it)).filter(({ option }) => optionIds.includes(option.id));
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: { "feed.json": asJson(feed), "record.json": asJson(record), "events.jsonl": eventsText(events) },
    report: serializeReport(report),
    figures: {
      ...commonFigures(feed, report),
      options_drifted: new Set(mod.map((f) => f.referenceRowId)).size,
      option_names: options.map(({ list, option }) => `${option.name} (${list.name})`).join(", "),
      items_drifted: new Set(mod.map((f) => itemOfRow(record, rowOf(f.claim.id)).id)).size,
      rows_drifted: mod.length,
      record_price: `$${centsToDecimal(RECORD_OPTION_CENTS)}`,
      copy_price: `$${centsToDecimal(COPY_OPTION_CENTS)}`,
    },
    transform: {
      itemsRepriced: N_ITEMS_MOD,
      recordOptionCents: RECORD_OPTION_CENTS,
      copyOptionCents: COPY_OPTION_CENTS,
      lastSyncHoursBeforeAsOf: MOD_SYNC_HOURS,
      record: "one priced add-on option per picked item set to the record price",
      feed: "faithful feed + every row's record add-ons (menu model); the repriced options keep the old price on the copy",
      pickedItems: picked.map((i) => i.id),
      repricedOptions: optionIds,
    },
  };
}

// ── 6 · spec-valid-lie ───────────────────────────────────────────────────────

/** Every vendored UCP schema version (folder names under fixtures/ucp-schemas). */
function vendoredUcpVersions(): string[] {
  return readdirSync(join(root, "fixtures", "ucp-schemas"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function buildSpecValidLie(): Built {
  const id = "spec-valid-lie";
  const rand = mulberry32(SEED[id]);
  const record = clone(SOR);
  record.generator = recordProvenance(id);
  const asOf = record.asOf;

  const eligible = FAITHFUL.items.filter((r) => r.availability === "in_stock").map((r) => r.item_id);
  const picked = shuffled(rand, eligible).slice(0, N_LIE_ROWS);
  const lift = new Map(picked.map((rowId) => [rowId, LIE_STEP_CENTS * (1 + Math.floor(rand() * 3))]));

  // The responder's state: the record with the lifted prices. The wire document is
  // built from it by the existing UCP builder, so it is schema-shaped by construction.
  const served = clone(record);
  for (const it of served.items) for (const v of it.variations) if (lift.has(v.id)) v.priceCents += lift.get(v.id)!;
  const wire = { simulated: true, ...buildUcpSearchResponse(served) } as UcpSearchResponse & { simulated: true };
  // The feed the answer was built from carries the same prices (one comparator, two surfaces).
  const feed = clone(FAITHFUL);
  for (const row of feed.items) {
    if (!lift.has(row.item_id)) continue;
    const v = served.items.flatMap((i) => i.variations).find((x) => x.id === row.item_id)!;
    row.price = centsToDecimal(v.priceCents);
  }

  const versions = vendoredUcpVersions();
  const conformance = versions.map((v) => runUcpConformance(wire, { op: "search", schemaDir: join(root, "fixtures", "ucp-schemas", v, "schemas") }));
  if (!conformance.every((r) => r.ok)) throw new Error("spec-valid-lie: the wire document must pass conformance on every vendored schema version");
  const active = runUcpConformance(wire, { op: "search", schemaDir: join(root, "fixtures", "ucp-schemas", wire.ucp.version, "schemas") });

  const events: Ev[] = [{ at: shiftMin(asOf, -90), actor: "integrator", action: "sync", target: "catalog" }];
  for (const rowId of picked) events.push({ at: shiftMin(asOf, -(20 + Math.floor(rand() * 40))), actor: "unknown", action: "price_edit", target: rowId });

  const report = runListingsVerification(ucpSearchResponseToClaims(wire), record);
  const acp = runListings(feed, record);
  const lies = report.findings.filter((f) => f.ruleId === "LST-PRICE-VALUE");
  const firstRow = rowOf(lies[0].claim.id);
  const firstFeedRow = FAITHFUL.items.find((r) => r.item_id === firstRow)!;
  const recordCents = record.items.flatMap((i) => i.variations).find((v) => v.id === firstRow)!.priceCents;
  return {
    id,
    pack: "listings",
    engine: LISTINGS_SPEC_VERSION,
    inputs: {
      "feed.json": asJson(feed),
      "record.json": asJson(record),
      "ucp-response.json": asJson(wire),
      "events.jsonl": eventsText(events),
    },
    report: serializeReport(report),
    figures: {
      verdict: report.ok ? "PASS" : "FAIL",
      findings: report.findings.length,
      errors: report.findings.filter((f) => f.severity === "error").length,
      warnings: report.findings.filter((f) => f.severity === "warn").length,
      rows_read: wire.products.reduce((n, p) => n + p.variants.length, 0),
      rules: tally(report.findings.map((f) => f.ruleId)),
      conformance: active.ok ? "pass" : "fail",
      conformance_findings: active.findings.length,
      ucp_version: wire.ucp.version,
      schema_versions: versions.join(", "),
      lie_rows: lies.length,
      lie_title: firstFeedRow.title,
      copy_price: `$${centsToDecimal(recordCents + lift.get(firstRow)!)}`,
      record_price: `$${centsToDecimal(recordCents)}`,
      acp_findings: acp.findings.length,
      acp_rules: tally(acp.findings.map((f) => f.ruleId)),
    },
    transform: {
      liedRowsChosen: N_LIE_ROWS,
      liftStepCents: LIE_STEP_CENTS,
      record: "unchanged copy of the base record",
      ucpResponse: "buildUcpSearchResponse over the record with the chosen rows' prices lifted (schema-shaped by construction)",
      feed: "faithful feed with the same rows at the same lifted prices",
      liftedRows: picked,
    },
  };
}

// ── 7 · fee-precheck ─────────────────────────────────────────────────────────

function buildFeePrecheck(): Built {
  const id = "fee-precheck";
  const rand = mulberry32(SEED[id]);
  const stmt = clone(FAITHFUL_STATEMENT);
  stmt.meta.generator = recordProvenance(id);
  const month = stmt.meta.month;
  const draftEnd = `${stmt.meta.asOf}T00:00:00Z`;

  const orders: { orderId: string; price: number }[] = [];
  for (let i = 0; i < N_EXTRA_ORDERS; i++) {
    orders.push({ orderId: `ORD-${3 + i}`, price: 1500 + 100 * Math.floor(rand() * 30) });
  }
  const [overCap, passthrough, bundled] = shuffled(rand, orders);
  const line = (orderId: string, declaredCategory: string, label: string, amountCents: number, price: number, passthroughDocumented = false) => ({
    orderId,
    month,
    declaredCategory,
    label,
    amountCents,
    orderPurchasePriceCents: price,
    isRefund: false,
    passthroughDocumented,
  });
  const events: Ev[] = [{ at: shiftMin(draftEnd, -hours(72)), actor: "platform", action: "sync", target: "statement" }];
  const edit = (target: string): void => {
    events.push({ at: shiftMin(draftEnd, -(hours(48) + Math.floor(rand() * 120))), actor: "platform", action: "price_edit", target });
  };

  for (const o of orders) {
    stmt.lines.push(line(o.orderId, "delivery_fee", "Delivery fee", Math.floor((o.price * 15) / 100), o.price));
    stmt.lines.push(line(o.orderId, "basic_service_fee", "Basic service fee", Math.floor((o.price * 5) / 100), o.price));
    if (o === overCap) {
      stmt.lines.push(line(o.orderId, "transaction_fee", "Card processing", Math.floor((o.price * 5) / 100), o.price));
      edit(`${o.orderId}#transaction_fee`);
    } else if (o === passthrough) {
      stmt.lines.push(line(o.orderId, "transaction_fee", "Card processing (pass-through)", Math.floor((o.price * 4) / 100), o.price, true));
      edit(`${o.orderId}#transaction_fee`);
    } else {
      stmt.lines.push(line(o.orderId, "transaction_fee", "Card processing", Math.floor((o.price * 3) / 100), o.price));
    }
    if (o === bundled) {
      stmt.lines.push(line(o.orderId, "service_and_delivery", "Combined service + delivery bundle", 150, o.price));
      edit(`${o.orderId}#service_and_delivery`);
    }
  }

  const text = asJson(stmt);
  const parsed = parseStatement(text); // the draft must be a statement the real parser accepts
  const report = auditStatement(parsed);
  const v = (verdict: string) => report.findings.filter((f) => f.verdict === verdict).length;
  return {
    id,
    pack: "fees",
    engine: FEES_SPEC_VERSION,
    inputs: { "statement.json": text, "events.jsonl": eventsText(events) },
    report: serializeFeeReport(report),
    figures: {
      verdict: report.ok ? "PASS" : "FAIL",
      orders: new Set(parsed.lines.map((l) => l.orderId)).size,
      lines: parsed.lines.length,
      findings: report.findings.length,
      violations: v("violation"),
      asserted: v("asserted-passthrough-unverified"),
      conditional: v("conditional-pending-refund-window"),
      cured: v("cured-by-refund"),
      provisional: report.findings.filter((f) => f.provisional.length > 0).length,
      rules: tally(report.findings.map((f) => f.ruleId)),
    },
    transform: {
      base: "fees/statement.faithful.json",
      ordersAdded: N_EXTRA_ORDERS,
      defects: ["one transaction fee above the cap", "one transaction fee above the cap with a pass-through asserted", "one line under a non-permitted category"],
    },
  };
}

// ── briefs ───────────────────────────────────────────────────────────────────
// Placeholders are {{key}}; every figure is a key of that scenario's `figures`.
// No digit is typed here (the test allow-lists only ids, slice names, the statute, U1).

const SEATS_LISTINGS = `- Audit (deterministic) runs the listings engine on the two inputs.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.`;

const NOT_YET = "Root cause, impact and routing arrive in S2; this folder holds the engine report and the event evidence only.";

export const BRIEF_TEMPLATES: Record<ScenarioId, string> = {
  "modifier-drift": `# modifier-drift — an add-on is repriced in the record, not on the copy

## The story

On this synthetic menu the merchant reprices {{options_drifted}} add-on options in the record to +{{record_price}}. The marketplace copy last synced before the change, so it still charges +{{copy_price}} for them, on every size of the {{items_drifted}} items that carry them. An order with one of those add-ons is charged more than the merchant asked. The record is right and the copy is stale. The audit names each row and option, with the record's own option price as the receipt.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} feed rows.
- Rules that fire: {{rules}} — the copy's add-on price is not the record's.
- Options affected: {{option_names}}; rows affected: {{rows_drifted}}.
- No base price, availability or name is flagged.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

A Merchant-Ops analyst would sign a proposal to re-sync the modifier lists of the affected items. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact (the orders those add-ons touched) and routing arrive in S2; this folder holds the engine report and the event evidence only.
`,

  "spec-valid-lie": `# spec-valid-lie — a catalog answer that passes conformance and still states a wrong price

## The story

A synthetic merchant's catalog answer, written in the public UCP schema shape, is checked twice. Against the pinned UCP schemas it is well formed: conformance {{conformance}}, {{conformance_findings}} schema findings, and it passes every vendored schema version ({{schema_versions}}). Against the merchant record it is wrong: {{lie_rows}} rows state a price the record does not have, and {{lie_title}} is answered at {{copy_price}} while the record says {{record_price}}. A document can be valid and still untrue; the two checks answer different questions.

## What the reviewer will see

- Conformance {{conformance}}: {{conformance_findings}} findings against the pinned schemas, UCP version {{ucp_version}}.
- Truth verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} answered rows.
- Rules that fire: {{rules}}.
- The feed the answer was built from: {{acp_findings}} findings ({{acp_rules}}) on the same rows — one comparator, two surfaces.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

An Integrations manager would sign a proposal to correct the responder's prices before an agent relies on them. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; this folder holds the engine report, the conformance verdict and the event evidence only.
`,

  "agent-86": `# agent-86 — an agent order lands on an item the kitchen has 86'd

## The story

On this synthetic menu the kitchen marks {{items86}} items sold out in the merchant record. The marketplace copy never hears about it and keeps offering them. An agent order arrives for {{order_title}} at {{order_price}}, placed against the copy, and the kitchen cannot make it. The record is right and the copy is stale. The audit shows exactly which rows still say "in stock", with the record's own row as the receipt.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} feed rows.
- Rules that fire: {{rules}} — the record says sold out, the copy says in stock.
- The agent order's row is {{order_row}}; its receipt quotes both sides.
- No other row is flagged.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

A Merchant-Ops analyst would sign a proposal to hold the affected rows on the agent surface or to ask for a re-sync. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

${NOT_YET}
`,

  "sync-outage": `# sync-outage — a whole category goes stale after a sync outage

## The story

A sync outage stops the marketplace copy from refreshing. {{rows_stale}} rows in the {{category}} category last synced {{outage_hours}} hours before the record's as-of time, and their expiry stamps have lapsed. Behind the outage the merchant changed {{price_drifts}} prices and sold out {{newly_86}} rows in the record. The copy still shows the old prices and still offers the sold-out rows. All data is synthetic.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} feed rows.
- Rules that fire: {{rules}}.
- Every row in {{category}} is stale, and no other category is flagged.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

A Merchant-Ops analyst would sign a proposal to force a re-sync of the category; an Integrations manager would sign the ticket to the sync vendor. Signatures are ledger records, never platform actions; nothing here is sent.

## Not yet

${NOT_YET}
`,

  "platform-override": `# platform-override — a portal edit wins over the feed

## The story

In this scenario a manual edit made on the platform side wins over the integration feed (the scenario's premise, not a claim about any real platform). {{items_edited}} items were edited by hand {{override_hours}} hours before the record's as-of time. The record has moved on since, but the copy keeps the hand-edited values: {{name_rows}} rows carry a different name, {{active_rows}} rows are switched off while the record says in stock, and {{description_rows}} rows carry a rewritten description. All data is synthetic.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} feed rows.
- Rules that fire: {{rules}}.
- The {{description_rows}} rewritten descriptions are visible in the inputs, but no current rule reads descriptions; that finding arrives in S1/S2.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

An Integrations manager would sign a proposal asking the platform to clear the manual overrides, so that the feed values apply again. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

${NOT_YET}
`,

  "partner-onboarding": `# partner-onboarding — a new integration partner's feed, scored

## The story

A new integration partner sends its first feed for this synthetic merchant. The reviewer wants one honest number before the partner goes live: how much of the feed matches the merchant's record. Of {{rows_read}} rows, {{clean_rows}} match exactly and {{drifted_rows}} drift, some on price, some on availability, some on name. The existing verdict scores it, and the reviewer sets the pass line.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings ({{errors}} errors, {{warnings}} warnings) over {{rows_read}} feed rows.
- Clean rows: {{clean_rows}} of {{rows_read}} ({{clean_pct}}); drifted rows: {{drifted_rows}}.
- Rules that fire: {{rules}}.
- The verdict is the engine's own: PASS only with zero findings. Any pass line is the reviewer's to set.

## Which seats act

${SEATS_LISTINGS}

## What a human signs

An Integrations or Partnerships manager would sign the go-live or hold decision for the partner. The signature is a ledger record, never a platform action; nothing here is sent.

## Not yet

Root cause, impact and routing arrive in S2; scoring against published partner criteria arrives in S3.
`,

  "fee-precheck": `# fee-precheck — a draft fee statement, checked before it is issued

## The story

A platform's legal team runs a compliance pre-check on a draft monthly fee statement for a synthetic merchant, before the statement is issued. The draft covers {{orders}} orders and {{lines}} fee lines. The codified fee caps in NYC §20-563.3 are the rulebook, so a line can be corrected while it is still a draft. The statement and the merchant are simulated, the law is real, and this is not legal advice.

## What the reviewer will see

- Verdict {{verdict}}: {{findings}} findings over {{lines}} fee lines on {{orders}} orders.
- {{violations}} violations, {{asserted}} asserted pass-through (unverified, not counted as a violation), {{conditional}} conditional, {{cured}} cured.
- Rules that fire: {{rules}}.
- {{provisional}} findings depend on the still-open purchase-price base (U1) and are marked provisional; none is stated as final.

## Which seats act

- Audit (deterministic) runs the fee audit on the draft statement.
- Evidence (deterministic) bundles the receipts behind each finding.
- Root-cause and Impact (new seats) and recorded Intake and Reviewer turns arrive in S2; none acts on this folder yet.

## What a human signs

A Compliance or Legal analyst would sign off on the corrected draft, or escalate it. The pre-check computes no penalties and files nothing; a signature is a ledger record, never an action on anyone's behalf.

## Not yet

${NOT_YET}
`,
};

const EXPECTED_NOTE = `# expected/

The engine report only (\`report.json\`), produced by the existing engine on \`inputs/\`.

Root-cause, impact, route and recorded turns arrive in S2. They are deliberately absent here — not empty, not stubbed.
`;

/** spec-valid-lie runs the truth leg on the UCP answer, so its note says which input. */
const EXPECTED_NOTE_SPEC_VALID_LIE = `# expected/

The engine report only (\`report.json\`): the existing engine's truth leg run on \`inputs/ucp-response.json\` against \`inputs/record.json\`. The same document's conformance verdict (it passes the pinned UCP schemas) is recorded in \`manifest.json\` figures, not as a second report.

Root-cause, impact, route and recorded turns arrive in S2. They are deliberately absent here — not empty, not stubbed.
`;

// ── assembly ─────────────────────────────────────────────────────────────────

const BUILDERS: Record<ScenarioId, () => Built> = {
  "agent-86": buildAgent86,
  "modifier-drift": buildModifierDrift,
  "sync-outage": buildSyncOutage,
  "platform-override": buildPlatformOverride,
  "partner-onboarding": buildPartnerOnboarding,
  "spec-valid-lie": buildSpecValidLie,
  "fee-precheck": buildFeePrecheck,
};

/** Fill {{placeholders}}; an unknown key is an error, never a silent blank. */
function render(template: string, figures: Figures): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    if (!(key in figures)) throw new Error(`placeholder {{${key}}} has no figure`);
    return String(figures[key]);
  });
}

/** Every file of the seven scenarios as repo-relative path → exact bytes. Pure. */
export function buildScenarioFiles(): Map<string, string> {
  const files = new Map<string, string>();
  for (const id of SCENARIO_IDS) {
    const b = BUILDERS[id]();
    const dir = `fixtures/scenarios/${id}`;
    for (const [name, bytes] of Object.entries(b.inputs)) files.set(`${dir}/inputs/${name}`, bytes);
    files.set(`${dir}/expected/report.json`, b.report);
    files.set(`${dir}/expected/README.md`, id === "spec-valid-lie" ? EXPECTED_NOTE_SPEC_VALID_LIE : EXPECTED_NOTE);
    files.set(`${dir}/brief.md`, render(BRIEF_TEMPLATES[id], b.figures));
    files.set(
      `${dir}/manifest.json`,
      asJson({
        id,
        number: NUMBER[id],
        simulated: true,
        shapedLike: null,
        seed: SEED[id],
        generator: `generate-scenarios.mts@${GENERATOR_VERSION}`,
        engine: b.engine,
        pack: b.pack,
        derivedFrom: {
          fixtures: ["fixtures/synthetic-restaurant/sor.catalog.json", "fixtures/synthetic-restaurant/acp-feed.faithful.json", "fixtures/synthetic-restaurant/fees/statement.faithful.json"].filter(
            (f) => (b.pack === "fees" ? f.includes("/fees/") : !f.includes("/fees/")),
          ),
          corpusSeed: CORPUS_SEED,
          corpusAsOf: CORPUS_AS_OF,
        },
        transform: b.transform,
        inputs: Object.keys(b.inputs).sort().map((n) => `inputs/${n}`),
        expected: ["expected/report.json", "expected/README.md"],
        absentUntilS2: ["root-cause", "impact", "route", "turns"],
        figures: b.figures,
      }),
    );
  }
  return new Map([...files.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

// Run as a script: write the files. Importing this module writes nothing.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [rel, bytes] of buildScenarioFiles()) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, bytes);
    process.stdout.write(`wrote ${rel}\n`);
  }
}
