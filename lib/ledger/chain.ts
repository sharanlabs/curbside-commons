/**
 * THE RUN LEDGER — append-only JSON-lines, hash-chained (Wave 2, S2-ledger).
 *
 * One line per recorded step of a run: what went in (a hash of the input bytes),
 * which rule and model versions judged it, what was recommended, where it was
 * routed, and who approved it. Each line carries the hash of the line before it
 * (`prevHash`) and its own hash, so editing, deleting or re-ordering any line
 * breaks every line after it.
 *
 * PURE over strings and arrays: this module never reads a file, never reads a
 * clock (the caller supplies `at`), never touches the network. File reads and
 * appends live ONLY in `./fs.ts`, so this core can be proven egress-free by an
 * import walk (evals/approvals/ledger.test.ts).
 *
 * WHAT A HASH CHAIN CAN AND CANNOT DO (Codex 2026-10-12 cross-check, page 5):
 * a chain alone detects an edit in the middle, but whoever can rewrite the whole
 * file can recompute every hash, and whoever can cut the tail leaves a chain
 * that still verifies. The defence is a TRUSTED CHECKPOINT: `checkpoint(text)`
 * returns `{ seq, hash }` for the latest line, and an OPERATOR RECORDS IT OUT OF
 * BAND (a commit, a ticket, a note in a different system) — never in the ledger
 * file itself. `verify(text, checkpoint)` then fails when the ledger is shorter
 * than the checkpoint or when the line at the checkpoint's `seq` no longer has
 * the checkpoint's `hash`. With no checkpoint, `verify` proves internal
 * consistency only; truncation of the tail is invisible without one.
 *
 * The genesis `prevHash` is the sha256 of a committed constant string
 * ({@link GENESIS_CHECKPOINT}): the first line is chained to something public,
 * not to an empty value anyone could fake.
 *
 * Plain: a notebook where every page quotes the fingerprint of the page before
 * it. Tearing out or rewriting a page shows. Tearing off the LAST pages only
 * shows if someone wrote the last fingerprint down somewhere else, which is what
 * the checkpoint is for.
 */
import { createHash } from "node:crypto";

import { canonicalContentJson } from "../approvals/canonical.ts";

/** The committed trusted-checkpoint constant the chain starts from. */
export const GENESIS_CHECKPOINT = "curbside-commons/run-ledger/genesis/v1";

/** sha256 hex of a UTF-8 string or raw bytes. */
export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** The `prevHash` of the first line: sha256 of {@link GENESIS_CHECKPOINT}. */
export const GENESIS_PREV_HASH: string = sha256Hex(GENESIS_CHECKPOINT);

/** Hash caller-supplied input bytes into the `inputsHash` field. */
export function hashInputs(bytes: string | Uint8Array): string {
  return sha256Hex(bytes);
}

/** The three rule versions a run was judged under (caller-supplied strings). */
export interface RuleVersions {
  readonly listingsSpec: string;
  readonly feesSpec: string;
  readonly ucpPin: string;
}

/** One seat's model. `model` is an id, "replay" (recorded run) or "DEFER" (seat deferred). */
export interface ModelVersion {
  readonly seat: string;
  readonly model: string;
}

/** The approval recorded against a run, if any. */
export interface LedgerApproval {
  readonly signerId: string;
  readonly decision: string;
  readonly requestId: string;
}

/** What a caller supplies; sequence number, links and hash are computed. */
export interface LedgerEntryInput {
  /** Caller-supplied clock string (the library never reads a clock). */
  readonly at: string;
  readonly runId: string;
  readonly scenarioId: string | null;
  /** sha256 hex over the caller-supplied input bytes (see {@link hashInputs}). */
  readonly inputsHash: string;
  readonly ruleVersions: RuleVersions;
  readonly modelVersions: readonly ModelVersion[];
  /** Opaque JSON: the ledger records it, never interprets it. */
  readonly recommendations: readonly unknown[];
  readonly route: string | null;
  readonly approval: LedgerApproval | null;
}

/** A full ledger line. */
export interface LedgerEntry extends LedgerEntryInput {
  readonly seq: number;
  readonly prevHash: string;
  readonly hash: string;
}

/** What an operator records out of band. */
export interface LedgerCheckpoint {
  readonly seq: number;
  readonly hash: string;
}

export interface VerifyResult {
  readonly ok: boolean;
  readonly failedAtSeq?: number;
  readonly reason?: string;
}

/** The hash of an entry: sha256 over canonical key-sorted JSON of the entry WITHOUT `hash`. */
export function entryHash(entry: Omit<LedgerEntry, "hash">): string {
  return sha256Hex(canonicalContentJson(entry));
}

const INPUT_STRING_FIELDS = ["at", "runId", "inputsHash"] as const;

function assertInput(input: LedgerEntryInput): void {
  for (const f of INPUT_STRING_FIELDS) {
    if (typeof input[f] !== "string" || input[f].length === 0) {
      throw new Error(`ledger: "${f}" must be a non-empty string`);
    }
  }
  if (input.scenarioId !== null && typeof input.scenarioId !== "string") {
    throw new Error('ledger: "scenarioId" must be a string or null');
  }
  if (input.route !== null && typeof input.route !== "string") {
    throw new Error('ledger: "route" must be a string or null');
  }
  const rv = input.ruleVersions;
  if (!rv || typeof rv.listingsSpec !== "string" || typeof rv.feesSpec !== "string" || typeof rv.ucpPin !== "string") {
    throw new Error('ledger: "ruleVersions" needs string listingsSpec, feesSpec and ucpPin');
  }
  if (!Array.isArray(input.modelVersions)) throw new Error('ledger: "modelVersions" must be an array');
  for (const m of input.modelVersions) {
    if (!m || typeof m.seat !== "string" || typeof m.model !== "string") {
      throw new Error('ledger: every modelVersions item needs string seat and model');
    }
  }
  if (!Array.isArray(input.recommendations)) throw new Error('ledger: "recommendations" must be an array');
  const a = input.approval;
  if (a !== null && (!a || typeof a.signerId !== "string" || typeof a.decision !== "string" || typeof a.requestId !== "string")) {
    throw new Error('ledger: "approval" must be null or { signerId, decision, requestId } strings');
  }
}

