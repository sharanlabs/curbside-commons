/**
 * Draft-quality eval — the MEASUREMENT layer over outreach drafts (resilix grader
 * pattern). Distinct in purpose from the gatekeeper: the gatekeeper is the runtime GATE
 * (PASS/BLOCK one draft before the human sees it); these graders SCORE draft quality per
 * dimension over a corpus, so quality is measurable and regressions are visible (the
 * Eval/Quality surface — the deep-AI showcase). They SHARE the rule definitions with the
 * gate (runGuardrail / scanText / validateDraft) rather than re-implementing them — one
 * source of truth, no divergence; the teeth are proven by the paired corrupted-record
 * tests, not by code independence.
 *
 * Four deterministic dimensions (plan's draft-quality contract):
 *   - structure          schema-valid + well-formed claims.
 *   - state-consistency  every claim matches merchant data; the action + prose never
 *                        assert a step the merchant has not reached.
 *   - policy             no forbidden revenue/impact/urgency claim, no PII.
 *   - no-leakage         the MERCHANT-FACING prose (subject + body) never leaks an internal
 *                        field identifier (snake_case enum token) or discloses an internal
 *                        risk level/score. (The internal risk_explanation/blocker_summary
 *                        legitimately carry those and are never sent to the merchant.)
 *
 * Each grader is paired in the test suite with a deliberately-corrupted draft it must
 * catch — a grader that cannot fail is theater. (These are PLANTED corruptions, not a
 * real model miss; an authentic LLM-caught failure is the separate key-gated live step.)
 */
import { REFERENCE_PLATFORM_NAME } from "@/legacy/activation/lib/core/constants";
import { scanText } from "@/legacy/activation/lib/core/guardrail";
import { validateDraft } from "@/legacy/activation/lib/core/pipeline";
import type { Merchant } from "@/legacy/activation/lib/core/types";
import type { OutreachDraft } from "@/legacy/activation/lib/agents/draft";
import { proseClaimsUnreachedStep, registerLeakFailures } from "@/legacy/activation/lib/agents/state-consistency";

export type GraderId = "structure" | "state-consistency" | "policy" | "no-leakage";

export interface GraderResult {
  grader: GraderId;
  pass: boolean;
  failures: string[];
}

export interface DraftScore {
  results: GraderResult[];
  pass: boolean;
  passed: number;
  total: number;
}

function gradeNoLeakage(draft: OutreachDraft): GraderResult {
  const prose = `${draft.draft_subject} ${draft.draft_body}`;
  const failures = registerLeakFailures(prose).map((f) => `no-leakage:${f}`);
  return { grader: "no-leakage", pass: failures.length === 0, failures };
}

function gradeStructure(draft: OutreachDraft): GraderResult {
  const failures = validateDraft(draft).map((e) => `structure:${e}`);
  if (draft.claims.length === 0) failures.push("no claims");
  for (const c of draft.claims) {
    if (!c.field || c.value === undefined || c.value === null) {
      failures.push(`malformed claim ${JSON.stringify(c)}`);
    }
  }
  return { grader: "structure", pass: failures.length === 0, failures };
}

function gradeStateConsistency(draft: OutreachDraft, merchant: Merchant): GraderResult {
  const failures: string[] = [];
  const m = merchant as unknown as Record<string, unknown>;
  for (const c of draft.claims) {
    const actual = m[c.field];
    if (actual === undefined) {
      failures.push(`claim field "${c.field}" not on merchant`);
      continue;
    }
    if (String(actual) !== String(c.value)) {
      failures.push(`claim ${c.field}=${JSON.stringify(c.value)} != merchant ${JSON.stringify(actual)}`);
    }
  }
  // Structural action check + a TENSE-AWARE prose check (the same product-tier
  // lib/agents/state-consistency the gatekeeper uses — NOT the core's bundled state_mismatch,
  // which over-matches "business verification" on live phrasing). Policy flags scored separately.
  const prose = `${draft.draft_subject} ${draft.draft_body}`;
  if (
    draft.next_best_action !== merchant.next_best_action ||
    proseClaimsUnreachedStep(prose, Number(merchant.steps_completed ?? 0))
  ) {
    failures.push("state_mismatch: action or prose asserts a step the merchant has not reached");
  }
  return { grader: "state-consistency", pass: failures.length === 0, failures };
}

function gradePolicy(draft: OutreachDraft, platformName: string): GraderResult {
  const text = [draft.draft_subject, draft.draft_body, draft.risk_explanation, draft.blocker_summary]
    .map((s) => String(s ?? ""))
    .join(" ");
  const flags = scanText(text, platformName); // forbidden categories only
  return { grader: "policy", pass: flags.length === 0, failures: flags.map((f) => `policy:${f}`) };
}

/** Score one draft across all dimensions. */
export function scoreDraft(
  draft: OutreachDraft,
  merchant: Merchant,
  platformName = REFERENCE_PLATFORM_NAME,
): DraftScore {
  const results = [
    gradeStructure(draft),
    gradeStateConsistency(draft, merchant),
    gradePolicy(draft, platformName),
    gradeNoLeakage(draft),
  ];
  const passed = results.filter((r) => r.pass).length;
  return { results, pass: passed === results.length, passed, total: results.length };
}

export interface CorpusEvalRow {
  merchant_id: string;
  merchant_name: string;
  score: DraftScore;
}

export interface CorpusEvalSummary {
  rows: CorpusEvalRow[];
  allPass: boolean;
  passedDrafts: number;
  totalDrafts: number;
}

/** Score a corpus of (merchant, draft) pairs — the eval lane over the hybrid set. */
export function scoreDraftCorpus(
  pairs: Array<{ merchant: Merchant; draft: OutreachDraft }>,
  platformName = REFERENCE_PLATFORM_NAME,
): CorpusEvalSummary {
  const rows = pairs.map(({ merchant, draft }) => ({
    merchant_id: merchant.merchant_id,
    merchant_name: merchant.merchant_name,
    score: scoreDraft(draft, merchant, platformName),
  }));
  const passedDrafts = rows.filter((r) => r.score.pass).length;
  return {
    rows,
    // An EMPTY corpus is not a pass — `[]` must be FAIL, not vacuously green (Codex P2).
    allPass: rows.length > 0 && passedDrafts === rows.length,
    passedDrafts,
    totalDrafts: rows.length,
  };
}
