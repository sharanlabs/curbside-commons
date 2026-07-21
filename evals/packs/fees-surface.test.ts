/**
 * Fee-surface teeth (NYC showcase N1+N2, plan docs/plan-nyc-showcase-2026-07-16.md)
 * — the tests that make the /fees page's claims TRUE rather than asserted:
 *
 * 1. GOLDEN EQUALITY — the browser seam (components/fees/audit-in-browser.ts),
 *    fed its own sample statement, reproduces the committed golden
 *    fixtures/synthetic-restaurant/fees/expected-report.drifted.json
 *    BYTE-FOR-BYTE (the meta rebuilt in plain voice provably changes nothing).
 * 2. THE GATE BITES — one mutated fee amount changes the report.
 * 3. ANSWER-KEY BINDING — every deterministic entry in the committed answer key
 *    appears in the rendered drifted view with the expected rule id, claim id,
 *    and verdict (the dashboard-evidence source-binding pattern).
 * 4. VIEW-MODEL BINDING — the rendered tallies/verdicts equal the goldens for
 *    all four example months; statement-line receipts resolve.
 * 5. BOUNDARY SET-LOCK — the rendered 11/6 lanes are exactly FEE_RULES +
 *    NON_STATEMENT_CHECKABLE (a registry change without a display row fails).
 * 6. FRESHNESS BINDING — the as-of date the page renders is carried by the
 *    committed rule-table research record.
 * 7. HONESTY — the fee surfaces stay jargon-free and no-AI/no-network-honest;
 *    display cleaning rewords internal markers without dropping the meaning.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLASSIFICATION_DISPLAY,
  EXECUTABLE_RULES,
  EXTERNAL_EVIDENCE_DISPLAY,
  EXTERNAL_EVIDENCE_RULES,
  FEE_BOUNDARY,
  FEE_CASES,
  RULE_TABLE_FRESHNESS,
  VERDICT_TAG_DISPLAY,
  cleanFeeCopy,
} from "../../components/fees/fee-report-data";
import {
  SAMPLE_STATEMENT,
  auditStatementText,
  sampleStatementText,
} from "../../components/fees/audit-in-browser";
import { FEE_RULES, FEE_VERDICTS, NON_STATEMENT_CHECKABLE, serializeFeeReport } from "../../lib/packs/fees";

const root = resolve(__dirname, "..", "..");
const feesDir = join(root, "fixtures", "synthetic-restaurant", "fees");
const goldenDrifted = readFileSync(join(feesDir, "expected-report.drifted.json"), "utf8");

describe("fee playground golden equality (the paste leg's central claim)", () => {
  it("the browser seam reproduces the committed drifted golden byte-for-byte", () => {
    const result = auditStatementText(sampleStatementText());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(serializeFeeReport(result.report)).toBe(goldenDrifted);
    }
  });

  it("the equality gate bites: one mutated fee amount changes the report", () => {
    const mutated = JSON.parse(sampleStatementText()) as {
      lines: Array<{ amountCents: number }>;
    };
    mutated.lines[0].amountCents = 1;
    const result = auditStatementText(JSON.stringify(mutated));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(serializeFeeReport(result.report)).not.toBe(goldenDrifted);
    }
  });

  it("the sample's rebuilt meta is honest and parser-complete (simulated marker on)", () => {
    expect(SAMPLE_STATEMENT.meta.simulated).toBe(true);
    // The rebuilt meta must not affect the audit: month + asOf are the fixture's.
    const fixture = JSON.parse(
      readFileSync(join(feesDir, "statement.drifted.json"), "utf8"),
    ) as { meta: { month: string; asOf: string } };
    expect(SAMPLE_STATEMENT.meta.month).toBe(fixture.meta.month);
    expect(SAMPLE_STATEMENT.meta.asOf).toBe(fixture.meta.asOf);
  });

  it("malformed input yields an honest error, never a verdict", () => {
    expect(auditStatementText("").ok).toBe(false);
    expect(auditStatementText("not json {").ok).toBe(false);
    expect(auditStatementText("[1,2,3]").ok).toBe(false);
    const noLines = auditStatementText('{"meta":{"simulated":true}}');
    expect(noLines.ok).toBe(false);
    if (!noLines.ok) expect(noLines.error).toMatch(/lines/);
  });

  it("a paste without the honesty marker is refused with the friendly boundary message", () => {
    const noMarker = auditStatementText('{"meta":{"simulated":false},"lines":[]}');
    expect(noMarker.ok).toBe(false);
    if (!noMarker.ok) {
      expect(noMarker.error).toMatch(/"simulated": true/);
      expect(noMarker.error).toMatch(/illustrative/i);
      // The internal gate tag never leaks to the rendered error.
      expect(noMarker.error).not.toMatch(/C10/);
    }
  });

  it("a broken line is rejected with the line named (the parser's loud path)", () => {
    const bad = auditStatementText(
      JSON.stringify({ meta: SAMPLE_STATEMENT.meta, lines: [{ orderId: "X" }] }),
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/lines\[0\]/);
  });
});

describe("answer-key binding (rendered figures bind to the committed key)", () => {
  type KeyEntry = {
    detection: string;
    expectedClaimId: string | null;
    expectedRuleId: string | null;
    expectedVerdict: string | null;
  };
  const answerKey = JSON.parse(readFileSync(join(feesDir, "fee-answer-key.json"), "utf8")) as {
    statements: Record<string, { entries: KeyEntry[] }>;
  };

  const KEY_TO_CASE: Record<string, string> = {
    "statement.drifted.json": "drifted",
    "statement.faithful.json": "faithful",
    "statement.cured.json": "cured",
    "statement.conditional.json": "conditional",
  };

  it.each(Object.entries(KEY_TO_CASE))(
    "%s: every deterministic answer-key entry appears in the rendered view",
    (file, caseKey) => {
      const view = FEE_CASES.find((c) => c.key === caseKey)!.view;
      const deterministic = answerKey.statements[file].entries.filter(
        (e) => e.detection === "deterministic",
      );
      for (const entry of deterministic) {
        const row = view.rows.find(
          (r) => r.ruleId === entry.expectedRuleId && r.claimId === entry.expectedClaimId,
        );
        expect(
          row,
          `answer-key entry ${entry.expectedRuleId}/${entry.expectedClaimId} missing from the rendered ${caseKey} view`,
        ).toBeDefined();
        expect(row!.verdict).toBe(entry.expectedVerdict);
      }
      // and the view renders EXACTLY the golden's finding count (no extras).
      const golden = JSON.parse(
        readFileSync(join(feesDir, `expected-report.${caseKey}.json`), "utf8"),
      ) as { findings: unknown[]; ok: boolean };
      expect(view.rows.length).toBe(golden.findings.length);
      expect(view.ok).toBe(golden.ok);
    },
  );

  it("the binding bites: a wrong verdict would be caught", () => {
    const view = FEE_CASES.find((c) => c.key === "drifted")!.view;
    const row = view.rows.find((r) => r.ruleId === "NYC-563.3-a-2")!;
    expect(row.verdict).toBe("violation");
    expect(row.verdictTag).toBe(VERDICT_TAG_DISPLAY.violation);
  });

  it("statement-line receipts resolve for every rendered finding", () => {
    for (const c of FEE_CASES) {
      for (const row of c.view.rows) {
        expect(row.statementLine.length, `${c.key}/${row.key} has an empty statement-line receipt`).toBeGreaterThan(0);
        expect(row.arithmetic.length).toBeGreaterThan(0);
        expect(row.clause).toMatch(/§ 20-563\.3/);
      }
    }
    // A line-tagged claim resolves to the fixture's own label text.
    const drifted = FEE_CASES.find((c) => c.key === "drifted")!.view;
    const bundled = drifted.rows.find((r) => r.claimId.includes("service_and_delivery"))!;
    expect(bundled.statementLine).toContain("Combined service + delivery bundle");
    expect(bundled.statementLine).toContain("ORD-3");
  });
});

describe("the 11 / 6 boundary set-lock (registry ↔ rendered lanes)", () => {
  it("the executable lane is exactly the FEE_RULES registry", () => {
    expect(EXECUTABLE_RULES.map((r) => r.id)).toEqual(FEE_RULES.map((r) => r.id));
    expect(FEE_BOUNDARY.executable).toBe(FEE_RULES.length);
  });

  it("the external-evidence lane is exactly NON_STATEMENT_CHECKABLE (both directions)", () => {
    const rendered = new Set(EXTERNAL_EVIDENCE_RULES.map((r) => r.id));
    const registry = new Set(NON_STATEMENT_CHECKABLE.keys());
    expect(rendered).toEqual(registry);
    expect(FEE_BOUNDARY.external).toBe(NON_STATEMENT_CHECKABLE.size);
    expect(FEE_BOUNDARY.total).toBe(FEE_RULES.length + NON_STATEMENT_CHECKABLE.size);
  });

  it("the set-lock bites: no display row may exist without a registry entry", () => {
    for (const id of Object.keys(EXTERNAL_EVIDENCE_DISPLAY)) {
      expect(NON_STATEMENT_CHECKABLE.has(id), `stray display row ${id}`).toBe(true);
    }
  });

  it("verdict-tag display covers exactly the engine's verdict states", () => {
    expect(Object.keys(VERDICT_TAG_DISPLAY).sort()).toEqual([...FEE_VERDICTS].sort());
  });
});

describe("freshness binding (the rendered as-of is carried by the research record)", () => {
  const ruleTable = readFileSync(join(root, "docs", "research", "uc1-rule-table.md"), "utf8");

  it("the rule-table record carries the rendered as-of date", () => {
    expect(ruleTable).toContain(`**As-of:** ${RULE_TABLE_FRESHNESS.verifiedAsOf}`);
  });

  it("the rendered primary source names LL79, and the record does too", () => {
    expect(RULE_TABLE_FRESHNESS.primarySource).toMatch(/Local Law 79 of 2025/);
    expect(ruleTable).toMatch(/LL79/);
  });
});

describe("fee-surface honesty (jargon-free prose, boundaries stated, meaning kept)", () => {
  const pageSrc = readFileSync(join(root, "app", "fees", "page.tsx"), "utf8");
  const viewSrc = readFileSync(join(root, "components", "fees", "FeesView.tsx"), "utf8");
  const clientSrc = readFileSync(join(root, "components", "fees", "FeePlaygroundClient.tsx"), "utf8");

  it.each([
    ["app/fees/page.tsx", pageSrc],
    ["components/fees/FeesView.tsx", viewSrc],
    ["components/fees/FeePlaygroundClient.tsx", clientSrc],
  ])("%s carries no lab-words / repo paths in its rendered prose", (_name, src) => {
    expect(src).not.toMatch(/\bsimulated\b/i);
    expect(src).not.toMatch(/\bsynthetic\b/i);
    expect(src).not.toMatch(/\bgolden\b/i);
    expect(src).not.toMatch(/\bfixture\b/i);
    expect(src).not.toMatch(/fixtures\//);
    expect(src).not.toMatch(/\bU1\b/);
  });

  it("the page states the honest boundaries: statement-level scope, no-AI, nothing leaves the browser", () => {
    // freeze-reversal 2026-07-20: the retired page copy (statement-level audit / No AI calls /
    // nothing leaves the browser / honestly unresolved) is rebound to the rebuilt chapter-02
    // honest invariants — line-by-line statement scope, local-only compute that sends nothing,
    // and an audit that names its own edge instead of pretending.
    expect(pageSrc).toMatch(/checked line by line/i);
    expect(pageSrc).toMatch(/computed locally/i);
    expect(pageSrc).toMatch(/Nothing is\s+sent anywhere/i);
    expect(pageSrc).toMatch(/An honest audit names its edge/i);
  });

  it("the report view states the invented-example boundary in rendered copy", () => {
    // freeze-reversal 2026-07-20: the retired FeesView footer paragraph ("statements audited
    // here are invented examples…") is gone from the view; its boundary — invented examples vs
    // real published law, plus the bright-line "no real platform statement/feed was audited" —
    // now lives in the /docs "What is real, and what is invented" statement, rebound here at
    // equal strength (the bright-line honesty check survives, at its new home).
    const docsSrc = readFileSync(join(root, "app", "docs", "page.tsx"), "utf8");
    expect(docsSrc).toMatch(/What is real, and what is invented/);
    expect(docsSrc).toMatch(/invented/i);
    expect(docsSrc).toMatch(/real published law/i);
    expect(docsSrc).toMatch(/No real platform feed\s+or statement was audited/i);
  });

  it("display cleaning rewords the internal markers but keeps the provisional meaning", () => {
    const cleanedPlain = cleanFeeCopy(
      'Across the month, delivery fees came to 16.0% of order value — over the 15% limit even on the monthly average. (Depends on the still-open definition of "purchase price", U1.)',
    );
    expect(cleanedPlain).not.toMatch(/\bU1\b/);
    expect(cleanedPlain).toMatch(/Provisional/i);
    const cleanedBase = cleanFeeCopy(
      "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)",
    );
    expect(cleanedBase).not.toMatch(/U1/);
    expect(cleanedBase).toMatch(/\(assumed\)/);
    const cleanedProfessional = cleanFeeCopy(
      "over-cap under the ASSUMED base — PROVISIONAL (U1); violation",
    );
    expect(cleanedProfessional).not.toMatch(/\bU1\b/);
    expect(cleanedProfessional).toMatch(/provisional/i);
  });

  it("the classification display keeps the true scope (as-declared; advisory lane never gates)", () => {
    expect(CLASSIFICATION_DISPLAY).toMatch(/as the platform declared/i);
    expect(CLASSIFICATION_DISPLAY).toMatch(/never decides a verdict/i);
  });
});

describe("prose-figure drift-lock (headline words ride the engine values — batch P1 hardening)", () => {
  const landingSrc = readFileSync(join(root, "app", "page.tsx"), "utf8");
  const feesPageSrc = readFileSync(join(root, "app", "fees", "page.tsx"), "utf8");
  const goldenAcp = JSON.parse(
    readFileSync(join(root, "fixtures", "synthetic-restaurant", "expected-report.acp.json"), "utf8"),
  ) as { findings: unknown[] };

  // v9 takeover (build piece 1, 2026-07-20): the landing's figure prose now
  // renders DERIVED values ({COVERAGE.*}) instead of spelled-out words, so the
  // lock flips form: the source must reference the derived identifiers and
  // must NOT hand-type the figures those identifiers carry. (The fees page
  // keeps its spelled-out lock until piece 3 rebuilds it.)
  it("landing figure prose is derivation-only: derived identifiers present", () => {
    expect(landingSrc).toMatch(/COVERAGE\.findingsTotal/);
    expect(landingSrc).toMatch(/COVERAGE\.errors/);
    expect(landingSrc).toMatch(/COVERAGE\.warns/);
    expect(landingSrc).toMatch(/COVERAGE\.feeRulesTotal/);
    expect(landingSrc).toMatch(/COVERAGE\.feeExternal/);
    expect(goldenAcp.findings.length).toBe(16);
    expect(NON_STATEMENT_CHECKABLE.size).toBe(6);
  });

  it("the report page's heading count is derivation-only too", () => {
    const reportSrc = readFileSync(join(root, "app", "report", "page.tsx"), "utf8");
    expect(reportSrc).toMatch(/spelledCap\(COVERAGE\.findingsTotal\)/);
    expect(reportSrc).not.toMatch(/\bSixteen findings\b/);
  });

  it("landing source hand-types none of the engine figures it narrates", () => {
    // The words that would silently drift if the engine moved: spelled-out or
    // bare-numeral finding/rule counts in prose position.
    for (const banned of [
      /One report\. Sixteen findings\./,
      /\bSixteen findings\b/i,
      /\b16 findings\b/,
      /\bSix fee-cap rules\b/i,
      /\b17 codified rules\b/,
      /\beleven errors\b/i,
      /\b11 errors\b/,
      /\bfive warnings\b/i,
      /\b5 warnings\b/,
    ]) {
      expect(landingSrc, String(banned)).not.toMatch(banned);
    }
  });

  it('"Four example months" matches the committed corpus (fees page, until piece 3)', () => {
    expect(feesPageSrc).toMatch(/Four example months/);
    expect(FEE_CASES.length).toBe(4);
  });
});

describe("refund evidence on cured verdicts (batch P2 fix)", () => {
  it("the cured month's receipt shows the refund amount and date from the statement", () => {
    const cured = FEE_CASES.find((c) => c.key === "cured")!.view;
    const row = cured.rows.find((r) => r.verdict === "cured-by-refund")!;
    expect(row.arithmetic).toMatch(/cured by refund \$\d+\.\d{2} on \d{4}-\d{2}-\d{2}/);
    expect(row.arithmetic).toMatch(/inside the 30-day window/);
  });

  it("the conditional month's receipt states the open window honestly", () => {
    const conditional = FEE_CASES.find((c) => c.key === "conditional")!.view;
    const row = conditional.rows.find(
      (r) => r.verdict === "conditional-pending-refund-window",
    )!;
    expect(row.arithmetic).toMatch(/no covering refund yet — the 30-day window is still open/);
  });
});
