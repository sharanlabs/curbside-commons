import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  LISTINGS_DRIFT_CLASSES,
  MENU_MODEL_DRIFT_CLASSES,
  MENU_MODEL_RULES,
  applyCorpusDrift,
  applyMenuModelDrift,
  buildFaithfulFeed,
  buildFaithfulMenuFeed,
  buildUcpResponse,
  generateCatalog,
  generateMenuModelCatalog,
  acpFeedToClaims,
  ucpResponseToClaims,
  runListingsVerification,
  type AcpFeedItem,
} from "@/lib/packs/listings";
import { parseInstant } from "@/lib/packs/listings/instants";

/**
 * C6 — taxonomy coverage is MEASURED, never asserted rhetorically: the eval
 * computes (a) % of enumerated §7 classes with ≥1 corpus fixture injection and
 * (b) % actually caught by the comparator, asserts the achieved floor, and
 * prints the numbers into the test names. A guardrail scan bans "all edge
 * cases"-style overclaims from the corpus and pack sources (C6/C10).
 *
 * MENU MODEL (S1-engine, 2026-10-12): three finer classes — modifier-price ·
 * modifier-missing · hours-window — injected by `applyMenuModelDrift` into the
 * menu-model copy of the same seeded restaurant and measured BY RULE ID (their
 * report category stays inside the eight). Headline: 11 classes.
 *
 * RED FIRST (recorded 2026-10-12): with the data model, projection and injector
 * in place but no detector, this file ran 3 failed / 7 passed — "all-class
 * coverage" (11/11 injected, 8/11 caught), "menu-model per-ENTRY" (menu-001 not
 * caught) and "exactly one finding per planted entry" (got []).
 * MUTATION PROOF, one detector at a time (each turned this file 3 failed /
 * 7 passed at 10/11 caught, then was reverted):
 *   LST-MOD-PRICE-VALUE — comparison dropped (`if (true || actual === expected)
 *     return []`): menu-001 not caught.
 *   LST-MOD-MISSING — `return []` after the field guard: menu-002 not caught.
 *   LST-HOURS-WINDOW — window comparison dropped (`if (false && !inSync)`):
 *     menu-003 not caught.
 * RE-APPLY WITH RESTORE SHA (S1.5, 2026-10-31 01:39; Wave 1 acceptance review
 * item (c)): `if (true || actual === expected) return [];` applied to the
 * LST-MOD-PRICE-VALUE detector ONLY (detectors.ts sha256/16 aaf19a2a925d5f09 →
 * 9624c040e7aac195) → this file 3 failed / 19 passed (all-class 10/11 caught ·
 * per-ENTRY menu-001 · one-finding-per-entry), listings-differential-c3 and
 * scenarios green (no c3 or scenario input carries a modifier). Restored from
 * the saved copy → aaf19a2a925d5f09 byte-exact, 22/22 green. The acceptance
 * review's wider red (c3 + scenarios) is not reproduced by the single-detector
 * mutation: the line `if (actual === expected) return [];` occurs five times in
 * detectors.ts, and replacing all five turns c6 6 · c3 7 · scenarios 28 red —
 * a multi-site replacement is the likely cause (inference, not re-measured on
 * the reviewer's tree).
 */

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const { feed: drifted, manifest } = applyCorpusDrift(faithful, sor);

// P3-1 (W1 gate advisory): the spec-version-skew class is injected at UCP fixture
// build (not by applyCorpusDrift), so DERIVE it from the committed manifest's
// ucpVersionSkew block rather than hand-adding the literal — the corpus stays the
// single source of truth for what was injected.
const driftManifestFile = JSON.parse(
  readFileSync(join(process.cwd(), "fixtures", "synthetic-restaurant", "drift-manifest.json"), "utf8"),
) as { ucpVersionSkew: { class: string } };
const injectedClasses = new Set<string>(manifest.map((e) => e.class));
injectedClasses.add(driftManifestFile.ucpVersionSkew.class);

const acpReport = runListingsVerification(acpFeedToClaims(drifted), sor);
const ucpReport = runListingsVerification(
  ucpResponseToClaims(
    buildUcpResponse(drifted, {
      supportedVersions: ["2026-03-01-draft"],
      sessionId: "sess-sim-drifted-001",
    }),
  ),
  sor,
);
const caughtClasses = new Set<string>(
  [...acpReport.findings, ...ucpReport.findings].map((f) => f.category ?? ""),
);

