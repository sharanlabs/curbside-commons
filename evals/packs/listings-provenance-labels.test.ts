import { describe, expect, it } from "vitest";
import {
  acpFeedToClaims,
  buildFaithfulFeed,
  generateCatalog,
  runListingsVerification,
} from "@/lib/packs/listings";

/**
 * SLICE 1 — the report's provenance labels must describe the RUN, not the
 * engine's default (owner commission 2026-07-27, "I want a working website
 * where I will upload test files").
 *
 * WHY THIS EXISTS. `runListingsVerification` used to hardcode
 * `matchingMode: "synthetic-controlled"` and `simulated: true` into every
 * report it built. That was TRUE for every caller that existed at the time —
 * all of them fed the committed synthetic catalog — so nothing was wrong on
 * the shipped surfaces. It becomes FALSE the moment a reader uploads their own
 * catalog: the engine would stamp a reader's real records `simulated: true`
 * and assert shared-synthetic-ID matching it never performed.
 *
 * That is a RULES §4 defect of exactly the class this project keeps catching —
 * a claim broader than the thing backing it (state doc, session 34: four
 * occurrences; session 35: two more). The label is not decoration: C10 pins
 * `simulated` as an honesty surface, and C3 requires every report to say how
 * matching was performed. A label that cannot vary cannot be honest about a
 * run that varies.
 *
 * THE FIX SHAPE. The provenance becomes an optional third parameter that
 * DEFAULTS to today's exact values, so every one of the ~40 existing call
 * sites keeps its byte-identical report (proven by the untouched golden and
 * drift-lock suites). Only a caller that KNOWS the data is the reader's own
 * passes the honest alternative.
 *
 * Note on `simulated`: the engine reads only `sor.items` and `sor.asOf` from a
 * catalog (reference.ts:38,64) — the `simulated` field on SyntheticCatalog is
 * a pure honesty label and never a computation input, so varying it cannot
 * change a single finding. This suite pins that too (T4): identical inputs
 * produce identical FINDINGS under either label. The labels describe the run;
 * they never steer it.
 */

const AS_OF = "2026-07-03T00:00:00Z";
const SEED = 4242;

describe("T1: the default is byte-identical to the pre-slice behaviour", () => {
  it("a two-argument call still reports synthetic-controlled + simulated:true", () => {
    const sor = generateCatalog(SEED, AS_OF);
    const report = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor);

    expect(report.matchingMode).toBe("synthetic-controlled");
    expect(report.simulated).toBe(true);
  });
});

describe("T2: a reader-supplied run can label itself honestly", () => {
  it("real-world matching + simulated:false reach the report header", () => {
    const sor = generateCatalog(SEED, AS_OF);
    const report = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor, {
      matchingMode: "real-world",
      simulated: false,
    });

    expect(report.matchingMode).toBe("real-world");
    expect(report.simulated).toBe(false);
  });

  it("each label moves independently (a partial provenance is still honest)", () => {
    const sor = generateCatalog(SEED, AS_OF);

    // Reader's own feed, but checked against OUR committed catalog: the data
    // is still synthetic on the truth side, and matching is still by shared id.
    const halfWay = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor, {
      simulated: false,
    });
    expect(halfWay.simulated).toBe(false);
    expect(halfWay.matchingMode).toBe("synthetic-controlled");

    const otherHalf = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor, {
      matchingMode: "real-world",
    });
    expect(otherHalf.simulated).toBe(true);
    expect(otherHalf.matchingMode).toBe("real-world");
  });
});

describe("T3: the spec version is NOT reader-overridable", () => {
  it("the pinned rule-table version survives any provenance the caller passes", () => {
    const sor = generateCatalog(SEED, AS_OF);
    const base = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor);
    const labelled = runListingsVerification(acpFeedToClaims(buildFaithfulFeed(sor)), sor, {
      matchingMode: "real-world",
      simulated: false,
    });

    // C10 pins the rule-table version into every report header. A caller may
    // describe WHOSE data it ran on; it may never restate WHICH RULES ran.
    expect(labelled.specVersion).toBe(base.specVersion);
  });
});

describe("T4: labels describe the run, they never steer it", () => {
  it("findings are identical under either provenance (drifted input)", () => {
    const sor = generateCatalog(SEED, AS_OF);
    const faithful = buildFaithfulFeed(sor);
    // Plant a lie so there is a non-empty finding set to compare.
    // ACP serves prices as decimal STRINGS; the drift is a real disagreement
    // with the record, not a type error.
    const drifted = {
      ...faithful,
      items: faithful.items.map((r, i) => (i === 0 ? { ...r, price: "9999.99" } : r)),
    };

    const asSynthetic = runListingsVerification(acpFeedToClaims(drifted), sor);
    const asReal = runListingsVerification(acpFeedToClaims(drifted), sor, {
      matchingMode: "real-world",
      simulated: false,
    });

    expect(asReal.findings.length).toBeGreaterThan(0);
    expect(JSON.stringify(asReal.findings)).toBe(JSON.stringify(asSynthetic.findings));
    expect(asReal.ok).toBe(asSynthetic.ok);
  });
});
