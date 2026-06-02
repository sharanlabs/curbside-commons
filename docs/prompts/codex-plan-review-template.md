# Codex Plan-Review Template

Use as the focus text for `/codex:adversarial-review` when reviewing a plan (not code). Codex should challenge the plan, not rubber-stamp it.

---

**Plan to review**
- (paste or reference the plan / link the doc)

**Specific concerns to pressure-test**
- (the parts you are least sure about)

**Review for:**
- Blockers — what would stop this plan from working at all?
- Edge cases — what inputs or states does it not handle?
- Missing tests — what should be tested that the plan does not mention?
- Security / privacy risks — secrets, eligibility, data exposure, webhook trust.
- Scope drift — does the plan quietly exceed the agreed V1 scope (`docs/plan-reconciliation.md`)?
- Wrong approach — is there a simpler or safer design that meets the goal?

**Process / playbook compliance (`RULES.md` §15 + `docs/enterprise-delivery-playbook.md`)**
- Is the task classified (type, stage, risk, lightweight/full) and is the mode chosen for the right reason?
- Are source / framework / tool rationale and alternatives sufficient for the risk level?
- Are assumptions and validation method stated? Any silent scope expansion vs. the agreed scope?
- If the playbook/Mandatory Startup Contract was skipped for a meaningful task → raise a **process finding**.

**Recommendation**
- Ask Codex for a clear verdict: proceed / revise / reconsider — with reasons tied to evidence.
