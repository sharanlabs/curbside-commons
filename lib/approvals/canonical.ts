/**
 * E3 — THE canonical serializations (one for the signing payload, one for the
 * subject-digest content). Signature malleability via key reordering,
 * whitespace, or type confusion is a real bug class, so:
 *
 * - `canonicalSigningBytes` serializes EXACTLY the six
 *   {@link SigningPayloadFields} keys, in SORTED key order, via
 *   `JSON.stringify` with no whitespace — and REJECTS non-finite
 *   `decidedAtMs` (JSON would render `null`, silently changing the signed
 *   bytes' meaning).
 * - `canonicalContentJson` recursively sorts every object's keys, so the
 *   subjectDigest of a crew record is independent of property insertion
 *   order.
 *
 * Plain: before anything is signed or fingerprinted it is written out in one
 * fixed, boring, always-identical way — so "the same content" always means
 * the same bytes, and nobody can sneak a different meaning past the
 * signature by shuffling fields.
 */
import type { SigningPayloadFields } from "./types.ts";

/** Canonical bytes the Ed25519 signature covers (sorted keys, compact JSON). */
export function canonicalSigningBytes(fields: SigningPayloadFields): Buffer {
  if (!Number.isFinite(fields.decidedAtMs)) {
    throw new Error(`canonicalSigningBytes: decidedAtMs must be finite, got ${fields.decidedAtMs}`);
  }
  const sorted = {
    decidedAtMs: fields.decidedAtMs,
    decision: fields.decision,
    nonce: fields.nonce,
    requestId: fields.requestId,
    signerKeyId: fields.signerKeyId,
    subjectDigest: fields.subjectDigest,
  };
  return Buffer.from(JSON.stringify(sorted), "utf8");
}

/** Recursively key-sorted compact JSON of arbitrary content (for subjectDigest). */
export function canonicalContentJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalContentJson(v)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalContentJson(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
