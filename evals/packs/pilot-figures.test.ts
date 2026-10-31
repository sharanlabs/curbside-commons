import { mkdtempSync, mkdirSync, readFileSync, readdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkImports } from "../lib/import-walk.ts";
import { GUIDE } from "@/lib/landing/test-guide.ts";
import {
  ASSUMPTIONS,
  BUNDLED,
  COST,
  COST_FORMULA,
  CONTROLS,
  LIBRARY,
  M1,
  PLAN_SCENARIOS,
  TIERS,
  buildLibrary,
  deriveCost,
  formatBp,
  formatCount,
  formatUsd,
  formatValue,
} from "@/lib/landing/pilot-figures.ts";

/**
 * /pilot's FIGURES ARE DERIVED, AND THEIR SOURCES AGREE — plan § 12 S4 ("every
 * figure on /pilot derived"), § 7 (the cost model), Wave 1 acceptance item 25.
 *
 *  ARITHMETIC  every derived figure equals a recomputation written HERE, in
 *              BigInt, from the declared inputs — a different path from the
 *              module's integer basis-point arithmetic, so a slip in either
 *              shows as a disagreement rather than as self-agreement.
 *  SOURCES     the declared inputs are the plan § 7 fill, read out of the plan's
 *              own sentence; pilot-proposal.md's ILLUSTRATIVE table (which, being
 *              markdown, must type its figures) equals the module row for row;
 *              M1's wording equals success-metrics.md.
 *  LABELS      every input is an ASSUMPTION with a source; every derived figure
 *              is ARITHMETIC with its working; the block is ILLUSTRATIVE and
 *              states that no dollar figure is a measurement.
 *  LIBRARY     the scenario rows are the folders that exist (never a pinned
 *              count): each BUILT row's figures equal the folder's own
 *              expected/report.json, a second source; a new folder flips its
 *              row to BUILT; a manifest that is not simulated is refused.
 *  EGRESS      the module and the page reach no network, SDK or model client
 *              (the fail-closed import walk shared by every egress suite).
 *
 * MUTATIONS (each applied by hand to lib/landing/pilot-figures.ts, run, then
 * restored with `git checkout -- lib/landing/pilot-figures.ts`; restored file
 * re-run green — recorded in docs/returns/2026-10-31-exec-layer.md):
 *  M-a  `const refundExposureCents = driftErrorsPerMonth * a.avgRefundCents.value;`
 *       → `… * a.avgRefundCents.value + 100;` → RED: ARITHMETIC (refund
 *       exposure), SOURCES (plan § 7 and pilot-proposal $108,000).
 *  M-b  `ordersPerStorePerDay` value `30` → `31` → RED: SOURCES (plan § 7
 *       sentence and the pilot-proposal table); ARITHMETIC stays green, which is
 *       why the source locks exist.
 *  M-c  the `m.simulated !== true` refusal removed from readManifest → RED:
 *       LIBRARY "a manifest that is not simulated is refused".
 *  M-d  formatBp's trailing-zero strip removed (`.replace(/0+$/, "")` dropped)
 *       → RED: formatters ("1.5%" became "1.50%").
 */

const ROOT = process.cwd();
const readRepo = (rel: string): string => readFileSync(join(ROOT, rel), "utf8");

// ---------------------------------------------------------------------------

describe("ARITHMETIC — every derived figure equals an independent recomputation", () => {
  // BigInt from the declared values: orders = stores · per-day · days;
  // errors = orders · rate% ; drift = errors · share% ; exposure = drift · refund.
  // Percentages are re-read from basis points as (bp / 10000) via BigInt
  // division with a remainder check, not the module's helper.
  const A = ASSUMPTIONS;
  const big = (n: number) => BigInt(n);
  const exactDiv = (num: bigint, den: bigint): bigint => {
    expect(num % den, "a recomputed step left a remainder").toBe(0n);
    return num / den;
  };
  const orders = big(A.stores.value) * big(A.ordersPerStorePerDay.value) * big(A.days.value);
  const errors = exactDiv(orders * big(A.errorRateBp.value), 10000n);
  const drift = exactDiv(orders * big(A.errorRateBp.value) * big(A.menuShareBp.value), 10000n * 10000n);
  const exposureCents = drift * big(A.avgRefundCents.value);

  it("orders per month", () => expect(BigInt(COST.derived.ordersPerMonth.value)).toBe(orders));
  it("order errors per month", () => expect(BigInt(COST.derived.orderErrorsPerMonth.value)).toBe(errors));
  it("drift-caused errors per month", () => expect(BigInt(COST.derived.driftErrorsPerMonth.value)).toBe(drift));
  it("refund exposure per month (cents)", () => expect(BigInt(COST.derived.refundExposureCents.value)).toBe(exposureCents));

  it("a fill that would leave a fraction is refused, not rounded", () => {
    const odd = { ...A, stores: { value: 1 }, ordersPerStorePerDay: { value: 1 }, days: { value: 1 } };
    expect(() => deriveCost(odd)).toThrow(/not a whole number/);
  });
});

