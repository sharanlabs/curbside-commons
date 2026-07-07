/**
 * Shared ajv instance for the A0 tool registry (plan §5 row A0: "validates
 * params against the tool's committed JSON Schema via ajv").
 *
 * This is a SEPARATE ajv instance from `lib/packs/listings/conformance.ts` —
 * that file is untouched per the hard constraint, and its cached instance is
 * private to the UCP schema-composition use case (registered `$id`s, a schema
 * dir walk). This module reuses the SAME ajv package + the SAME 2020-12
 * draft/`ajv-formats` setup style (draft class + strict:false + allErrors +
 * ajv-formats CJS-interop shim), for one-shot compiles of this registry's own
 * small, self-contained (no cross-schema `$ref`) input/output schemas.
 *
 * Plain: the same rulebook-checker library the menu-shape checker uses,
 * pointed instead at this registry's own small "is this input shaped right?"
 * rulebooks.
 */
import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";
import addFormatsModule from "ajv-formats";

const ajv = new Ajv2020({ strict: false, allErrors: true, verbose: true });
// ajv-formats is CJS; tolerate both default and namespace interop shapes
// (same shim as conformance.ts, applied to our own instance).
const addFormats =
  (addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ??
  addFormatsModule;
addFormats(ajv);

/** Compile one committed JSON Schema (input or output envelope) into a validator. */
export function compileSchema(schema: Readonly<Record<string, unknown>>): ValidateFunction {
  return ajv.compile(schema);
}

export type { ErrorObject, ValidateFunction };
