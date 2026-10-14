import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LISTINGS_SPEC_VERSION,
  acpFeedToClaims,
  runListingsVerification,
  type AcpFeed,
  type SyntheticCatalog,
} from "@/lib/packs/listings";
import { FEES_SPEC_VERSION, auditStatement, parseStatement, serializeFeeReport } from "@/lib/packs/fees";
import { serializeReport } from "@/lib/verifier-core";

/**
 * SCENARIO LIBRARY, WAVE 1 / LANE 3 — five scenarios, no new detector.
 * (docs/plan-menu-integrity-crew-2026-10-09.md §9 + Appendix W1c; lane packet
 * "scenarios-w1", 2026-10-12; events.jsonl per docs/plan-wave2-gap-sheet-2026-10-12.md p.2.)
 *
 * fixtures/scenarios/<id>/ = brief.md · inputs/ · expected/ · manifest.json for
 *   agent-86 · sync-outage · platform-override · partner-onboarding · fee-precheck
 * generated from seed by ONE script (scripts-ts/generate-scenarios.mts) out of
 * fixtures/synthetic-restaurant (read-only). The other two ids of the plan's
 * eight that exist this wave are built by the S1 lane; this file owns only these five.
 *
 *  FREEZE    regenerate in memory and byte-compare every committed file; the
 *            committed file set IS the generated file set (nothing extra, nothing
 *            hand-added). One byte edited → red → `node scripts-ts/generate-scenarios.mts`
 *            → green.
 *  ENGINE    the EXISTING engine (listings pack for 1/3/4/5; the fee audit for 7)
 *            is run here, on the committed inputs, and (a) must reproduce
 *            expected/report.json byte for byte, (b) must reproduce every figure
 *            the manifest records — derived by code written in THIS file,
 *            independently of the generator's own derivation.
 *  BRIEF     every figure in a brief is a {{placeholder}} the script fills and
 *            this file re-derives. No digit is typed by hand (the only digits a
 *            brief may carry are the short allow-listed tokens below). Register:
 *            "synthetic"/"bundled", never "sample"/"demo"/"example". RULES §4:
 *            no platform/merchant/impact claim, no named real platform or agent
 *            product.
 *  EVENTS    inputs/events.jsonl exists, parses, is consistent with the run, and
 *            names neither the scenario nor a cause (evidence, not a label).
 *  ABSENT    root-cause · impact · route · turns are NOT in these folders — they
 *            arrive in S2, and the README says so.
 *
 * ── Proof record (2026-10-12; commands + outputs are in the return packet) ──
 *  RED 1  before any folder or script existed: the folder-contract, ABSENT, FREEZE,
 *         ENGINE, EVENTS and BRIEF tests fail (folders absent; script unresolved).
 *  RED 2  freeze tooth: one byte edited in fixtures/scenarios/agent-86/inputs/feed.json
 *         -> FREEZE red; restored by running the generator -> green.
 *         sha256 (first 16 hex) of agent-86/inputs/feed.json:
 *         regenerated = 9592000be84434ab · edited ("21.50" -> "21.51") = 8fdde9507e686946 ·
 *         after re-running the generator = 9592000be84434ab (restored byte-for-byte)
 *  RED 3  no-typed-digit tooth: one digit typed into agent-86/brief.md's story
 *         -> BRIEF red (brief != template filled with live figures; typed digit);
 *         restored by running the generator -> green.
 *         sha256 (first 16 hex) of agent-86/brief.md: regenerated = a74adc233f8e237a ·
 *         edited ("never hears about it" -> "never hears 7 about it") = 642509dbf0da50c5 ·
 *         after re-running the generator = a74adc233f8e237a
 */

const ROOT = process.cwd();
const SCEN = join(ROOT, "fixtures", "scenarios");
const read = (p: string): string => readFileSync(p, "utf8");

const IDS = ["agent-86", "sync-outage", "platform-override", "partner-onboarding", "fee-precheck"] as const;
type Id = (typeof IDS)[number];
const S1_IDS = ["modifier-drift", "spec-valid-lie"] as const;
const PLAN_EIGHT = [
  "agent-86",
  "modifier-drift",
  "sync-outage",
  "platform-override",
  "partner-onboarding",
  "spec-valid-lie",
  "fee-precheck",
  "injected-artifact",
] as const;
const isFees = (id: Id): boolean => id === "fee-precheck";

const gen = () => import("@/scripts-ts/generate-scenarios.mts");

