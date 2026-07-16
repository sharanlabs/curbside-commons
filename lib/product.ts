/**
 * Product-level constants for the de-branded, company-agnostic surface.
 *
 * PLATFORM_NAME is the WORKING name the product renders. It is intentionally NOT the
 * differential oracle's REFERENCE_PLATFORM_NAME ("DoorDash") — the core keeps that
 * default so the byte-for-byte Python oracle stays green, while the product passes this
 * de-branded name (identical logic, only the token differs).
 *
 * NOTE: "Curbside Commons" is the working demo name. A quick web search (2026-06-20) found no
 * obvious trademark collision; with the non-affiliation footer it is fine for a demo/portfolio.
 * Formal trademark clearance is the owner's responsibility only before any COMMERCIAL use.
 */
export const PLATFORM_NAME = "Curbside Commons";

/** One-line honest data label, reused across surfaces. */
export const HONEST_DATA_LABEL =
  "The merchant names and personas shown are invented — no real businesses, so no state is ever attached to a real person. A separate, tested adapter can ingest name and category fields from a public business registry (personal data removed) when real inputs are supplied. Activation state is illustrative. No real merchant relationship or account.";
