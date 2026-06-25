/**
 * score_quality — wraps scoreDraft (lib/evals/draft-quality.ts).
 *
 * The measurement layer: 4 deterministic graders (structure / state-consistency / policy /
 * no-leakage) over one draft. Delegation-only (R-TOOL-1).
 */
import { z } from "zod";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { DraftScore } from "@/lib/evals/draft-quality";
import { scoreDraft } from "@/lib/evals/draft-quality";
import type { OutreachDraft } from "@/lib/agents/draft";
import type { Merchant } from "@/lib/core/types";
import type { Tool } from "./registry";
import { DraftScoreSchema, MerchantSchema, OutreachDraftSchema } from "./schemas";

export const ScoreQualityInputSchema = z.object({
  draft: OutreachDraftSchema,
  merchant: MerchantSchema,
  platformName: z.string().optional(),
});

export type ScoreQualityInput = z.infer<typeof ScoreQualityInputSchema>;

export const scoreQuality: Tool<ScoreQualityInput, DraftScore> = {
  name: "score_quality",
  description:
    "Deterministic draft-quality scoring across 4 graders (structure / state-consistency / " +
    "policy / no-leakage). Wraps scoreDraft().",
  inputSchema: ScoreQualityInputSchema,
  outputSchema: DraftScoreSchema,
  run(input: ScoreQualityInput): DraftScore {
    const { draft, merchant, platformName } = ScoreQualityInputSchema.parse(input);
    const score = scoreDraft(
      draft as OutreachDraft,
      merchant as Merchant,
      platformName ?? REFERENCE_PLATFORM_NAME,
    );
    return DraftScoreSchema.parse(score) as DraftScore;
  },
};
