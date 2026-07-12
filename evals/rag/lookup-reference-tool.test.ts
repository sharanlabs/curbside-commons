/**
 * E2 — `lookup_reference` tool contract (pre-reg §6): the advisory envelope
 * can never be consumed as a verdict, the deferred label rides every payload,
 * input validation fails loud, abstention is a first-class outcome, and the
 * tool is deterministic.
 *
 * Plain: the new "quote me the rulebook" button is proven to (a) always wear
 * its "experimental — not validated" sticker, (b) refuse malformed presses
 * loudly, (c) say "no good answer" rather than guess, and (d) be un-usable as
 * a pass/fail decision anywhere in the system.
 */
import { describe, expect, it } from "vitest";

import {
  assertDecisionGrade,
  callTool,
  outputValidatorFor,
  ToolInputError,
} from "@/lib/tools/registry.ts";
import { LOOKUP_REFERENCE_LABEL, LOOKUP_REFERENCE_REGISTERED_LABEL } from "@/lib/tools/tools/lookup-reference.ts";

describe("E2 lookup_reference tool contract", () => {
  it("answers with a verbatim cited span and the deferred label, envelope schema-valid", () => {
    const r = callTool("lookup_reference", { question: "What does drift mean for a published menu?" });
    expect(r.advisory).toBe(true);
    expect(r.earnsLabel).toBe(false);
    expect(r.ok).toBe(true);
    const validate = outputValidatorFor("lookup_reference");
    expect(validate!(r), JSON.stringify(validate!.errors)).toBe(true);
    const payload = JSON.parse(r.canonical) as {
      label: string;
      abstained: boolean;
      answer_span: string | null;
      citations: { file: string; anchor: string }[];
      lane: string;
    };
    expect(payload.label).toBe(LOOKUP_REFERENCE_LABEL);
    expect(payload.label).toContain(LOOKUP_REFERENCE_REGISTERED_LABEL); // pre-registration §5, verbatim
    expect(payload.label).toContain("floors not met"); // the registered wording, verbatim
    expect(payload.lane).toBe("bm25");
    expect(payload.abstained).toBe(false);
    expect(payload.answer_span).toBeTruthy();
    expect(payload.citations.length).toBeGreaterThan(0);
    expect(payload.citations[0].file).toBe("docs/GLOSSARY.md");
  });

  it("abstains (citation-free, null span) on an off-corpus question", () => {
    const r = callTool("lookup_reference", { question: "What is the boiling point of tungsten?" });
    const payload = JSON.parse(r.canonical) as { abstained: boolean; answer_span: null; citations: unknown[] };
    expect(payload.abstained).toBe(true);
    expect(payload.answer_span).toBeNull();
    expect(payload.citations).toEqual([]);
  });

  it("is deterministic: two identical calls return byte-identical canonical output", () => {
    const a = callTool("lookup_reference", { question: "Which fee types allow monthly averaging?" });
    const b = callTool("lookup_reference", { question: "Which fee types allow monthly averaging?" });
    expect(a.canonical).toBe(b.canonical);
  });

  it("fails LOUD on malformed input (missing/short/oversize/extra keys)", () => {
    expect(() => callTool("lookup_reference", {})).toThrow(ToolInputError);
    expect(() => callTool("lookup_reference", { question: "ab" })).toThrow(ToolInputError);
    expect(() => callTool("lookup_reference", { question: "x".repeat(501) })).toThrow(ToolInputError);
    expect(() => callTool("lookup_reference", { question: "valid question", extra: 1 })).toThrow(ToolInputError);
  });

  it("can NEVER be consumed decision-grade (advisory hard-block)", () => {
    const r = callTool("lookup_reference", { question: "What does drift mean for a published menu?" });
    expect(() => assertDecisionGrade(r)).toThrow(/advisory/);
  });
});
