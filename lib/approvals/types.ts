/**
 * E3 APPROVALS TYPES — the typed vocabulary of the OFFLINE MCP-Slack approvals
 * SIMULATOR (plan `docs/plan-debrand-design-armoury-2026-07-09.md` §E3, Tier-3
 * #3). This module simulates — fully offline, at $0, with zero transport — the
 * future live "sign a human approval in Slack, then execute" lane. That live
 * interactive lane is NOT built here and stays a future owner word; everything
 * in `lib/approvals/**` is SIMULATED per RULES §4.
 *
 * THE THREAT MODEL these types encode (why each field exists):
 *  - signer identity + authorization: a decision is trusted only if its
 *    `signerKeyId` resolves to a registered public key AND that signer holds the
 *    required role. The keyId→publicKey binding is the trust anchor — a forged
 *    signature (a different private key claiming a registered keyId) fails.
 *  - content binding: `subjectDigest` is the sha256 of the crew record's
 *    canonical content, so a signed decision cannot be re-bound to a DIFFERENT
 *    crew record — the digest travels inside the signed payload AND is
 *    cross-checked against the request.
 *  - replay: `nonce` is a per-request single-use token; a nonce seen once can
 *    never execute again (globally, across requests).
 *  - expiry: `expiresAtMs` vs an INJECTED clock makes staleness testable; there
 *    is no ambient `Date.now()` anywhere in this module.
 *  - tamper/forgery: the signature is verified over a payload RECOMPUTED from
 *    canonical bytes — never trusted from the wire.
 *
 * KEY HANDLING: no key material is defined, stored, or serialized here. Public
 * keys arrive at verify time in the caller's `authorizedSigners` map; private
 * keys exist only inside a signer's device (in tests/simulation, a runtime-
 * generated ephemeral keypair). No `ExecutionRecord` — the simulator's only
 * output — ever carries key bytes or transport fields.
 *
 * Plain: this is a paper-only rehearsal of "a human signs off in Slack, then the
 * action runs." Nothing here can talk to Slack or change anything real. Each
 * approval is cryptographically tied to exactly what was reviewed, to a specific
 * person, for a short window, and can be used exactly once — and the rehearsal
 * proves all of that with tests instead of trusting anyone's word.
 */
import type { KeyObject } from "node:crypto";
import type { TrajectoryTerminal } from "../crew/types.ts";

/** A monotonic time source — the ONLY way this module learns "now" (determinism + testable expiry). */
export interface Clock {
  /** Current time in epoch milliseconds. Pure: no ambient clock, no side effects. */
  nowMs(): number;
}

/** The three approval flows. Derived from a crew record's terminal; see `resolveAction`. */
export type ApprovalAction = "approve-recommendation" | "reject-recommendation" | "acknowledge-escalation";

/** A signed human verdict. Orthogonal to the flow: within any flow a human may approve or reject. */
export type ApprovalVerdict = "approve" | "reject";

/** An opaque signer role (e.g. "approver"). Compared for EXACT equality against `requiredRole`. */
export type SignerRole = string;

/**
 * The minimal crew-contract shape the simulator consumes READ-ONLY. A full
 * `TrajectoryRecord` from `lib/crew/types.ts` is structurally assignable; only
 * `terminal` (to pick the flow) and `caseId` (to label the request) are read
 * directly, but the ENTIRE object passed is hashed into `subjectDigest`.
 */
export interface CrewRecordForApproval {
  readonly caseId: string;
  readonly terminal: TrajectoryTerminal;
}

/**
 * A request for a signed human decision. Created from a crew record; carries the
 * content binding (`subjectDigest`), the single-use `nonce`, and the validity
 * window. Never carries any transport, channel, or recipient field.
 */
export interface ApprovalRequest {
  readonly requestId: string;
  readonly caseId: string;
  readonly action: ApprovalAction;
  /** sha256 (hex) of the canonical serialization of the crew record this request approves. */
  readonly subjectDigest: string;
  readonly requestedAtMs: number;
  readonly expiresAtMs: number;
  /** Single-use anti-replay token (globally unique; consumed on first verified execution). */
  readonly nonce: string;
}

/**
 * The six fields the Ed25519 signature covers. The ONE canonical serialization
 * of exactly these keys (sorted, no whitespace) is documented in `canonical.ts`
 * — a key-order or type-confusion variance would be signature malleability.
 */
export interface SigningPayloadFields {
  readonly requestId: string;
  readonly decision: ApprovalVerdict;
  readonly signerKeyId: string;
  readonly decidedAtMs: number;
  readonly subjectDigest: string;
  readonly nonce: string;
}

