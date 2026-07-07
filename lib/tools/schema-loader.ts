/**
 * JSON Schema loader for the A0 tool registry — reads a committed schema file
 * from `lib/tools/schemas/` by name (path resolved off this module's own URL,
 * so it works from any cwd, matching the repo's fs-read-at-runtime idiom for
 * pinned schemas — see `lib/packs/listings/conformance.ts`).
 *
 * Plain: fetches one of the registry's committed input/output rulebooks off
 * disk, by filename.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_DIR = join(dirname(fileURLToPath(import.meta.url)), "schemas");

/** Load + parse one committed schema file (e.g. "check_feed.input.schema.json"). */
export function loadSchema(fileName: string): Readonly<Record<string, unknown>> {
  return JSON.parse(readFileSync(join(SCHEMA_DIR, fileName), "utf8")) as Record<string, unknown>;
}
