/**
 * Demo text renderer — D1 (plan §5 D1, C7). A PURE, deterministic transcript →
 * plain-text transform for `node bin/check.mjs demo`. Browser-safe (types only;
 * no fs, no clock, no locale-dependent formatting), so its output is byte-stable
 * and golden-lockable (fixtures/synthetic-restaurant/expected-demo.txt).
 *
 * Two registers per beat (documentation-standard): the plain line leads, the
 * technical detail sits under it, receipts last. Needs no explanation to read.
 *
 * Plain: turns the demo script into the exact block of text the command prints —
 * the same words every time.
 */
import type { DemoBeat, DemoFinding, DemoTranscript } from "./types.ts";

const RULE = "=".repeat(76);
const SUBRULE = "-".repeat(76);

function findingBlock(f: DemoFinding, index: number): string[] {
  return [
    `    ${String(index + 1).padStart(2, "0")}. [${f.severity.toUpperCase()}] ${f.plainLine}`,
    `        claim:      ${f.claimId}  (${f.claimSource} · ${f.claimField} = ${f.claimValue})`,
    `        reference:  ${f.referenceRowId}`,
    `        rule:       ${f.ruleId}`,
    `        class:      ${f.category || "—"}`,
  ];
}

function beatBlock(beat: DemoBeat, ordinal: number): string[] {
  const out: string[] = [SUBRULE, `BEAT ${ordinal} · ${beat.title}`, "", `  ▸ ${beat.plain}`, ""];
  for (const line of beat.lines) out.push(`  ${line}`);
  if (beat.verdicts && beat.verdicts.length > 0) {
    out.push("");
    for (const v of beat.verdicts) out.push(`  verdict: [${v.ok ? "OK" : "FLAG"}] ${v.label}`);
  }
  if (beat.findings && beat.findings.length > 0) {
    out.push("", "  evidence (each catch carries its four receipts):");
    beat.findings.forEach((f, i) => out.push(...findingBlock(f, i)));
  }
  out.push("");
  return out;
}

/** Render the transcript to deterministic plain text (trailing newline). */
export function renderDemoText(t: DemoTranscript): string {
  const lines: string[] = [
    RULE,
    // Template v2 (2026-07-10, plan v3.3 S4b): name migrated → "Curbside Commons"
    // (decision-log row precedes this edit; expected-demo goldens regenerated).
    "Curbside Commons — verifier demo (SIMULATED)",
    RULE,
    "",
    `Demo claim: ${t.claim}`,
    `Actor:      ${t.actorLabel}`,
    `Spec pin:   ${t.specVersion}`,
    `Simulated:  ${String(t.simulated)}`,
    "",
  ];
  t.beats.forEach((beat, i) => lines.push(...beatBlock(beat, i + 1)));
  lines.push(
    RULE,
    "No language model runs in this demo; the comparison is exact, deterministic",
    "logic. Simulated data, run on demand — not a live service, no platform access.",
    RULE,
  );
  return `${lines.join("\n")}\n`;
}
