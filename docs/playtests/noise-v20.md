# Noise Thieves v20 — stationary bot safety

## What changed

Every stationary bot decision now passes through one shared safety check, including waiting for rescue, spacing holds, plate holding, follow/receive holds, and blocked movement. It forecasts each non-retreating guard in 250ms steps through 1.5s, using walls, patrol waypoints and current movement state. This longer forecast is separate from the short travel-routing forecast, preserving v19's guarded movement.

When threatened, the bot selects a nearby unexposed position, favors solid cover, and reaches it through the same guarded planner. Candidate safety accounts for all forecast patrol positions, not only the captor. A held capsule can provide a decoy. Escape targets clear on reaching the van, preventing an in/out boundary loop. Short committed escape targets and a preference for continuing the previous escape direction prevent frame-by-frame reversals. A safe rescue can interrupt that commitment once per capture.

A valid rescue channel is not abandoned for a guard arriving only after completion would grant 3s protection. Current danger still interrupts it. No protection duration, rescue duration, guard difficulty constants, map, loot, or game rule changed. New per-match evasion state resets on replay.

## Fixed 40-seed capture regression

`scripts/verify-noise-v20.ts` reconstructs the supplied Claude fixture description: seeds 1–40, Normal co-op, Auto Echo, events ON. The capture scenario starts at the 13s clock mark with the crew at spawn; the human walks toward the nearest currently patrolling guard, stands until freed, then walks toward its van. Captures and releases are natural. Every seed counts; none is replaced or filtered based on outcome.

| Measure | v19 baseline | v20 | Gate |
| --- | ---: | ---: | ---: |
| Human captured | 40/40 | 40/40 | All cases |
| Echo caught during human's hold | 0/40 | 0/40 | <=4/40 |
| Echo caught within 3s after release | 0/40 | 0/40 | <=4/40 |
| Human rescued | 30/40 | 33/40 | >=16/40 |

Important: this reconstruction does **not** reproduce Claude's reported v19 21/40 held-time captures or 17/40 rescues. It must not be described as a measured 21-to-zero improvement. His actual fixture source/state remains needed for exact comparison. An initial alternative that actually simulated 13s of idle time before the approach put Echo elsewhere and produced only 6/40 rescues on v19; that is a different starting state, not the fixed spawn-at-13s fixture above.

A separate focused approaching-patrol test fails against v19 (Echo remains stationary) and passes with the new safety check. It starts Echo outside the current cone but inside the 1.5s forecast, then checks that Echo actively moves and remains uncaught. This isolates the missing idle-state behavior without relying on the unreproduced aggregate rate.

Raw baseline and final runs are in `v20/baseline.json` and `v20/claude-fixture.json`.

## Existing checks

All **97 tests pass**: the 95 existing tests, including v18 rescue speed/art loss/vibration/jackpot checks and v19 rejoin coverage, plus two v20 regressions. Existing thresholds were not weakened. Intermediate implementations that caused vibration or slowed rescues were rejected before release.

## Browser playtest scope

The supported managed browser preview worked in this run. I started a Normal solo game, entered the briefing, used Follow/Hold Plate/Fetch commands, observed Echo traverse the Night Archive with active guards, and checked the rendered arena, countdown and action row. Screenshot: `v20/browser-playtest.jpg`.

This was a limited live interaction/observation pass, not a full skilled-human match. The browser surface did not provide reliable sustained movement; short keyboard presses did not support a meaningful human heist. A Fetch command was accepted, but successful pickup/banking was not established by this UI observation. Do not use this as evidence that every route, all controls, or subjective play feel are correct.

## Still unverified

- Exact reproduction of Claude's original failing seeds/trace, beyond the reconstructed fixture and targeted regression.
- A complete hands-on human match, mobile touch behavior and two-device online latency.
- All possible stationary threats: the 1.5s forecast approximates future patrol motion and cannot predict every new player/noise action.
- Absolute difficulty targets and broader human balance; the difficulty-order gate is reported separately below.

## Final difficulty gate

Unchanged naive collector + Auto policy; 40 identical seeds (1001–1040) per cell, 240 matches. No difficulty constants or bot skill settings changed.

| Mode | Rookie | Normal | Pro |
| --- | ---: | ---: | ---: |
| Co-op win rate | 97.5% | 72.5% | 22.5% |
| Rivals win rate | 72.5% | 57.5% | 47.5% |

Both strict Rookie > Normal > Pro gates pass. Absolute rates differ from earlier approximate targets, particularly Rookie co-op and Pro rivals; this is not a claim of final balance. The final matrix is tied to the engine and policy hashes in `v20/difficulty-matrix.json`. Earlier routing candidates that failed ordering were rejected; neither seeds nor gate thresholds changed.

Final validation: 97/97 tests, TypeScript and production difficulty gate pass. The 1.5s forecast includes patrol/investigation/chase speed and the existing alert-speed modifier.
