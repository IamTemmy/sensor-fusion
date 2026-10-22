# Noise Thieves v17 — difficulty and bot refinements

## Changes
- Existing v16 rules, artwork, arenas, loot budget, vans, rescue protection and manual bot modes retained. No van raids.
- Difficulty tuning: Rookie rivals are slower, hesitate at pickups, do not coordinate the plate or raid far-side exhibits, and use a simple contested-art priority. Normal/Pro retain teamwork and planting. Rival collection starts sooner than the old universal 12-second idle period; movement speed and tactical behavior differ by level. Co-op Normal adds a core patrol; Pro adds return-route/core coverage and hears carried screams farther away. Opening guard grace and capture-retreat protection remain.
- Empty-handed bots sneak only within 50 units of a sensor on their next movement segment, rather than over the whole jackpot route.
- Auto backs toward the van side, aiming for an 80-unit gap when a guard closes within 150 units of the human. It backs off from exposed rescue approaches instead of waiting on the captive's shoulder. Bank-first rescue remains.
- Bot callouts carry a crew tag, are filtered in the seat view, and repeated identical lines are suppressed for 10 seconds while retained in the feed. Public captures, deliveries and planted-alarm events remain visible.
- Briefing, practice hint, opening feed and canvas accessibility text now say art/exhibits instead of gold.

## Difficulty matrix
Same naive collector + Auto Echo on seeds 1001–1040 in all six cells: **240 matches**. The collector paths to the nearest available art, collects and banks it, and ignores guards; it does not sneak, throw or solve the plate. It uses full map knowledge and 40ms decisions, so this is a deterministic regression benchmark, not a human win-rate prediction. Rival ties are not wins.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 90% (36/40) | 62.5% (25/40) | 42.5% (17/40) |
| Rivals (2v2) | 57.5% (23/40) | 32.5% (13/40) | 10% (4/40) |

Requested approximate targets: co-op 85/60/30%, rivals 60/35/15%. Ordering passes in both modes. **Pro co-op remains above the requested target: 42.5% instead of roughly 30%.** Do not describe every target as met. Sample sizes are small and results depend on the collector policy. The last 20 seeds extend the original 20-seed tuning set, but the final aggregate is not an independent blinded validation.

`npm run build` runs `scripts/difficulty-gate.mjs` first. It checks the 40-seed matrix and fails unless Rookie > Normal > Pro in both modes. Cached results are accepted only for the same SHA-256 of the engine and simulation policy; changed inputs trigger fresh simulations. Raw counts, per-layout counts and hashes are in `v17/difficulty-matrix.json`.

## Verification
- All 87 retained/new tests pass; TypeScript passes. The noise-transfer unit fixture now isolates guards; the sneaking fixture uses a distance between Normal's half/full sight range. Assertions were preserved, no tests removed.
- Guard-free plate handoff: **240/240 pickups within 10 seconds**, across both human-on-plate / human-at-jackpot scenarios and both modes. Sensors remain active. This is pickup success, not banking success under live guards.
- Controlled bank-first fixture: **0/40 art losses**, all 40 humans naturally captured.
- Controlled approaching-guard spacing fixture: **40/40 natural human captures, 0/40 Echo captures** through three seconds after capture. This is a single open-space encounter with seeded guard offsets, not an all-map guarantee or directly comparable to Claude's fixture.
- Existing 40-seed rescuer protection regression, replay tests, loot budget/danger, route fairness, sensor, event and authority tests retained.

## Still unverified
- Hands-on browser/mobile gameplay, live visual review, and two-device multiplayer latency. Browser preview access remains unavailable; no substitute browser path used.
- Whether the updated Pro pressure feels fun to a human, broader populations of seed/policy combinations, and 3v3 difficulty rates.
- Exact replication of Claude's collector/rescue fixture, which was not supplied as code.
- Pro co-op's roughly 30% target remains unmet on this benchmark.
