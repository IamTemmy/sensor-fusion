# Velmont: After Hours v35

## Changes

- Added authored L returns to Gallery pillars and Archive shelving, and inward-facing L-notches to the Crossroads display blocks. Moved hiding/stash spots to these route-side corners. Kept room identities, full-width lasers, docks, symmetrical counterparts and two routes per objective. Archive's wing patrol was rerouted around the new shelf return.
- E stashes carried art in a vacant visible niche within 45 units. Each niche holds one piece; the attached alarm stops, guards cannot return the stash, and any crew can pick it up. Pickup starts a new alarm. The stash renders as a faint glint.
- F passes art to a free teammate within 220 units and line of sight. Flight lasts 500 ms; the recipient must remain within 30 units of landing. Rivals can intercept the actual swept path. A miss drops the art and sounds its alarm. Walls stop flight. Aim snaps to an eligible receiver. Echo offers an open receive point toward the van under chase, calls PASS, catches and banks. Bots can pass while chased; a short cooldown prevents immediate pass-back loops.
- Abandoned sentry exhibits show POST EMPTY. Bots exploit an available exhibit only when their approach is safe. Rescue decisions retain priority.
- Layered rope artwork wiggles while tied, loosens during Untie, then falls away when freed; reduced-motion settings suppress motion.
- Room names find open floor away from blocks, staff signs, art, niches and other room labels. Each bay has one crew DOCK label. Sentry clearance remains at least 40 units. Active guards receive 20-unit separation and staggered shift-change waypoints.

## Validation

- Full suite: **131/131 passed**, including all retained regression tests. Seven new v35 tests cover stash/capacity/retrieval, airborne pickup exclusion, pass catch, miss, rival interception and wall blocking, Echo receive/bank, empty-post exploitation and guard separation.
- TypeScript: passed.
- Freeze regression: zero 6-second stalls across 30 matches. Both 130/220-unit chase fixtures caught the no-throw control, while the throw diverted the guard and avoided capture.
- Exact Claude 40-seed fixture: **35 rescues; 0 Echo captures during the hold; 0 within 3 seconds after release**.
- Fairness: 40 seeds, all six objectives; maximum matched route spread **21.56 units** (<40).
- Rendered 24 arena/seed maps (four seeds per arena per mode) and 54 objective route diagrams. Gallery keeps open crossing routes; Archive keeps shelf loops with returns; Crossroads keeps its hub and now has inward display niches. The map images are engine-data diagrams, not gameplay screenshots.
- Desktop pass and capture, and phone stash screenshots are frozen presentation fixtures, explicitly not live playtest results. A separate live practice run exercised pickup, capture, Echo rescue and the PASS callout.

## Tuning

Normal co-op patrol/investigation speed multiplier changed from 0.92 to 0.96; chase speed stays unchanged. Normal rival movement multiplier changed from 1.15 to 1.10. Rookie and Pro settings remain unchanged. Difficulty gate thresholds were not relaxed. The final matrix is in `difficulty-matrix.json`.

## Limits

No two-device hosted multiplayer or latency test was completed in this pass. Manual browser coverage is partial: stash retrieval, throws, misses and interceptions have engine-test coverage but not a complete human-vs-human browser match. Balance percentages are outcomes of the fixed naive collector policy plus Auto Echo, not predictions of human win rates. The finite fixtures cannot prove absence of every possible guard crowding or bot-routing edge case.

## Final difficulty matrix

40 seeds per cell, naive collector + Auto Echo; all unchanged gate bounds pass.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 77.5% | 70% | 22.5% |
| Rivals | 87.5% | 47.5% | 35% |
