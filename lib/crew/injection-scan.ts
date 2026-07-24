/**
 * DETERMINISTIC INJECTION TRIPWIRE — a full-artifact scan that surfaces
 * prompt-injection / tamper signatures as anomalies for the crew's existing
 * forced-escalation path (audit finding M2, decision-log 2026-07-24).
 *
 * WHY THIS EXISTS: the model-visible artifact is a 400-char excerpt
 * (`lib/crew/model.ts` `quarantineExcerpt`). A payload placed past character
 * 400 in an otherwise-clean artifact is invisible to both model roles, so the
 * one control designed to surface tampering to a human could be truncated away.
 * This scan reads the WHOLE `rawContent` before any model turn and cannot be
 * out-run by depth — it converts a truncatable model heuristic into an
 * untruncatable structural control.
 *
 * WHAT THIS IS NOT: it is a TRIPWIRE, not a parser and not a guarantee. It
 * matches a conservative, precision-first set of AI-directed imperative
 * signatures (see SIGNATURES). A miss does not certify an artifact clean; a hit
 * does not adjudicate intent — it forces the artifact to a human (the crew's
 * anomaly → forced-escalation path). The `quarantineExcerpt` 400-char window
 * remains a SECONDARY heuristic (what the model actually sees); this scan is the
 * PRIMARY, structural one (what a human is guaranteed to be told about).
 *
 * DESIGN — precision over recall: every signature targets an imperative
 * addressed at an AI reader ("ignore previous instructions", spoofed system
 * framing, role reassignment, tool-invocation directives, approval steering).
 * The bar is ZERO false positives on benign business artifacts (fee statements,
 * product feeds, catalogs, UCP docs) — a tripwire that cried wolf on ordinary
 * data would train humans to wave escalations through. Coverage is deliberately
 * incomplete; adding a signature requires the same zero-FP proof
 * (`evals/crew/crew-injection-scan.test.ts` enumerates the committed benign
 * fixtures and asserts no hit on any of them).
 *
 * Pure + deterministic: no I/O, no state, same input → same output, matches
 * returned in a stable order (SIGNATURES array order, de-duplicated).
 */

interface InjectionSignature {
  /** Stable machine name emitted as `injection_signature:<name>`. */
  readonly name: string;
  /** Case-insensitive matcher. Intentionally narrow — precision over recall. */
  readonly pattern: RegExp;
  /** What AI-directed imperative family this catches, and why it is safe on business data. */
  readonly doc: string;
}

/**
 * The committed signature set. Each entry is one AI-directed-imperative family.
 * Ordered most-specific-framing first; the return order follows this array.
 */
const SIGNATURES: readonly InjectionSignature[] = [
  {
    name: "spoofed-system-directive",
    // A payload impersonating a system/developer channel ("SYSTEM OVERRIDE",
    // "IMPORTANT SYSTEM MESSAGE", "system prompt"). Business artifacts describe
    // fees and menu items, never a "system prompt/message/override".
    pattern: /\bsystem\s+(prompt|message|override|instruction|directive)/i,
    doc: "spoofed system/developer-channel framing — the 'system prompt/message/override' family",
  },
  {
    name: "ai-addressed-directive",
    // Text explicitly ADDRESSED to an AI reader ("to any AI assistant", "note
    // to AI reviewers", "message to AI model"). Gated on an addressing
    // preposition so neutral prose that merely mentions an AI ("the same data
    // any AI assistant would consume") does NOT trip — the directive framing is
    // the signal, not the noun. No business artifact in this corpus ADDRESSES
    // an AI assistant/reviewer/model/agent.
    pattern:
      /\b(to|for|dear|attention|note\s+to|message\s+to)\s+(any\s+|all\s+|the\s+)?AI\s+(assistant|reviewer|model|agent|system)s?\b/i,
    doc: "an imperative ADDRESSED at an AI reader — the 'to any AI assistant / note to AI reviewers' family (addressing-preposition-gated)",
  },
  {
    name: "ignore-prior-instructions",
    // The canonical override imperative ("ignore all previous rules",
    // "disregard your routing rules"). Requires an ignore/override verb AND a
    // prior-scope word AND an instruction-noun in close proximity, so ordinary
    // prose ("ignore the tip line") cannot trip it.
    pattern:
      /\b(ignore|disregard|forget|override)\b[\s\S]{0,40}?\b(previous|prior|earlier|above|all|your)\b[\s\S]{0,25}?\b(instruction|rule|direction|prompt|routing|guardrail|guideline|policy)s?\b/i,
    doc: "the 'ignore previous instructions' override family (verb + prior-scope + instruction-noun, proximity-bound)",
  },
  {
    name: "role-reassignment",
    // Attempts to re-cast the reader's role/mode ("you are now in unrestricted
    // mode", "you are no longer bound by"). Menu/fee text never reassigns a role.
    pattern: /\byou are (now|no longer|actually|really|not)\b/i,
    doc: "role/mode reassignment — the 'you are now …' family",
  },
  {
    name: "tool-invocation-directive",
    // A directive to CALL a specific registry tool, or a generic "call the X
    // tool" instruction. Bound to the known tool names (or the literal word
    // "tool") so benign phrasing like "call vendor re: napkins" cannot match.
    pattern:
      /\bcall\b[\s\S]{0,25}?\b(run_demo|classify_and_audit|audit_statement|check_feed|check_conformance|get_rule)\b|\bcall\s+(the\s+)?[a-z_]+\s+tool\b/i,
    doc: "a directive to invoke a specific tool — the tool-invocation-directive family (tool-name- or 'the X tool'-bound)",
  },
  {
    name: "approval-steering-directive",
    // An imperative steering the reader toward a rubber-stamp / suppressed
    // escalation ("approve everything", "approve without escalation", "approve
    // as clean", "report no violations", "skip escalation"). Requires an
    // approve/skip/suppress/report verb next to an escalation/violation/clean
    // object — vocabulary absent from ordinary fee and feed data.
    pattern:
      /\b(approve|skip|suppress|report)\b[\s\S]{0,30}?\b(everything|without\s+escalation|escalation|as\s+clean|no\s+violations?)\b/i,
    doc: "steering toward a rubber-stamp or suppressed escalation — the approval-steering family (verb + escalation/violation/clean object)",
  },
];

/**
 * Scan the FULL artifact content and return the names of every matched
 * signature, in SIGNATURES order, de-duplicated. Empty array = no tripwire hit
 * (which is NOT a certificate of safety — see the module header).
 */
export function detectInjectionSignatures(rawContent: string): string[] {
  const hits: string[] = [];
  for (const sig of SIGNATURES) {
    if (sig.pattern.test(rawContent)) hits.push(sig.name);
  }
  return hits;
}

/** The committed signature names, for tests that enumerate the set. */
export const INJECTION_SIGNATURE_NAMES: readonly string[] = SIGNATURES.map((s) => s.name);
