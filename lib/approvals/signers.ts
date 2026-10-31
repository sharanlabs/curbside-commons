/**
 * The SIGNER REGISTRY (Wave 2, S2-ledger): who may sign an approval, what role
 * they hold, when their key was enrolled, and when (if ever) it was revoked.
 *
 * The committed registry is `./signers.json`: public keys only. The three keys in
 * it are the public halves of throwaway Ed25519 keypairs whose private halves were
 * not kept, so the committed file can verify nothing and sign nothing; real use
 * (and every test) enrols keys generated at runtime. SIMULATED per RULES §4.
 *
 * This module touches no file and no network: `loadSigners` validates a parsed
 * JSON value (the statically imported fixture by default), so it can sit inside
 * the egress-proven approvals graph.
 *
 * ROTATION = enrol the new key, revoke the old one ({@link rotateSigner}).
 * REVOCATION IS A VERIFICATION-TIME RULE: the simulator's door 5 refuses a
 * decision whenever, at the moment it is verified, `now >= revokedAt` — even if
 * the decision was signed before the revocation. A key withdrawn today does not
 * keep approving yesterday's paperwork after the withdrawal.
 *
 * Plain: a guest list with a "withdrawn on" date per name. Once the date passes,
 * the name is refused at the door, whenever the note it signed was written.
 */
import { createPublicKey } from "node:crypto";

import signersFixture from "./signers.json" with { type: "json" };
import type { AuthorizedSigner } from "./types.ts";

export interface SignerRecord {
  readonly signerId: string;
  readonly role: string;
  readonly publicKeyPem: string;
  /** ISO-8601 instant. */
  readonly enrolledAt: string;
  /** ISO-8601 instant, or null while the key is active. */
  readonly revokedAt: string | null;
}

function iso(v: unknown, where: string): number {
  if (typeof v !== "string" || v.length === 0) throw new Error(`signers: ${where} must be an ISO-8601 string`);
  const ms = Date.parse(v);
  if (!Number.isFinite(ms)) throw new Error(`signers: ${where} is not a valid ISO-8601 instant: ${JSON.stringify(v)}`);
  return ms;
}

/** Validate a parsed registry LOUDLY: any malformed record throws, naming the record and field. */
export function loadSigners(raw: unknown = signersFixture): SignerRecord[] {
  if (!Array.isArray(raw)) throw new Error("signers: registry must be an array");
  const seen = new Set<string>();
  return raw.map((r: unknown, i: number) => {
    const at = `record ${i}`;
    if (r === null || typeof r !== "object" || Array.isArray(r)) throw new Error(`signers: ${at} must be an object`);
    const o = r as Record<string, unknown>;
    const allowed = new Set(["signerId", "role", "publicKeyPem", "enrolledAt", "revokedAt"]);
    for (const k of Object.keys(o)) if (!allowed.has(k)) throw new Error(`signers: ${at} has unknown field "${k}"`);
    for (const k of ["signerId", "role", "publicKeyPem"] as const) {
      if (typeof o[k] !== "string" || (o[k] as string).length === 0) throw new Error(`signers: ${at} needs a non-empty string "${k}"`);
    }
    const signerId = o.signerId as string;
    if (seen.has(signerId)) throw new Error(`signers: duplicate signerId "${signerId}"`);
    seen.add(signerId);
    try {
      const key = createPublicKey(o.publicKeyPem as string);
      if (key.asymmetricKeyType !== "ed25519") throw new Error(`type ${String(key.asymmetricKeyType)}`);
    } catch (e) {
      throw new Error(`signers: ${at} ("${signerId}") publicKeyPem is not a valid Ed25519 public key (${(e as Error).message})`);
    }
    const enrolled = iso(o.enrolledAt, `${at} enrolledAt`);
    let revokedAt: string | null = null;
    if (o.revokedAt !== null && o.revokedAt !== undefined) {
      const revoked = iso(o.revokedAt, `${at} revokedAt`);
      if (revoked < enrolled) throw new Error(`signers: ${at} ("${signerId}") revokedAt is before enrolledAt`);
      revokedAt = o.revokedAt as string;
    } else if (o.revokedAt === undefined) {
      throw new Error(`signers: ${at} needs "revokedAt" (an ISO string, or null while active)`);
    }
    return {
      signerId,
      role: o.role as string,
      publicKeyPem: o.publicKeyPem as string,
      enrolledAt: o.enrolledAt as string,
      revokedAt,
    };
  });
}

/** Build the simulator's roster (keyId -> key, role, revocation) from validated records. */
export function toAuthorizedSigners(records: readonly SignerRecord[]): Map<string, AuthorizedSigner> {
  return new Map(
    records.map((r) => [
      r.signerId,
      {
        publicKey: createPublicKey(r.publicKeyPem),
        role: r.role,
        revokedAtMs: r.revokedAt === null ? null : Date.parse(r.revokedAt),
      } satisfies AuthorizedSigner,
    ]),
  );
}

/**
 * Rotation as data: enrol `next` and revoke `oldSignerId` at `atIso`. Pure; the
 * caller commits the returned registry. Refuses to rotate an unknown or
 * already-revoked signer, or to reuse an existing signerId.
 */
export function rotateSigner(
  records: readonly SignerRecord[],
  oldSignerId: string,
  next: Omit<SignerRecord, "revokedAt" | "enrolledAt">,
  atIso: string,
): SignerRecord[] {
  const old = records.find((r) => r.signerId === oldSignerId);
  if (!old) throw new Error(`signers: cannot rotate unknown signer "${oldSignerId}"`);
  if (old.revokedAt !== null) throw new Error(`signers: "${oldSignerId}" is already revoked`);
  const out = [
    ...records.map((r) => (r.signerId === oldSignerId ? { ...r, revokedAt: atIso } : r)),
    { ...next, enrolledAt: atIso, revokedAt: null },
  ];
  return loadSigners(out); // re-validates: duplicate ids, bad key, date order
}
