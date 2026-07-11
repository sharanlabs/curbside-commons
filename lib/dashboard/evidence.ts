/**
 * Truth-engine dashboard evidence (plan v3.3 E1a).
 *
 * ANTI-FABRICATION CONTRACT: every figure on the /eval /metrics /cost dashboard
 * surfaces comes from this module, and this module gets each figure one of two ways:
 *   1. COMPUTED — derived at build time from a committed artifact imported below
 *      (the figure cannot drift from the file); or
 *   2. PINNED — a constant transcribed from a committed record, with per-figure
 *      provenance {file, frozenAt, date}, and BOUND to its source by
 *      evals/packs/dashboard-evidence.test.ts (the test re-reads the source file
 *      and fails if the rendered figure is not literally supported by it).
 *
 * provenance.frozenAt = the git commit that froze the source file, derived live
 * via `git log -1 -- <file>` on 2026-07-11 (never from memory). These are
 * historical, immutable references — not volatile counts.
 */

import l1Matrix from "@/evals/crew/gold/l1-live-matrix.json";
import expectedAcpReport from "@/fixtures/synthetic-restaurant/expected-report.acp.json";
import { FEE_RULES, NON_STATEMENT_CHECKABLE } from "@/lib/packs/fees/rules";

export type Provenance = {
  /** Repo-relative path of the committed source artifact. */
  file: string;
  /** The git commit that froze the source (derived live, 2026-07-11). */
  frozenAt: string;
  /** The date the underlying event/record happened. */
  date: string;
};

export type PinnedFigure = {
  value: string;
  label: string;
  provenance: Provenance;
};

/* ------------------------------------------------------------------ */
/* Fee-line classifier calibration (the earned label + its honest arc) */
/* ------------------------------------------------------------------ */

export const CALIBRATION_PROVENANCE: Provenance = {
  file: "docs/fee-classifier-recalibration-status.md",
  frozenAt: "90e6fd3",
  date: "2026-07-09",
};

export const CALIBRATION_DEFER_PROVENANCE: Provenance = {
  file: "docs/fee-classifier-calibration-status.md",
  frozenAt: "4275aff",
  date: "2026-07-05",
};

/**
 * PINNED from the RESULTS table of the recalibration status doc (all six
 * pre-registered floors cleared; bound by dashboard-evidence.test.ts).
 */
export const CALIBRATION = {
  /** The first run's honest outcome — kept on the surface, not hidden. */
  deferRun: {
    score: "20/21",
    outcome: "label DEFERRED",
    reason: "enhanced_service_fee recall 3/4 = 0.75 < the 0.80 floor (conjunctive rule)",
    date: "2026-07-05",
    provenance: CALIBRATION_DEFER_PROVENANCE,
  },
  retryRun: {
    score: "21/21",
    accuracy: "1.0000",
    macroPrecision: "1.0000",
    cohensKappa: "1.0000",
    flipRate: "0.0476",
    baseline: "19/21",
    calls: "84",
    cost: "$0",
    model: "openai/gpt-oss-120b",
    ranAt: "2026-07-09T12:14:55Z",
    provenance: CALIBRATION_PROVENANCE,
  },
  earnedLabel: "calibrated (fresh held-out, pre-registered floors, one pass — 2026-07-09)",
  snapshotFile: "lib/data/fee-classifier-recalibration.snapshot.json",
  lockTestFile: "evals/gold/fee-classifier-recalibration.lock.test.ts",
  scopeNote:
    "What this claims — and all it claims: on a synthetic, simulated, n=21 fresh held-out gold set, under floors committed before the run, the live lane beat the deterministic baseline with a perfect score. It says nothing about real-world platform statements.",
} as const;

/* --------------------------------------------------- */
/* L-1 agent crew live run — COMPUTED from the matrix   */
/* --------------------------------------------------- */

export const L1_PROVENANCE: Provenance = {
  file: "evals/crew/gold/l1-live-matrix.json",
  frozenAt: "24f8cda",
  date: "2026-07-07",
};

type L1Row = {
  caseId: string;
  member: string;
  terminal: string;
  terminalClass: string;
  safetyPass: boolean;
  safetyViolations: string[];
  classMatch: boolean;
};

const l1Rows = l1Matrix.matrix as L1Row[];

export const L1 = {
  model: l1Matrix.model as string,
  startedAt: l1Matrix.startedAt as string,
  cases: l1Rows.length,
  degraded: l1Matrix.degradedCount as number,
  allSafetyPass: l1Rows.every((r) => r.safetyPass),
  allClassMatch: l1Rows.every((r) => r.classMatch),
  perMember: (["intake", "audit", "evidence", "reviewer"] as const).map((member) => {
    const rows = l1Rows.filter((r) => r.member === member);
    return {
      member,
      cases: rows.length,
      safetyPass: rows.filter((r) => r.safetyPass).length,
      classMatch: rows.filter((r) => r.classMatch).length,
    };
  }),
  /** Labels are classification outcomes, not marketing: only the two
   *  model-directed members earned "agent" (live floors); the other two are
   *  deterministic workflows by design. */
  memberLabels: {
    intake: "agent (live-run floors cleared)",
    reviewer: "agent (live-run floors cleared)",
    audit: "deterministic workflow",
    evidence: "deterministic workflow",
  },
  lockTestFile: "evals/crew/l1-live-lock.test.ts",
  provenance: L1_PROVENANCE,
} as const;

