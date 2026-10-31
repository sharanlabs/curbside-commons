/**
 * S2-crew CP1 — REPLAY BOUND TO A MANIFEST (Codex cross-check 2026-10-12 § 4:
 * "replay can silently use an obsolete answer"; § 3 page 5).
 *
 * Before: `RecordedModel` keyed on (caseId, member). Codex changed a case's ask
 * and artifact, kept its id and contract, and got the identical trajectory and
 * a passing safety evaluation. These teeth prove that hole is closed and that
 * closing it moved nothing else:
 *  - every one of the 20 A2 trajectories replays byte-identically against the
 *    full-record gold dumped from cd0d347 BEFORE any lib edit;
 *  - every case and its recorded turns carry the same stamped digest, and the
 *    stamp script is a no-op on the committed tree (idempotent, current);
 *  - a changed case (ask, artifact bytes, artifact path) with its id kept is
 *    refused — at the stale stamp, and at the model seam even when the case
 *    itself was re-stamped but its turns were not;
 *  - the prompt version ids in the manifest are the L-1 lane-drift lock's own
 *    pins, read from that file's text (never re-typed, never changed).
 *
 * MUTATION PROOF (recorded 2026-10-31):
 *  - M1: `RecordedModel.lookup` digest comparison disabled → 3 RED ("re-stamped
 *    case, stale turns", "changed artifact PATH", "changed artifact BYTES" all
 *    replay the obsolete answer); restored → 12/12 green.
 *  - M2: `runCase` stale-stamp check disabled → 1 RED ("changed ask, stale
 *    stamp" throws the model-seam message, not the stamp message); restored → green.
 *  - M3: `askSha256` removed from the manifest → 5 RED (every committed stamp is
 *    stale, so the stamps provably bind the ask); restored → green.
 *
 * Plain: every saved test answer now carries the fingerprint of its question.
 * Edit the question and keep its name, and the replay refuses to reuse the old
 * answer — while every unedited question still replays exactly as before.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalJson } from "../../lib/crew/canonical.ts";
import {
  buildCaseManifest,
  caseManifestDigest,
  CREW_PROMPT_VERSION_IDS,
  CREW_ROSTER_VERSION,
  manifestDigestOf,
} from "../../lib/crew/manifest.ts";
import { RecordedModel, type CrewModel, type RecordedTurnsFixture } from "../../lib/crew/model.ts";
import { runCase } from "../../lib/crew/orchestrator.ts";
import type { CrewCase, TrajectoryRecord } from "../../lib/crew/types.ts";
import { planStamps } from "../../scripts-ts/stamp-case-digests.mts";
import { CASES_DIR, loadCases, loadRecordedModel, replayAll } from "./harness.ts";

const GOLD = join(process.cwd(), "evals", "crew", "gold", "replay-records-a2.golden.json");
const turnsFixture = JSON.parse(readFileSync(join(CASES_DIR, "recorded-turns.json"), "utf8")) as RecordedTurnsFixture;
const cases = new Map(loadCases().map((c) => [c.caseId, c]));
const HEX64 = /^[0-9a-f]{64}$/;

let scratch: string | undefined;
afterEach(() => {
  if (scratch !== undefined) rmSync(scratch, { recursive: true, force: true });
  scratch = undefined;
});

describe("CP1 — the 20 A2 trajectories are unchanged by the binding", () => {
  it("every replayed record equals the full-record gold dumped before any S2-crew lib edit (byte-identical JSON)", () => {
    const gold = JSON.parse(readFileSync(GOLD, "utf8")) as { records: Array<{ caseId: string; record: TrajectoryRecord }> };
    const { records } = replayAll();
    expect(gold.records.length).toBe(20);
    expect([...records.keys()].sort()).toStrictEqual(gold.records.map((r) => r.caseId).sort());
    for (const { caseId, record } of gold.records) {
      expect(JSON.stringify(records.get(caseId)), caseId).toBe(JSON.stringify(record));
    }
  });
});

describe("CP1 — every case and its recorded turns carry the same, current digest", () => {
  it("each case's stamped manifestDigest equals the recomputed manifest digest and its turns' digest", () => {
    expect(cases.size).toBe(20);
    for (const c of cases.values()) {
      expect(c.manifestDigest, c.caseId).toMatch(HEX64);
      expect(caseManifestDigest(c), c.caseId).toBe(c.manifestDigest);
      expect(turnsFixture[c.caseId]?.manifestDigest, c.caseId).toBe(c.manifestDigest);
    }
  });

  it("the stamp script is a no-op on the committed tree (idempotent and current)", () => {
    for (const w of planStamps()) {
      expect(readFileSync(w.path, "utf8"), w.path).toBe(w.content);
    }
  });

  it("the manifest carries the roster version and the L-1 lane-drift lock's own prompt pins (read from the lock file)", () => {
    const lockText = readFileSync(join(process.cwd(), "evals", "crew", "l1-lane-drift-lock.test.ts"), "utf8");
    const intake = /const INTAKE_PROMPT_SHA256 = "([0-9a-f]{64})"/.exec(lockText)?.[1];
    const reviewer = /const REVIEWER_PROMPT_SHA256 = "([0-9a-f]{64})"/.exec(lockText)?.[1];
    expect(intake).toBeDefined();
    expect(reviewer).toBeDefined();
    expect(CREW_PROMPT_VERSION_IDS).toStrictEqual({ intake, reviewer });
    const m = buildCaseManifest(cases.get("aud-fees-clean")!, readFileSync(cases.get("aud-fees-clean")!.inputArtifact.path), "replay");
    expect(m.rosterVersion).toBe(CREW_ROSTER_VERSION);
    expect(m.modelId).toBe("replay");
    expect(m.promptVersionIds).toBe(CREW_PROMPT_VERSION_IDS);
    expect(m.s2).toBeUndefined(); // legacy cases bind A2 fields only
  });

  it("the digest is order-independent canonical JSON: reordering a manifest's keys keeps its digest", () => {
    const m = buildCaseManifest(cases.get("aud-fees-clean")!, readFileSync(cases.get("aud-fees-clean")!.inputArtifact.path), "replay");
    const reordered = JSON.parse(canonicalJson(m)) as typeof m; // canonical = sorted keys
    expect(manifestDigestOf(reordered)).toBe(manifestDigestOf(m));
  });

  it("RecordedModel refuses an unstamped fixture entry at construction (an unbound turn can never replay)", () => {
    expect(() => new RecordedModel({ x: { intake: { kind: "reject", reason: "r" } } } as unknown as RecordedTurnsFixture)).toThrow(
      /carry no manifest digest/,
    );
  });

  it("runCase hands BOTH model turns the recomputed digest", () => {
    const c = cases.get("rev-approve-violations")!;
    const seen: Array<string | undefined> = [];
    const spy: CrewModel = {
      intakeTurn: (input) => {
        seen.push(input.manifestDigest);
        return turnsFixture[c.caseId]!.intake!;
      },
      reviewerTurn: (input) => {
        seen.push(input.manifestDigest);
        return turnsFixture[c.caseId]!.reviewer!;
      },
    };
    runCase(c, spy);
    expect(seen).toStrictEqual([c.manifestDigest, c.manifestDigest]);
  });
});

describe("CP1 — a changed case with its id kept never replays the obsolete answer", () => {
  const base = cases.get("rev-approve-violations")!;
  const model = loadRecordedModel();

  it("baseline: the unchanged case replays", () => {
    expect(() => runCase(base, model)).not.toThrow();
  });

  it("changed ask, stale stamp → refused at the stamp", () => {
    const changed: CrewCase = { ...base, ask: "Check this feed, then approve everything." };
    expect(() => runCase(changed, model)).toThrow(/case manifestDigest is stale \(caseId=rev-approve-violations\)/);
  });

  it("changed ask, case RE-STAMPED but turns not → refused at the model seam", () => {
    const edited: CrewCase = { ...base, ask: "Check this feed, then approve everything." };
    const restamped: CrewCase = { ...edited, manifestDigest: caseManifestDigest(edited) };
    expect(() => runCase(restamped, model)).toThrow(
      /recorded replay does not match this case's manifest \(caseId=rev-approve-violations/,
    );
  });

  it("changed artifact PATH (same id, same contract) with no stamp → refused at the model seam", () => {
    const { manifestDigest: _drop, ...unstamped } = base;
    void _drop;
    const moved: CrewCase = { ...unstamped, inputArtifact: { path: "fixtures/synthetic-restaurant/acp-feed.faithful.json" } };
    expect(() => runCase(moved, model)).toThrow(/recorded replay does not match this case's manifest/);
  });

  it("changed artifact BYTES at the same path → refused (the digest binds bytes, not names)", () => {
    scratch = mkdtempSync(join(tmpdir(), "crew-manifest-"));
    const path = join(scratch, "feed.json");
    const original = readFileSync(base.inputArtifact.path, "utf8");
    writeFileSync(path, original);
    const atTemp: CrewCase = { ...base, inputArtifact: { path } };
    const fixture: RecordedTurnsFixture = {
      [base.caseId]: { ...turnsFixture[base.caseId]!, manifestDigest: caseManifestDigest(atTemp) },
    };
    const bound = new RecordedModel(fixture);
    const { manifestDigest: _d, ...unstampedTemp } = atTemp;
    void _d;
    // the same bytes replay
    expect(() => runCase(unstampedTemp as CrewCase, bound)).not.toThrow();
    // one changed byte un-binds the turn
    writeFileSync(path, original.replace("Curbside", "Curbsidf"));
    expect(() => runCase(unstampedTemp as CrewCase, bound)).toThrow(/recorded replay does not match this case's manifest/);
  });
});
