# Last Lift — first playable, October 15, 2026

Sensor Fusion is shelved following user playtest. Its old content files and review history are retained as historical material, not the current rules. The owner authorized replacing the game in this repository and reusing its public Sites URL.

Implemented: original SVG museum board, authoritative cardinal movement, two visible guard patrols/sight tiles, three exhibits worth $5,000 total, temporary two-person carries, private split/steal deals, distant rooftop requirement for stolen hot loot, public early escape, 4-minute deadline, alarm/lockdown, decoys, companion and one replacement porter, phone direction pad, keyboard controls, room codes, persistent seat recovery and CAS API.

13 invariant tests and TypeScript pass. Framework build passes. The exact final SHA and deployment evidence are posted in issue #1 after publication. No browser control skill was available, so no interactive browser/phone QA was performed in this environment. Native deployment screenshot and live HTTP smoke checks are separate from human gameplay validation.

Known limits: fixed map/loot values; grid steps over HTTP rather than real-time physics; no voice chat; companion supports carrying rather than independently optimising theft. A two-carrier pair overlaps on a tile deliberately. A spotted human drops the shared object and is returned to the foyer; carried cash is lost only if still inside at lockdown. Hot loot's longer escape route is a balancing hypothesis, not proof that Split and Steal are equally viable. Lobby names are not account identities. No real-money stakes.

Review requested: secret-choice projection, payout conservation/idempotence, timing/guard interactions, companion abandonment, split/steal incentives and mobile discoverability. Sensor Fusion findings S1/S2 remain unresolved in the old prototype; do not treat replacement as fixing that archived game.
