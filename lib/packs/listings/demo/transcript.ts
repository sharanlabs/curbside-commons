/**
 * Demo transcript engine — D1 (plan §5 D1; criteria C7, C10; council condition 5).
 *
 * ONE deterministic engine that produces the typed {@link DemoTranscript} both
 * renderers consume. Every verdict in the transcript is COMPUTED from a real
 * verifier result, never narrated:
 *  - beats (a)+(b): the SOR-blind {@link selectFromSurface} actor reads the feed
 *    and selects (it takes the surface at face value);
 *  - beat (c): the verifier runs on the SAME feed vs the SOR via the real
 *    {@link runListingsVerification}; the beat shows the evidence-cited findings
 *    for exactly the selected row, labeled as a FILTERED view against the full
 *    report count (never implying the verifier found only those);
 *  - beat (d): the conformance-foil — the real {@link runUcpConformance} PASSES a
 *    spec-valid document, and the real truth leg on the SAME document catches the
 *    price lie. Both verdicts are read off the returned results.
 *
 * The demo ends at agent-selects-the-drifted-item (slice-C cut): there is NO
 * fake checkout. Because it calls conformance.ts (which reads pinned schemas from
 * `node:fs`), this module is NOT browser-safe — the CLI, the generator, and the
 * evals use it; the web renders the COMMITTED transcript JSON instead.
 *
 * Plain: the script-writer. It plays the agent's choice, then runs the real
 * checker twice — once on the menu the agent trusted, once on a differently-
 * shaped-but-official document — and writes down exactly what each check returned.
 */
import type { AcpFeed } from "../acp-feed.ts";
import type { SyntheticCatalog } from "../types.ts";
import type { UcpSearchResponse } from "../ucp-wire.ts";
import type { VerifierReport } from "../../../verifier-core/index.ts";
import type { Finding } from "../../../verifier-core/evidence.ts";
import { acpFeedToClaims } from "../adapters.ts";
import { ucpSearchResponseToClaims } from "../ucp-wire.ts";
import { runListingsVerification } from "../run.ts";
import { runUcpConformance } from "../conformance.ts";
import { toReportView, type FindingRow } from "../report-view.ts";
import { selectFromSurface } from "./actor.ts";
import {
  DEMO_ACTOR_LABEL,
  DEMO_BEAT,
  DEMO_CLAIM,
  DEMO_FOIL_LINE,
} from "./copy.ts";
import type { ActorSelection, DemoBeat, DemoTranscript } from "./types.ts";

/** Inputs to the engine — parsed documents, so the engine is pure over its data
 * (mutate the feed and the verdicts change: the beats-compute red-green). */
export interface DemoInputs {
  /** The DRIFTED ACP serving copy the actor reads (mutate to faithful → verdicts change). */
  readonly feed: AcpFeed;
  /** The merchant system-of-record (the verifier's truth side; NOT the actor's). */
  readonly sor: SyntheticCatalog;
  /** A spec-valid UCP catalog-response document that still lies (the foil). */
  readonly conformanceDoc: UcpSearchResponse;
  /** Optional pinned-schema dir override (tests); defaults to the shipped corpus. */
  readonly conformanceSchemaDir?: string;
}

/** The findings on exactly one serving row — as claim-row owner OR resolved truth row. */
function findingsForRow(report: VerifierReport, itemId: string): FindingRow[] {
  const filtered: VerifierReport = {
    ...report,
    findings: report.findings.filter(
      (f: Finding) => f.claim.id.split("#")[0] === itemId || f.referenceRowId === itemId,
    ),
  };
  return [...toReportView(filtered).rows];
}

function actorReadsBeat(selection: ActorSelection): DemoBeat {
  return {
    id: "actor-reads",
    title: `${DEMO_BEAT.actorRead.title} — ${DEMO_ACTOR_LABEL}`,
    plain: DEMO_BEAT.actorRead.plain,
    lines: [
      `intent: ${selection.intent}`,
      `source read: the published ACP serving copy only (no system-of-record access)`,
    ],
  };
}

