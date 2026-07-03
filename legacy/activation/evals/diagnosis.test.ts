import { describe, it, expect } from "vitest";
import { normalizeRow } from "@/legacy/activation/lib/core/pipeline";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";
import { STEP_MAP } from "@/legacy/activation/lib/core/constants";
import { diagnose, engagementState } from "@/legacy/activation/lib/domain/diagnosis";

function merchant(overrides: Partial<MerchantInput>) {
  return normalizeRow(
    {
      merchant_name: "Test Co",
      merchant_category: "Restaurant",
      days_since_signup: 20,
      last_login_days_ago: 2,
      steps_completed: 1, // -> menu_upload_needed
      source_risk_level: "Medium",
      ...overrides,
    },
    1,
  );
}

describe("engagementState — the no-new-fields discriminator", () => {
  it("classifies new / ghosted / dormant / actively_stuck / progressing", () => {
    expect(engagementState(merchant({ days_since_signup: 3 }))).toBe("new");
    expect(engagementState(merchant({ last_login_days_ago: 10, steps_completed: 1 }))).toBe("ghosted");
    // inactive AFTER making progress = dormant (not "progressing") — Codex P2 fix
    expect(engagementState(merchant({ last_login_days_ago: 10, steps_completed: 3 }))).toBe("dormant");
    expect(engagementState(merchant({ last_login_days_ago: 2, steps_completed: 1 }))).toBe("actively_stuck");
    expect(engagementState(merchant({ last_login_days_ago: 5, steps_completed: 3 }))).toBe("progressing");
  });

  it("routes a dormant (inactive-after-progress) merchant to re-engagement, not a bare step nudge", () => {
    const d = diagnose(merchant({ last_login_days_ago: 10, steps_completed: 3 }));
    expect(d.engagement_state).toBe("dormant");
    expect(d.play.touch).toBe("re_engagement");
  });
});

describe("diagnose — adds value beyond the core (the discrimination test)", () => {
  it("routes the SAME blocker differently by engagement state", () => {
    // menu_upload_needed (steps_completed=1) for both — only engagement differs.
    const ghosted = diagnose(merchant({ last_login_days_ago: 12, steps_completed: 1 }));
    const stuck = diagnose(merchant({ last_login_days_ago: 1, steps_completed: 1 }));
    expect(ghosted.blocker_code).toBe("menu_upload_needed");
    expect(stuck.blocker_code).toBe("menu_upload_needed");
    // Same step, DIFFERENT play — this is the value the core (fixed next_best_action) can't give.
    expect(ghosted.play.touch).toBe("re_engagement");
    expect(stuck.play.touch).toBe("self_serve_nudge");
    expect(ghosted.play.touch).not.toBe(stuck.play.touch);
  });

  it("a brand-new merchant is not treated as stalled (wait, don't pressure)", () => {
    const d = diagnose(merchant({ days_since_signup: 2, steps_completed: 1 }));
    expect(d.engagement_state).toBe("new");
    expect(d.play.touch).toBe("wait");
  });

  it("covers every core blocker as merchant-side Group-A, with an honest caveat + upgrade signal", () => {
    for (const steps of Object.keys(STEP_MAP).map(Number)) {
      const d = diagnose(merchant({ steps_completed: steps, last_login_days_ago: 2 }));
      expect(d.blocker_label.length).toBeGreaterThan(0);
      expect(d.blocker_group).toBe("A_step_aligned");
      expect(d.blocker_source).toBe("merchant_side");
      expect(d.detectable_now).toBe(true);
      // honesty: the caveat names what needs instrumentation
      expect(d.caveat.toLowerCase()).toContain("instrumentation");
      expect(d.root_cause_hypothesis.length).toBeGreaterThan(0);
    }
  });
});