describe("C6 measured taxonomy coverage", () => {
  const total = LISTINGS_DRIFT_CLASSES.length;
  const injected = LISTINGS_DRIFT_CLASSES.filter((c) => injectedClasses.has(c)).length;
  const caught = LISTINGS_DRIFT_CLASSES.filter((c) => caughtClasses.has(c)).length;

  it(`fixture coverage: ${injected}/${total} enumerated classes have ≥1 injection`, () => {
    // The measured floor of THIS corpus (v1): every enumerated class is injected.
    // This is a statement about the 8 enumerated classes, not about "all edge cases".
    expect(injected).toBe(total);
  });

  it(`detection coverage: ${caught}/${total} injected classes are caught`, () => {
    expect(caught).toBe(total);
  });

  it("per-class: every enumerated class with a fixture is caught somewhere", () => {
    for (const c of LISTINGS_DRIFT_CLASSES) {
      if (!injectedClasses.has(c)) continue;
      expect(caughtClasses.has(c), `class "${c}" injected but never caught`).toBe(true);
    }
  });

  // PER-ENTRY teeth under the class summary (M1 Codex P2 reconciliation,
  // 2026-07-03): "8/8 classes caught" could in principle be satisfied by a
  // false positive in the same class while a planted row goes missed. So the
  // measured claim is grounded entry-by-entry: EVERY manifest entry must be
  // caught as (its class, anchored to ITS row) on at least one of its labeled
  // surfaces — the class tally above is the compressed summary of this.
  it("per-ENTRY: every planted manifest entry is caught by class AND row on a labeled surface", () => {
    for (const e of manifest) {
      const reports =
        e.surfaces === "both"
          ? [acpReport, ucpReport]
          : e.surfaces === "acp-only"
            ? [acpReport]
            : [ucpReport];
      const caught = reports.some((rep) =>
        rep.findings.some(
          (f) =>
            f.category === e.class &&
            (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||
              f.referenceRowId === e.targetFeedItemId),
        ),
      );
      expect(caught, `${e.id} (${e.class} @ ${e.targetFeedItemId}) not caught on its surface(s)`).toBe(true);
    }
  });
});

const menuSor = generateMenuModelCatalog(CORPUS_SEED, CORPUS_AS_OF);
const menuFaithful = buildFaithfulMenuFeed(menuSor);
const { feed: menuDrifted, manifest: menuManifest } = applyMenuModelDrift(menuFaithful);
const menuReport = runListingsVerification(acpFeedToClaims(menuDrifted), menuSor);
const menuInjected = new Set<string>(menuManifest.map((e) => e.menuClass ?? ""));
const menuCaught = new Set<string>(
  MENU_MODEL_DRIFT_CLASSES.filter((c) => menuReport.findings.some((f) => f.ruleId === MENU_MODEL_RULES[c].ruleId)),
);

describe("C6 measured coverage — menu model (modifier price · modifier existence · hours)", () => {
  const total = LISTINGS_DRIFT_CLASSES.length + MENU_MODEL_DRIFT_CLASSES.length;
  const injected =
    LISTINGS_DRIFT_CLASSES.filter((c) => injectedClasses.has(c)).length +
    MENU_MODEL_DRIFT_CLASSES.filter((c) => menuInjected.has(c)).length;
  const caught =
    LISTINGS_DRIFT_CLASSES.filter((c) => caughtClasses.has(c)).length +
    MENU_MODEL_DRIFT_CLASSES.filter((c) => menuCaught.has(c)).length;

  it(`all-class coverage: ${injected}/${total} injected and ${caught}/${total} caught (8 taxonomy + 3 menu-model)`, () => {
    expect(injected).toBe(total);
    expect(caught).toBe(total);
  });

  it("the faithful menu-model copy is clean — modifiers, 86'd options and hours all agree", () => {
    expect(runListingsVerification(acpFeedToClaims(menuFaithful), menuSor).findings).toEqual([]);
  });

  it("the menu-model record really carries what the rules read (options, an 86'd option, hours)", () => {
    const options = menuSor.items.flatMap((i) => i.modifierLists.flatMap((l) => l.options));
    expect(options.length).toBeGreaterThan(0);
    expect(options.some((o) => o.soldOut === true)).toBe(true);
    expect((menuSor.categoryAvailability ?? []).length).toBeGreaterThan(0);
  });

  it("menu-model per-ENTRY: every planted entry is caught by its rule, category AND row", () => {
    for (const e of menuManifest) {
      const rule = MENU_MODEL_RULES[e.menuClass as keyof typeof MENU_MODEL_RULES];
      expect(rule, `${e.id} has no menu class`).toBeDefined();
      expect(e.class).toBe(rule.category);
      const hit = menuReport.findings.some(
        (f) =>
          f.ruleId === rule.ruleId &&
          f.severity === rule.severity &&
          f.category === rule.category &&
          f.claim.id.startsWith(`${e.targetFeedItemId}#`),
      );
      expect(hit, `${e.id} (${e.menuClass} @ ${e.targetFeedItemId}) not caught`).toBe(true);
    }
  });

  it("menu-model drifted copy yields exactly one finding per planted entry (no collateral)", () => {
    expect(menuReport.findings.map((f) => f.ruleId).sort()).toEqual(
      menuManifest.map((e) => MENU_MODEL_RULES[e.menuClass as keyof typeof MENU_MODEL_RULES].ruleId).sort(),
    );
  });
});

