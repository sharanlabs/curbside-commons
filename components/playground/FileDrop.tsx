"use client";

/**
 * One upload slot — drag-drop, click-to-browse, or paste (owner commission
 * 2026-07-27, "a working website where I will upload test files").
 *
 * THE PROMISE THIS COMPONENT MUST NOT BREAK. The site states on its face that
 * nothing you upload or type leaves your browser. (It used to say "no network
 * requests", which was measurably FALSE — the page itself prefetches its own
 * routes; retired 2026-07-28, see docs/reviews/codex-2026-07-28-s38-gate.md.
 * The promise that matters — and the one this component holds — was always
 * about the reader's DATA, not about the page's own traffic.) A file input
 * keeps that promise only if the file is read LOCALLY. `FileReader` is a browser API
 * that never touches the network, and this module imports nothing that could:
 * evals/packs/import-walk-guard.test.ts walks the import graph of the
 * playground closure and asserts no node:fs and no fetch reaches it. The
 * upload path is therefore zero-network BY CONSTRUCTION, not by promise.
 *
 * ACCESSIBILITY. A drop zone that is only a drop zone excludes every reader
 * who cannot drag. The real control here is a native <input type="file">,
 * kept in the accessibility tree and driven by its own <label> — so keyboard,
 * screen reader, and pointer all reach the same function. The drag surface is
 * an ENHANCEMENT layered on top; dragging is never the only way in. The paste
 * textarea is the third route, and the one that needs no file at all.
 *
 * TWO CHANNELS, NEVER ONE. Content and failure travel separately: `onText`
 * carries what the reader supplied, `onReadError` carries why nothing arrived.
 * Encoding a failure as content (a sentinel string, a leading space) is the
 * shape this product exists to catch — a value that means something other than
 * what it says.
 *
 * WHY THE FILE NAME IS SHOWN. A two-slot tool whose slots look alike is a tool
 * you can load backwards. Echoing the file name and its parsed row count is
 * how a reader catches "I dropped the feed into the record slot" before the
 * verdict confuses them.
 */
import { useId, useRef, useState } from "react";
import { MAX_INPUT_CHARS } from "./verify-in-browser";

export type SlotStatus =
  | { readonly kind: "ok"; readonly summary: string }
  | { readonly kind: "error"; readonly message: string };

export interface FileDropProps {
  /** Slot heading — "The feed" / "The record". */
  readonly title: string;
  /** One line saying what this side IS, in the site's plain voice. */
  readonly hint: string;
  /** Accessible name for the paste textarea. */
  readonly textareaLabel: string;
  /** Current text held by the slot (lifted state: the parent owns the run). */
  readonly value: string;
  /** Reader supplied content — from a file, a paste, or the sample. */
  readonly onText: (text: string, fileName: string | null) => void;
  /** The file could not be read at all; no content is arriving. */
  readonly onReadError: (message: string) => void;
  /**
   * A read has BEGUN. Fired synchronously so any verdict on screen is cleared
   * the instant a new file is chosen — `FileReader` is asynchronous, so without
   * this the old result stayed runnable and downloadable beside a slot the
   * reader had already changed (gate finding 11).
   */
  readonly onReadStart: () => void;
  /** Name of the file that filled this slot, if it came from one. */
  readonly fileName: string | null;
  /** Parse/read status, rendered inline so a failure sits beside its cause. */
  readonly status: SlotStatus | null;
  readonly onLoadSample: () => void;
  readonly sampleLabel: string;
  /**
   * Save this slot's sample to disk. Optional: a slot without one simply omits
   * the control. Exists because "I want a ready-to-use website to upload test
   * files" needs FILES — loading the sample inline exercises the engine but
   * never the upload path, and left a reader with nothing to drag.
   */
  readonly onDownloadSample?: () => void;
}

