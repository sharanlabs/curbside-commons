import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { VerifierReport } from "@/lib/verifier-core/report";
import { toReportView } from "@/lib/packs/listings/report-view";
import acpJson from "@/fixtures/synthetic-restaurant/expected-report.acp.json";
import ucpJson from "@/fixtures/synthetic-restaurant/expected-report.ucp.json";

/**
 * W3 — the one-page report-rendering path (plan §5 W3; C1 $0-LLM · C2 evidence
 * visibility · C4 plain-line lead · C10 header surface).
 *
 * Mirrors the CLI's structural $0-LLM proof for the WEB report path: a transitive
 * import-graph scan from `app/report/page.tsx` proves the report renderer can
 * never reach an LLM/provider/network module. Then it asserts the pure view
 * transform preserves every C2 receipt (no synthesis, no drop), leads with the
 * C4 plain line, surfaces the C10 header, and is deterministic.
 */

const root = process.cwd();
const acp = acpJson as unknown as VerifierReport;
const ucp = ucpJson as unknown as VerifierReport;

describe("C1 $0-LLM: report-rendering path imports no LLM/provider/network module", () => {
  const banned = [
    /lib\/agents\//,
    /@ai-sdk/,
    /^ai$|\/ai\//,
    /node:https?/,
    /undici/,
    /groq|gemini/i,
  ];

  function importsOf(file: string): string[] {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    // Catches all three module-graph edges: `... from "x"`, dynamic `import("x")`,
    // AND bare side-effect `import "x"` (the last is what a sneaky provider import
    // would use; the `from`-only form would miss it).
    const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
    for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
    return specs;
  }

  // Resolve a specifier to a concrete repo file: "@/..." → root, "./..."/"../..."
  // → relative, trying the TS/TSX/MJS/JSON/index candidates. Bare specifiers
  // (react, next/*) return null — unresolvable to a repo file, checked but not walked.
  function resolve(fromFile: string, spec: string): string | null {
    let base: string | null = null;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
    if (base === null) return null;
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.mjs`,
      `${base}.json`,
      join(base, "index.ts"),
    ];
    return candidates.find((c) => existsSync(c) && c.match(/\.(ts|tsx|mjs|json)$/)) ?? null;
  }

  it("no module reachable from app/report/page.tsx matches a banned pattern", () => {
    const entry = join(root, "app", "report", "page.tsx");
    const queue = [entry];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (file.endsWith(".json")) continue; // data leaf, no imports
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
        const resolved = resolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    // The walk actually reached the renderers and the data (v9 takeover build
    // piece 1, 2026-07-20: ReportView → Jewel + Ledger; figures derive through
    // lib/landing/specimen from the committed acp report golden — the ucp golden
    // and the toReportView transform left this page's path and stay covered by
    // the wedge + transcript packs).
    const reached = [...seen].map((f) => f.replace(root, ""));
    expect(reached.some((f) => f.includes("components/report/Jewel"))).toBe(true);
    expect(reached.some((f) => f.includes("components/report/Ledger"))).toBe(true);
    expect(reached.some((f) => f.includes("lib/landing/specimen"))).toBe(true);
    expect(reached.some((f) => f.includes("expected-report.acp.json"))).toBe(true);
  });

  it("no reachable source performs a bare fetch()", () => {
    const entry = join(root, "app", "report", "page.tsx");
    const queue = [entry];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      const text = readFileSync(file, "utf8");
      if (!file.endsWith(".json")) {
        expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
        for (const spec of importsOf(file)) {
          const resolved = resolve(file, spec);
          if (resolved !== null) queue.push(resolved);
        }
      }
    }
  });
});

describe("C2 — the view preserves every evidence field (no synthesis, no drop)", () => {
  it.each([
    ["acp", acp],
    ["ucp", ucp],
  ])("%s: every finding becomes exactly one row carrying all four C2 fields", (_name, report) => {
    const view = toReportView(report);
    expect(view.rows).toHaveLength(report.findings.length);
    report.findings.forEach((f, i) => {
      const row = view.rows[i];
      // C2's four required fields survive verbatim.
      expect(row.claimId).toBe(f.claim.id);
      expect(row.referenceRowId).toBe(f.referenceRowId);
      expect(row.ruleId).toBe(f.ruleId);
      expect(row.severity).toBe(f.severity);
      // The claim's SOURCE surface is part of the receipt (M1 Codex P2): with
      // ACP/UCP/conformance rows sharing field paths, "which copy said it"
      // must survive the view — verbatim and non-empty.
      expect(row.claimSource).toBe(f.claim.source);
      expect(row.claimSource).not.toBe("");
      // No field is empty — the renderer would otherwise hide a receipt.
      expect(row.claimId).not.toBe("");
      expect(row.referenceRowId).not.toBe("");
      expect(row.ruleId).not.toBe("");
    });
  });

  it("the severity tally sums to the finding count", () => {
    const view = toReportView(acp);
    const { error, warn, info } = view.tally;
    expect(error + warn + info).toBe(view.findingCount);
  });
});

describe("C4 — every finding leads with a plain-words line (golden corpus)", () => {
  it.each([
    ["acp", acp],
    ["ucp", ucp],
  ])("%s: no rendered finding has an empty plain line", (_name, report) => {
    for (const row of toReportView(report).rows) {
      expect(row.plainLine.length).toBeGreaterThan(0);
    }
  });
});

describe("C10 — the view carries the pinned header surface", () => {
  it("specVersion pin, matchingMode label, and simulated flag are present", () => {
    const view = toReportView(acp);
    expect(view.specVersion).toContain("ucp-pin-2026-04-08");
    expect(["synthetic-controlled", "real-world"]).toContain(view.matchingMode);
    expect(view.matchingModePlain.length).toBeGreaterThan(0);
    expect(view.simulated).toBe(true);
  });
});

describe("determinism — the transform is pure", () => {
  it("identical input yields deep-equal output", () => {
    expect(toReportView(acp)).toEqual(toReportView(acp));
  });
});

describe("print fidelity — the report's coloured marks survive print", () => {
  // The report is a printable one-pager. Chrome/Safari drop background colours when
  // printing unless color-adjust is forced exact — without it the verdict flag
  // (paper text on an ink ground) and the severity marks (colour dots on tinted
  // grounds) would print as invisible white-on-white, silently stripping meaning
  // from a printed copy. (Freeze-reversal 2026-07-14: the .rpt-sim SIMULATED banner
  // and its dedicated print-color-adjust assertion were removed with the banner.)
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");

  it("globals.css keeps an @media print block", () => {
    expect(css).toMatch(/@media\s+print\s*\{/);
  });

  it("keeps print-color-adjust: exact (both standard + -webkit- forms)", () => {
    expect(css).toMatch(/(?:^|[^-])print-color-adjust:\s*exact/m);
    expect(css).toMatch(/-webkit-print-color-adjust:\s*exact/);
  });

  it("the verdict-flag rule carries both color-adjust forms (its ink ground must print)", () => {
    // Scope to the verdict flag's own rule block so moving the property OFF it fails
    // the gate — not merely that the string appears somewhere in the file. Both the
    // -webkit- prefixed form and the standard (un-prefixed) form must be present.
    const flagRule = css.match(/\.rpt-verdict-flag\s*\{[^}]*\}/);
    expect(flagRule, ".rpt-verdict-flag rule block found in globals.css").not.toBeNull();
    const block = flagRule?.[0] ?? "";
    expect(block).toMatch(/-webkit-print-color-adjust:\s*exact/);
    expect(block).toMatch(/(?:^|[^-])print-color-adjust:\s*exact/m);
  });
});
