/**
 * Demo transcript types — D1 (plan §5 D1). Browser-safe: type-only imports, no
 * `node:fs`, no clock, no LLM — so the web renderer can consume a committed
 * transcript JSON without pulling the fs-touching engine (transcript.ts) into
 * the client bundle. The $0 import-graph eval relies on this separation.
 *
 * Plain: the fixed shape of the scripted demo's script — the actor's choice, the
 * beats it plays out, and the receipts each beat carries — with no machinery in it.
 */
import type { FindingRow } from "../report-view.ts";

/** One rendered finding line — reuses the report view-model's row shape (C2). */
export type DemoFinding = FindingRow;

/** What the SOR-blind actor read off the surface and chose (beats a + b). */
export interface ActorSelection {
  /** Human-readable scripted intent (deterministic, seeded in code). */
  readonly intent: string;
  /** The item title the actor set out to order. */
  readonly targetTitle: string;
  /** The serving-row id the actor chose (as keyed by the surface). */
  readonly selectedItemId: string;
  /** The title as the surface served it. */
  readonly selectedTitle: string;
  /** The price the actor read off the surface (the value it would transact on). */
  readonly observedPrice: string;
  readonly observedCurrency: string;
  /** The availability the actor read off the surface. */
  readonly observedAvailability: string;
}

/** A structured, computed verdict for a beat (drives badges + text; never narrated). */
export interface DemoVerdict {
  /** true when the beat's derived state is "clean"; drives color, not copy. */
  readonly ok: boolean;
  /** A short, computed label (e.g. "DRIFT ON SELECTED ITEM", "PASS"). */
  readonly label: string;
}

export type DemoBeatId =
  | "actor-reads"
  | "actor-selects"
  | "verifier-finds"
  | "conformance-foil";

/** One beat of the transcript. `plain` leads (C4); `lines` are the technical detail. */
export interface DemoBeat {
  readonly id: DemoBeatId;
  /** Technical heading. */
  readonly title: string;
  /** C4 plain-words lead — leads the beat in both renderers. */
  readonly plain: string;
  /** Deterministic technical detail lines (pre-formatted, no clock/locale). */
  readonly lines: readonly string[];
  /** Evidence-cited findings shown on this beat (verifier + foil beats). */
  readonly findings?: readonly DemoFinding[];
  /** Computed verdict(s) for this beat — derived from real results, never hardcoded. */
  readonly verdicts?: readonly DemoVerdict[];
  /**
   * Optional annotation slot for future owner-gated Gemini color (plan §5 D1,
   * C7 "Gemini variant = non-load-bearing color"). UNUSED now — always absent in
   * the committed transcript; present in the type so adding color later needs no
   * shape change.
   */
  readonly annotation?: string;
}

/** The full deterministic demo transcript both renderers consume. */
export interface DemoTranscript {
  /** C7 verbatim demo claim — the only headline. */
  readonly claim: string;
  /** The actor's mandatory honesty label. */
  readonly actorLabel: string;
  /** C10 honesty surface — always true for this demo. */
  readonly simulated: true;
  /** C10 — the pinned spec/taxonomy version, carried from the verifier report. */
  readonly specVersion: string;
  /** What the SOR-blind actor read and chose. */
  readonly selection: ActorSelection;
  /** Full-report finding count (so a filtered view never implies "only N found"). */
  readonly totalFindingCount: number;
  /** The four beats, in play order. */
  readonly beats: readonly DemoBeat[];
}