function splitLines(text: string): string[] {
  if (text === "") return [];
  const parts = text.split("\n");
  // A well-formed ledger ends with exactly one newline; the last part is then "".
  if (parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/** Parse every line (no verification). Throws on an unparseable line, naming its index. */
export function parseLines(text: string): LedgerEntry[] {
  return splitLines(text).map((line, i) => {
    try {
      return JSON.parse(line) as LedgerEntry;
    } catch {
      throw new Error(`ledger: line ${i} is not valid JSON`);
    }
  });
}

/**
 * Append one entry. Reads only the LAST existing line to learn `seq` and the
 * link; it does not re-verify the history (that is {@link verify}'s job).
 * Returns the full new text, newline-terminated.
 */
export function appendLine(existingText: string, input: LedgerEntryInput): string {
  assertInput(input);
  if (existingText !== "" && !existingText.endsWith("\n")) {
    throw new Error("ledger: existing text does not end with a newline (partial last line)");
  }
  const lines = splitLines(existingText);
  let seq = 0;
  let prevHash = GENESIS_PREV_HASH;
  if (lines.length > 0) {
    let last: LedgerEntry;
    try {
      last = JSON.parse(lines[lines.length - 1]) as LedgerEntry;
    } catch {
      throw new Error("ledger: the last existing line is not valid JSON; refusing to chain onto it");
    }
    if (!Number.isInteger(last.seq) || typeof last.hash !== "string") {
      throw new Error("ledger: the last existing line has no seq/hash; refusing to chain onto it");
    }
    seq = last.seq + 1;
    prevHash = last.hash;
  }
  const body = {
    seq,
    at: input.at,
    runId: input.runId,
    scenarioId: input.scenarioId,
    inputsHash: input.inputsHash,
    ruleVersions: input.ruleVersions,
    modelVersions: input.modelVersions,
    recommendations: input.recommendations,
    route: input.route,
    approval: input.approval,
    prevHash,
  };
  const entry: LedgerEntry = { ...body, hash: entryHash(body) };
  return `${existingText}${canonicalContentJson(entry)}\n`;
}

/**
 * Verify the chain. Fails on: a partial last line, an unparseable line, a wrong
 * `seq`, a broken `prevHash` link, a rewritten entry (hash no longer matches),
 * and — when a checkpoint is given — a ledger that stops at or before the
 * checkpoint's seq, or whose line at that seq no longer carries its hash.
 */
export function verify(text: string, checkpoint?: LedgerCheckpoint): VerifyResult {
  if (text !== "" && !text.endsWith("\n")) {
    return { ok: false, failedAtSeq: splitLines(text).length - 1, reason: "last line is not newline-terminated (partial write or tail edit)" };
  }
  const lines = splitLines(text);
  let prev = GENESIS_PREV_HASH;
  const hashes: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let e: LedgerEntry;
    try {
      e = JSON.parse(lines[i]) as LedgerEntry;
    } catch {
      return { ok: false, failedAtSeq: i, reason: `line ${i} is not valid JSON` };
    }
    if (e === null || typeof e !== "object" || typeof e.hash !== "string" || typeof e.prevHash !== "string") {
      return { ok: false, failedAtSeq: i, reason: `line ${i} is not a ledger entry (no hash / prevHash)` };
    }
    if (e.seq !== i) {
      return { ok: false, failedAtSeq: i, reason: `line ${i} claims seq ${String(e.seq)}; expected ${i} (line removed, inserted or reordered)` };
    }
    if (e.prevHash !== prev) {
      return { ok: false, failedAtSeq: i, reason: `seq ${i} prevHash does not match the previous entry's hash (broken link)` };
    }
    const { hash, ...rest } = e;
    if (entryHash(rest as Omit<LedgerEntry, "hash">) !== hash) {
      return { ok: false, failedAtSeq: i, reason: `seq ${i} content does not match its hash (entry was rewritten)` };
    }
    hashes.push(hash);
    prev = hash;
  }
  if (checkpoint !== undefined) {
    if (hashes.length <= checkpoint.seq) {
      return {
        ok: false,
        failedAtSeq: checkpoint.seq,
        reason: `ledger has ${hashes.length} entries but the trusted checkpoint is at seq ${checkpoint.seq} (truncated)`,
      };
    }
    if (hashes[checkpoint.seq] !== checkpoint.hash) {
      return {
        ok: false,
        failedAtSeq: checkpoint.seq,
        reason: `seq ${checkpoint.seq} no longer matches the trusted checkpoint hash (history rewritten at or before the checkpoint)`,
      };
    }
  }
  return { ok: true };
}

/**
 * The checkpoint of the latest line: what an OPERATOR RECORDS OUT OF BAND
 * (a commit message, a ticket, another system) so a later `verify` can detect
 * truncation. Throws on an empty ledger (nothing to attest). Does not verify.
 */
export function checkpoint(text: string): LedgerCheckpoint {
  const lines = splitLines(text);
  if (lines.length === 0) throw new Error("ledger: cannot checkpoint an empty ledger");
  const last = JSON.parse(lines[lines.length - 1]) as LedgerEntry;
  return { seq: last.seq, hash: last.hash };
}
