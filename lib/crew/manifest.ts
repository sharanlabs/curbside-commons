/**
 * CREW REPLAY MANIFEST — binds a recorded model turn to the exact case it was
 * recorded for (S2-crew CP1; Codex cross-check 2026-10-12 § 4 "replay can use
 * an obsolete answer", § 3 page 5 "a replay manifest binding input, prompt,
 * model, rule, and roster versions"; adopted in the 2026-10-14 decision-log row).
 *
 * Before this, `RecordedModel` keyed on (caseId, member) only: change a case's
 * ask and artifact, keep its id, and the old answer replayed and the safety
 * evaluation passed. Now the orchestrator RECOMPUTES a manifest from the case
 * it is actually running (and the artifact bytes it actually read), and a
 * recorded turn whose stamped digest differs is refused loudly.
 *
 * The manifest (canonical key-sorted JSON, then sha256):
 *  - `artifactPath` + `artifactSha256` — what the run reads (raw bytes);
 *  - `askSha256` — the ask Intake answers (S2-crew addition: the ask is model
 *    input, so an answer recorded for another ask is obsolete);
 *  - `expectedToolCallsDigests` — the call contract, per call `{tool, argsDigest}`;
 *  - `promptVersionIds` — the live prompt pins the L-1 lane-drift lock holds
 *    (copied here, never changed; `evals/crew/crew-replay-manifest.test.ts`
 *    reads the lock file and fails if the two ever disagree);
 *  - `modelId` — `"replay"` for committed offline turns;
 *  - `rosterVersion` — {@link CREW_ROSTER_VERSION};
 *  - `s2` — only on a case that carries the S2 extension: the digest of that
 *    block and of the event log (and orders file) it names. Absent on every
 *    legacy case, so the 20 A2 digests depend on the A2 fields alone.
 *
 * Plain: every saved answer now carries the fingerprint of the exact question
 * it answered. Change the question — the file, the wording, the allowed tools'
 * contract, the prompt version, the team line-up — and the saved answer no
 * longer fits, so the replay stops instead of reusing it.
 */
import { readFileSync } from "node:fs";
import { argsDigest, canonicalJson, sha256Hex } from "./canonical.ts";
import type { CrewCase } from "./types.ts";

/** The crew roster version a manifest is bound to (A2 four seats + the S2 root-cause and impact seats). */
export const CREW_ROSTER_VERSION = "a2+s2-2026-10-31";

/** The model id stamped on committed offline (recorded) turns. */
export const REPLAY_MODEL_ID = "replay";

/**
 * The prompt version ids — the sha256 pins `evals/crew/l1-lane-drift-lock.test.ts`
 * holds for `buildIntakeLivePrompt` / `buildReviewerLivePrompt` on its fixed
 * inputs. READ from that lock, never changed here; a test asserts equality
 * against the lock file's own text.
 */
export const CREW_PROMPT_VERSION_IDS = Object.freeze({
  intake: "31264afad7ff8b724b30a6c08b28ed7f4501df34698a678cb3db7d0d44d0f55c",
  reviewer: "cdc32f318f4cf93d5f14f71c7f40c00ce5c215352439da68dcac90318c175d72",
});

/** The fields a manifest digest is computed over. */
export interface CaseManifest {
  readonly artifactPath: string;
  readonly artifactSha256: string;
  readonly askSha256: string;
  readonly expectedToolCallsDigests: ReadonlyArray<{ readonly tool: string; readonly argsDigest: string }>;
  readonly promptVersionIds: Readonly<{ intake: string; reviewer: string }>;
  readonly modelId: string;
  readonly rosterVersion: string;
  readonly s2?: {
    readonly configSha256: string;
    readonly eventsSha256: string;
    readonly ordersSha256?: string;
  };
}

/** Read a file as raw bytes (the manifest hashes bytes, not decoded text). */
function fileSha256(path: string): string {
  return sha256Hex(readFileSync(path));
}

/**
 * Build the manifest for one case. `artifactBytes` is what the run actually
 * read (the orchestrator passes its own read, so the digest describes the
 * run, not a second read of the disk).
 */
export function buildCaseManifest(crewCase: CrewCase, artifactBytes: Uint8Array, modelId: string): CaseManifest {
  const base = {
    artifactPath: crewCase.inputArtifact.path,
    artifactSha256: sha256Hex(artifactBytes),
    askSha256: sha256Hex(crewCase.ask),
    expectedToolCallsDigests: crewCase.expectedToolCalls.map((c) => ({ tool: c.tool, argsDigest: argsDigest(c.params) })),
    promptVersionIds: CREW_PROMPT_VERSION_IDS,
    modelId,
    rosterVersion: CREW_ROSTER_VERSION,
  };
  if (crewCase.s2 === undefined) return base;
  const s2 = crewCase.s2;
  return {
    ...base,
    s2: {
      configSha256: sha256Hex(canonicalJson(s2)),
      eventsSha256: fileSha256(s2.eventsPath),
      ...(s2.impact?.ordersPath !== undefined ? { ordersSha256: fileSha256(s2.impact.ordersPath) } : {}),
    },
  };
}

/** sha256 of the manifest's canonical (key-sorted) JSON. */
export function manifestDigestOf(manifest: CaseManifest): string {
  return sha256Hex(canonicalJson(manifest));
}

/** Convenience: the digest of a case as it stands on disk (the stamp script and tests use this). */
export function caseManifestDigest(crewCase: CrewCase, modelId: string = REPLAY_MODEL_ID): string {
  return manifestDigestOf(buildCaseManifest(crewCase, readFileSync(crewCase.inputArtifact.path), modelId));
}
