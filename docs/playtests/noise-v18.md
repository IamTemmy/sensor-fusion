# Noise Thieves v18 — rescue and movement repairs

## Changes
- Rescue channel is 1.2 seconds; ordinary captor retreat is 4.5 seconds. Retreating captors do not block an immediate rescue. The retreat remains extended throughout the channel and for at least one second afterward. Existing three-second protection for both thieves, silent capture drops, van exclusion and the longer plate patrol return remain.
- Auto spacing is bypassed while the human is captive. A loaded rescuer banks first if home is closer or its rescue trip is exposed. The loaded-trip check projects patrol movement through the approach, channel and escape; a captor becomes dangerous only after its retreat expires. This includes escape exposure, rather than checking only the initial approach: a safe entry with no safe loaded exit was causing art losses.
- After rescuing, a bot takes a nearby cover point for at most 1.2 seconds, then resumes its job. Reaching that point clears the retreat immediately, preventing repeated turns back toward a completed cover move. Captor movement now updates its facing angle.
- Auto holds a 55–100-unit spacing band under nearby guard pressure. Escaping a cone takes priority over returning to the band; it does not step back into danger just to close the gap. Cover choices persist briefly instead of flipping each frame. Plate jobs take priority over ordinary spacing.
- Weighted grid routing penalizes current guard cones and next-waypoint proximity, with a short patrol look-ahead. Safe shortcutting preserves waypoint costs. Plate/fetch/rescue routes wait or use a held distraction before entering exposure. Auto evaluates the return route before selecting an exhibit. Loaded return-to-van movement is not stopped to wait with a screaming exhibit.
- Names remain visible in status labels: `YOU · FREE 3s`, `ECHO · LOCKED 4s`. The existing local-player outline and final drawing order remain. Help copy and rescue ring agree with 1.2 seconds.
- Idle online reconciliation uses collision-aware, bounded movement rather than interpolating through walls. Local blocked movement, bursty frame timing and stale input rejection have regression coverage. This is not a claim of visually verified network smoothness.

No new gameplay systems, arenas or loot changes. Difficulty parameters, vans, last call, penalties, protection, sensors, events and manual bot orders remain. Historical v17 reports are retained; the build gate now writes the current matrix under v18.

## Verification

92 retained/new tests pass. Release packaging also runs TypeScript and the production build, including the difficulty gate. Raw results and engine SHA-256 are in `v18/verification.json` and `v18/difficulty-matrix.json`.

| Check | Result | Requested threshold |
|---|---:|---:|
| Natural human captures, Echo Auto | 35/40 rescued (87.5%) | ≥70% |
| Median successful rescue | 2.00 seconds | ≤3 seconds |
| Echo caught within four seconds after rescue | 2/40 runs; 2/35 successful rescues (5.7%) | ≤10% |
| Loaded rescuer loses art within 12 seconds of capture | 1/40 (2.5%) | <10% |
| Maximum direction reversals in rolling two seconds | 3 across 20 seeds | ≤6 |
| Active-guard jackpot, Echo starts beside plate crew | 60/60 within 15 seconds | ≥75% |
| Active-guard jackpot, Echo starts at van | 29/60 within 15 seconds (48.3%) | **Below 75%** |

The natural-capture fixture retains real layouts and guards. The human walks from spawn toward the closest patrol, is naturally caught, then stands still. No stun is assigned. Rescue seeds are 1–40. The separate carrying variant equips Echo at the capture instant; it uses the first 40 seeds where Echo is still free, through seed 42. Seeds 6 and 25 are explicitly excluded from that *setup* because Echo was already captured and could not legally be a carrying rescuer. No outcome-based filtering is used. All 40 accepted cases start holding art. Art loss is observed for 12 seconds after the human's capture.

Both jackpot fixtures use seeds 1–60, all guards active after opening grace, no guard removal or immunity, and a plate holder who can be caught. The beside-crew fixture starts Echo 60 units from the plate at a wall-clear spot; the cross-museum fixture leaves Echo at the van. These are deliberately separate results. The 60/60 result does not establish a 75% success rate for an arbitrary starting position. Mid-job events are disabled in these targeted fixtures to isolate movement. Claude's original fixture code was not supplied; these are reproducible local fixtures, not an exact replication of his rates.

Spacing seeds 1–20 place an idle human near a live patrol and keep all guards and walls. Reversals count changes over 120 degrees between movement samples, including pauses shorter than 500ms. Tests also verify weighted detours, retreat-safe rescue planning, blocked local movement with bursty frames, and ignored stale input.

## Difficulty gate

Unchanged naive-collector policy, identical seeds 1001–1040 in each cell, 240 complete matches. Ties are not rival wins. No thresholds or simulator policy were weakened.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op + Auto Echo | 90% (36/40) | 72.5% (29/40) | 25% (10/40) |
| Rivals + Auto Echo | 55% (22/40) | 50% (20/40) | 35% (14/40) |

The strict Rookie > Normal > Pro build gate passes in both modes. Navigation changes have changed absolute win rates; Normal/Pro rivals are easier for this collector than in v17. The small Rookie/Normal rivals separation is not statistical proof of distinct human difficulty. This deterministic policy is not a substitute for human playtesting.

## Remaining limitations

- Cross-museum jackpot pickup is still below the requested 75% target. Guard-aware routing is implemented, but the long run is not reliable enough; do not report this target as globally met.
- Hands-on browser, mobile controls, live label appearance and two-device multiplayer latency remain unverified because browser preview access was unavailable. No alternate browser path was used.
- Broader seed populations, a human who moves immediately after rescue, 3v3 behavior and perceived difficulty/fun have not been measured in this pass.
- Existing capture-retreat and fairness regressions remain covered; no fresh visual map audit was necessary because architecture and placements did not change.
