/**
 * `get_rule` — the A0 tool wrapping the codified rule table
 * (`FEE_RULES` / `FEE_RULE_BY_ID` / `NON_STATEMENT_CHECKABLE`,
 * `lib/packs/fees/rules.ts`), UNCHANGED (plan §3, §5 row A0).
 *
 * `ruleId` omitted -> all {@link FEE_RULES}. A known `ruleId` -> that
 * {@link FeeRule}. A `ruleId` registered in {@link NON_STATEMENT_CHECKABLE} ->
 * `{ ruleId, nonStatementCheckable: true, reason }` (registered, not faked —
 * the same honesty move `rules.ts` itself documents). An unknown `ruleId` ->
 * a typed loud {@link RuleNotFoundError} (never a silent empty result).
 *
 * `get_rule` is a pure lookup, never a pass/fail check: every successful
 * branch (including the non-statement-checkable one, which is a correctly
 * ANSWERED question, not a failure) returns `exitCode: 0, ok: true`.
 *
 * Plain: ask this tool about one legal fee rule (or leave it blank for all 11)
 * and it hands back exactly what the rulebook says — including an honest "the
 * law names this, but a bill alone can't check it" answer where that's true,
 * and a loud error rather than a made-up answer for a rule id that doesn't exist.
 */
import { FEE_RULE_BY_ID, FEE_RULES, NON_STATEMENT_CHECKABLE } from "../../packs/fees/rules.ts";
import { serializeRuleLookup } from "../serializers.ts";
import { freezeToolResult, RuleNotFoundError, type ToolResult } from "../types.ts";

/** Params for `get_rule` (schema: `schemas/get_rule.input.schema.json`). */
export interface GetRuleParams {
  readonly ruleId?: string;
}

/** Run `get_rule`. `params` must already be ajv-validated by `callTool`. Throws {@link RuleNotFoundError} on an unknown `ruleId`. */
export function runGetRuleTool(params: unknown): ToolResult {
  const p = params as GetRuleParams;

  if (p.ruleId === undefined) {
    return freezeToolResult({
      tool: "get_rule",
      ok: true,
      exitCode: 0,
      canonical: serializeRuleLookup(FEE_RULES),
    });
  }

  const rule = FEE_RULE_BY_ID.get(p.ruleId);
  if (rule !== undefined) {
    return freezeToolResult({
      tool: "get_rule",
      ok: true,
      exitCode: 0,
      canonical: serializeRuleLookup(rule),
    });
  }

  const reason = NON_STATEMENT_CHECKABLE.get(p.ruleId);
  if (reason !== undefined) {
    return freezeToolResult({
      tool: "get_rule",
      ok: true,
      exitCode: 0,
      canonical: serializeRuleLookup({ ruleId: p.ruleId, nonStatementCheckable: true, reason }),
    });
  }

  throw new RuleNotFoundError(p.ruleId);
}
