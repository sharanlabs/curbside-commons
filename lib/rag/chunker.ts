/**
 * E2 — deterministic corpus chunker. Parameters are FROZEN in
 * `lib/rag/corpus-manifest.json` before any scoring (pre-reg §3): target
 * 200–400 approx-tokens per chunk (approx-token = whitespace-word count
 * × 1.3, rounded up), hard cap 600, split on natural boundaries:
 *
 * - `.md`   — blank-line blocks, with each table row (`|`-prefixed line) its
 *             own block; anchor = nearest preceding heading (+ first cell for
 *             table rows).
 * - `.ts`   — blocks opened by each `/**` doc comment; anchor = line range.
 * - `.json` — whole file when within the hard cap, else sequential line
 *             groups; anchor = filename (+ part ordinal).
 *
 * Oversize single blocks split on line boundaries. Every BLOCK is verbatim
 * source text (whole lines, never rewritten or summarized); a chunk is one or
 * more consecutive blocks joined with newlines (blank separator lines
 * collapse). The extractive guarantee (answer ⊆ citation span ⊆ chunk text)
 * builds on this.
 *
 * Plain: the documents are cut into paragraph-sized cards along their natural
 * seams — headings, table rows, rule blocks — and every card is an exact
 * photocopy of its source, never a summary.
 */
import type { Chunk } from "./types.ts";

export const CHUNK_TARGET_MIN = 200;
export const CHUNK_TARGET_MAX = 400;
export const CHUNK_HARD_CAP = 600;

/** Manifest-recorded approx-token formula. */
export function approxTokens(text: string): number {
  const words = text.split(/\s+/u).filter((w) => w.length > 0).length;
  return Math.ceil(words * 1.3);
}

interface Block {
  readonly text: string;
  readonly anchor: string;
}

/** Split an oversize block on line boundaries into ≤ CHUNK_TARGET_MAX pieces. */
function splitOversize(block: Block): Block[] {
  const lines = block.text.split("\n");
  const out: Block[] = [];
  let cur: string[] = [];
  let part = 1;
  const flush = () => {
    if (cur.length > 0) {
      out.push({ text: cur.join("\n"), anchor: `${block.anchor} (part ${part})` });
      part += 1;
      cur = [];
    }
  };
  for (const line of lines) {
    cur.push(line);
    if (approxTokens(cur.join("\n")) >= CHUNK_TARGET_MAX) flush();
  }
  flush();
  return out;
}

function mdBlocks(text: string): Block[] {
  const out: Block[] = [];
  let heading = "(top)";
  let cur: string[] = [];
  const flush = () => {
    const t = cur.join("\n").trim();
    if (t.length > 0) out.push({ text: cur.join("\n"), anchor: heading });
    cur = [];
  };
  for (const line of text.split("\n")) {
    if (/^#{1,6}\s/.test(line)) {
      flush();
      heading = line.replace(/^#{1,6}\s+/, "").trim();
      cur.push(line);
      flush();
      continue;
    }
    if (line.startsWith("|")) {
      flush();
      const firstCell = line.split("|")[1]?.replace(/\*/g, "").trim() ?? "";
      out.push({ text: line, anchor: firstCell.length > 0 ? `${heading} · ${firstCell}` : heading });
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    cur.push(line);
  }
  flush();
  return out;
}

function tsBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const starts: number[] = [0];
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("/**") && i > 0) starts.push(i);
  });
  const out: Block[] = [];
  for (let s = 0; s < starts.length; s += 1) {
    const from = starts[s];
    const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const t = lines.slice(from, to).join("\n");
    if (t.trim().length > 0) out.push({ text: t, anchor: `L${from + 1}-L${to}` });
  }
  return out;
}

function jsonBlocks(text: string, fileName: string): Block[] {
  const whole: Block = { text, anchor: fileName };
  return approxTokens(text) <= CHUNK_HARD_CAP ? [whole] : splitOversize(whole);
}

/** Chunk one corpus file deterministically. */
export function chunkFile(file: string, text: string): Chunk[] {
  const name = file.split("/").at(-1) ?? file;
  let blocks: Block[];
  if (file.endsWith(".md")) blocks = mdBlocks(text);
  else if (file.endsWith(".ts")) blocks = tsBlocks(text);
  else blocks = jsonBlocks(text, name);

  // Expand any block past the hard cap, then merge small neighbours to target.
  blocks = blocks.flatMap((b) => (approxTokens(b.text) > CHUNK_HARD_CAP ? splitOversize(b) : [b]));

  const chunks: Chunk[] = [];
  let curText: string[] = [];
  let curAnchor = "";
  const flush = () => {
    const t = curText.join("\n");
    if (t.trim().length > 0) {
      chunks.push({
        id: `${file}#${chunks.length}`,
        file,
        anchor: curAnchor,
        text: t,
        tokens: approxTokens(t),
      });
    }
    curText = [];
    curAnchor = "";
  };
  for (const b of blocks) {
    const merged = curText.length > 0 ? `${curText.join("\n")}\n${b.text}` : b.text;
    if (curText.length > 0 && approxTokens(merged) > CHUNK_TARGET_MAX) flush();
    if (curText.length === 0) curAnchor = b.anchor;
    curText.push(b.text);
    if (approxTokens(curText.join("\n")) >= CHUNK_TARGET_MIN) flush();
  }
  flush();
  return chunks;
}