const dirOf = (id: Id): string => join(SCEN, id);

/** Every file under a folder, as sorted posix paths relative to `base`. */
function listFiles(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(full, base));
    else out.push(relative(base, full).split("\\").join("/"));
  }
  return out.sort();
}

// ---------------------------------------------------------------------------
// §4 / register probes
// ---------------------------------------------------------------------------

/**
 * Copied from evals/packs/honesty-c10.test.ts (`BANNED_CLAIMS`, @ fac8204). That
 * constant is module-private to a test file whose import would re-run its whole
 * suite, so it is not importable; the eight patterns are kept verbatim and the
 * lockstep probe below fails if this copy ever stops biting.
 */
const BANNED_CLAIMS: readonly RegExp[] = [
  /\bno AI was used\b/i,
  /\bAI built this\b/i,
  /\bbuilt (?:entirely )?by AI\b/i,
  /\breal[- ](?:time )?(?:DoorDash|Square|Uber\s?Eats|Grubhub)\s+(?:data|access|feed|account|integration|API)/i,
  /\b(?:connected|integrated) to (?:DoorDash|Square|Uber|Grubhub|the (?:live )?marketplace)\b/i,
  /\bactual (?:DoorDash|Square|marketplace|merchant) (?:data|account|orders?)\b/i,
  /\bproduction (?:merchant|platform|marketplace) data\b/i,
  /\bwe have (?:real |live )?(?:platform |marketplace )?access\b/i,
];

const BANNED_PROBES: ReadonlyArray<readonly [RegExp, string]> = [
  [BANNED_CLAIMS[0], "no AI was used to build this"],
  [BANNED_CLAIMS[1], "AI built this dashboard"],
  [BANNED_CLAIMS[2], "this was built entirely by AI"],
  [BANNED_CLAIMS[3], "the page shows real-time DoorDash data"],
  [BANNED_CLAIMS[4], "the app is connected to DoorDash"],
  [BANNED_CLAIMS[5], "displays actual DoorDash orders"],
  [BANNED_CLAIMS[6], "renders production platform data"],
  [BANNED_CLAIMS[7], "we have live platform access"],
];

/**
 * This lane's own §4 probe, beyond the copied set: a scenario brief names no real
 * platform, no real agent product and no real model vendor at all (plan §2: "an
 * agent order, never a named real agent product"; RULES §4: no affiliation).
 */
const NAMED_REAL_PARTIES =
  /\b(DoorDash|Uber\s?Eats|Uber|Grubhub|Instacart|Square|Toast|Deliverect|Gemini|ChatGPT|OpenAI|Anthropic|Claude|Google|Postmates)\b/i;

/** Register (owner 2026-07-31): production words only. */
const BANNED_REGISTER = /\b(sample|demo|example)s?\b/i;

/** The only digit-bearing tokens a brief may type: ids, the kitchen word "86'd", slice names, the statute, the open base. */
const ALLOWED_TYPED_TOKENS = /agent-86|\b86'd\b|S1\/S2|\bS1\b|\bS2\b|\bS3\b|§\s?20-563\.3|\bU1\b/g;

/** Digits left in text once the allow-listed tokens are removed. */
function typedDigits(text: string): string[] {
  return text.replace(ALLOWED_TYPED_TOKENS, " ").match(/\d/g) ?? [];
}

const wordCount = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

