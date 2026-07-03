/**
 * verifier-core — W0 skeleton barrel (plan §6).
 *
 * Honest STUBS only: claim schema, swappable reference interface, evidence /
 * finding types, and the report model. No drift logic yet — W1 fills these.
 *
 * Plain: the empty frame of the verifier engine. The shapes are fixed so the
 * packs can plug in; the actual checking is built next (W1).
 */
export type { Claim, ClaimSource } from "./claim";
export type { MatchingMode, Reference, ReferenceKind, ReferenceMatch } from "./reference";
export type { Finding, Severity } from "./evidence";
export { SEVERITY_LEVELS } from "./evidence";
export type { VerifierReport } from "./report";

/** Skeleton marker — verifier-core is scaffolded but carries no logic yet. */
export const VERIFIER_CORE_STATUS = "skeleton-w0";