/**
 * Refuse implausibly large files BEFORE reading them into memory.
 *
 * Deliberately the same number the parsers enforce on pasted text
 * (`MAX_INPUT_CHARS`, verify-in-browser.ts) rather than a second copy of it:
 * the cap used to live only here, so the identical document was refused as a
 * file and accepted as a paste (F-1,
 * docs/security/vuln-scan-2026-07-31-upload-surface.md). Two constants that
 * both mean "the limit" drift apart the first time one is tuned.
 *
 * This check stays because it is the only one that can refuse a file WITHOUT
 * reading it — `file.size` is known before `FileReader` runs, so a huge file
 * never enters memory at all. The parser-side bound catches the paste route
 * and anything that reaches a parser another way; this catches it earlier.
 */
const MAX_BYTES = MAX_INPUT_CHARS;

export function FileDrop({
  title,
  hint,
  textareaLabel,
  value,
  onText,
  onReadError,
  onReadStart,
  fileName,
  status,
  onLoadSample,
  sampleLabel,
  onDownloadSample,
}: FileDropProps) {
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const areaId = useId();
  const titleId = useId();
  /**
   * Monotonic read counter. Two files chosen in quick succession can finish out
   * of ORDER — `FileReader` gives no ordering guarantee — so an older, slower
   * read could overwrite the newer choice and the reader would audit a file
   * they had already replaced (gate finding 11). A read whose token is stale by
   * the time it lands is dropped.
   */
  const generation = useRef(0);

  function readFile(file: File) {
    const token = ++generation.current;
    onReadStart();
    if (file.size > MAX_BYTES) {
      onReadError(
        `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB — larger than the 5 MB this tab will read.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (token !== generation.current) return;
      onText(String(reader.result ?? ""), file.name);
    };
    reader.onerror = () => {
      if (token !== generation.current) return;
      onReadError(`Could not read ${file.name}.`);
    };
    reader.readAsText(file);
  }

  return (
    <div className="fd-slot">
      <div className="fd-head">
        <p className="fd-title" id={titleId}>
          {title}
        </p>
        <p className="fd-hint" id={`${titleId}-hint`}>
          {hint}
        </p>
      </div>

      {/* The drag surface decorates a real control; the <label> reaches the
          native input, so a keyboard user takes the same path a mouse does. */}
      <div
        className={`fd-zone${dragging ? " is-drag" : ""}${fileName !== null ? " is-filled" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
      >
        <input
          id={inputId}
          className="fd-input"
          type="file"
          accept="application/json,.json,text/plain,.txt"
          /* Both slots' inputs read "Choose a file or drag it here" from their
             label alone, so a screen-reader control list could not tell the
             feed input from the record one (gate finding 13). The slot title
             joins the accessible name, and the hint becomes its description. */
          aria-labelledby={`${titleId} ${inputId}-label`}
          aria-describedby={`${titleId}-hint`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            // Reset so re-choosing the SAME file fires change again.
            e.target.value = "";
          }}
        />
        <label className="fd-label" id={`${inputId}-label`} htmlFor={inputId}>
          <span className="fd-cta">Choose a file</span>
          <span className="fd-or">or drag it here</span>
        </label>
        <span className="fd-sample-row">
          <button type="button" className="fd-sample" onClick={onLoadSample}>
            {sampleLabel}
          </button>
          {/* "Upload test files" needs FILES. Loading the sample inline proves
              the engine works but never exercises the upload path, and a reader
              who wants to try dragging something in had nothing to drag
              (2026-07-28). Saved from the same bytes the inline button loads,
              so the two can never describe different samples. */}
          {onDownloadSample !== undefined && (
            <button type="button" className="fd-dl" onClick={onDownloadSample}>
              or download it to test uploading
            </button>
          )}
        </span>
      </div>

      {fileName !== null && <p className="fd-file">{fileName}</p>}

      {status !== null && (
        <p
          className={`fd-status ${status.kind}`}
          role={status.kind === "error" ? "alert" : undefined}
        >
          {status.kind === "ok" ? status.summary : status.message}
        </p>
      )}

      <details className="fd-paste">
        <summary>or paste it as text</summary>
        <label className="fd-paste-label" htmlFor={areaId}>
          {textareaLabel}
        </label>
        <textarea
          id={areaId}
          className="fd-area"
          spellCheck={false}
          value={value}
          onChange={(e) => onText(e.target.value, null)}
        />
      </details>
    </div>
  );
}
