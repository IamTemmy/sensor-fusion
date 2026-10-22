# Noise Thieves v19 — safe rejoin and waiting

Changes are limited to bot movement and its regression coverage. Arenas, rules, rescue timers/protection, loot, labels, difficulty parameters and client rendering are unchanged.

## Changes

- Every bot movement branch now enters the guard-aware weighted planner: follow/rejoin, receiving a pass, cover, spacing, post-rescue cover, banking, last-call boarding, alarm collection and rival interception, as well as existing plate/fetch/rescue paths.
- Planned movement is checked against current and short-look-ahead guard cones. An unexposed bot cannot enter a new cone. A bot already exposed can move away from its threat, rather than freezing while carrying a screaming exhibit; escape steps still cannot enter another guard's cone.
- Blocked bots hold, seek cover when already threatened, or throw their held capsule as a decoy. Cover fallback uses the same movement gate without recursive fallback. Brief cover-target commitment and spacing hysteresis remain intact.
- Waiting during a capture now checks current/projected danger and upcoming patrol waypoints. Cover scoring avoids every nearby active patrol's next waypoint, not only the captor's target. The human's release does not bypass these checks.

## Verification

The 92 existing tests pass unchanged. New coverage includes a 40-case actual self-release regression, a focused cone-crossing rejoin test in Auto/Follow/Cover, and a check preventing direct movement calls in bot decision branches. TypeScript passes.

The focused cone-crossing regression **fails against v18** (`0215b6f`: Auto enters the visible cone) and passes against v19 in all three modes. It uses a deliberately stationary guard to isolate the movement decision; it is not a natural-capture simulation.

The natural-capture fixture starts the crew in seeded, unobstructed patrol-area positions after the onboarding grace period, 160 units apart, with all guards active. The human walks into a patrol, stands until released, then walks toward its van. No guard is removed, no capture is forced and no immunity is added. Mid-job events are disabled to isolate movement. Only actual timer releases with Echo free to move at that instant qualify; earlier teammate rescues and already-held Echo cases are recorded separately. Cases are taken in seed order, never selected by the subsequent capture outcome.

- v19: **0/40 Echo captures within the three seconds after self-release**, meeting the <=4/40 gate. First 40 eligible cases occur through seed 360; all other 320 cases are retained in `v19/release.json`.
- v18 comparison: **0/40** on the same fixture procedure, through seed 327, with 287 other cases retained in `v19/baseline.json`. This procedure **does not reproduce Claude's reported 15/40 failure rate**. It must not be presented as a measured 15-to-zero improvement. The targeted cone test and movement-branch audit establish the bypass being fixed. Claude's original fixture is still needed for exact reproduction.
- Existing v18 rescue, carrying-loss, idle-spacing, active-guard jackpot and client burst/collision tests continue to pass, without weakening thresholds.

## Difficulty gate

Unchanged naive collector + Auto policy, 40 identical seeds (1001–1040) per cell, 240 matches. No difficulty constants or simulation policy were tuned in v19.

| Mode | Rookie | Normal | Pro |
| --- | ---: | ---: | ---: |
| Co-op win rate | 92.5% | 65.0% | 30.0% |
| Rivals win rate | 65.0% | 57.5% | 50.0% |

Both strict Rookie > Normal > Pro build gates pass. The absolute rival win rates are higher than the earlier approximate 60/35/15 targets, especially Pro. Safer routing changes both teammate and opponent decisions. This focused fix preserves ordering, **not those absolute targets**, and does not claim balance is final. Raw results and source/policy hashes are in `v19/difficulty-matrix.json`.

## Unverified

- Exact replication of Claude's natural-capture fixture and reported failure rate.
- Hands-on browser/phone movement feel and two-device online latency; no manual playtest is claimed. Prior managed-preview access restrictions remain unresolved.
- Broad balance beyond the unchanged collector policy; no claim that smarter routing guarantees safety or that all situations are solved.
- The previously reported cross-museum jackpot target is not newly certified by the near-crew regression.
