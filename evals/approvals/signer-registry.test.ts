/**
 * S2-ledger CP2 — the signer registry and the REVOCATION door (door 5 of eight).
 *
 * Doors, in the frozen order: 1 id match · 2 expiry · 3 replay · 4 signer known ·
 * 5 NOT REVOKED (verification time) · 6 role · 7 signature · 8 subject digest.
 *
 * MUTATION PROOF (lib/approvals/simulator.ts, 2026-10-31): the door-5 `if` block
 * commented out -> RED: the revocation tests (door, ordering, rotation) fail
 * while every pre-existing threat-model test stays green. Restored -> GREEN.
 * Second mutation: the door moved AFTER the role check -> RED on the
 * "revoked + wrong role" ordering test. Exact counts in the return packet.
 */
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadSigners, rotateSigner, toAuthorizedSigners, type SignerRecord } from "@/lib/approvals/signers.ts";
import { createApprovalRequest, signDecision, verifyAndExecute } from "@/lib/approvals/simulator.ts";
import {
  ApprovalError,
  ExpiredError,
  ReplayError,
  RequestMismatchError,
  RoleNotAuthorizedError,
  SignatureInvalidError,
  SignerRevokedError,
  SubjectMismatchError,
  UnauthorizedSignerError,
  type AuthorizedSigner,
  type Clock,
} from "@/lib/approvals/types.ts";
import { walkImports } from "../lib/import-walk.ts";

const clk = (ms: number): Clock => ({ nowMs: () => ms });
const T0 = 1_760_000_000_000;
const TTL = 3_600_000;
const pem = (k: ReturnType<typeof generateKeyPairSync>) => k.publicKey.export({ type: "spki", format: "pem" }).toString();

const keyA = generateKeyPairSync("ed25519");
const keyB = generateKeyPairSync("ed25519");
const record = { caseId: "case-1", terminal: "recommendation" as const, n: 1 };

function flow(roster: ReadonlyMap<string, AuthorizedSigner>, over: { nowMs?: number; nonce?: string; role?: string } = {}) {
  const request = createApprovalRequest(record, { clock: clk(T0), ttlMs: TTL, nonce: over.nonce ?? "n1" });
  const decision = signDecision(request, "approve", keyA.privateKey, "key-a", clk(T0 + 1000));
  const opts = { clock: clk(over.nowMs ?? T0 + 2000), authorizedSigners: roster, seenNonces: new Set<string>(), requiredRole: over.role ?? "approver" };
  return { request, decision, opts };
}
const roster = (revokedAtMs: number | null, role = "approver") =>
  new Map<string, AuthorizedSigner>([["key-a", { publicKey: keyA.publicKey, role, revokedAtMs }]]);

describe("revocation door (5)", () => {
  it("a never-revoked signer (null, and the field absent) still executes", () => {
    for (const r of [roster(null), new Map([["key-a", { publicKey: keyA.publicKey, role: "approver" }]])]) {
      const f = flow(r);
      expect(verifyAndExecute(f.request, f.decision, f.opts).executed).toBe(true);
    }
  });

  it("signed BEFORE revocation but VERIFIED after is refused (verification-time rule)", () => {
    const f = flow(roster(T0 + 1500), { nowMs: T0 + 2000 }); // signed at T0+1000 < revoked T0+1500 <= now
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(SignerRevokedError);
    expect(f.opts.seenNonces.size).toBe(0); // a refused attempt burns nothing
  });

  it("boundary: revoked AT the verification instant is refused; one ms earlier still executes", () => {
    const at = T0 + 2000;
    const early = flow(roster(at), { nowMs: at - 1 });
    expect(verifyAndExecute(early.request, early.decision, early.opts).executed).toBe(true);
    const on = flow(roster(at), { nowMs: at });
    expect(() => verifyAndExecute(on.request, on.decision, on.opts)).toThrow(SignerRevokedError);
  });

  it("typed error keeps the family: ApprovalError with code SIGNER_REVOKED", () => {
    const f = flow(roster(T0));
    try {
      verifyAndExecute(f.request, f.decision, f.opts);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ApprovalError);
      expect((e as SignerRevokedError).code).toBe("SIGNER_REVOKED");
      expect((e as Error).name).toBe("SignerRevokedError");
    }
  });
});

describe("the eight-door ORDER (earlier door always wins)", () => {
  it("1 beats everything: wrong request id", () => {
    const f = flow(roster(T0), { nowMs: T0 + TTL + 1 });
    const other = { ...f.decision, requestId: "apr-other" };
    expect(() => verifyAndExecute(f.request, other, f.opts)).toThrow(RequestMismatchError);
  });
  it("2 beats revoked: expired AND revoked -> ExpiredError", () => {
    const f = flow(roster(T0), { nowMs: T0 + TTL });
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(ExpiredError);
  });
  it("3 beats revoked: replayed AND revoked -> ReplayError", () => {
    const f = flow(roster(T0));
    f.opts.seenNonces.add("n1");
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(ReplayError);
  });
  it("4 beats revoked: an unknown key is Unauthorized, not Revoked", () => {
    const f = flow(new Map([["someone-else", { publicKey: keyA.publicKey, role: "approver", revokedAtMs: T0 }]]));
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(UnauthorizedSignerError);
  });
  it("5 beats 6: revoked AND wrong role -> SignerRevokedError", () => {
    const f = flow(roster(T0, "observer"));
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(SignerRevokedError);
  });
  it("5 beats 7: revoked AND bad signature -> SignerRevokedError", () => {
    const f = flow(roster(T0));
    const forged = signDecision(f.request, "approve", keyB.privateKey, "key-a", clk(T0 + 1000));
    expect(() => verifyAndExecute(f.request, forged, f.opts)).toThrow(SignerRevokedError);
  });
  it("6 still bites for an active signer with the wrong role", () => {
    const f = flow(roster(null, "observer"));
    expect(() => verifyAndExecute(f.request, f.decision, f.opts)).toThrow(RoleNotAuthorizedError);
  });
  it("7 still bites for an active signer with a forged signature; 8 for a foreign digest", () => {
    const f = flow(roster(null));
    const forged = signDecision(f.request, "approve", keyB.privateKey, "key-a", clk(T0 + 1000));
    expect(() => verifyAndExecute(f.request, forged, f.opts)).toThrow(SignatureInvalidError);
    const foreign = createApprovalRequest({ ...record, n: 2 }, { clock: clk(T0), ttlMs: TTL, nonce: "n1" });
    const alt = { ...foreign, requestId: f.request.requestId };
    const d = signDecision(alt, "approve", keyA.privateKey, "key-a", clk(T0 + 1000));
    expect(() => verifyAndExecute(f.request, d, f.opts)).toThrow(SubjectMismatchError);
  });
});

