import { describe, it, expect } from "vitest";
import { proseClaimsUnreachedStep } from "@/legacy/activation/lib/agents/state-consistency";

// At steps_completed = 0 (nothing done), ANY completion claim is false and MUST flag; every
// imperative / "to-do" phrasing MUST NOT flag. Locks the precision fix (Codex P1) broadly.

const MUST_FLAG: string[] = [
  // business verification — incl. the forms the first refactor missed + verb-before-noun
  "Great — your business is verified and you're all set.",
  "Your business verification is complete.",
  "Your business verification has been completed.",
  "We've verified your business already.",
  "We've completed your business verification.",
  // bank verification verb-before-noun (Codex/evals P1 escape)
  "We have finished your bank verification.",
  "We completed your bank verification.",
  // menu
  "Your menu is uploaded and live.",
  "We added your menu.",
  // photos
  "Your photos are uploaded.",
  "Photos added to your listing.",
  // hours — incl. "hours are set" (missed by the first refactor)
  "Your business hours are set.",
  "Your hours are configured.",
  // bank
  "Your bank is verified.",
  "Bank verification has been completed.",
  // global live / onboarding (straight + curly apostrophe)
  "Congratulations, you're now live!",
  "Congratulations, you’re now live!",
  "Your onboarding is complete.",
];

const MUST_NOT_FLAG: string[] = [
  "Please complete business verification to continue.",
  "To verify your business, click the link.",
  "Your next step is to upload your menu.",
  "Please add photos of your items.",
  "Set your business hours to go live.",
  "Set your hours so customers can find you.",
  "Next, verify your bank information to get paid.",
  "Complete your final verification to finish onboarding.",
  // live-run-surfaced false positives (2026-06-20): infinitive/passive phrasing, NOT "done"
  "Your account requires your menu to be uploaded to continue.",
  "Add Photos to Complete Onboarding.",
  "Set your business hours to complete setup.",
];

describe("proseClaimsUnreachedStep — completion claims flag; imperative phrasing does not", () => {
  it.each(MUST_FLAG)("FLAGS a real completion claim: %s", (prose) => {
    expect(proseClaimsUnreachedStep(prose, 0)).toBe(true);
  });

  it.each(MUST_NOT_FLAG)("does NOT flag imperative/to-do phrasing: %s", (prose) => {
    expect(proseClaimsUnreachedStep(prose, 0)).toBe(false);
  });

  it("respects the per-step threshold (a claim TRUE for the merchant's progress is not flagged)", () => {
    // "menu is uploaded" requires steps >= 2; at steps_completed = 3 it is TRUE -> not a violation.
    expect(proseClaimsUnreachedStep("Your menu is uploaded.", 3)).toBe(false);
    // but at steps_completed = 1 it IS a violation.
    expect(proseClaimsUnreachedStep("Your menu is uploaded.", 1)).toBe(true);
  });
});