describe("FORMATTERS — the text the page prints", () => {
  it("counts, basis points and cents format exactly", () => {
    expect(formatCount(900000)).toBe("900,000");
    expect(formatCount(1000)).toBe("1,000");
    expect(formatCount(30)).toBe("30");
    expect(formatBp(150)).toBe("1.5%");
    expect(formatBp(4000)).toBe("40%");
    expect(formatBp(1225)).toBe("12.25%");
    expect(formatUsd(10800000)).toBe("$108,000");
    expect(formatUsd(2000)).toBe("$20");
    expect(formatUsd(1999)).toBe("$19.99");
  });

  it("a fractional or negative figure is a bug, and throws", () => {
    expect(() => formatCount(1.5)).toThrow();
    expect(() => formatUsd(-1)).toThrow();
    expect(() => formatBp(0.5)).toThrow();
  });
});

describe("SOURCES — the inputs are the plan's, and the markdown that must type them agrees", () => {
  it("the declared inputs are plan § 7's illustrative fill, read from the plan's own sentence", () => {
    const plan = readRepo("docs/plan-menu-integrity-crew-2026-10-09.md").replace(/\s+/g, " ");
    const m = plan.match(
      /([\d,]+) stores × (\d+) orders\/day × (\d+) days = ([\d,]+) orders; error rate ([\d.]+) %; menu-data share (\d+) % → ~([\d,]+) drift-caused errors; avg refund \$(\d+) → ~\$([\d,]+)\/month/,
    );
    expect(m, "plan § 7 no longer states the illustrative fill in its one sentence").not.toBeNull();
    const n = (s: string) => Number(s.replace(/,/g, ""));
    expect(n(m![1])).toBe(ASSUMPTIONS.stores.value);
    expect(n(m![2])).toBe(ASSUMPTIONS.ordersPerStorePerDay.value);
    expect(n(m![3])).toBe(ASSUMPTIONS.days.value);
    expect(n(m![4])).toBe(COST.derived.ordersPerMonth.value);
    expect(Math.round(Number(m![5]) * 100)).toBe(ASSUMPTIONS.errorRateBp.value);
    expect(n(m![6]) * 100).toBe(ASSUMPTIONS.menuShareBp.value);
    expect(n(m![7])).toBe(COST.derived.driftErrorsPerMonth.value);
    expect(n(m![8]) * 100).toBe(ASSUMPTIONS.avgRefundCents.value);
    expect(n(m![9]) * 100).toBe(COST.derived.refundExposureCents.value);
  });

  it("pilot-proposal.md's ILLUSTRATIVE table equals the module, row for row", () => {
    const md = readRepo("docs/pilot-kit/pilot-proposal.md");
    const cell = (label: string): string => {
      const row = md
        .split("\n")
        .find((l) => l.startsWith("|") && l.split("|")[1]?.replace(/\*/g, "").trim() === label);
      expect(row, `pilot-proposal.md has no "${label}" row`).toBeDefined();
      return row!.split("|")[2].replace(/\*/g, "").trim();
    };
    const num = (s: string) => Number(s.replace(/about|per month|percent|\$|,|\s/g, ""));
    expect(num(cell("Stores"))).toBe(ASSUMPTIONS.stores.value);
    expect(num(cell("Orders per store per day"))).toBe(ASSUMPTIONS.ordersPerStorePerDay.value);
    expect(num(cell("Days"))).toBe(ASSUMPTIONS.days.value);
    expect(num(cell("Orders per month"))).toBe(COST.derived.ordersPerMonth.value);
    expect(Math.round(num(cell("Order-error rate")) * 100)).toBe(ASSUMPTIONS.errorRateBp.value);
    expect(num(cell("Menu-data share of those errors")) * 100).toBe(ASSUMPTIONS.menuShareBp.value);
    expect(num(cell("Drift-caused errors per month"))).toBe(COST.derived.driftErrorsPerMonth.value);
    expect(num(cell("Average refund")) * 100).toBe(ASSUMPTIONS.avgRefundCents.value);
    expect(num(cell("Refund flow exposed to this class, before any catch rate")) * 100).toBe(
      COST.derived.refundExposureCents.value,
    );
    // Item 25 of the acceptance review: the $ figure keeps its label adjacent.
    expect(md).toMatch(/\*\*ILLUSTRATIVE fill\.\*\*/);
    expect(md).toContain("No dollar figure below is a measurement.");
  });

  it("the formula is plan § 7's and pilot-proposal's, word for word", () => {
    expect(readRepo("docs/pilot-kit/pilot-proposal.md")).toContain(COST_FORMULA);
    const plan = readRepo("docs/plan-menu-integrity-crew-2026-10-09.md");
    // The plan abbreviates ("Benefit/month", "avg refund"); the terms must match in order.
    const terms = ["orders", "error rate", "menu-data share", "refund", "measured catch rate", "dispute minutes avoided", "loaded hourly cost", "agent cancellations avoided"];
    const line = plan.split("\n").find((l) => l.startsWith("Benefit/month ≈"));
    expect(line, "plan § 7 lost its formula line").toBeDefined();
    let at = 0;
    for (const t of terms) {
      const i = line!.indexOf(t, at);
      expect(i, `plan § 7's formula lacks "${t}" in order`).toBeGreaterThan(-1);
      at = i;
      expect(COST_FORMULA).toContain(t);
    }
  });

  it("M1's wording is success-metrics.md's", () => {
    const sm = readRepo("docs/pilot-kit/success-metrics.md");
    expect(sm).toContain(`**${M1.id}** | **${M1.name}**`);
    expect(sm).toContain(M1.floor);
    expect(sm).toContain(M1.instrument);
  });
});