function actorSelectsBeat(selection: ActorSelection): DemoBeat {
  return {
    id: "actor-selects",
    title: DEMO_BEAT.actorSelect.title,
    plain: DEMO_BEAT.actorSelect.plain,
    lines: [
      `selected item: "${selection.selectedTitle}" (row id ${selection.selectedItemId})`,
      `read off the surface: price ${selection.observedPrice} ${selection.observedCurrency} · availability ${selection.observedAvailability}`,
      `the agent is now ready to order at that price — the demo stops here (no checkout).`,
    ],
    verdicts: [{ ok: true, label: "SELECTED (from the surface)" }],
  };
}

function verifierFindsBeat(
  selection: ActorSelection,
  rows: FindingRow[],
  totalFindingCount: number,
): DemoBeat {
  const k = rows.length;
  const noun = k === 1 ? "finding" : "findings";
  return {
    id: "verifier-finds",
    title: DEMO_BEAT.verifierFind.title,
    plain: DEMO_BEAT.verifierFind.plain,
    lines: [
      // FILTERED-view label: this beat shows only the selected row's findings — the
      // full-report count is stated so nothing implies the verifier found only these.
      `${k} ${noun} for the selected item ("${selection.selectedTitle}"); full report: ${totalFindingCount} findings across the whole copy.`,
    ],
    findings: rows,
    verdicts: [
      {
        ok: k === 0,
        label:
          k === 0
            ? "NO DRIFT ON THE SELECTED ITEM"
            : "DRIFT ON THE SELECTED ITEM — the agent could not have seen it",
      },
    ],
  };
}

function conformanceFoilBeat(conf: VerifierReport, truthRows: FindingRow[]): DemoBeat {
  const conformant = conf.ok; // derived from the real conformance result
  const truthFindings = truthRows.length;
  return {
    id: "conformance-foil",
    title: DEMO_BEAT.conformanceFoil.title,
    plain: DEMO_BEAT.conformanceFoil.plain,
    lines: [
      // The beat's line, computed: the two legs on the SAME document disagree.
      `${DEMO_FOIL_LINE} — conformance: ${conformant ? "PASS" : "FAIL"} (spec-shape); truth: ${truthFindings} finding(s) vs the system-of-record.`,
    ],
    findings: truthRows,
    verdicts: [
      { ok: conformant, label: conformant ? "CONFORMANT (spec-valid)" : "NON-CONFORMANT" },
      {
        ok: truthFindings === 0,
        label: truthFindings === 0 ? "TRUE vs SOR" : "FALSE vs SOR (still lies)",
      },
    ],
  };
}

/** Build the deterministic demo transcript from parsed inputs. */
export function buildDemoTranscript(inputs: DemoInputs): DemoTranscript {
  const { feed, sor, conformanceDoc, conformanceSchemaDir } = inputs;

  // Beats (a)+(b): the SOR-blind actor reads the surface and selects.
  const selection = selectFromSurface(feed);

  // Beat (c): the verifier runs on the SAME surface vs the SOR (computed).
  const report = runListingsVerification(acpFeedToClaims(feed), sor);
  const selectedRows = findingsForRow(report, selection.selectedItemId);

  // Beat (d): conformance-foil — same document, two questions (both computed).
  const conf = runUcpConformance(conformanceDoc, {
    op: "search",
    schemaDir: conformanceSchemaDir,
  });
  const truth = runListingsVerification(ucpSearchResponseToClaims(conformanceDoc), sor);
  const truthRows = [...toReportView(truth).rows];

  return {
    claim: DEMO_CLAIM,
    actorLabel: DEMO_ACTOR_LABEL,
    simulated: true,
    specVersion: report.specVersion,
    selection,
    totalFindingCount: report.findings.length,
    beats: [
      actorReadsBeat(selection),
      actorSelectsBeat(selection),
      verifierFindsBeat(selection, selectedRows, report.findings.length),
      conformanceFoilBeat(conf, truthRows),
    ],
  };
}
