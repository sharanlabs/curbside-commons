/**
 * E3 — the OFFLINE approvals simulator: request → signed human decision →
 * verified execution (plan §E3). Everything is injected (clock, roster,
 * nonce store); the only effect of a fully-verified decision is a returned,
 * frozen {@link ExecutionRecord} — no transport, no channel, no mutation of
 * anything else (the no-send import-graph eval proves `lib/delivery/**` and
 * `lib/mcp/**` are unreachable from here).
 *
 * THE FROZEN CHECK ORDER (each its own typed error; tested one by one):
 *   1. request/decision id match        → RequestMismatchError
 *   2. expiry (expired AT expiresAtMs)  → ExpiredError
 *   3. nonce replay                     → ReplayError
 *   4. signer known                     → UnauthorizedSignerError
 *   5. signer role authorized           → RoleNotAuthorizedError
 *   6. Ed25519 over the RECOMPUTED canonical payload → SignatureInvalidError
 *   7. attested subjectDigest == request's           → SubjectMismatchError
 * Only then execute. Ordering rationale: cheap structural checks first,
 * replay consumed only on success (a rejected attempt must not burn the
 * nonce), signature verified over bytes THIS module rebuilds — never bytes
 * the wire supplied.
 *
 * Plain: seven locked doors in a fixed order between "someone sent a signed
 * yes" and "the simulator records it as done" — wrong paperwork, stale
 * paperwork, reused paperwork, unknown signer, under-powered signer, fake
 * signature, or paperwork about a different case each slam their own door,
 * loudly.
 */
import { createHash, verify as edVerify, sign as edSign, type KeyObject } from "node:crypto";

import type { TrajectoryTerminal } from "../crew/types.ts";
import { canonicalContentJson, canonicalSigningBytes } from "./canonical.ts";
import {
  ExpiredError,
  ReplayError,
  RequestMismatchError,
  RoleNotAuthorizedError,
  SignatureInvalidError,
  SubjectMismatchError,
  UnauthorizedSignerError,
  type ApprovalAction,
  type ApprovalRequest,
  type ApprovalVerdict,
  type Clock,
  type CrewRecordForApproval,
  type ExecutionRecord,
  type SignedDecision,
  type VerifyOptions,
} from "./types.ts";