describe("LABELS — every input declared, every figure shown with its working", () => {
  it("every input is an ASSUMPTION with a label and a source", () => {
    for (const a of Object.values(ASSUMPTIONS)) {
      expect(a.basis).toBe("ASSUMPTION");
      expect(a.label.length).toBeGreaterThan(2);
      expect(a.source).toMatch(/plan § 7/);
      expect(a.source).toMatch(/not a measurement/);
      expect(Number.isInteger(a.value)).toBe(true);
    }
  });

  it("every derived figure is ARITHMETIC with its working in words, and formats without throwing", () => {
    for (const d of Object.values(COST.derived)) {
      expect(d.basis).toBe("ARITHMETIC");
      expect(d.how).toMatch(/×/);
      expect(formatValue(d.value, d.unit).length).toBeGreaterThan(0);
    }
  });

  it("the block is ILLUSTRATIVE, assumes no catch rate, and says no dollar figure is a measurement", () => {
    expect(COST.label).toBe("ILLUSTRATIVE");
    expect(COST.catchRate.value).toBeNull();
    expect(COST.notAMeasurement).toBe("No dollar figure on this page is a measurement.");
  });
});

describe("BUNDLED — the front page's figures come from GUIDE, not a second copy", () => {
  it("equals the derived guide object field for field", () => {
    expect(BUNDLED).toEqual({
      verdict: GUIDE.bundled.verdict,
      findings: GUIDE.bundled.findings,
      errors: GUIDE.bundled.errors,
      warnings: GUIDE.bundled.warnings,
      rowsRead: GUIDE.bundled.rowsRead,
    });
  });
});