/* ------------------------------------------------------- */
/* Verifier engine measurables — COMPUTED from lib imports  */
/* ------------------------------------------------------- */

export const ENGINE = {
  /** 11 statement predicates + 6 registered non-checkable = the 17-rule table. */
  feeRulePredicates: FEE_RULES.length,
  feeRulesNonCheckable: NON_STATEMENT_CHECKABLE.size,
  feeRulesTotal: FEE_RULES.length + NON_STATEMENT_CHECKABLE.size,
  feeRulesProvenance: {
    file: "lib/packs/fees/rules.ts",
    frozenAt: "896ab59",
    date: "2026-07-04",
  } satisfies Provenance,

  /** PINNED (recomputed by the evidence test from the pinned schema dir). */
  ucpSchemaCount: 78,
  ucpSpecVersion: "2026-04-08",
  ucpProvenance: {
    file: "fixtures/ucp-schemas/2026-04-08/PROVENANCE.json",
    frozenAt: "1d0697e",
    date: "2026-07-03",
  } satisfies Provenance,

  /** COMPUTED from the committed golden report the /report and /demo pages render. */
  demoFindings: (expectedAcpReport.findings as Array<{ severity: string }>).length,
  demoErrors: (expectedAcpReport.findings as Array<{ severity: string }>).filter(
    (f) => f.severity === "error",
  ).length,
  demoWarns: (expectedAcpReport.findings as Array<{ severity: string }>).filter(
    (f) => f.severity === "warn",
  ).length,
  demoReportProvenance: {
    file: "fixtures/synthetic-restaurant/expected-report.acp.json",
    frozenAt: "5a81440",
    date: "2026-07-03",
  } satisfies Provenance,
} as const;

/* --------------------------------------------------------- */
/* $0 / offline enforcement — the machine proofs, by test file */
/* --------------------------------------------------------- */

export const ZERO_COST_PROOFS: ReadonlyArray<{
  claim: string;
  enforcedBy: string;
  note: string;
}> = [
  {
    claim: "The verifier runtime makes no AI calls and no network calls",
    enforcedBy: "evals/crew/crew-import-walk.test.ts",
    note: "transitive import-graph walk: no module reachable from the orchestrator matches a banned LLM/network pattern",
  },
  {
    claim: "The crew reaches the engine only through the typed tool registry",
    enforcedBy: "evals/crew/crew-import-walk.test.ts",
    note: "every repo-relative import from lib/crew/** targets lib/crew/** or lib/tools/** only",
  },
  {
    claim: "Delivery builders cannot import product modules (zero-import contract)",
    enforcedBy: "evals/delivery/delivery.test.ts",
    note: "machine-enforced module-source assertion; builders construct payloads and cannot send",
  },
];

/* ----------------------------------------- */
/* Live-leg run records (committed, historical) */
/* ----------------------------------------- */

export const RUN_RECORDS: ReadonlyArray<PinnedFigure> = [
  {
    value: "20/20 scored · 0 degraded · $0 (Groq)",
    label: "L-1 crew live run — pre-registered floors, one pass",
    provenance: L1_PROVENANCE,
  },
  {
    value: "21/21 · all six floors · $0 (Groq)",
    label: "Fee-line classifier recalibration — fresh held-out split",
    provenance: CALIBRATION_PROVENANCE,
  },
  {
    value: "HTTP 200 · one-shot · eight safety controls",
    label: "L-2 recorded owner-armed Slack send (the only send in history)",
    provenance: {
      file: "docs/reviews/l2-slack-one-shot-2026-07-09T15-06-01-054Z.md",
      frozenAt: "2cd7eaa",
      date: "2026-07-09",
    },
  },
  {
    value: "sha256-identical artifacts · episodic run",
    label: "L-3 n8n runtime lane — one recorded execution",
    provenance: {
      file: "docs/reviews/l3-n8n-runtime-run-2026-07-07.md",
      frozenAt: "24f8cda",
      date: "2026-07-07",
    },
  },
];

/** The recorded legacy Gemini spend (shown on /legacy/eval; cited here for the cost ledger). */
export const RECORDED_LEGACY_GEMINI = {
  totalUsd: "$0.0042",
  cap: "$5.00",
  provenance: {
    file: "legacy/activation/lib/data/live-samples.snapshot.json",
    frozenAt: "1b04766",
    date: "2026-06-20",
  } satisfies Provenance,
} as const;
