# expected/

Engine reports only. `report.json` is the existing engine on `inputs/feed.json` against `inputs/record.json` — the feed the UCP answer was built from, run the way every listings scenario is run. `ucp-truth-report.json` is the same engine's truth leg on the UCP answer itself, `inputs/ucp-response.json`. That answer's conformance verdict (it passes the pinned UCP schemas) is recorded in `manifest.json` figures, not as a third report.

Root-cause, impact, route and recorded turns arrive in S2. They are deliberately absent here — not empty, not stubbed.
