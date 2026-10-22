# Noise Thieves — first playable

Updated October 20, 2026 UTC. User approved Noise Thieves in the sensor-fusion repo. New landing page, canvas action scene, sound-capture heist engine, helper bot, and room-code API now replace Last Lift on the main route. Last Lift source and tests remain for history; Blackout is untouched.

See [NOISE-THIEVES.md](NOISE-THIEVES.md) for controls, architecture, acceptance checks, and limitations. This is a prototype to validate fun, not a finished competition entry. Online HTTP/D1 responsiveness and browser/phone feel remain explicit review gates. Exact publication SHA and GitHub review request are recorded in issue #1.

## Playtest response — October 20

Implemented carried-art screams (move with carrier, return 8 seconds after capture), explicit G drop and contextual E interaction, distinct-alarm stats, self-recapture cooldown, bot throw wind-up and no bot recycling of thrown alarms. Echo follows without taking alarms; explicit cover/fetch/plate orders affect only allied bots. Added a diagonal thumbstick, target highlight, reduced world-label clutter, 12-second opening grace, alert tiers/fourth guard, plate-gated jackpot, final horn, best-throw recap and prompt solo boarding.

Rival crews: up to six seats; pairs (2v2 or 2v2v2) or 3v3, team selection, balanced bot fill, pooled banked scores and tied winners. Solo has one-click you+Echo against a rival bot pair. Shared noise can lure guards toward any crew; this is indirect sabotage, not friendly-fire immunity. There is no public matchmaking.

Verification: 32 tests passed (21 Noise Thieves, 11 retained Last Lift), TypeScript and production build passed. A 20-seed all-bot rival simulation completed 20/20 matches, banked all $3,500 on average, with 4.4 distinct captures/match and at most 2 captures by one bot. Both crews scored in every run. This confirms completion/no capture-stat farming, NOT fun or balanced human competition; bots may still be too efficient.

Intentional deviations: no global slow-motion or surprise closing corridor; these would impair synchronized input or trap new players. Lockdown uses faster guards, red tint and a fourth guard; the jackpot uses a plate-gated display. Online HTTP/D1 input delay still needs real two-client measurement. Do not claim that test is complete. New room schema is v2; create a new room after deployment.

## October 20 — Noise Thieves v9 review candidate

See `docs/playtests/noise-v9.md` and its JSON simulation results. Replay client reset/epoch and real local RAF driver regression; timed rescues; smaller van; Help pause; spectator/end-job; dropped/recoverable loot; three layouts; optional safe practice; readable scream/jackpot/team labels. Co-op goal is now$1800 (practice$500), exposed in UI. 43 tests/typecheck/build passed. Rival balance targets remain OPEN (naive75%, noise65%; lockdown95–100%). Browser DOM replay and real-device networking remain unverified. New rooms required (schema3). Do not interpret headless policy wins as measured human difficulty.

## October 20 — Noise Thieves v10 interaction repairs

See `docs/playtests/noise-v10.md` and simulation JSON. Exact safe rectangle; bounded guard search; silent capture drops; 3s release protection; safe rescues; automatic plate fetch; F art passing only; crossing sensors and rival alarm planting; two-stage practice; desktop HUD outside arena. 52 tests and typecheck pass. Browser/manual replay unavailable. Balance remains OPEN: co-op policies both 100% wins; rival naive60%, noise55%. Do not claim human playtesting or balance success.

## October21 — Noise Thieves v11

Rescuer protection/retreat (40-seed engine regression); own crew vans and symmetric rival routes (max31u three-crew spread);25% straggler penalty;15s Last Call; cumulative stars and per-layout device record; one-piece slower Fetch; through-wall hearing and genuine Sneak; moving-carrier alarm planting + bot ambushes; layout-specific sensors; bounded action footer.63 tests and typecheck pass. See docs/playtests/noise-v11.md for180-match results. Co-op one-star difficulty target NOT MET; browser UI/real devices remain unverified. Do not claim balance complete.

## v12 rivals map rebuild
Three mirrored wing geometries, seeded equal wing loot, distinct patrols, separated crew vans. 66 tests pass. See docs/playtests/noise-v12.md for 180-match simulation and route distances. Co-op star distribution and three-crew fairness remain unmet; no browser playtest claimed.

## v13 arena identity
Distinct open Gallery, rotational shelving Archive, plus-hub Crossroads; separated plate/jackpot, six committed SVG diagrams. 69 tests pass, 180 simulated matches. All two-crew route differences <40u (max19u). Three crews retained with explicit unbalanced lobby warning. See docs/playtests/noise-v13.md for measurements and unverified human-play limits.

## v14 seeded content and events
Fixed v13 arenas; $3,300/5–6-piece seeded jobs; weighted carry speed; one announced event; patrol pools/plate return tuning; Follow bodyguard; label cleanup. Two rival crews only (2v2/3v3). Crates omitted. 75 tests/typecheck pass. Solo optimistic bound63.6%; stationary plate averages2.1–3.0 catches/90s. See [full report](playtests/noise-v14.md) and18 SVG maps. Fetch still reliably clears normal co-op loot; browser access policy blocked hands-on QA. No claim of final balance or manual testing.

