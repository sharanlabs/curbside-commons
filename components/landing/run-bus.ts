"use client";

/**
 * THE RUN BUS — one publisher, several readers (walkthrough redesign, 2026-08-02).
 *
 * WHY IT EXISTS. The six-station landing splits one run across four places on
 * the page: the workbench takes the inputs (INPUTS), the ticker narrates the
 * check (RUN), the slab renders the verdict (VERDICT), and the delivery station
 * rebuilds the outgoing messages (DELIVERY). They are separated by server-
 * rendered sections, so prop-drilling would force the whole page to become one
 * client component and drag the engine fixtures into the browser bundle with it.
 *
 * WHAT IT IS NOT: a second owner of run state. `AuditWorkbench` remains the ONLY
 * thing that parses input, calls the verifier, and decides what a run means. This
 * module is a notice board — the workbench posts a snapshot, everyone else reads
 * it. Nothing here can start, alter, or re-run an audit.
 *
 * A store rather than a DOM CustomEvent, for one reason that matters: a station
 * scrolled into view AFTER a run has finished still needs the result. An event
 * fires once and is gone; `getSnapshot()` is always current, so a late subscriber
 * renders the run it missed instead of an empty card.
 */
import { useSyncExternalStore } from "react";
import type { VerifierReport } from "@/lib/verifier-core/report";
import type { RunOrigin } from "@/components/playground/verify-in-browser";

/** One line of the ticker — a check that genuinely ran, with its outcome. */
export interface CheckLine {
  /** The claim or row this check was about. */
  readonly id: string;
  /** What was compared, in the engine's own vocabulary. */
  readonly what: string;
  readonly verdict: "OK" | "HELD";
}

export type RunPhase = "idle" | "running" | "done";

export interface RunSnapshot {
  readonly phase: RunPhase;
  /** The verifier's own report — null until a run completes. */
  readonly report: VerifierReport | null;
  /** Which side of the run came from the reader and which from the bundle. */
  readonly origin: RunOrigin | null;
  readonly feedRows: number;
  readonly recordRows: number;
  /** Checks to narrate, derived from the report by the workbench that ran it. */
  readonly checks: readonly CheckLine[];
  readonly error: string | null;
}

export const IDLE_RUN: RunSnapshot = {
  phase: "idle",
  report: null,
  origin: null,
  feedRows: 0,
  recordRows: 0,
  checks: [],
  error: null,
};

let snapshot: RunSnapshot = IDLE_RUN;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

/** Post a new run state. Called by `AuditWorkbench` and by nothing else. */
export function publishRun(next: RunSnapshot): void {
  snapshot = next;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RunSnapshot {
  return snapshot;
}

/**
 * The server renders the IDLE snapshot, always. Every station has a complete
 * idle state built from the bundled pair, so the page tells its whole story
 * before a reader runs anything — and without scripting at all.
 */
function getServerSnapshot(): RunSnapshot {
  return IDLE_RUN;
}

/** Subscribe a station to the current run. */
export function useRun(): RunSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Derive the ticker's lines from a report that actually ran.
 *
 * THE HONESTY CONSTRAINT THIS ENCODES: a HELD line exists only where the engine
 * produced a finding, and carries that finding's own rule id; an OK line exists
 * only for a row that produced NO finding at all. Neither is ever invented to
 * pad the stream — a ticker that shows a check which did not happen is exactly
 * the class of claim this product exists to catch.
 *
 * The stream is a SAMPLE, deliberately: the settle summary beneath it states the
 * true totals for the whole run, so a capped stream never implies a capped audit.
 */
export function deriveChecks(
  report: VerifierReport,
  feedRowIds: readonly string[],
  limits: { readonly ok: number; readonly held: number } = { ok: 3, held: 5 },
): CheckLine[] {
  const held: CheckLine[] = report.findings.slice(0, limits.held).map((f) => ({
    id: f.claim.id,
    what: `${f.claim.field} · ${f.ruleId}`,
    verdict: "HELD" as const,
  }));

  // A row is clean only if NO finding cites it. Finding claim ids are of the
  // form `<rowId>#<field>`, so the row is the part before the separator.
  const flagged = new Set(report.findings.map((f) => f.claim.id.split("#")[0]));
  const ok: CheckLine[] = feedRowIds
    .filter((id) => !flagged.has(id))
    .slice(0, limits.ok)
    .map((id) => ({ id, what: "every checked field agrees with the record", verdict: "OK" as const }));

  // Clean rows first: the check reads as a pass that finds trouble, not a
  // prosecution that opens with the verdict.
  return [...ok, ...held];
}
