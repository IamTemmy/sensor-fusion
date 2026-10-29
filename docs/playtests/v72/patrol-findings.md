# v72 patrol and handoff audit (v71 engine)

Baseline commit: `0fd7757f42aaa07f5583074d267bb2374a065cf3`. No production source edits were made by this audit.

Reproduce: `node --experimental-strip-types docs/playtests/v72/patrol-audit.ts > docs/playtests/v72/patrol-audit.json`.

The 18 full matches cover 2/4/6 thieves, each of the three museums, and idle versus naive collector human policies. Seeds 1, 2, 6 select layouts 0, 1, 2. A stall means remaining within 10 units of a sampled position for over six seconds, excluding inactive guards and sentries holding within 10 units of their posts. Sharp angle flips are diagnostics, not independently proven visual defects.

## Confirmed route-progress bug

All six four-player duos cases stalled g0 near (191,310), targeting (80,300). Other stalls include lockdown guards near (368,310), targeting (350,530) in layout2 (two-player idle, six-player collector).

Exact reproduction: four-player duos, seed1, idle human, at26000ms. g0=(191.895399,309.678801), target=(80,300), steer=(190,310), distance=1.922422. The walk helper only moves for distance>3; therefore it never completes the required grid corner and remains there. E.move can legally finish that short step; immediately afterward E.steer becomes(70,310), 120 units onward. At the frozen point radius12 clearance passes but navigation radius13 fails, making completion of the corner particularly important.

Second independent case: two-player coop seed6 idle, at88000ms. lockdown=(368.058460,309.545771), target=(350,530), steer=(370,310), distance1.993966. Both radius12 and13 clearance pass, yet the same deadzone blocks the necessary corner.

Minimal recommended correction: use a much smaller movement arrival tolerance for guards only (e.g.0.05 units), preserving the bots' existing3-unit arrival tolerance, path budget, geometry, collision radius, speeds, and sentry stopping rules. Validate with focused corner regressions, existing hold/escape tests and the full seed audit. This is an engine bug fix and therefore separate from the requested visual-only gate.

## Intentional holds versus freezes

Sentries intentionally stand within6 units of their post and sweep their facing by a smooth sine wave. Noise can lure them away for six seconds. Shift events currently exclude sentries and explicitly announce that sentries keep their exhibits; changing this is a new mechanic. Investigating guards search for three seconds after reaching the noise, and chase attention persists briefly after losing a target. These states should not be classified as routing freezes.

## Bot passes

Bots already pass to humans. The current trigger requires an active chasing guard targeting the carrier within200 units, an empty-handed crew receiver within220 units and clear line of sight, receiver>65 units away and50 units closer to the van, and an unexposed receiver-to-van route. Merely dodging a patrol does not qualify. Unstick/idle routing can return before botDecision reaches the passing branch.

Controlled fixture: coop seed1, now20s/end90s, empty walls/sensors/noises; human(100,450), bot(250,350) carrying art1, guard(420,350), safe receiver route. Chasing guard targeting bot produces an immediate pass toward Human at20.040s. Identical patrol guard produces no pass. A safe enhancement would add a measured prolonged-stall/dodge trigger and run safe handoff evaluation before the unstick branch, while preserving urgent van escape priority and the receiver safety constraints. This is a separate AI change, not visual polish.

## Value topology

Current authored plans total$4300. Jackpot$1200 is27.9%; jackpot plus nearest$200 pocket totals$1400 and cannot mathematically guarantee victory. Jackpot plus the complete four-player own wing($200+$600+$500) totals$2500, exceeding the$1800 remainder. A non-jackpot counterexample is both$600 wing masterpieces plus two$500 portraits:$2200 versus$2100 remaining. Strategic dominance of the jackpot route depends on collection time, exposure and denial; it is plausible from the user's experience but not proved by these guard simulations. Do not claim the economy is validated by this audit.

## Existing coverage

`scripts/check-v47.ts` scans15 seeds in coop/duos for long guard stalls, excluding all sentries. `scripts/verify-v48.ts` has performance/path-budget and40-seed per-difficulty escape modes. Tests in `noise-v47.test.ts` cover forbidden dock waypoints; `noise-v48.test.ts` cover guard replanning fairness/budget and late Echo van priority. Passing/stashing coverage also exists in `noise-v35.test.ts` and `gameplay-coordination.test.ts`.

## Isolated correction experiment

A temporary copy of the engine, changing only the final `walk` movement condition to `if(d>(g.guards.includes(p as Guard)?.05:3))move(...)`, eliminated all11 baseline stalls across the18 representative cases (baseline8 affected cases; experimental0). Results are in `patrol-audit-guard-threshold-experiment.json`. Reproduce without touching production: `node docs/playtests/v72/patrol-threshold-experiment.mjs > docs/playtests/v72/patrol-audit-guard-threshold-experiment.json`.

This is not proof that every guard twitch is solved: the diagnostic angle-flip count for four-player/layout2 collector rose from41 to132 in the changed trajectory. A renderer review and stronger rapid-oscillation metric are needed before claiming smoothness. The experiment changes trajectories, so prior frozen guards being active again naturally changes downstream catches and decisions; do not claim exact gameplay equivalence.
