/**
 * CREW CANONICAL JSON + DIGESTS — the one place the crew turns a value into
 * the bytes it hashes (moved here from `orchestrator.ts` in S2-crew so the
 * replay manifest and the call contract share one implementation; the
 * orchestrator re-exports {@link argsDigest} unchanged, byte-for-byte).
 *
 * Canonical form: arrays keep their order, object keys are sorted by code
 * unit, then `JSON.stringify` with no whitespace. Two values with the same
 * content always hash the same, whatever order their keys were written in.
 *
 * Plain: before the crew compares two things by fingerprint, it writes both
 * out in one fixed order, so a reshuffled-but-identical answer still matches
 * and a changed one never does.
 */
import { createHash } from "node:crypto";

/** Recursively key-sort a JSON value (arrays keep their order). */
export function canonicalize(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonicalize);
  if (v !== null && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1));
    return Object.fromEntries(entries.map(([k, val]) => [k, canonicalize(val)]));
  }
  return v;
}

/** The canonical (key-sorted, whitespace-free) JSON text of a value. */
export function canonicalJson(v: unknown): string {
  return JSON.stringify(canonicalize(v));
}

/** sha256 hex of a string (utf8) or raw bytes. */
export function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/** sha256 of the canonical JSON of a params object — the §6 argument digest. */
export function argsDigest(params: Readonly<Record<string, unknown>>): string {
  return sha256Hex(canonicalJson(params));
}
