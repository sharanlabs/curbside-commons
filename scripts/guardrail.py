"""Forbidden-claims + state-consistency guardrail for stubbed outreach drafts.

Patterns mirror docs/v1-data-dictionary.md §9. Numeric/percentage patterns are
bound to revenue/performance context so onboarding-progress text ("60% complete",
"80% done") does NOT flag — this is what keeps the 20 real nudges passing T11.
No network, no AI.
"""

import re

# category -> list of regex patterns (case-insensitive)
PATTERNS = {
    "forbidden_revenue_claim": [
        r"\bguarantee(d|s)?\b",
        r"\byou(?:'ll| will)?\s+earn\b",
        r"\bearn\s+\$?\d+",
        r"\$\s?\d+",
        r"\b(increase|boost|double|triple|grow)\b.{0,20}\b(sales|revenue|orders|income|profit|earnings)\b",
        r"\b\d+\s?%\s*(more|increase)\b.{0,20}\b(sales|revenue|orders|income|customers)\b",
    ],
    "unsupported_metric": [
        # NB: no \b after %, since % is non-word and the next char is a space
        # ("30% more"); \b there would never match. Still bound to perf words so
        # progress text ("60% complete") does not flag.
        r"\b\d+\s?%.{0,15}\b(more|increase|boost|growth)\b",
        r"\b\d+\s?x\b.{0,15}\b(more|sales|revenue|orders|income|customers)\b",
    ],
    "false_impact_claim": [
        r"\bofficial(ly)?\b.{0,15}\bdoordash\b",
        # verbs allow inflections so trailing \b still matches "guarantees"/"endorsed"
        r"\bdoordash\b.{0,15}\b(guarantee[sd]?|endorse[sd]?|recommend[sd]?|partner of the year)\b",
        r"\b(proven|guaranteed)\b.{0,15}\b(results|growth|sales)\b",
    ],
    "pii_or_secret": [
        r"[A-Za-z0-9._%+-]+@(?!example\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        r"\b(sk|pk|api[_-]?key|token|secret|bearer)[-_]?[A-Za-z0-9]{8,}\b",
    ],
    "aggressive_urgency": [
        r"\bact now\b",
        r"\blast chance\b",
        r"\b(or )?(you(?:'ll| will)? )?lose (your )?(account|listing|spot|ranking)\b",
        r"\bfinal (notice|warning)\b",
        r"\b(respond|act|sign up)\s+(immediately|right now)\b",
    ],
}

_COMPILED = {
    cat: [re.compile(p, re.IGNORECASE) for p in pats]
    for cat, pats in PATTERNS.items()
}


def scan_text(text: str) -> list:
    """Return sorted regex-based flags present in text (empty = clean)."""
    flags = []
    for cat, patterns in _COMPILED.items():
        if any(p.search(text) for p in patterns):
            flags.append(cat)
    return sorted(flags)


def run_guardrail(draft: dict, merchant: dict) -> list:
    """Return guardrail flags for a draft against its merchant. Empty = clean.

    Text categories are regex-based; `state_mismatch` is structural.
    """
    text = " ".join(
        str(draft.get(k, ""))
        for k in ("draft_subject", "draft_body", "risk_explanation", "blocker_summary")
    )
    flags = set(scan_text(text))

    # state_mismatch (structural): the draft's recommended action must equal the
    # deterministically computed next-best-action for this merchant.
    if draft.get("next_best_action") != merchant.get("next_best_action"):
        flags.add("state_mismatch")

    return sorted(flags)