describe("probes bite in isolation (so a green scan means something)", () => {
  it("every copied banned pattern has one probe, in lockstep", () => {
    expect(BANNED_PROBES.length).toBe(BANNED_CLAIMS.length);
    BANNED_PROBES.forEach(([p], i) => expect(p).toBe(BANNED_CLAIMS[i]));
  });
  it.each(BANNED_PROBES)("%s matches its own planted claim", (pattern, planted) => {
    expect(pattern.test(planted)).toBe(true);
  });
  it("the named-party, register, typed-digit and cause-word probes each catch a planted violation", () => {
    expect(NAMED_REAL_PARTIES.test("an order placed through ChatGPT")).toBe(true);
    expect(NAMED_REAL_PARTIES.test("a menu on DoorDash")).toBe(true);
    expect(BANNED_REGISTER.test("a bundled sample menu")).toBe(true);
    expect(BANNED_REGISTER.test("the demo run")).toBe(true);
    expect(typedDigits("the copy shows 3 items")).toEqual(["3"]);
    expect(typedDigits("agent-86 reads §20-563.3 and S2 and U1 on an 86'd item")).toEqual([]);
    expect(CAUSE_WORDS.test("root_cause")).toBe(true);
    expect(CAUSE_WORDS.test("the cause")).toBe(true);
    expect(CAUSE_WORDS.test("price_edit")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// THE FIVE FOLDERS
// ---------------------------------------------------------------------------

describe("the five scenario folders exist with the folder contract", () => {
  it.each(IDS)("%s has brief.md · manifest.json · inputs/ (with events.jsonl) · expected/", (id) => {
    const files = listFiles(dirOf(id));
    expect(files, `fixtures/scenarios/${id} is missing`).not.toHaveLength(0);
    for (const f of ["brief.md", "manifest.json", "expected/report.json", "expected/README.md"]) {
      expect(files, `${id}: ${f}`).toContain(f);
    }
    const inputs = files.filter((f) => f.startsWith("inputs/"));
    expect(inputs).toEqual(
      isFees(id)
        ? ["inputs/events.jsonl", "inputs/statement.json"]
        : ["inputs/events.jsonl", "inputs/feed.json", "inputs/record.json"],
    );
  });

  it("the folder README names all eight plan ids exactly as spelled; the two S1 ids are 'built by the S1 lane'", () => {
    const readme = read(join(SCEN, "README.md"));
    for (const id of PLAN_EIGHT) expect(readme, `README lacks id ${id}`).toContain(`\`${id}\``);
    for (const id of S1_IDS) {
      const line = readme.split("\n").find((l) => l.includes(`\`${id}\``)) ?? "";
      expect(line, `README row for ${id}`).toMatch(/built by the S1 lane/);
    }
  });
});

describe("ABSENT — root-cause · impact · route · turns arrive in S2 and are not faked here", () => {
  it.each(IDS)("%s carries none of them, and says why", (id) => {
    const files = listFiles(dirOf(id));
    expect(files, `fixtures/scenarios/${id} is missing`).not.toHaveLength(0);
    for (const f of files) {
      expect(f, `${id}/${f}`).not.toMatch(/root-cause|rootcause|impact|route|turns/i);
    }
    expect(read(join(dirOf(id), "expected", "README.md"))).toMatch(/arrive in S2/);
    expect(read(join(SCEN, "README.md"))).toMatch(/arrive in S2/);
  });
});

// ---------------------------------------------------------------------------
// FREEZE — regenerate and byte-compare
// ---------------------------------------------------------------------------

describe("FREEZE — the committed folders are exactly the generator's output at the pinned seeds", () => {
  it("regeneration is deterministic (twice → identical bytes)", async () => {
    const g = await gen();
    expect([...g.buildScenarioFiles()]).toEqual([...g.buildScenarioFiles()]);
  });

  it("every generated file is committed, byte-identical; no other file exists in the five folders", async () => {
    const g = await gen();
    const generated = g.buildScenarioFiles();
    for (const [rel, bytes] of generated) {
      const abs = join(ROOT, rel);
      expect(existsSync(abs), `${rel} is not committed`).toBe(true);
      expect(read(abs), `${rel} differs from the generator's bytes`).toBe(bytes);
    }
    const committed = IDS.flatMap((id) => listFiles(dirOf(id), SCEN).map((f) => `fixtures/scenarios/${f}`)).sort();
    expect(committed).toEqual([...generated.keys()].sort());
  });
});

// ---------------------------------------------------------------------------
// ENGINE — the existing engine, run here, on the committed inputs
// ---------------------------------------------------------------------------

type Figures = Record<string, string | number>;
type Manifest = {
  id: string;
  number: number;
  simulated: boolean;
  shapedLike: null;
  seed: number;
  generator: string;
  engine: string;
  pack: "listings" | "fees";
  figures: Figures;
};

const manifestOf = (id: Id): Manifest => JSON.parse(read(join(dirOf(id), "manifest.json"))) as Manifest;

type ListingsRun = {
  feed: AcpFeed;
  record: SyntheticCatalog;
  report: ReturnType<typeof runListingsVerification>;
};
function runListings(id: Id): ListingsRun {
  const feed = JSON.parse(read(join(dirOf(id), "inputs", "feed.json"))) as AcpFeed;
  const record = JSON.parse(read(join(dirOf(id), "inputs", "record.json"))) as SyntheticCatalog;
  return { feed, record, report: runListingsVerification(acpFeedToClaims(feed), record) };
}

/** Rule tally "RULE ×n, RULE ×m" sorted by rule id — written here, not imported from the generator. */
function tallyOf(ruleIds: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const r of ruleIds) counts.set(r, (counts.get(r) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([r, n]) => `${r} ×${n}`)
    .join(", ");
}

const rowOf = (claimId: string): string => claimId.split("#")[0];
const hoursBetween = (laterIso: string, earlierIso: string): number =>
  (Date.parse(laterIso) - Date.parse(earlierIso)) / 3_600_000;

/** Figures common to the four listings scenarios. */
function listingsCommon({ feed, report }: ListingsRun): Figures {
  return {
    verdict: report.ok ? "PASS" : "FAIL",
    findings: report.findings.length,
    errors: report.findings.filter((f) => f.severity === "error").length,
    warnings: report.findings.filter((f) => f.severity === "warn").length,
    rows_read: feed.items.length,
    rules: tallyOf(report.findings.map((f) => f.ruleId)),
  };
}

const itemOfRow = (record: SyntheticCatalog, rowId: string) => {
  const it = record.items.find((i) => i.variations.some((v) => v.id === rowId));
  if (!it) throw new Error(`row ${rowId} is not in the record`);
  return it;
};

/** Live figures per scenario — derived from the engine's own output + the inputs, in this file. */
function liveFigures(id: Id): Figures {
  if (id === "fee-precheck") {
    const statement = parseStatement(read(join(dirOf(id), "inputs", "statement.json")));
    const report = auditStatement(statement);
    return {
      verdict: report.ok ? "PASS" : "FAIL",
      orders: new Set(statement.lines.map((l) => l.orderId)).size,
      lines: statement.lines.length,
      findings: report.findings.length,
      violations: report.findings.filter((f) => f.verdict === "violation").length,
      asserted: report.findings.filter((f) => f.verdict === "asserted-passthrough-unverified").length,
      conditional: report.findings.filter((f) => f.verdict === "conditional-pending-refund-window").length,
      cured: report.findings.filter((f) => f.verdict === "cured-by-refund").length,
      provisional: report.findings.filter((f) => f.provisional.length > 0).length,
      rules: tallyOf(report.findings.map((f) => f.ruleId)),
    };
  }

  const run = runListings(id);
  const { feed, record, report } = run;
  const common = listingsCommon(run);
  const byRule = (rule: string) => report.findings.filter((f) => f.ruleId === rule);

  if (id === "agent-86") {
    const first = rowOf(report.findings[0].claim.id);
    const row = feed.items.find((r) => r.item_id === first)!;
    return {
      ...common,
      items86: new Set(report.findings.map((f) => itemOfRow(record, rowOf(f.claim.id)).id)).size,
      order_row: first,
      order_title: row.title,
      order_price: `$${row.price}`,
    };
  }

  if (id === "sync-outage") {
    const stale = byRule("LST-STALE-EXPIRED");
    const staleRows = stale.map((f) => rowOf(f.claim.id));
    const cats = new Set(staleRows.map((r) => itemOfRow(record, r).category));
    expect(cats.size, "the stale rows must be one whole category").toBe(1);
    const lastSync = staleRows.map((r) => feed.items.find((x) => x.item_id === r)!.updated_at!).sort()[0];
    return {
      ...common,
      category: [...cats][0],
      rows_stale: stale.length,
      price_drifts: byRule("LST-PRICE-VALUE").length,
      newly_86: byRule("LST-AVAIL-STATE").length,
      outage_hours: hoursBetween(record.asOf, lastSync),
    };
  }

  if (id === "platform-override") {
    const descRows = feed.items.filter((r) => r.description !== itemOfRow(record, r.item_id).description);
    const editedItems = new Set([
      ...report.findings.map((f) => itemOfRow(record, rowOf(f.claim.id)).id),
      ...descRows.map((r) => itemOfRow(record, r.item_id).id),
    ]);
    const portalStamps = [
      ...new Set(feed.items.filter((r) => editedItems.has(itemOfRow(record, r.item_id).id)).map((r) => r.updated_at!)),
    ];
    expect(portalStamps.length, "all portal-edited rows carry one edit time").toBe(1);
    return {
      ...common,
      items_edited: editedItems.size,
      name_rows: byRule("LST-IDENT-NAME").length,
      active_rows: byRule("LST-AVAIL-STATE").length,
      description_rows: descRows.length,
      override_hours: hoursBetween(record.asOf, portalStamps[0]),
    };
  }

  // partner-onboarding
  const drifted = new Set(report.findings.map((f) => rowOf(f.claim.id))).size;
  const clean = feed.items.length - drifted;
  return {
    ...common,
    clean_rows: clean,
    drifted_rows: drifted,
    clean_pct: `${((clean * 100) / feed.items.length).toFixed(1)}%`,
  };
}

describe("ENGINE — the existing engine, run on the committed inputs, reproduces expected/ and every figure", () => {
  it.each(IDS)("%s: expected/report.json is the engine's report byte for byte", (id) => {
    const expected = read(join(dirOf(id), "expected", "report.json"));
    if (isFees(id)) {
      const report = auditStatement(parseStatement(read(join(dirOf(id), "inputs", "statement.json"))));
      expect(serializeFeeReport(report)).toBe(expected);
    } else {
      expect(serializeReport(runListings(id).report)).toBe(expected);
    }
  });

  it.each(IDS)("%s: manifest contract (simulated · shapedLike null · seed · generator · engine from code)", (id) => {
    const m = manifestOf(id);
    expect(m.id).toBe(id);
    expect(m.simulated).toBe(true);
    expect(m.shapedLike).toBeNull();
    expect(Number.isInteger(m.seed)).toBe(true);
    expect(m.generator).toMatch(/^generate-scenarios\.mts@\d+\.\d+\.\d+$/);
    expect(m.engine).toBe(isFees(id) ? FEES_SPEC_VERSION : LISTINGS_SPEC_VERSION);
    expect(m.pack).toBe(isFees(id) ? "fees" : "listings");
    expect(m.number).toBe(PLAN_EIGHT.indexOf(id) + 1);
  });

  it.each(IDS)("%s: manifest figures equal a live engine run", (id) => {
    expect(manifestOf(id).figures).toEqual(liveFigures(id));
  });

  it.each(IDS)("%s: the run is non-degenerate (a FAIL with something to look at)", (id) => {
    const f = liveFigures(id);
    expect(f.verdict).toBe("FAIL");
    expect(Number(f.findings)).toBeGreaterThan(1);
  });

  // The existing rules that must fire — and nothing else — per scenario. These
  // are the claims each brief makes about WHICH rules; held here against a run.
  it("agent-86: only LST-AVAIL-STATE fires, on rows the record 86'd and the copy still lists", () => {
    const { feed, record, report } = runListings("agent-86");
    expect(new Set(report.findings.map((f) => f.ruleId))).toEqual(new Set(["LST-AVAIL-STATE"]));
    for (const f of report.findings) {
      const row = rowOf(f.claim.id);
      const stock = record.items.flatMap((i) => i.variations).find((v) => v.id === row)!.stock;
      expect(stock).toBe("soldout_86");
      expect(feed.items.find((r) => r.item_id === row)!.availability).toBe("in_stock");
    }
  });

  it("sync-outage: stale rows are a WHOLE category; only the three named rules fire; every finding sits in that category", () => {
    const { feed, record, report } = runListings("sync-outage");
    const rules = new Set(report.findings.map((f) => f.ruleId));
    expect(rules.has("LST-STALE-EXPIRED")).toBe(true);
    for (const r of rules) expect(["LST-STALE-EXPIRED", "LST-PRICE-VALUE", "LST-AVAIL-STATE"]).toContain(r);
    const f = liveFigures("sync-outage");
    const catRows = feed.items.filter((r) => itemOfRow(record, r.item_id).category === f.category);
    expect(catRows.length).toBe(f.rows_stale);
    for (const fd of report.findings) {
      expect(catRows.some((r) => r.item_id === rowOf(fd.claim.id))).toBe(true);
    }
    expect(Number(f.price_drifts)).toBeGreaterThan(0);
    expect(Number(f.newly_86)).toBeGreaterThan(0);
  });

  it("platform-override: IDENT-NAME + AVAIL-STATE fire; descriptions differ but no current rule reads them", () => {
    const { report } = runListings("platform-override");
    expect(new Set(report.findings.map((f) => f.ruleId))).toEqual(new Set(["LST-IDENT-NAME", "LST-AVAIL-STATE"]));
    const f = liveFigures("platform-override");
    expect(Number(f.description_rows)).toBeGreaterThan(0);
    expect(report.findings.some((fd) => /description/i.test(fd.claim.field))).toBe(false);
    expect(Number(f.override_hours)).toBeGreaterThan(0);
  });

  it("partner-onboarding: one finding per drifted row; the mix is neither all-clean nor all-drifted", () => {
    const { report, feed } = runListings("partner-onboarding");
    const rows = report.findings.map((f) => rowOf(f.claim.id));
    expect(new Set(rows).size).toBe(rows.length);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(feed.items.length);
    for (const r of new Set(report.findings.map((f) => f.ruleId))) {
      expect(["LST-PRICE-VALUE", "LST-AVAIL-STATE", "LST-IDENT-NAME"]).toContain(r);
    }
  });

  it("fee-precheck: the existing fee audit runs offline from a test; the three expected rules fire; base-derived findings are provisional", () => {
    const report = auditStatement(parseStatement(read(join(dirOf("fee-precheck"), "inputs", "statement.json"))));
    expect(new Set(report.findings.map((f) => f.ruleId))).toEqual(
      new Set(["NYC-563.3-c-1", "NYC-563.3-c-2", "NYC-563.3-d-1"]),
    );
    expect(report.simulated).toBe(true);
    for (const f of report.findings.filter((x) => x.ruleId !== "NYC-563.3-d-1")) {
      expect(f.provisional.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// EVENTS — evidence for a later explanation seat, never a label
// ---------------------------------------------------------------------------

type Ev = { at: string; actor: string; action: string; target: string };
const ACTORS = ["merchant", "integrator", "platform", "unknown"];
const ACTIONS = ["price_edit", "86", "un86", "sync", "override"];
/** The class is the hidden label: no event may name a cause, root or the scenario. */
const CAUSE_WORDS = /cause|root/i;

function eventsOf(id: Id): Ev[] {
  const text = read(join(dirOf(id), "inputs", "events.jsonl"));
  expect(text.endsWith("\n"), `${id}: events.jsonl ends with a newline`).toBe(true);
  return text
    .trimEnd()
    .split("\n")
    .map((l) => JSON.parse(l) as Ev);
}

describe("EVENTS — inputs/events.jsonl is evidence: it parses, fits the run, and names no cause", () => {
  it.each(IDS)("%s: exists, parses, shape {at, actor, action, target}, sorted by time", (id) => {
    const evs = eventsOf(id);
    expect(evs.length).toBeGreaterThan(0);
    for (const e of evs) {
      expect(Object.keys(e).sort()).toEqual(["action", "actor", "at", "target"]);
      expect(ACTORS).toContain(e.actor);
      expect(ACTIONS).toContain(e.action);
      expect(e.at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(typeof e.target).toBe("string");
      expect(e.target.length).toBeGreaterThan(0);
    }
    const ats = evs.map((e) => e.at);
    expect(ats).toEqual([...ats].sort());
  });

  it.each(IDS)("%s: no key or value equals the scenario id or contains 'cause'/'root' (the class stays hidden)", (id) => {
    const text = read(join(dirOf(id), "inputs", "events.jsonl"));
    for (const e of eventsOf(id)) {
      for (const [k, v] of Object.entries(e)) {
        expect(k, `${id}: key ${k}`).not.toBe(id);
        expect(v, `${id}: value ${v}`).not.toBe(id);
        expect(CAUSE_WORDS.test(k) || CAUSE_WORDS.test(String(v)), `${id}: ${k}=${v}`).toBe(false);
      }
    }
    // and the class appears nowhere in ANY input file of the folder
    for (const f of listFiles(join(dirOf(id), "inputs"))) {
      const body = read(join(dirOf(id), "inputs", f));
      expect(CAUSE_WORDS.test(body), `${id}/inputs/${f} contains cause/root`).toBe(false);
    }
    expect(text).not.toContain(id);
  });

  it("agent-86: one 86 event per finding row, by the merchant, before the record's as-of time", () => {
    const { record, report } = runListings("agent-86");
    const evs = eventsOf("agent-86").filter((e) => e.action === "86");
    expect(evs.map((e) => e.target).sort()).toEqual(report.findings.map((f) => rowOf(f.claim.id)).sort());
    for (const e of evs) {
      expect(e.actor).toBe("merchant");
      expect(Date.parse(e.at)).toBeLessThan(Date.parse(record.asOf));
    }
  });

  it("sync-outage: price_edit/86 events match the findings; the last sync is the outage start", () => {
    const { report, record, feed } = runListings("sync-outage");
    const evs = eventsOf("sync-outage");
    const targets = (a: string) => evs.filter((e) => e.action === a && e.actor === "merchant").map((e) => e.target).sort();
    const rowsOf = (rule: string) => report.findings.filter((f) => f.ruleId === rule).map((f) => rowOf(f.claim.id)).sort();
    expect(targets("price_edit")).toEqual(rowsOf("LST-PRICE-VALUE"));
    expect(targets("86")).toEqual(rowsOf("LST-AVAIL-STATE"));
    const syncs = evs.filter((e) => e.action === "sync").map((e) => e.at);
    const lastSync = syncs[syncs.length - 1];
    const stamps = feed.items.map((r) => r.updated_at!).sort();
    expect(lastSync).toBe(stamps[0]);
    expect(Date.parse(record.asOf) - Date.parse(lastSync)).toBeGreaterThan(0);
    for (const e of evs.filter((x) => x.actor === "merchant")) expect(Date.parse(e.at)).toBeGreaterThan(Date.parse(lastSync));
  });

  it("platform-override: a platform override event per edited item, earlier than the record's as-of time", () => {
    const { record, feed } = runListings("platform-override");
    const evs = eventsOf("platform-override").filter((e) => e.action === "override");
    const editedItems = [
      ...new Set(
        feed.items
          .filter((r) => r.updated_at !== record.asOf)
          .map((r) => itemOfRow(record, r.item_id).id),
      ),
    ].sort();
    expect(evs.map((e) => e.target).sort()).toEqual(editedItems);
    for (const e of evs) {
      expect(e.actor).toBe("platform");
      expect(Date.parse(e.at)).toBeLessThan(Date.parse(record.asOf));
    }
  });

  it("partner-onboarding: an integrator event per drifted row (price_edit / 86 / un86 as the row's drift)", () => {
    const { report } = runListings("partner-onboarding");
    const evs = eventsOf("partner-onboarding").filter((e) => e.action !== "sync");
    expect(evs.map((e) => e.target).sort()).toEqual(report.findings.map((f) => rowOf(f.claim.id)).sort());
    const priceRows = report.findings.filter((f) => f.ruleId === "LST-PRICE-VALUE").map((f) => rowOf(f.claim.id)).sort();
    expect(evs.filter((e) => e.action === "price_edit").map((e) => e.target).sort()).toEqual(priceRows);
  });

  it("fee-precheck: every event targets a real statement line (order#category)", () => {
    const statement = parseStatement(read(join(dirOf("fee-precheck"), "inputs", "statement.json")));
    const keys = new Set(statement.lines.map((l) => `${l.orderId}#${l.declaredCategory}`));
    const evs = eventsOf("fee-precheck");
    expect(evs.some((e) => e.action !== "sync")).toBe(true);
    for (const e of evs.filter((x) => x.action !== "sync")) expect(keys.has(e.target), e.target).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BRIEFS
// ---------------------------------------------------------------------------

const HEADINGS = [
  "## The story",
  "## What the reviewer will see",
  "## Which seats act",
  "## What a human signs",
  "## Not yet",
] as const;

/** Body of a `## heading` section (up to the next `## `). */
function section(brief: string, heading: string): string {
  const start = brief.indexOf(`${heading}\n`);
  expect(start, `brief lacks "${heading}"`).toBeGreaterThan(-1);
  const bodyStart = start + heading.length + 1;
  const next = brief.indexOf("\n## ", bodyStart);
  return brief.slice(bodyStart, next === -1 ? undefined : next).trim();
}

/** Fill a template with figures — a deliberately separate, tiny implementation. */
function fill(template: string, figures: Figures): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    if (!(key in figures)) throw new Error(`placeholder {{${key}}} has no figure`);
    return String(figures[key]);
  });
}

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Pull the placeholder values out of a committed brief by matching it against the template. */
function capture(template: string, brief: string): { keys: string[]; values: string[] } | null {
  const parts = template.split(/\{\{(\w+)\}\}/); // lit, key, lit, key, …, lit
  const keys: string[] = [];
  let re = "^";
  parts.forEach((p, i) => {
    if (i % 2 === 0) re += escapeRe(p);
    else {
      keys.push(p);
      re += "([^\\n]+?)";
    }
  });
  re += "$";
  const m = new RegExp(re).exec(brief);
  return m ? { keys, values: m.slice(1) } : null;
}

describe("BRIEF — structure, derived figures, register, §4", () => {
  it.each(IDS)("%s: the order is Title · story · what the reviewer will see · seats · what a human signs · Not yet", (id) => {
    const brief = read(join(dirOf(id), "brief.md"));
    expect(brief.split("\n")[0]).toMatch(/^# /);
    expect(brief.split("\n")[0], "the title line carries the id exactly as spelled").toContain(id);
    const at = HEADINGS.map((h) => brief.indexOf(`\n${h}\n`));
    for (const a of at) expect(a).toBeGreaterThan(-1);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(brief.match(/^## /gm)?.length).toBe(HEADINGS.length);
  });

  it.each(IDS)("%s: the story is at most 120 words; 'Not yet' is one line naming S2", (id) => {
    const brief = read(join(dirOf(id), "brief.md"));
    expect(wordCount(section(brief, "## The story"))).toBeLessThanOrEqual(120);
    const notYet = section(brief, "## Not yet");
    expect(notYet.split("\n").filter((l) => l.trim() !== "")).toHaveLength(1);
    expect(notYet).toMatch(/S2/);
  });

  it.each(IDS)("%s: every figure is a placeholder the script fills — the brief equals the template filled with LIVE figures", async (id) => {
    const g = await gen();
    const brief = read(join(dirOf(id), "brief.md"));
    const template = g.BRIEF_TEMPLATES[id];
    expect(brief).not.toContain("{{");
    const live = liveFigures(id);
    // 1) the template filled with figures THIS file derived is the committed brief
    expect(brief).toBe(fill(template, live));
    // 2) each captured value equals the live figure it stands for (names the culprit on a red)
    const cap = capture(template, brief);
    expect(cap, "the committed brief no longer matches its template (typed edit?)").not.toBeNull();
    cap!.keys.forEach((k, i) => expect(cap!.values[i], `{{${k}}}`).toBe(String(live[k])));
  });

  it.each(IDS)("%s: no digit is typed by hand — only the allow-listed tokens appear outside placeholders", async (id) => {
    const g = await gen();
    const template = g.BRIEF_TEMPLATES[id];
    // the literal text of the template (placeholders removed) carries no digit…
    expect(typedDigits(template.replace(/\{\{\w+\}\}/g, " ")), `template ${id} types digits`).toEqual([]);
    // …and neither does the committed brief once every live figure is masked out.
    // (allow-listed tokens come out FIRST, so masking a short figure cannot split one)
    let masked = read(join(dirOf(id), "brief.md")).replace(ALLOWED_TYPED_TOKENS, " ");
    for (const v of Object.values(liveFigures(id)).map(String).sort((a, b) => b.length - a.length)) {
      masked = masked.split(v).join(" ");
    }
    expect(typedDigits(masked), `${id}/brief.md has a typed digit`).toEqual([]);
  });

  it.each(IDS)("%s: production register and RULES §4 hold on the brief and the expected/ note", (id) => {
    for (const rel of ["brief.md", "expected/README.md"]) {
      const text = read(join(dirOf(id), rel));
      expect(text, `${id}/${rel}: register`).not.toMatch(BANNED_REGISTER);
      for (const p of BANNED_CLAIMS) expect(p.test(text), `${id}/${rel}: ${p}`).toBe(false);
      expect(text, `${id}/${rel}: names a real party`).not.toMatch(NAMED_REAL_PARTIES);
    }
    expect(read(join(dirOf(id), "brief.md")), `${id}: carries the synthetic label`).toMatch(/\bsynthetic\b/i);
  });

  it("the folder README holds the same register and §4 lines", () => {
    const text = read(join(SCEN, "README.md"));
    expect(text).not.toMatch(BANNED_REGISTER);
    for (const p of BANNED_CLAIMS) expect(p.test(text), `${p}`).toBe(false);
    expect(text).not.toMatch(NAMED_REAL_PARTIES);
  });

  it("scenario 7 is framed as a compliance pre-check for a legal team, never adversarially", () => {
    const brief = read(join(dirOf("fee-precheck"), "brief.md"));
    expect(brief).toMatch(/compliance pre-check/i);
    expect(brief).toMatch(/legal team/i);
    expect(brief).toMatch(/not legal advice/i);
    expect(brief).not.toMatch(/\b(overcharg|rip-?off|gouging|exploit|sue|lawsuit)/i);
  });

  it("every directory under fixtures/scenarios is a plan id (no stray folder)", () => {
    const dirs = readdirSync(SCEN).filter((e) => statSync(join(SCEN, e)).isDirectory());
    for (const d of dirs) expect(PLAN_EIGHT as readonly string[]).toContain(d);
  });
});
