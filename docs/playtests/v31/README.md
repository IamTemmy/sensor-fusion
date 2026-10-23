# Noise Thieves v31 — museum clarity and sentry corrections

## Changes

- Sentries are assigned to exhibit IDs and paired by actual mirrored/rotated locations. Candidate posts sit beside walls within 125 units of the exhibit. A 10-unit clearance graph rejects any set of posts that disconnects an exhibit from a van with a 32-unit exclusion around each post. Crossroads corridors stay usable; Archive wing posts cannot collapse onto a shared central coordinate. A sentry whose exhibit is claimed joins its existing patrol. Its stationary torch sweeps toward the exhibit, with a POST badge. Existing guard-aware bot routing and blocked-route capsule throws remain active.
- Four hiding spots are selected at setup, beside walls/corners, at least 120 units from every starting sentry post. Rivals spots are symmetric. The locations stay fixed for the entire match.
- Vans are drawn outside outer-wall loading doors. Lit loading bays keep exactly the previous safe-zone coordinates and rules.
- Sensors are red laser beams with emitters, glow, sneak flicker and a bright trip flash. Geometry and trip rules are unchanged.
- Events and Last Call share a top banner. Shift-change routes are marked NEW ROUTES for three seconds. Error toasts use the top area. The desktop right column stacks bot controls, status and radio; a boarded thief sees the spectator card in the status slot. Phone alert is kept in the HUD.
- Dropped art waits five seconds, then an available nearby guard walks to it and carries it back to its plinth. It remains stealable until collected, and cannot be grabbed while guard-carried. Guards still never enter safe zones. Without an eligible guard there is no teleport. Bots exclude guard-carried art from fetch targets.
- Capture labels say CUFFED with drawn handcuffs; E says Uncuff/Uncuffing. Crew colors remain visible. Hold, channel and immunity durations are unchanged.

## Test interpretation

The old v3 test removed every guard and expected art to teleport home. Its superseded assertion now verifies that the art stays dropped; the rest of that test remains intact. A new test verifies the actual five-second collection and continuous guard-carried return, including grab rejection while carried. New spatial tests cover 240 setups (40 seeds × two modes × three difficulties). Existing rescue, freeze, noise diversion, replay and route-fairness tests remain required.

The naive collector matrix is a deterministic regression benchmark, not a human win-rate estimate. Sentry retirement and correct facing increase pressure, so co-op patrol/investigation tuning was separated from pursuit: pursuit retains its former speed and sight. Normal sentries rejoin the arena patrol pool rather than the extra co-op core circuit; Pro retains that circuit. Normal/Pro co-op patrol and investigation speed multipliers are 1.1/1.5, with sight multipliers 1.05/1.3; their former pursuit speed and sight remain unchanged, and bot safety forecasts remain conservative. Rival bot movement multipliers are Rookie 0.55, Normal 1.1275, Pro 1.45; there are no score bonuses or immunities for either crew. Final measured results are in difficulty-matrix.json, bound to engine and policy hashes.

## Visual review and limits

Desktop 1280×720 and phone 390×844 frozen UI fixtures were inspected in the browser, including crowd/cuffed labels, red lasers, bays, event banner and panel stacking. A live local job was opened through the briefing and opening grace. These checks do not constitute a full human-skilled match or a two-device online playtest. Physical phone input, network latency and subjective difficulty still need human validation. Twenty-four engine-data SVGs show four content seeds for every arena and mode; these are geometry diagnostics, not gameplay screenshots.

## Safety and spatial results

- 119 tests pass on the retuned behavior; TypeScript passes.
- Exact Claude fixture: 39/40 rescues, 0 Echo captures during the hold, 0 within three seconds after release.
- Thirty-match freeze regression: zero qualifying six-second bot idles.
- 130/220-unit chase fixtures: caught in both no-throw controls; escaped in both thrown-noise cases.
- Forty-seed route fairness: maximum spread 16.6726 units, below 40.
- Spatial sentry/hiding checks: 240 setups pass.

## Final 240-match difficulty matrix

Identical seeds 1001–1040 in every cell; naive collector with Auto Echo. Strict Rookie > Normal > Pro passes in both modes. Rookie rivals >70% and Normal rivals 45–50% also pass without changing the gate.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 67.5% | 40% | 15% |
| Rivals | 87.5% | 50% | 37.5% |

Start a new job after refreshing to get the new setup-time sentry and hiding placements.
