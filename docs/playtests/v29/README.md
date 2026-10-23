# Noise Thieves v29 — gameplay review

## Changes

- Bot stall recovery: a 2.8s progress watchdog chooses another reachable goal, retries a least-exposed route and avoids edge/corner waiting. Guard-aware movement, rescue safety and short heading hysteresis remain active.
- Thrown capsules are heard on landing. A guard within 220 units can break a chase when more than 60 units from its victim, with 2.5s distraction followed by search. Aiming shows a dotted trajectory and hearing radius; distracted guards turn and a count appears.
- R now boards or leaves the van before Last Call. Leaving preserves banked money and grants 3s safety. All aboard still finishes the job. Last Call disables leaving.
- Guards enter from marked staff doors after grace; later reinforcements use doors too. They are not rendered as stationary guards beside art during grace.
- Existing guard pressure includes exhibit sentries. A sentry leaves its post for a noise and returns after investigation. Rookie has fewer posts; Pro has more. They have a rotating torch and a post icon.
- Quiet thieves can sneak into marked plant cover: one occupant, 6s maximum, 4s cooldown. A scream prevents hiding; a guard within 20 units detects the thief. Bots consider cover when threatened.
- Eight exhibits, $4,300 fixed budget, $2,600 first-star co-op goal. Each wing has cheap, mid and valuable art; centre objectives remain shared. Co-op spreads exhibits across the three rooms. The jackpot is still $1,200 and the plate is shared.
- Every event has a banner, sound cue and persistent status. Shift change flashes patrol routes, curator relocation leaves a trail and MOVED marker, side vault glows, blackout darkens the museum. Sentries retain their posts during shift change.
- Existing painted UI and gameplay identity retained. No freeze item, van raids or 4v4.

## Verification

113/113 tests passed. TypeScript check passed. Tests for older count/budget, goal and grace-visual contracts were updated to the explicitly requested v29 contracts; rescue, routing and difficulty-order thresholds were not relaxed.

40-seed exact Claude fixture: 38 rescues, zero Echo captures during the human hold, two captures within 3s after release. The fixture lets 13s play before the human approaches a guard.

30 complete scripted matches (15 co-op, 15 rivals): zero qualifying bot idles of 6s or more. This excludes legitimate zone, plate and channel waits. It does not prove no stall is possible in every seed or network condition.

Matched 130-unit and 220-unit chase fixtures: both controls caught the fleeing thief within 4s; both capsule throws diverted the guard and avoided capture. These are two deterministic scenarios, not a broad statistical guarantee.

240-match difficulty gate, naive collector + Auto Echo, identical seeds 1001–1040 per cell:

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op win rate | 90% | 75% | 27.5% |
| Rivals win rate | 77.5% | 72.5% | 42.5% |

Ordering passes. The earlier desired absolute win rates, especially Normal rivals ~35%, are NOT met. Retuning in this pass: Rookie rival movement and carried-art speed reduced; Normal rival carrying slightly slowed; Normal co-op guard speed/sight reduced from an initially over-aggressive setting. No artificial immunity or scripted win outcomes were added.

Route fairness: 40 seeds, matched cheap/mid/valuable wing objectives plus shared centre art, jackpot and plate. Maximum spread 16.68 units, below the 40-unit gate. See routes.json.

24 engine-data SVG renders: four distinct placement samples per arena and mode. Recognizable walls retained. Gallery retains open cover, Archive shelving, Crossroads a shared hub. New loot occupies both wings and centre.

Browser check: local preview entered a live co-op match, boarded with R, then left again with R; bank and match continued. Desktop screenshot documents the returned player and current painted arena. This is a short functional playtest, not a complete human balance playtest.

## Remaining limits / not verified

- New eight-piece budget changes the earlier solo-haul arithmetic. The optimistic, wall-aware 90s solo planner can bank up to $3,100/$4,300 (72.1%) without the jackpot, ignoring guards and interaction delays. The previous ~60% ceiling is NOT preserved. Three stars still require the plate-gated jackpot. See solo-ceiling.json; it is an upper bound, not observed human performance.
- Rivals absolute difficulty targets need further tuning with human playtests. Ordering is verified, satisfaction is not.
- No two-real-device public multiplayer latency test was performed in this pass.
- Audible mixing/volume and touch controls were not physically evaluated. Event cue wiring is tested.
- Hiding and sentry behavior pass isolated tests; their strategic value has not yet been measured with skilled human players.
- All three rooms are covered, but the new mid-tier slot candidates are procedural. Four rendered seeds per arena are not exhaustive visual coverage.

Reproduce: node --experimental-strip-types --test tests/*.test.ts; node scripts/difficulty-gate.mjs; node --experimental-strip-types scripts/verify-noise-v29.ts; node --experimental-strip-types scripts/fairness-v29.ts; node --experimental-strip-types scripts/render-noise-v29.ts; node --experimental-strip-types scripts/solo-route-v29.ts.
