# Noise Thieves v21 — exact Claude rescue fixture

## Reproduction

The supplied script is preserved in `scripts/verify-noise-v21.ts`, wrapped by `tests/claude-fixture.test.ts`. Its setup, commands, 13,000 ms advance, guards[0] target, 40 seeds, 40 ms inputs, hold/release loop and counters are unchanged. Added reporting records each seed and asserts that all 40 actually reach capture; no skipped-outcome filtering or extra immunity is used.

| Exact fixture | v20 baseline | v21 | Gate |
| --- | ---: | ---: | ---: |
| Echo caught during human hold | 15/40 | 0/40 | ≤4/40 |
| Echo first caught within 3s after release | 3/40 | 4/40 | ≤4/40 |
| Human rescued | 16/40 | 16/40 | ≥16/40 |

The post-release result is at the allowed ceiling and is one case worse than baseline; this is not a claim of perfect safety. Raw seed results are in `v21/baseline.json` and `v21/claude-fixture.json`.

Technical fidelity note: the existing engine caps one `advance` call's simulated catch-up at 2 seconds, then advances its clock for the remainder. The supplied 13,000 ms call is retained exactly; it is not replaced with 325 individual ticks. This fixture therefore reproduces Claude's script, rather than asserting that 13 full seconds of physical simulation took place.

## Behavior changes

- Waiting invokes the long forecast before returning, even when an earlier decision moved Echo. Rescue approaches project Echo along the planned route against every non-retreating guard's forecast.
- The forecast accounts for the rescue channel and its existing protection. A distant guard that cannot reach Echo before completion does not unnecessarily veto the rescue.
- Escape destinations must have a traversable, guard-checked approach. An escape is reconsidered when that approach becomes unsafe. The search reaches farther for actual cover and selects the least exposed reachable alternative if no completely clear destination exists.
- A short escape commitment prevents approach/retreat oscillation. A safe rescue opportunity can interrupt it once per capture; that opportunity is not consumed when there is no escape to interrupt.
- Forecasts ignore opening-grace guards parked by the actual simulation. Previously those inactive guards could send Echo away before a rescue started.
- Autonomous rival crews retain the v20 roaming escape policy outside rescues. Human-facing bodyguards use the broader cover search; autonomous crews also use it while a teammate is held or protected after release. This keeps the rescue fix from making rival collectors abandon normal jobs.
- Existing captor retreat, release/rescuer protection, rescue duration, guard strength, capture rules, loot and maps are unchanged. Normal autonomous rivals now start collecting at 3s instead of 8s, correcting the old inversion where Rookie started earlier (5s). Pro remains 1s. This preserves the intended startup progression without changing the difficulty test.

## Verification

- All 98 tests passed; TypeScript check passed.
- Original v18 natural-capture fixture: 37/40 rescues; its median-time, post-rescue-capture and carrying-art gates pass.
- Existing spacing regression remains within six reversals per rolling two seconds on all 20 seeds.
- Difficulty matrix: see `v21/difficulty-matrix.json` and the status entry after the gate completes. Gate and simulation policy are unchanged; only the report directory advances to v21.

## Limits

These are deterministic engine playtests, not a new human/browser or two-device network playtest. The exact fixture covers Normal co-op with Auto Echo on seeds 1–40. It does not establish zero captures in arbitrary matches, other human routes, or all seeds. No claim is made that every possible situation is safe; the game retains real danger.

## Final difficulty gate

Unchanged naive collector + Auto Echo, identical seeds 1001–1040, 40 matches per cell (240 total):

| Mode | Rookie | Normal | Pro |
| --- | ---: | ---: | ---: |
| Co-op wins | 97.5% | 67.5% | 22.5% |
| Rivals wins | 65.0% | 62.5% | 50.0% |

Both strict ordering gates pass. The Rookie/Normal rivals margin is only one match, and absolute earlier balance targets are not all met; this is not proof of robust ordering over every seed or human policy. Two intermediate candidates failed rivals ordering and were not released. The final matrix records the exact engine and policy hashes.
