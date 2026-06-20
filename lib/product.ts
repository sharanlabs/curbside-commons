/**
 * Product-level constants for the de-branded, company-agnostic surface.
 *
 * PLATFORM_NAME is the WORKING name the product renders. It is intentionally NOT the
 * differential oracle's REFERENCE_PLATFORM_NAME ("DoorDash") — the core keeps that
 * default so the byte-for-byte Python oracle stays green, while the product passes this
 * de-branded name (identical logic, only the token differs).
 *
 * NOTE (owner-gated): "Curbside Commons" is a working placeholder pending the owner's
 * platform-name confirmation (a 2-minute trademark/web check) before any public deploy.
 */
export const PLATFORM_NAME = "Curbside Commons";

/** One-line honest data label, reused across surfaces. */
export const HONEST_DATA_LABEL =
  "Real open business data (DataSF, public domain — public-record business/trade names, some of which are sole-proprietor personal-name DBAs). No private contact details, addresses, coordinates, account data, or marketplace records. Activation state is synthetic and illustrative. No real merchant relationship or account.";