describe("C6/C10 overclaim guardrail", () => {
  const banned = /\ball (edge cases|drift|possible)/i;

  it("corpus README and pack sources never claim 'all edge cases'", () => {
    const files: string[] = [];
    files.push(join(process.cwd(), "fixtures", "README.md"));
    const fixturesDir = join(process.cwd(), "fixtures", "synthetic-restaurant");
    files.push(join(fixturesDir, "README.md"));
    const packDir = join(process.cwd(), "lib", "packs", "listings");
    for (const f of readdirSync(packDir)) {
      if (f.endsWith(".ts")) files.push(join(packDir, f));
    }
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(banned.test(text), `overclaim in ${file}`).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// S1.5 (2026-10-31) — dates are compared as INSTANTS, both sides
// (lib/packs/listings/instants.ts; Codex cross-check 2026-10-12 § 4).
//
// The staleness rules compared ISO-8601 strings. Codex's three offline probes,
// each now a test: an expiry 100 ms in the future was reported EXPIRED; an
// already-expired instant written with a +02:00 offset PASSED; an unparseable
// date PASSED. New rule LST-DATE-INVALID (error · staleness) reports an
// unreadable date instead of passing it or crashing. Existing rule ids and
// plainLines are byte-unchanged (raw strings are still quoted; only the
// comparison moved), which the frozen goldens hold.
//
// RED proof (2026-10-31 01:35, recorded): with both detectors' comparison put
// back to text (`if (String(claim.value) >= asOf) return [];`, no instant
// parse; detectors.ts sha256/16 aaf19a2a925d5f09 → aace2f7e598a4cc9), this
// block ran 10 failed / 2 passed (the file 10 failed / 12 passed): both 100 ms
// cases expired, both +02:00 cases passed, every unreadable date produced no
// LST-DATE-INVALID, and a +02:00 equal instant expired. The two that stay green
// under the mutation are the parseInstant unit test and the bundled-corpus pin
// (neither reads the detectors' comparison). Restored from the saved copy →
// aaf19a2a925d5f09, 22/22 green.
// ---------------------------------------------------------------------------

describe("S1.5 — timestamps are canonicalized to instants before any comparison", () => {
  const asOf = CORPUS_AS_OF; // "2026-07-03T00:00:00Z"
  const inStockRow = faithful.items.find((r) => r.availability === "in_stock")!;
  const withRow = (patch: Partial<AcpFeedItem>, catalogAsOf = asOf) =>
    runListingsVerification(
      acpFeedToClaims({ ...faithful, items: faithful.items.map((r) => (r.item_id === inStockRow.item_id ? { ...r, ...patch } : r)) }),
      { ...sor, asOf: catalogAsOf },
    );
  const rules = (rep: ReturnType<typeof withRow>) => rep.findings.map((f) => f.ruleId);
  // A pre_order copy row against an in-stock record row also (rightly) fires
  // LST-AVAIL-STATE; the date tests read the date rules only.
  const dateFindings = (rep: ReturnType<typeof withRow>) => rep.findings.filter((f) => f.ruleId !== "LST-AVAIL-STATE");

  it("parseInstant: offsets name the same moment; impossible or zone-less forms are refused", () => {
    expect(parseInstant("2026-07-03T02:00:00+02:00")).toBe(parseInstant("2026-07-03T00:00:00Z"));
    expect(parseInstant("2026-07-02T19:00:00-05:00")).toBe(Date.UTC(2026, 6, 3, 0, 0, 0));
    expect(parseInstant("2026-07-03")).toBe(Date.UTC(2026, 6, 3));
    expect(parseInstant("2026-07-03T00:00:00.100Z")! - parseInstant("2026-07-03T00:00:00Z")!).toBe(100);
    expect(parseInstant("2024-02-29T00:00:00Z")).toBe(Date.UTC(2024, 1, 29));
    for (const bad of [
      "2026-02-30T00:00:00Z", // Date.parse rolls this over to 2 March
      "2025-02-29T00:00:00Z",
      "2026-07-03T24:00:00Z",
      "2026-07-03T12:00:00", // no offset: local time, machine-dependent
      "2026-07-03T12:00:00+25:00",
      "July 3 2026",
      "not-a-date",
      "",
    ]) {
      expect(parseInstant(bad), bad).toBeNull();
    }
    expect(parseInstant(20260703)).toBeNull();
    expect(parseInstant(null)).toBeNull();
  });

  it("expiration_date 100 ms AFTER as-of is NOT expired (text order said it was)", () => {
    expect("2026-07-03T00:00:00.100Z" < asOf, "the text comparison really did order it before as-of").toBe(true);
    expect(rules(withRow({ expiration_date: "2026-07-03T00:00:00.100Z" }))).toEqual([]);
  });

  it("expiration_date already past, written with a +02:00 offset, IS expired (text order passed it)", () => {
    const raw = "2026-07-03T01:00:00+02:00"; // = 2026-07-02T23:00:00Z, one hour before as-of
    expect(raw >= asOf, "the text comparison really did pass it").toBe(true);
    const rep = withRow({ expiration_date: raw });
    expect(rules(rep)).toEqual(["LST-STALE-EXPIRED"]);
    // the existing plainLine, byte-for-byte, quoting the raw value
    expect(rep.findings[0].plainLine).toBe(`This row expired ${raw} but is still served (catalog as-of ${asOf}).`);
  });

  it("an unparseable expiration_date is a LST-DATE-INVALID finding naming the field and quoting the value", () => {
    const rep = withRow({ expiration_date: "not-a-date" });
    expect(rep.ok).toBe(false);
    expect(rep.findings).toHaveLength(1);
    const f = rep.findings[0];
    expect(f.ruleId).toBe("LST-DATE-INVALID");
    expect(f.severity).toBe("error");
    expect(f.category).toBe("staleness");
    expect(f.referenceRowId).toBe(inStockRow.item_id);
    expect(f.plainLine).toContain("expiration_date");
    expect(f.plainLine).toContain('"not-a-date"');
  });

  it("a zone-less date-time is refused the same way (its moment depends on the machine)", () => {
    const f = withRow({ expiration_date: "2026-07-04T00:00:00" }).findings;
    expect(f.map((x) => x.ruleId)).toEqual(["LST-DATE-INVALID"]);
    expect(f[0].plainLine).toContain('"2026-07-04T00:00:00"');
  });

  it("availability_date 100 ms after as-of is NOT stale", () => {
    expect(dateFindings(withRow({ availability: "pre_order", availability_date: "2026-07-03T00:00:00.100Z" }))).toEqual([]);
  });

  it("availability_date already past with a +02:00 offset IS stale", () => {
    const raw = "2026-07-03T01:00:00+02:00";
    const found = dateFindings(withRow({ availability: "pre_order", availability_date: raw }));
    expect(found.map((f) => f.ruleId)).toEqual(["LST-STALE-AVAILDATE"]);
    expect(found[0].plainLine).toBe(
      `The pre-order availability date ${raw} already passed (catalog as-of ${asOf}) — the promise is stale.`,
    );
  });

  it("an unparseable availability_date is LST-DATE-INVALID (and a missing one stays LST-XF-PREORDER-DATE-MISSING)", () => {
    const f = dateFindings(withRow({ availability: "pre_order", availability_date: "2026-13-01" }));
    expect(f.map((x) => x.ruleId)).toEqual(["LST-DATE-INVALID"]);
    expect(f[0].plainLine).toContain("availability_date");
    expect(f[0].plainLine).toContain('"2026-13-01"');
    expect(dateFindings(withRow({ availability: "pre_order", availability_date: undefined })).map((x) => x.ruleId)).toEqual([
      "LST-XF-PREORDER-DATE-MISSING",
    ]);
  });

  it("an unreadable catalog asOf is reported on every date claim — never a silent pass, never a crash", () => {
    const rep = withRow({ expiration_date: "2026-07-04T00:00:00Z" }, "yesterday");
    expect(rep.findings.map((x) => x.ruleId)).toEqual(["LST-DATE-INVALID"]);
    expect(rep.findings[0].referenceRowId).toBe("catalog-meta");
    expect(rep.findings[0].plainLine).toContain('asOf is "yesterday"');
    expect(rep.findings[0].plainLine).toContain('"2026-07-04T00:00:00Z"');
  });

  it("a non-string date value is reported, quoted as written", () => {
    const rep = withRow({ expiration_date: 20260704 as unknown as string });
    expect(rep.findings.map((x) => x.ruleId)).toEqual(["LST-DATE-INVALID"]);
    expect(rep.findings[0].plainLine).toContain('"20260704"');
  });

  it("equal instants in different spellings are not expired (>= is kept)", () => {
    expect(rules(withRow({ expiration_date: "2026-07-03T02:00:00+02:00" }))).toEqual([]);
    expect(rules(withRow({ expiration_date: "2026-07-03" }))).toEqual([]);
  });

  it("the bundled drifted corpus still yields exactly its staleness findings (no date rule added or lost)", () => {
    const stale = acpReport.findings.filter((f) => f.category === "staleness").map((f) => f.ruleId).sort();
    expect(stale).toEqual(["LST-STALE-AVAILDATE", "LST-STALE-EXPIRED"]);
    expect(acpReport.findings.some((f) => f.ruleId === "LST-DATE-INVALID")).toBe(false);
  });
});
