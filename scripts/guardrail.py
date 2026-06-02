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

# Completion claims for state_mismatch: (pattern, min steps_completed for the claim
# to be TRUE). If a draft's prose asserts a step is done that the merchant has not
# reached, flag state_mismatch. Keyword-then-done-verb phrasing only, so the TODO
# phrasing in clean drafts ("upload your menu") does not match completion phrasing
# ("menu uploaded"). Scanned over subject+body only (not machine blocker codes).
COMPLETION_CLAIMS = [
    (re.compile(r"\bbusiness\b.{0,25}\bverif(ied|ication)\b", re.IGNORECASE), 1),
    (re.compile(r"\bmenu\b.{0,15}\b(uploaded|live|complete|added)\b", re.IGNORECASE), 2),
    (re.compile(r"\bphotos?\b.{0,15}\b(added|uploaded|live|complete|done)\b", re.IGNORECASE), 3),
    (re.compile(r"\bhours\b.{0,15}\b(set|configured|complete|done)\b", re.IGNORECASE), 4),
    (re.compile(r"\bbank\b.{0,25}\bverif(ied|ication)\b", re.IGNORECASE), 5),
    (re.compile(r"\b(fully verified|onboarding (is )?complete|you(?:'re| are) (now )?live)\b", re.IGNORECASE), 5),
    # Verb-before-step phrasing ("We've added your photos"). PAST-TENSE / completed
    # forms only, so imperative TODO phrasing ("add photos", "upload your menu",
    # "verify your bank") is NOT caught. "set" is ambiguous (imperative == past), so
    # it is gated behind a completion auxiliary ("we've/have/already set ... hours").
    (re.compile(r"\bverified\b.{0,15}\bbusiness\b", re.IGNORECASE), 1),
    (re.compile(r"\b(uploaded|added)\b.{0,15}\bmenu\b", re.IGNORECASE), 2),
    (re.compile(r"\b(added|uploaded)\b.{0,15}\bphotos?\b", re.IGNORECASE), 3),
    (re.compile(r"\b(we'?ve|we have|have|already)\b.{0,20}\bset\b.{0,15}\bhours\b", re.IGNORECASE), 4),
    (re.compile(r"\bverified\b.{0,15}\bbank\b", re.IGNORECASE), 5),
]


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

    # state_mismatch (prose): the merchant-facing text must not claim a step is
    # done that the merchant has not yet completed. Scan subject+body only so
    # internal blocker codes (e.g., "business_verification_needed") don't trip it.
    prose = " ".join(str(draft.get(k, "")) for k in ("draft_subject", "draft_body"))
    steps_completed = int(merchant.get("steps_completed", 0))
    for pattern, required_steps in COMPLETION_CLAIMS:
        if required_steps > steps_completed and pattern.search(prose):
            flags.add("state_mismatch")
            break

    return sorted(flags)
