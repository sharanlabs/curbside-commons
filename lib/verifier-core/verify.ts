/**
 * Verification engine — W1 (plan §3, §5 W1; criteria C1/C2/C3).
 *
 * The generic half of "one engine, two packs": walk claims, resolve each against
 * the swappable Reference, run pack-provided detectors, enforce the C2 evidence
 * guard on every finding, sort deterministically, and assemble the report.
 * The engine knows NO domain taxonomy — packs own the detectors and any
 * completeness/unmatched logic; the engine owns evidence discipline, determinism,
 * and report assembly. Zero LLM, zero network, zero clock reads (any "now" must
 * arrive as data so identical inputs give byte-identical reports).
 *
 * Plain: the referee's rulebook-independent machinery — take each claim, look up
 * the truth, ask the domain rules what's wrong, demand receipts for every catch,
 * and write the report the same way every time.
 */
import type { Claim } from "./claim.ts";
import type { Reference, ReferenceMatch, MatchingMode } from "./reference.ts";
import type { Finding } from "./evidence.ts";
import { makeFinding, type FindingInput } from "./guard.ts";
import type { VerifierReport } from "./report.ts";

/**
 * A pack-provided detection rule. Runs on every (claim, match) pair; returns
 * finding inputs (usually 0 or 1). `match` is null when the reference could not
 * resolve the claim — unmatched handling is also a pack decision.
 */
export type Detector = (claim: Claim, match: ReferenceMatch | null) => readonly FindingInput[];

/** Options for a verification run — all report-level facts arrive as data. */
export interface VerifyOptions {
  /** Spec / rule-table / taxonomy version pinned into the report header (C10). */
  readonly specVersion: string;
  /** How claim↔reference matching was performed (C3 label). */
  readonly matchingMode: MatchingMode;
  /** True when any synthetic artifact is involved (C10 honesty surface). */
  readonly simulated: boolean;
}

/**
 * Deterministic finding order: category, then ruleId, then claim id. Stable
 * output ordering is what makes golden-report byte-comparison possible.
 */
export function sortFindings(findings: readonly Finding[]): readonly Finding[] {
  return [...findings].sort(
    (a, b) =>
      (a.category ?? "").localeCompare(b.category ?? "") ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.claim.id.localeCompare(b.claim.id),
  );
}

/**
 * Run detectors over claims against a reference. Every emitted finding passes
 * through {@link makeFinding} (C2: no finding without all four receipts).
 */
export function verifyClaims(
  claims: readonly Claim[],
  reference: Reference,
  detectors: readonly Detector[],
): readonly Finding[] {
  const findings: Finding[] = [];
  for (const claim of claims) {
    const match = reference.resolve(claim);
    for (const detector of detectors) {
      for (const input of detector(claim, match)) {
        findings.push(makeFinding(input));
      }
    }
  }
  return findings;
}

/**
 * Assemble the machine-readable report (C1-consumable). Re-asserts C2 on every
 * finding (belt-and-suspenders for findings built outside verifyClaims, e.g. a
 * pack's completeness sweep), sorts deterministically, and derives `ok`.
 */
export function buildReport(
  findings: readonly Finding[],
  opts: VerifyOptions,
): VerifierReport {
  const validated = findings.map((f) => makeFinding(f));
  const sorted = sortFindings(validated);
  return Object.freeze({
    specVersion: opts.specVersion,
    matchingMode: opts.matchingMode,
    simulated: opts.simulated,
    findings: sorted,
    ok: sorted.length === 0,
  });
}

/**
 * Canonical report serialization — the single stringifier every consumer (CLI,
 * golden fixtures, tests) uses, so byte-identity is meaningful.
 */
export function serializeReport(report: VerifierReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
