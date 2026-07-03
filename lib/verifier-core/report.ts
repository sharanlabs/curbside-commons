/**
 * Report model — W0 STUB (plan §3 "the report IS a document", S-9 / C4 / C10).
 *
 * The verifier's output: one page, evidence-cited, spec-version pinned. W0 fixes
 * the machine-readable shape; rendering (web + machine JSON) lands in W3. No
 * report-building logic here.
 *
 * Plain: the one-page result — every catch with its receipts, stamped with the
 * spec version it was checked against, and labeled if anything is simulated.
 */
import type { Finding } from "./evidence.ts";
import type { MatchingMode } from "./reference.ts";

/** Machine-readable verifier report (CI-usable, C1). */
export interface VerifierReport {
  /** Spec / rule-table version pinned in the header of every report (C10). */
  readonly specVersion: string;
  /**
   * C3: every report labels whether claim↔reference matching was
   * synthetic-controlled (shared IDs) or real-world (entity resolution).
   * Required by construction so an unlabeled report cannot exist.
   */
  readonly matchingMode: MatchingMode;
  /** True if any synthetic artifact is involved — honesty surface (C10). */
  readonly simulated: boolean;
  /** All evidence-cited findings; an empty array means no drift detected. */
  readonly findings: readonly Finding[];
  /** Overall pass/fail; the CLI derives its non-zero exit from this (C1). */
  readonly ok: boolean;
}