/**
 * A signed human decision. The signature is Ed25519 over the canonical
 * serialization of {requestId, decision, signerKeyId, decidedAtMs, subjectDigest,
 * nonce} (the last, `nonce`, is the REQUEST's nonce at signing time; see
 * `signDecision`). `subjectDigest` is carried here — not sourced from the request
 * at verify time — so the "does this decision bind to THIS request's content?"
 * check is an explicit, independently-testable step (see verify step 7).
 */
export interface SignedDecision {
  readonly requestId: string;
  readonly decision: ApprovalVerdict;
  readonly signerKeyId: string;
  readonly decidedAtMs: number;
  /** The signer's attested content digest (part of the signed payload; cross-checked vs the request). */
  readonly subjectDigest: string;
  /** Base64 of the raw 64-byte Ed25519 signature over the canonical payload. */
  readonly signatureBase64: string;
}

/** A registered signer: its public key (the trust anchor) and its authorized role. */
export interface AuthorizedSigner {
  readonly publicKey: KeyObject;
  readonly role: SignerRole;
}

/** Options for {@link verifyAndExecute}. All time comes from `clock`; `seenNonces` is caller-owned, mutated on success. */
export interface VerifyOptions {
  readonly clock: Clock;
  readonly authorizedSigners: ReadonlyMap<string, AuthorizedSigner>;
  /** Mutable set of already-consumed nonces. A verified execution ADDS its nonce here. */
  readonly seenNonces: Set<string>;
  readonly requiredRole: SignerRole;
}

/**
 * The verified outcome — the simulator's ONLY effect. Contains an append-only
 * audit line and the decided facts. It NEVER carries key material or any
 * transport/channel/recipient field (proven by a record-output scan in the
 * threat-model suite). `executed` is always `true` on a returned record: the
 * only way NOT to execute is a thrown typed error (loud, never a silent false).
 */
export interface ExecutionRecord {
  readonly executed: boolean;
  readonly requestId: string;
  readonly caseId: string;
  readonly action: ApprovalAction;
  readonly decision: ApprovalVerdict;
  readonly signerKeyId: string;
  readonly signerRole: SignerRole;
  readonly subjectDigest: string;
  readonly decidedAtMs: number;
  readonly verifiedAtMs: number;
  readonly reason: string;
  /** A deterministic single-line, append-only audit entry. No secrets, no transport. */
  readonly auditLine: string;
}

/** Stable machine codes for every failure mode — one per frozen verify check. */
export type ApprovalErrorCode =
  | "REQUEST_MISMATCH"
  | "EXPIRED"
  | "REPLAY"
  | "UNAUTHORIZED_SIGNER"
  | "ROLE_NOT_AUTHORIZED"
  | "SIGNATURE_INVALID"
  | "SUBJECT_MISMATCH";

/** Base class for every approval failure. Each failure is one of these — loud, typed, never a boolean false. */
export class ApprovalError extends Error {
  readonly code: ApprovalErrorCode;
  constructor(code: ApprovalErrorCode, message: string) {
    super(message);
    // new.target.name resolves to the concrete subclass (e.g. "ReplayError").
    this.name = new.target.name;
    this.code = code;
  }
}

/** Step 1: the signed decision's requestId does not match the request (verdicts are orthogonal to the flow — see {@link ApprovalVerdict}). */
export class RequestMismatchError extends ApprovalError {
  constructor(message: string) {
    super("REQUEST_MISMATCH", message);
  }
}

/** Step 2: the request has expired (clock ≥ expiresAtMs — expired AT the boundary). */
export class ExpiredError extends ApprovalError {
  constructor(message: string) {
    super("EXPIRED", message);
  }
}

/** Step 3: this nonce has already been consumed — a replay. */
export class ReplayError extends ApprovalError {
  constructor(message: string) {
    super("REPLAY", message);
  }
}

/** Step 4: the signerKeyId resolves to no registered public key (authentication failure). */
export class UnauthorizedSignerError extends ApprovalError {
  constructor(message: string) {
    super("UNAUTHORIZED_SIGNER", message);
  }
}

/** Step 5: a known signer, but its role is not the required role (authorization failure). */
export class RoleNotAuthorizedError extends ApprovalError {
  constructor(message: string) {
    super("ROLE_NOT_AUTHORIZED", message);
  }
}

/** Step 6: the signature does not verify over the recomputed canonical payload (tamper/forgery/empty). */
export class SignatureInvalidError extends ApprovalError {
  constructor(message: string) {
    super("SIGNATURE_INVALID", message);
  }
}

/** Step 7: a validly-signed decision whose attested subjectDigest is bound to a DIFFERENT crew record than the request. */
export class SubjectMismatchError extends ApprovalError {
  constructor(message: string) {
    super("SUBJECT_MISMATCH", message);
  }
}
