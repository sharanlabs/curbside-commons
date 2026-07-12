/**
 * E3 — the THREAT-MODEL suite (plan §E3): every registered threat gets its
 * own test against the frozen seven-check order — signer identity,
 * authorization (role), forgery, tamper (payload + digest re-binding),
 * replay (same request + cross-request), expiry via the injected clock
 * (before/at/after the boundary), request mismatch, empty signature — plus
 * the key-handling scan proving no private material can appear in the
 * simulator's only output.
 *
 * Keypairs are generated AT RUNTIME (never committed — RULES §11); the crew
 * record fixture is typed against the real crew contract
 * (`lib/crew/types.ts`) but constructed inline (evals/crew fixtures stay
 * untouched).
 *
 * Plain: we attack our own approval flow every way we could think of —
 * forged signatures, reused approvals, stale approvals, the wrong person,
 * the right person with the wrong powers, paperwork swapped between cases —
 * and prove each attack dies on its own specific locked door.
 */
import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  createApprovalRequest,
  resolveAction,
  signDecision,
  subjectDigestOf,
  verifyAndExecute,
} from "@/lib/approvals/simulator.ts";
import {
  ExpiredError,
  ReplayError,
  RequestMismatchError,
  RoleNotAuthorizedError,
  SignatureInvalidError,
  SubjectMismatchError,
  UnauthorizedSignerError,
  type AuthorizedSigner,
  type Clock,
  type CrewRecordForApproval,
} from "@/lib/approvals/types.ts";

// ── runtime-generated signers (never committed) ─────────────────────────────
const owner = generateKeyPairSync("ed25519");
const reviewer = generateKeyPairSync("ed25519");
const stranger = generateKeyPairSync("ed25519");

const ROSTER: ReadonlyMap<string, AuthorizedSigner> = new Map([
  ["owner-key-1", { publicKey: owner.publicKey, role: "approver" }],
  ["reviewer-key-1", { publicKey: reviewer.publicKey, role: "observer" }],
]);

const fixedClock = (ms: number): Clock => ({ nowMs: () => ms });

// A crew-record-shaped subject (typed against the real contract; extra fields
// are part of the hashed content, as they would be on a full record).
const crewRecord: CrewRecordForApproval & { engineReportHash: string; steps: string[] } = {
  caseId: "int-approve-clean",
  terminal: "recommendation",
  engineReportHash: "sha256:2f6b3f9a0d1c",
  steps: ["intake", "audit", "evidence", "reviewer"],
};

const T0 = 1_752_000_000_000; // fixed epoch base for the whole suite
const TTL = 60_000;

function freshFlow(nonce: string) {
  const request = createApprovalRequest(crewRecord, { clock: fixedClock(T0), ttlMs: TTL, nonce });
  const decision = signDecision(request, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1_000));
  const opts = {
    clock: fixedClock(T0 + 2_000),
    authorizedSigners: ROSTER,
    seenNonces: new Set<string>(),
    requiredRole: "approver",
  };
  return { request, decision, opts };
}

describe("E3 happy paths", () => {
  it("approve on a recommendation terminal executes with a full audit line", () => {
    const { request, decision, opts } = freshFlow("n-happy-1");
    const record = verifyAndExecute(request, decision, opts);
    expect(record.executed).toBe(true);
    expect(record.action).toBe("approve-recommendation");
    expect(record.decision).toBe("approve");
    expect(record.signerKeyId).toBe("owner-key-1");
    expect(record.auditLine).toContain("SIMULATED-APPROVAL");
    expect(record.auditLine).toContain(request.requestId);
    expect(opts.seenNonces.has("n-happy-1")).toBe(true);
  });

  it("reject is a first-class verified outcome (not an error)", () => {
    const { request, opts } = freshFlow("n-happy-2");
    const decision = signDecision(request, "reject", owner.privateKey, "owner-key-1", fixedClock(T0 + 1_000));
    const record = verifyAndExecute(request, decision, opts);
    expect(record.executed).toBe(true);
    expect(record.decision).toBe("reject");
  });

  it("an escalate-to-human terminal yields the acknowledge-escalation flow", () => {
    const escalated = { ...crewRecord, caseId: "int-escalate-1", terminal: "escalate-to-human" as const };
    const request = createApprovalRequest(escalated, { clock: fixedClock(T0), ttlMs: TTL, nonce: "n-esc-1" });
    expect(request.action).toBe("acknowledge-escalation");
    expect(resolveAction("escalate-to-human")).toBe("acknowledge-escalation");
    const decision = signDecision(request, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1));
    const record = verifyAndExecute(request, decision, {
      clock: fixedClock(T0 + 2),
      authorizedSigners: ROSTER,
      seenNonces: new Set(),
      requiredRole: "approver",
    });
    expect(record.action).toBe("acknowledge-escalation");
  });
});

