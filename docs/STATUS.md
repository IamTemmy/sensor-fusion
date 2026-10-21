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
