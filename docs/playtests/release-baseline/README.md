# museums-v2 release baseline

Approved for main after a bounded rivals-only balance pass. Engine change: museum rival collection movement factor Normal 0.97 → 1.26, Pro 1.65 → 1.85. Rookie, co-op decisions and tuning, carry speed, art values and timers are unchanged. Tested candidates and their strict player win rates: Normal 1.30 = 42.5%, 1.20 = 67.5%, 1.26 = 57.5%; Pro 1.95 = 42.5%, 2.10 = 55%, 1.95 with 1.15 carry factor = 52.5% (rejected), 1.85 = 37.5%, 1.90 = 45%. These fixed-seed results are policy benchmarks, not measured human win rates.

Validation uses seeds 1001–1040, naive collector + Auto Echo:

| Difficulty | Rivals player wins | Co-op wins | Echo left outside, not tied | Tied at finish |
|---|---:|---:|---:|---:|
| Rookie | 77.5% | 82.5% | 1/40 | 0/40 |
| Normal | 57.5% | 60% | 1/40 | 2/40 |
| Pro | 37.5% | 27.5% | 0/40 | 1/40 |

- 232/232 tests; typecheck passed.
- Geometry 9/9 population plans, 54/54 mode/difficulty setups; mirrored route fairness ≤5%.
- Stationary-bot detector: 0/30 in each museum, excluding deliberate plate/van/tied/hidden waits, short bottle/windup/rescue channels. This is the repository detector with explicit exclusions, not Claude's unavailable detector.
- Co-op matrix is identical to the pre-balance museums-v2 matrix.
- CPU evidence is in cpu.json (isolated run, no concurrent simulation jobs).
- Removed unused legacy night-city.webp; current artwork remains below the existing 3 MB asset budget. No relaxation of that test.
- Build difficulty targets now reflect the user's approved ranges, including Pro.

Full logs and machine-readable results are adjacent. The older museums-v2 report records its historical v73-relative failures; this report records the new acceptance criteria and final tested baseline.