describe("signer registry (signers.json + loadSigners)", () => {
  const good = (over: Partial<Record<keyof SignerRecord, unknown>> = {}) => ({
    signerId: "s1", role: "approver", publicKeyPem: pem(keyA), enrolledAt: "2026-10-31T00:00:00Z", revokedAt: null, ...over,
  });

  it("the committed registry loads, has an active approver, and a revoked rotated-out key", () => {
    const recs = loadSigners();
    expect(recs.some((r) => r.role === "approver" && r.revokedAt === null)).toBe(true);
    expect(recs.some((r) => r.revokedAt !== null)).toBe(true);
    const ros = toAuthorizedSigners(recs);
    expect(ros.get("owner-key-0")?.revokedAtMs).toBe(Date.parse("2026-10-31T00:00:00Z"));
    expect(ros.get("owner-key-1")?.revokedAtMs).toBeNull();
    expect(readFileSync(join(process.cwd(), "lib/approvals/signers.json"), "utf8")).not.toMatch(/PRIVATE/);
  });

  it.each([
    ["not an array", {}, /must be an array/],
    ["record not an object", [1], /must be an object/],
    ["unknown field", [good({ extra: 1 })], /unknown field "extra"/],
    ["empty signerId", [good({ signerId: "" })], /signerId/],
    ["missing role", [good({ role: undefined })], /role/],
    ["bad PEM", [good({ publicKeyPem: "nope" })], /not a valid Ed25519/],
    ["wrong key type", [good({ publicKeyPem: pem(generateKeyPairSync("x25519") as never) })], /not a valid Ed25519/],
    ["bad enrolledAt", [good({ enrolledAt: "yesterday" })], /enrolledAt/],
    ["revokedAt before enrolledAt", [good({ revokedAt: "2026-01-01T00:00:00Z" })], /before enrolledAt/],
    ["revokedAt missing", [good({ revokedAt: undefined })], /needs "revokedAt"/],
    ["duplicate signerId", [good(), good()], /duplicate signerId/],
  ])("loadSigners rejects loudly: %s", (_n, raw, re) => {
    expect(() => loadSigners(raw)).toThrow(re);
  });

  it("rotation = enrol new + revoke old: old key is refused after, new key approves", () => {
    const before = loadSigners([good({ signerId: "key-a" })]);
    const after = rotateSigner(before, "key-a", { signerId: "key-b", role: "approver", publicKeyPem: pem(keyB) }, "2026-11-01T00:00:00Z");
    expect(after.find((r) => r.signerId === "key-a")?.revokedAt).toBe("2026-11-01T00:00:00Z");
    expect(after.find((r) => r.signerId === "key-b")?.revokedAt).toBeNull();
    const ros = toAuthorizedSigners(after);
    const req = createApprovalRequest(record, { clock: clk(Date.parse("2026-11-02T00:00:00Z")), ttlMs: TTL, nonce: "rot" });
    const now = Date.parse("2026-11-02T00:00:00Z") + 2000;
    const oldD = signDecision(req, "approve", keyA.privateKey, "key-a", clk(now - 1000));
    const newD = signDecision(req, "approve", keyB.privateKey, "key-b", clk(now - 1000));
    const mk = () => ({ clock: clk(now), authorizedSigners: ros, seenNonces: new Set<string>(), requiredRole: "approver" });
    expect(() => verifyAndExecute(req, oldD, mk())).toThrow(SignerRevokedError);
    expect(verifyAndExecute(req, newD, mk()).signerKeyId).toBe("key-b");
    expect(() => rotateSigner(after, "key-a", { signerId: "key-c", role: "approver", publicKeyPem: pem(keyB) }, "2026-11-03T00:00:00Z")).toThrow(/already revoked/);
    expect(() => rotateSigner(before, "ghost", { signerId: "k", role: "approver", publicKeyPem: pem(keyB) }, "2026-11-03T00:00:00Z")).toThrow(/unknown signer/);
    expect(() => rotateSigner(before, "key-a", { signerId: "key-a", role: "approver", publicKeyPem: pem(keyB) }, "2026-11-03T00:00:00Z")).toThrow(/duplicate/);
  });

  it("egress tooth: signers.ts and the simulator reach no network / model / file module", () => {
    const root = process.cwd();
    for (const f of ["lib/approvals/signers.ts", "lib/approvals/simulator.ts"]) {
      const { violations } = walkImports(join(root, f), { root });
      expect(violations, f).toEqual([]);
    }
  });
});