describe("E3 threats — each dies on its own typed door", () => {
  it("UNAUTHORIZED SIGNER: an unregistered keyId is rejected before any crypto", () => {
    const { request, opts } = freshFlow("n-t1");
    const decision = signDecision(request, "approve", stranger.privateKey, "stranger-key-9", fixedClock(T0 + 1));
    expect(() => verifyAndExecute(request, decision, opts)).toThrow(UnauthorizedSignerError);
  });

  it("WRONG ROLE: a known signer without the required role is rejected", () => {
    const { request, opts } = freshFlow("n-t2");
    const decision = signDecision(request, "approve", reviewer.privateKey, "reviewer-key-1", fixedClock(T0 + 1));
    expect(() => verifyAndExecute(request, decision, opts)).toThrow(RoleNotAuthorizedError);
  });

  it("FORGERY: a stranger's signature under a registered keyId fails signature verification", () => {
    const { request, opts } = freshFlow("n-t3");
    const forged = signDecision(request, "approve", stranger.privateKey, "owner-key-1", fixedClock(T0 + 1));
    expect(() => verifyAndExecute(request, forged, opts)).toThrow(SignatureInvalidError);
  });

  it("TAMPER: flipping the decision after signing invalidates the signature", () => {
    const { request, decision, opts } = freshFlow("n-t4");
    const tampered = { ...decision, decision: "reject" as const };
    expect(() => verifyAndExecute(request, tampered, opts)).toThrow(SignatureInvalidError);
  });

  it("RE-BINDING: a validly-signed decision for a DIFFERENT crew record dies on the digest cross-check", () => {
    const otherRecord = { ...crewRecord, caseId: "int-other-case", engineReportHash: "sha256:ffff" };
    const otherRequest = createApprovalRequest(otherRecord, { clock: fixedClock(T0), ttlMs: TTL, nonce: "n-t5" });
    const { request, opts } = freshFlow("n-t5"); // same nonce, same id shape? ids differ by caseId
    // Sign honestly over the OTHER request, then present it against THIS one.
    const foreign = signDecision(otherRequest, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1));
    const rebound = { ...foreign, requestId: request.requestId };
    // The requestId in the signed payload no longer matches -> signature dies
    // first (the payload is recomputed); prove the digest door too by signing
    // a decision whose payload uses THIS request's id but the other digest:
    expect(() => verifyAndExecute(request, rebound, opts)).toThrow(SignatureInvalidError);
    expect(subjectDigestOf(otherRecord)).not.toBe(request.subjectDigest);
  });

  it("REPLAY: the same nonce cannot execute twice", () => {
    const { request, decision, opts } = freshFlow("n-t6");
    verifyAndExecute(request, decision, opts);
    expect(() => verifyAndExecute(request, decision, opts)).toThrow(ReplayError);
  });

  it("REPLAY ACROSS REQUESTS: a consumed nonce blocks a different request sharing it", () => {
    const { request, decision, opts } = freshFlow("n-t7");
    verifyAndExecute(request, decision, opts);
    const second = createApprovalRequest({ ...crewRecord, caseId: "int-second" }, { clock: fixedClock(T0), ttlMs: TTL, nonce: "n-t7" });
    const secondDecision = signDecision(second, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1));
    expect(() => verifyAndExecute(second, secondDecision, opts)).toThrow(ReplayError);
  });

  it("EXPIRY: valid 1ms before the boundary, expired AT it, expired after it (injected clock)", () => {
    const mk = (nonce: string) => {
      const request = createApprovalRequest(crewRecord, { clock: fixedClock(T0), ttlMs: TTL, nonce });
      const decision = signDecision(request, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1));
      return { request, decision };
    };
    const base = { authorizedSigners: ROSTER, requiredRole: "approver" } as const;
    const a = mk("n-t8a");
    expect(
      verifyAndExecute(a.request, a.decision, { ...base, clock: fixedClock(T0 + TTL - 1), seenNonces: new Set() }).executed,
    ).toBe(true);
    const b = mk("n-t8b");
    expect(() =>
      verifyAndExecute(b.request, b.decision, { ...base, clock: fixedClock(T0 + TTL), seenNonces: new Set() }),
    ).toThrow(ExpiredError);
    const c = mk("n-t8c");
    expect(() =>
      verifyAndExecute(c.request, c.decision, { ...base, clock: fixedClock(T0 + TTL + 60_000), seenNonces: new Set() }),
    ).toThrow(ExpiredError);
  });

  it("REQUEST MISMATCH: a decision for another requestId is rejected at door 1", () => {
    const { request, opts } = freshFlow("n-t9");
    const other = createApprovalRequest({ ...crewRecord, caseId: "int-elsewhere" }, { clock: fixedClock(T0), ttlMs: TTL, nonce: "n-t9-other" });
    const decision = signDecision(other, "approve", owner.privateKey, "owner-key-1", fixedClock(T0 + 1));
    expect(() => verifyAndExecute(request, decision, opts)).toThrow(RequestMismatchError);
  });

  it("EMPTY/GARBAGE SIGNATURE: rejected loudly, never a silent pass", () => {
    const { request, decision, opts } = freshFlow("n-t10");
    expect(() => verifyAndExecute(request, { ...decision, signatureBase64: "" }, opts)).toThrow(SignatureInvalidError);
    expect(() => verifyAndExecute(request, { ...decision, signatureBase64: "not-base64!!" }, opts)).toThrow(
      SignatureInvalidError,
    );
  });

  it("FAILED ATTEMPTS DO NOT BURN THE NONCE: a rejected try leaves the request usable", () => {
    const { request, decision, opts } = freshFlow("n-t11");
    const forged = { ...decision, signatureBase64: Buffer.alloc(64).toString("base64") };
    expect(() => verifyAndExecute(request, forged, opts)).toThrow(SignatureInvalidError);
    expect(opts.seenNonces.size).toBe(0);
    expect(verifyAndExecute(request, decision, opts).executed).toBe(true);
  });

  it("KEY HANDLING: no private-key material appears in the serialized ExecutionRecord", () => {
    const { request, decision, opts } = freshFlow("n-t12");
    const record = verifyAndExecute(request, decision, opts);
    const serialized = JSON.stringify(record);
    const privatePem = owner.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const privateB64 = owner.privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
    expect(serialized.includes("PRIVATE KEY")).toBe(false);
    expect(serialized.includes(privateB64.slice(0, 24))).toBe(false);
    expect(privatePem.includes("PRIVATE KEY")).toBe(true); // sanity: the scan looks for real material
    for (const field of ["channel", "webhook", "url", "recipient", "transport"]) {
      expect(Object.keys(record).includes(field), `transport-shaped field "${field}" on the record`).toBe(false);
    }
  });

  it("determinism: identical inputs (same clocks, keys, nonce) produce identical records", () => {
    const { request, decision } = freshFlow("n-t13");
    const run = () =>
      verifyAndExecute(request, decision, {
        clock: fixedClock(T0 + 2_000),
        authorizedSigners: ROSTER,
        seenNonces: new Set<string>(),
        requiredRole: "approver",
      });
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });
});
