/**
 * `lookup_reference` — the E2 advisory retrieval tool (pre-reg
 * `docs/e2-rag-preregistration.md` §6, wired AFTER the one scoring pass).
 *
 * Ships the lane the registered floors selected: **BM25** (the hybrid failed
 * to strictly beat it on M1 — anti-theater clause), and because the floors
 * were MISSED the envelope is permanently `advisory: true, earnsLabel: false`
 * and the payload carries the deferred label verbatim. It RETRIEVES and
 * CITES committed reference text (extractive, verbatim spans only) or
 * abstains; it never decides anything and the engine never consumes it.
 *
 * Deterministic, $0, offline: pure BM25 over the pin-verified corpus — no
 * embedding model, no network, nothing outside this repo's committed files
 * (the A1 gate throws before any drifted corpus could be served).
 *
 * Plain: ask it a question about the rulebook, the schemas, or the glossary
 * and it quotes the exact passage back with the source attached — or says
 * "no sufficiently supported answer." It's labeled experimental because it
 * missed the quality bars we set in advance, and the label says exactly that.
 */
import manifest from "../../rag/corpus-manifest.json" with { type: "json" };
import { Bm25Index } from "../../rag/bm25.ts";
import { loadCorpusChunks } from "../../rag/corpus.ts";
import { toLaneResult } from "../../rag/retrieve.ts";
import { serializeReferenceLookup } from "../serializers.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** Params for `lookup_reference` (schema: `schemas/lookup_reference.input.schema.json`). */
export interface LookupReferenceParams {
  readonly question: string;
}

/**
 * The label the pre-registration itself specifies for a missed floor, VERBATIM
 * (§5: "Label on any miss"), plus the pointer a reader needs. Batch-D P2 #10:
 * the earlier string paraphrased the registered label while the comments
 * claimed it was carried verbatim — a small dishonesty about honesty, which is
 * the worst kind here.
 */
export const LOOKUP_REFERENCE_REGISTERED_LABEL =
  "RAG lane: floors not met (see results) — experimental, advisory only";
export const LOOKUP_REFERENCE_LABEL =
  `${LOOKUP_REFERENCE_REGISTERED_LABEL} (scored 2026-07-12; docs/e2-rag-preregistration.md RESULTS)`;

// Lazy singleton: the corpus gate + index build run once, on first call —
// and the A1 HARD BLOCK throws here if any pinned source drifted.
let indexSingleton: Bm25Index | undefined;
function index(): Bm25Index {
  if (indexSingleton === undefined) {
    indexSingleton = new Bm25Index(loadCorpusChunks());
  }
  return indexSingleton;
}

/** Run `lookup_reference`. `params` must already be ajv-validated by `callTool`. */
export function runLookupReferenceTool(params: unknown): ToolResult {
  const p = params as LookupReferenceParams;
  const hits = index().search(p.question);
  const threshold = manifest.abstention.bm25.threshold;
  const result = toLaneResult("bm25", hits, p.question, hits[0]?.score ?? 0, threshold);
  return freezeToolResult({
    tool: "lookup_reference",
    ok: true,
    exitCode: 0,
    advisory: true,
    earnsLabel: false,
    canonical: serializeReferenceLookup({
      question: p.question,
      lane: "bm25",
      label: LOOKUP_REFERENCE_LABEL,
      abstained: !result.answered,
      answer_span: result.answer_span,
      citations: result.citations.map((c) => ({ file: c.file, anchor: c.anchor })),
      score: result.score,
      registration: "docs/e2-rag-preregistration.md",
    }),
  });
}
