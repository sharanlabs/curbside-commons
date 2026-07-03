/**
 * verifier-core — W1 barrel (plan §6, §3).
 *
 * The generic verification engine: claim schema, swappable reference interface,
 * evidence/finding types with the C2 runtime guard, report model, and the
 * deterministic compare/report machinery. Domain logic lives in the packs
 * (lib/packs/*) — the core knows no taxonomy.
 *
 * Plain: the referee's engine room — shapes, receipts discipline, and the
 * always-the-same-way comparison loop. The rulebooks plug in from the packs.
 */
export type { Claim, ClaimSource } from "./claim.ts";
export type { MatchingMode, Reference, ReferenceKind, ReferenceMatch } from "./reference.ts";
export type { Finding, Severity } from "./evidence.ts";
export { SEVERITY_LEVELS } from "./evidence.ts";
export type { VerifierReport } from "./report.ts";
export type { FindingInput } from "./guard.ts";
export { MissingEvidenceError, assertHasEvidence, makeFinding } from "./guard.ts";
export type { Detector, VerifyOptions } from "./verify.ts";
export { buildReport, serializeReport, sortFindings, verifyClaims } from "./verify.ts";

/** Build-stage marker — the engine is live as of the W1 wedge. */
export const VERIFIER_CORE_STATUS = "w1-wedge";
