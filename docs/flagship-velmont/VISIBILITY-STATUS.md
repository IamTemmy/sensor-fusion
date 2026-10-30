# Visibility, sound and dock candidate — not yet merged

Implemented readable Shadows/Full lighting, three-second guard silhouettes, nearby unseen footsteps, faint flashlight cues, exhibit values, an accessible title, and a boarding notice below the timer. Restored solid dinosaur/statue/orrery exhibits. Rivals docks now leave a 34u walk-through gap (was 15u); a 13u-radius thief fits, with a continuous clear center line from the front approach to the rear. Co-op keeps its original dock.

Sound fixtures cover a thrown jar luring a guard around the Clock doorway, a throw triggering a Hall emitter, and a throw stopping at a solid centerpiece. Existing art-pass tests ensure a queued pass cannot substitute a sound jar. Both loading-bay entrances reach either van after either rematch assignment.

## Final branch checks (not a release pass)

- 264 tests passed; TypeScript and geometry checks passed. The seven new tests cover guard memory, solid-exhibit clearance, both bay approaches and the continuous 34u van gap, rematch/snapshot dock positions, three sound-throw scenarios, and pulling the Portrait sentry through its doorway.
- Unintended bot idle: 0/30. Patrol stalls: 0; Archive patrol passes: 9/9.
- Crown early banks: 0/120.
- Echo escape: Rookie 40/40, Normal 40/40, Pro 39/40 (one tied up, none left behind untied).
- Host p95: 5.37ms; maximum: 38.60ms. Both pass the 8ms/40ms limits.

| Deterministic collector win rate | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op, 40 seeds | 100% | 45% | 32.5% |
| Duos, initial docks, 40 seeds | 100% | 60% | 37.5% |
| Duos, swapped docks, 40 seeds | 100% | 72.5% | 57.5% |
| Duos, pooled | 100% | **66.25% — fail** | **47.5% — fail** |

Rivals Normal must be 45–60% and Pro 25–40%. These two release gates fail, so this candidate has **not** been merged or deployed. Source-matched results are in `../playtests/flagship-velmont/release.json`. Earlier completed candidates remain in `visibility-iteration-1` through `visibility-iteration-4`; no failed result was relabelled as passing. Coordinate changes materially affect the scripted collector's routes; the unresolved issue is rivals balance, not sound collision or route reachability.

No scoring, timers, guard speed, rival skill or network transport changes. Current candidate reports are source-hashed. Screenshots are frozen development fixtures, not physical-device or multiplayer human tests.