describe("LIBRARY — the folders that exist, each held to its own engine report", () => {
  const SCEN = join(ROOT, "fixtures", "scenarios");
  const onDisk = readdirSync(SCEN, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(SCEN, d.name, "manifest.json")))
    .map((d) => d.name);

  it("every folder on disk is a BUILT row, and every BUILT row is a folder on disk (no pinned count)", () => {
    const built = LIBRARY.rows.filter((r) => r.state === "BUILT").map((r) => r.id).sort();
    expect(built).toEqual([...onDisk].sort());
    expect(LIBRARY.builtCount).toBe(onDisk.length);
    expect(LIBRARY.plannedCount).toBe(PLAN_SCENARIOS.length);
    expect(onDisk.length, "the library read nothing — the scan would be vacuous").toBeGreaterThan(0);
  });

  it("each BUILT row's verdict and findings equal the folder's expected/report.json (a second source)", () => {
    for (const r of LIBRARY.rows.filter((x) => x.state === "BUILT")) {
      const report = JSON.parse(readFileSync(join(SCEN, r.id, "expected", "report.json"), "utf8")) as {
        ok: boolean;
        findings: unknown[];
      };
      expect(r.findings, `${r.id}: findings`).toBe(report.findings.length);
      expect(r.verdict, `${r.id}: verdict`).toBe(report.ok ? "PASS" : "FAIL");
    }
  });

  it("every plan id without a folder says when it arrives; no row is both", () => {
    for (const r of LIBRARY.rows) {
      if (r.state === "BUILT") {
        expect(r.arrives).toBeNull();
        expect(r.verdict).not.toBeNull();
      } else {
        expect(r.verdict).toBeNull();
        expect(r.findings).toBeNull();
        if (r.state === "ARRIVES") expect(r.arrives).toMatch(/^S\d/);
      }
    }
    expect(LIBRARY.rows.map((r) => r.id).slice(0, PLAN_SCENARIOS.length)).toEqual(PLAN_SCENARIOS.map((s) => s.id));
  });

  // The teeth must not depend on tonight's fixture state (scenarios 2 and 6 may
  // land from another lane), so they run on a temporary library built from
  // nothing: an ARRIVES id gains a folder and must flip to BUILT.
  const tmp = (): string => mkdtempSync(join(tmpdir(), "cc-pilot-lib-"));
  const writeFolder = (dir: string, id: string, manifest: object, report: object) => {
    mkdirSync(join(dir, id, "expected"), { recursive: true });
    writeFileSync(join(dir, id, "manifest.json"), JSON.stringify(manifest));
    writeFileSync(join(dir, id, "expected", "report.json"), JSON.stringify(report));
  };

  it("a folder that lands later flips its row from ARRIVES to BUILT with no edit to the module", () => {
    const dir = tmp();
    try {
      const empty = buildLibrary(dir);
      const target = PLAN_SCENARIOS.find((s) => s.arrives !== null)!;
      expect(empty.rows.find((r) => r.id === target.id)!.state).toBe("ARRIVES");
      expect(empty.builtCount).toBe(0);
      writeFolder(
        dir,
        target.id,
        { id: target.id, simulated: true, pack: "listings", figures: { verdict: "FAIL", findings: 4 }, absentUntilS2: ["impact"] },
        { ok: false, findings: [1, 2, 3, 4] },
      );
      const after = buildLibrary(dir);
      const row = after.rows.find((r) => r.id === target.id)!;
      expect(row.state).toBe("BUILT");
      expect(row.findings).toBe(4);
      expect(row.later).toEqual(["impact"]);
      expect(after.builtCount).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("a manifest that is not simulated is refused (RULES §4 is a build failure, not a rendering choice)", () => {
    const dir = tmp();
    try {
      writeFolder(
        dir,
        "agent-86",
        { id: "agent-86", simulated: false, figures: { verdict: "FAIL", findings: 1 } },
        { ok: false, findings: [1] },
      );
      expect(() => buildLibrary(dir)).toThrow(/simulated/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("GOVERNANCE — tiers and controls are text, in order", () => {
  it("tiers are exactly 0, 1, 2, 3, the pilot stops at proposing, and Tier 3 is never", () => {
    expect(TIERS.map((t) => t.tier)).toEqual([0, 1, 2, 3]);
    expect(TIERS[1].covers).toMatch(/signed human decision/);
    expect(TIERS[2].state).toMatch(/Out of scope/);
    expect(TIERS[3].name).toBe("Never");
    expect(TIERS[3].covers).toMatch(/issue a credit/);
  });

  it("the control register names the five controls of plan § 6", () => {
    expect(CONTROLS.map((c) => c.control)).toEqual(["Evidence", "Model risk", "Data", "Audit trail", "Operational"]);
  });

  it("governance text carries no figure (a digit here would be a typed number)", () => {
    const text = JSON.stringify([TIERS.map((t) => [t.name, t.covers, t.state]), CONTROLS]);
    // Dates and slice labels are names, not figures.
    const stripped = text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "").replace(/\bS\d(?:\.\d)?\b/g, "");
    expect(stripped).not.toMatch(/\d/);
  });
});

describe("EGRESS — the module and the page reach no network, SDK or model client", () => {
  // The same UI packages the landing delivery station's walk allows, for the
  // same reason (the GUIDE import reaches the playground seam). `next` is the
  // page's TYPE-only Metadata import, asserted below to stay type-only.
  const allowPackages = ["react", "react-dom", "next/link", "next/navigation"];

  it("lib/landing/pilot-figures.ts: the walk is clean and reaches the verifier seam", () => {
    const { violations, seen } = walkImports(join(ROOT, "lib", "landing", "pilot-figures.ts"), { root: ROOT, allowPackages });
    expect([...seen].some((f) => f.endsWith("test-guide.ts")), "the walk never reached test-guide.ts").toBe(true);
    expect(seen.size, "the walk did not traverse a real closure").toBeGreaterThan(10);
    expect(violations).toEqual([]);
  });

  it("app/pilot/page.tsx: the walk is clean; its only `next` import is type-only", () => {
    const page = join(ROOT, "app", "pilot", "page.tsx");
    const src = readFileSync(page, "utf8");
    expect(src).toMatch(/import type \{ Metadata \} from "next";/);
    expect(src.match(/from "next"/g)?.length).toBe(1);
    const { violations, seen } = walkImports(page, { root: ROOT, allowPackages: [...allowPackages, "next"] });
    expect([...seen].some((f) => f.endsWith("pilot-figures.ts"))).toBe(true);
    expect(violations).toEqual([]);
    for (const forbidden of ["@ai-sdk", "groq", "gemini", "crew-live", "resend", "webhook"]) {
      expect([...seen].some((f) => f.toLowerCase().includes(forbidden)), `/pilot reaches "${forbidden}"`).toBe(false);
    }
  });
});
