# Three-star and rules audit — 30 October 2026

The round remains 90 seconds. A three-star co-op run requires the $2,600 goal,
an escape, every ordinary exhibit, and the Crown. The total collection is $4,300.
All-art banking starts the existing 15-second Last Call; this audit measures when
the final exhibit was banked, separately from departure.

## Confirmed defect and correction

The unexpected-loot event previously resealed an unclaimed exhibit after 15 seconds.
Because that exhibit remained part of the full-collection star requirement, missing
its window permanently prevented two/three stars, even with time left. Reproduced
in both architectural museums with failing regression tests before the fix.

Arriving loot now stays available until departure. It remains invisible before
arrival, is announced once, and keeps its original value. The announcement states
its actual availability. No round length, score value, Crown lock, guard tuning,
geometry, or networking changes.

## Seeded timing test

`scripts/audit-perfect-haul.ts` drives one scripted player alongside real Auto Echo.
The player collects, orders Hold Plate at 30 seconds for a Crown attempt, bottles
and throws alarms, returns to bank, and requests extraction. Guards, collisions,
alarms, return paths, captures, and timers run normally. No teleports, immunity,
guard removal, pre-banked loot, or extended clock. Seeds 1001–1020 per cell.

The planner has full map/state knowledge and is not a representative human player.
These are policy-specific outcomes, not difficulty win-rate targets and not manual
browser victories. A failed scripted attempt does not prove a human cannot succeed.

| Museum | Rookie three stars | Normal three stars | Pro three stars |
| --- | ---: | ---: | ---: |
| The Velmont | 11/20 | 1/20 | 0/20 |
| Night Archive | 18/20 | 9/20 | 0/20 |

The Velmont's Normal success banked all $4,300 at 68.92 seconds; Night Archive's
Normal successes completed at 66.64–89.72 seconds. All these runs earned three
stars at the actual recap. This establishes feasibility within 90 seconds on
Rookie and Normal in both museums, not comfortable attainability on every seed.
Pro full-collection feasibility remains unproven by this policy. Its failed runs
include catches and uncollected art; they do not isolate the timer as the cause.
The timer was therefore not increased solely to compensate for policy limitations.

The live page was inspected and keyboard/on-screen movement attempted. Cloud-browser
input/render cadence was unsuitable for claiming a timed manual full match; timing
conclusions above come from engine-level input simulations, not that interaction.

Reproduce from the repository root:

```sh
AUDIT_COUNT=20 AUDIT_OUT=/tmp/perfect-velmont.json node --experimental-strip-types scripts/audit-perfect-haul.ts
GATE_MUSEUM=night-archive AUDIT_COUNT=20 AUDIT_OUT=/tmp/perfect-archive.json node --experimental-strip-types scripts/audit-perfect-haul.ts
pnpm test
pnpm typecheck
node scripts/flagship-gates.mjs
```

Raw results: `velmont.json`, `archive.json`. The full release certificate and Crown,
Echo, chase-fork, idle, patrol, and CPU results live in the sibling museum folders.

## Rules checked without changing them

- Co-op three stars require the full collection; rivals three stars instead require
  the winning/tied-highest haul plus the Crown. These are different objectives,
  consistent with the recap's displayed criteria.
- The Crown still cannot be picked up before 1:00 remains. Banking quickly after
  that unlock is allowed, as previously approved.
- Banking the final piece grants the existing full 15-second Last Call, including
  when the last piece is banked just before the original deadline.
- Being left behind retains the existing personal 25% bank penalty.
- The surprise piece is part of the original $4,300 budget, not extra money added
  on top of it. This correction changes availability, not scoring.

## Release validation

294 tests and TypeScript passed. Both museum suites passed the existing idle,
patrol, Crown lock, human/Echo Crown, Echo-alone haul and Echo-escape gates. The
Velmont chase-fork test caught 7/33 after a throw (21.2%, within the 25% gate).

The initial Velmont CPU run had a 55.84 ms maximum (6.26 ms p95), failing the
40 ms maximum gate. Slow ticks occurred at 10.8s/11.8s, before a job event, and
this CPU fixture's event is a shift rather than the changed vault arrival.
Two unchanged-source, serial repetitions of all six cases passed: p95 5.82/5.85 ms,
maximum 30.93/20.56 ms. The original outlier's cause is not established. All three
measurements are retained; the release certificate explicitly records the recheck.
Night Archive passed initially at p95 7.08 ms, maximum 29.61 ms.
