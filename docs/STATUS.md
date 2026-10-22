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