## v15 wing value and slot variety
Rival wings each$200+$600; centre$1200+$500; fixed$3300. Budget conflict resolved at48.5% wing value. Three deep pair/centre configurations; events20–65s; facing-captor Follow wait. Crates deferred.77 tests/typecheck pass; max audited route spread31.8u.24 rendered seed diagrams inspected.180 engine sims: rival teamwork60%, naive20%, noise15%; co-op Fetch95%, teamwork60% three-star. Noise advantage/manual browser/network QA still unverified. See [v15 report](playtests/noise-v15.md).

## v16 situational Echo and difficulty
E closest-target priority; plate/capsule order repaired; reverse plate handoff; default Auto plus manual overrides; carried-art rescue decisions; widened rival centres with paired escape exits and serialized-navigation parity; canvas figurines/paintings/busts/crown-mask; caught/free/retreat indicators; Rookie/Normal/Pro with isolated records and forced Normal for human rival crews; far-side exhibit raids, no van raids.83 tests/typecheck pass.240/240 guard-free jackpot handoffs;0/40 carried-art losses in controlled natural-capture rescue probe.660 matches across three difficulties; co-op Auto wins100/95/75%, teamwork three-stars80/55/10%. Max audited route spread16.7u.24 renders inspected. Live browser/real-device feel remains unverified; see [v16 report](playtests/noise-v16.md).


## Noise Thieves v17
Difficulty ordering is now build-gated over 40 seeds per cell. Naive + Auto: co-op 90 / 62.5 / 42.5%; rivals 57.5 / 32.5 / 10%. Pro co-op remains above the ~30% target. Local sensor-only sneaking, Auto guard spacing, crew-only deduplicated callouts and art copy shipped. See docs/playtests/noise-v17.md for verification limits. No new gameplay systems or van raids.

## October 22 — Noise Thieves v18 review candidate

Rescue1.2s/captor retreat4.5s, retreat-safe approach, loaded-trip exposure forecast, short local cover after rescue, spacing hysteresis, guard-aware routing/short patrol look-ahead, named FREE/LOCKED labels and collision-aware idle reconciliation. No new gameplay systems; v17 difficulty settings retained. All 92 tests pass. Full report: `docs/playtests/noise-v18.md`; raw fixtures/matrix: `docs/playtests/v18/`.

Natural rescue35/40, median2s, post-rescue Echo catches2/40; valid carrying-at-capture setups lose art1/40. Maximum spacing reversals3 per2s across20 seeds. Active guards: jackpot60/60 within15s when Echo starts beside the plate crew, but only29/60 from the van. The cross-museum75% target remains unmet. Exact Claude fixture replication and hands-on browser/mobile/network behavior remain unverified.

240-match difficulty gate: co-op Rookie/Normal/Pro90/72.5/25%; rivals55/50/35%. Both orders pass; absolute rival Normal/Pro rates are easier than v17. Publication SHA and review request belong in issue#1 after successful release packaging.

## October 22 — Noise Thieves v19

All bot movement now uses guarded routing, including rejoin/follow/cover/receive, banking and rival interception. Cover fallback is checked; waiting avoids current cones and upcoming patrol waypoints. No new systems or difficulty constant changes. Existing 92 tests retained; three new regression checks. Actual self-release/free-Echo sample: 0/40 catches in the next 3s. Focused cone-rejoin test fails v18 and passes v19; natural fixture itself does NOT reproduce Claude's 15/40 baseline (v18 also 0/40). See `docs/playtests/noise-v19.md` for sampling and limitations.

240-match difficulty gate: co-op 92.5/65/30%; rivals 65/57.5/50% (Rookie/Normal/Pro). Both strict orders pass; absolute rival difficulty targets remain unmet. Browser/mobile/real-device behavior and exact Claude fixture replication remain unverified.

## October 22 — Noise Thieves v20

Shared idle safety checks every stationary bot state against 1.5s of all non-retreating patrols, routes to an unexposed position, favors cover, and keeps short escape commitments. Safe rescue completion accounts for the protection it grants; reaching the van clears stale escape targets. All v19 movement gates retained; no game rules or difficulty constants changed.

97 tests and TypeScript pass. Reconstructed fixed-seed Claude fixture (Normal, Auto, events on, spawn at 13s): 0/40 held-time Echo catches, 0/40 within 3s after release, 33/40 rescues. This reconstruction does NOT reproduce Claude's v19 baseline (ours 0/40, 30/40 rescues); actual original fixture still needed. Targeted approaching-patrol test fails v19 and passes v20. See `docs/playtests/noise-v20.md` and raw `v20/` results.

240-match strict difficulty gate passes: co-op 97.5/72.5/22.5%; rivals 72.5/57.5/47.5% (Rookie/Normal/Pro). Absolute balance targets remain open. Managed-browser UI/command inspection now available and performed, with screenshot; sustained human movement/full manual match, mobile and two-device latency remain unverified.
