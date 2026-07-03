import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  applyCorpusDrift,
  buildFaithfulFeed,
  buildUcpSearchResponse,
  generateCatalog,
  acpFeedToClaims,
  runListingsVerification,
} from "@/lib/packs/listings";
import { buildDemoTranscript } from "@/lib/packs/listings/demo/transcript";
import { DEMO_ACTOR_LABEL, DEMO_CLAIM } from "@/lib/packs/listings/demo/copy";
import type { UcpSearchResponse } from "@/lib/packs/listings/ucp-wire";
import type { DemoBeat } from "@/lib/packs/listings/demo/types";

/**
 * D1 — the demo BEATS COMPUTE, they do not narrate (plan §5 D1; RULES §4). Every
 * verdict in the transcript is derived from a real verifier/conformance result:
 * mutate the input and the verdicts CHANGE accordingly. This is the natural
 * red-green — a hardcoded verdict string would survive the mutation and fail here.
 */

const root = process.cwd();
const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithfulFeed = buildFaithfulFeed(sor);
const { feed: driftedFeed } = applyCorpusDrift(faithfulFeed, sor);

// The shipped conformant-but-false doc LIES about a price; a faithful UCP doc
// built from the same SOR does not. Both are spec-valid (both pass conformance).
const lyingDoc = JSON.parse(
  readFileSync(
    join(root, "fixtures", "ucp-conformance-ci", "valid", "conformant-but-false.json"),
    "utf8",
  ),
) as UcpSearchResponse;
const faithfulDoc = buildUcpSearchResponse(sor);

function beat(beats: readonly DemoBeat[], id: DemoBeat["id"]): DemoBeat {
  const b = beats.find((x) => x.id === id);
  if (!b) throw new Error(`no beat ${id}`);
  return b;
}

describe("D1 beats compute: the drifted surface yields drift verdicts", () => {
  const t = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: lyingDoc });

  it("the verifier beat flags drift on the selected item (computed, not narrated)", () => {
    const b = beat(t.beats, "verifier-finds");
    expect(b.findings && b.findings.length).toBeGreaterThanOrEqual(1);
    expect(b.verdicts?.[0].ok).toBe(false);
  });

  it("the filtered view states the FULL report count (never implies only-N-found)", () => {
    const report = runListingsVerification(acpFeedToClaims(driftedFeed), sor);
    expect(t.totalFindingCount).toBe(report.findings.length);
    const b = beat(t.beats, "verifier-finds");
    expect(b.lines.join(" ")).toContain(`full report: ${report.findings.length} findings`);
  });

  it("the conformance-foil PASSES conformance yet the truth leg still catches the lie", () => {
    const b = beat(t.beats, "conformance-foil");
    expect(b.verdicts?.[0].ok).toBe(true); // conformant (spec-valid)
    expect(b.verdicts?.[1].ok).toBe(false); // false vs SOR
    expect(b.findings && b.findings.length).toBeGreaterThanOrEqual(1);
  });
});

describe("D1 beats compute: mutate the input → the verdicts change", () => {
  it("the FAITHFUL feed makes the same selected item show NO drift (verdict flips)", () => {
    // The actor selects the SAME item on both feeds (it is in-stock on both);
    // the price it reads legitimately differs (that IS the drift), so only the
    // verifier's verdict flips — a hardcoded 'DRIFT' verdict would not flip here.
    const drifted = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: lyingDoc });
    const faithful = buildDemoTranscript({ feed: faithfulFeed, sor, conformanceDoc: lyingDoc });

    expect(drifted.selection.selectedItemId).toBe(faithful.selection.selectedItemId);
    // The surface lied about the price to this same agent (drifted vs faithful).
    expect(drifted.selection.observedPrice).not.toBe(faithful.selection.observedPrice);
    expect(beat(drifted.beats, "verifier-finds").verdicts?.[0].ok).toBe(false);
    expect(beat(faithful.beats, "verifier-finds").verdicts?.[0].ok).toBe(true);
    expect(beat(faithful.beats, "verifier-finds").findings ?? []).toHaveLength(0);
  });

  it("a FAITHFUL conformance doc makes the foil's truth verdict flip to TRUE vs SOR", () => {
    const lying = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: lyingDoc });
    const honest = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: faithfulDoc });

    // Conformance passes in both (both spec-valid); only truth changes.
    expect(beat(lying.beats, "conformance-foil").verdicts?.[0].ok).toBe(true);
    expect(beat(honest.beats, "conformance-foil").verdicts?.[0].ok).toBe(true);
    expect(beat(lying.beats, "conformance-foil").verdicts?.[1].ok).toBe(false);
    expect(beat(honest.beats, "conformance-foil").verdicts?.[1].ok).toBe(true);
  });
});

describe("D1 transcript honesty + determinism", () => {
  const t = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: lyingDoc });

  it("carries the C7 verbatim claim and the mandated actor label", () => {
    expect(t.claim).toBe(DEMO_CLAIM);
    expect(t.actorLabel).toBe(DEMO_ACTOR_LABEL);
    expect(t.simulated).toBe(true);
  });

  it("is deterministic — identical inputs give deep-equal transcripts", () => {
    const again = buildDemoTranscript({ feed: driftedFeed, sor, conformanceDoc: lyingDoc });
    expect(again).toStrictEqual(t);
  });

  it("has exactly the four beats in play order, and no annotation is set yet", () => {
    expect(t.beats.map((b) => b.id)).toStrictEqual([
      "actor-reads",
      "actor-selects",
      "verifier-finds",
      "conformance-foil",
    ]);
    expect(t.beats.every((b) => b.annotation === undefined)).toBe(true);
  });
});