/** sha256 hex of a UTF-8 string. */
function sha256Hex(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

/** Derive the flow from the crew's human-gate terminal (lib/crew/types.ts §6). */
export function resolveAction(terminal: TrajectoryTerminal): ApprovalAction {
  return terminal === "recommendation" ? "approve-recommendation" : "acknowledge-escalation";
}

/** Content digest of a crew record (recursively key-sorted canonical JSON). */
export function subjectDigestOf(record: CrewRecordForApproval): string {
  return sha256Hex(canonicalContentJson(record));
}

/** Create an approval request bound to one crew record. Pure given its inputs. */
export function createApprovalRequest(
  record: CrewRecordForApproval,
  opts: { readonly clock: Clock; readonly ttlMs: number; readonly nonce: string },
): ApprovalRequest {
  if (opts.ttlMs <= 0) throw new Error(`createApprovalRequest: ttlMs must be positive, got ${opts.ttlMs}`);
  if (opts.nonce.length === 0) throw new Error("createApprovalRequest: nonce must be non-empty");
  const requestedAtMs = opts.clock.nowMs();
  return Object.freeze({
    requestId: `apr-${record.caseId}-${opts.nonce}`,
    caseId: record.caseId,
    action: resolveAction(record.terminal),
    subjectDigest: subjectDigestOf(record),
    requestedAtMs,
    expiresAtMs: requestedAtMs + opts.ttlMs,
    nonce: opts.nonce,
  });
}

/**
 * Sign a decision over a request (the SIMULATED human's side; in the future
 * live lane this happens on the approver's device). The signed payload's
 * `nonce` is the REQUEST's nonce — a decision cannot supply its own.
 */
export function signDecision(
  request: ApprovalRequest,
  decision: ApprovalVerdict,
  privateKey: KeyObject,
  signerKeyId: string,
  clock: Clock,
): SignedDecision {
  const decidedAtMs = clock.nowMs();
  const payload = canonicalSigningBytes({
    requestId: request.requestId,
    decision,
    signerKeyId,
    decidedAtMs,
    subjectDigest: request.subjectDigest,
    nonce: request.nonce,
  });
  const signatureBase64 = edSign(null, payload, privateKey).toString("base64");
  return Object.freeze({
    requestId: request.requestId,
    decision,
    signerKeyId,
    decidedAtMs,
    subjectDigest: request.subjectDigest,
    signatureBase64,
  });
}

/**
 * The verifier-executor. Runs the seven frozen checks (docstring above) and,
 * only if ALL pass, consumes the nonce and returns the frozen
 * {@link ExecutionRecord}. Every failure throws its typed error — there is
 * no false return.
 */
export function verifyAndExecute(
  request: ApprovalRequest,
  decision: SignedDecision,
  opts: VerifyOptions,
): ExecutionRecord {
  const now = opts.clock.nowMs();

  // 1 — request/decision binding.
  if (decision.requestId !== request.requestId) {
    throw new RequestMismatchError(
      `decision is for "${decision.requestId}", not this request ("${request.requestId}")`,
    );
  }
  // 2 — expiry (expired AT the boundary: now >= expiresAtMs).
  if (now >= request.expiresAtMs) {
    throw new ExpiredError(`request expired at ${request.expiresAtMs} (now ${now})`);
  }
  // 3 — replay (checked before any crypto so a replayed nonce never gets far).
  if (opts.seenNonces.has(request.nonce)) {
    throw new ReplayError(`nonce "${request.nonce}" has already been consumed`);
  }
  // 4 — signer identity.
  const signer = opts.authorizedSigners.get(decision.signerKeyId);
  if (signer === undefined) {
    throw new UnauthorizedSignerError(`signerKeyId "${decision.signerKeyId}" is not a registered signer`);
  }
  // 5 — signer authorization (role).
  if (signer.role !== opts.requiredRole) {
    throw new RoleNotAuthorizedError(
      `signer "${decision.signerKeyId}" holds role "${signer.role}" but this action requires "${opts.requiredRole}"`,
    );
  }
  // 6 — signature over the RECOMPUTED canonical payload (nonce from the
  // REQUEST; digest as attested by the decision — cross-checked in step 7).
  const payload = canonicalSigningBytes({
    requestId: decision.requestId,
    decision: decision.decision,
    signerKeyId: decision.signerKeyId,
    decidedAtMs: decision.decidedAtMs,
    subjectDigest: decision.subjectDigest,
    nonce: request.nonce,
  });
  let signatureOk = false;
  try {
    signatureOk = edVerify(null, payload, signer.publicKey, Buffer.from(decision.signatureBase64, "base64"));
  } catch {
    signatureOk = false; // malformed base64 / wrong key type — same loud outcome
  }
  if (!signatureOk) {
    throw new SignatureInvalidError(
      `signature by "${decision.signerKeyId}" does not verify over the canonical payload`,
    );
  }
  // 7 — content binding: the SIGNED digest must be THIS request's content.
  if (decision.subjectDigest !== request.subjectDigest) {
    throw new SubjectMismatchError(
      `decision is signed over content ${decision.subjectDigest.slice(0, 12)}…, but this request covers ${request.subjectDigest.slice(0, 12)}…`,
    );
  }

  // All seven held — consume the nonce, then execute (= record, nothing else).
  opts.seenNonces.add(request.nonce);
  return Object.freeze({
    executed: true,
    requestId: request.requestId,
    caseId: request.caseId,
    action: request.action,
    decision: decision.decision,
    signerKeyId: decision.signerKeyId,
    signerRole: signer.role,
    subjectDigest: request.subjectDigest,
    decidedAtMs: decision.decidedAtMs,
    verifiedAtMs: now,
    reason: "all seven verification checks passed (SIMULATED offline approvals lane)",
    auditLine: `SIMULATED-APPROVAL executed=${true} request=${request.requestId} case=${request.caseId} action=${request.action} decision=${decision.decision} signer=${decision.signerKeyId} verifiedAt=${now}`,
  });
}
