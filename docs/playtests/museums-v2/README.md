# Museums v2 — review branch

**Not cleared to merge or deploy. Failed gates are retained below.**

Three mirrored architectures: Echo's open court and gated side alcoves; the Archive's shelf aisles, blind collection ends, catalog crossing and laser-gated folio vault; the Observatory's circular floor hub, four guarded spokes and outer loop. Population plans preserve the same fair wing structure while changing partition lengths. Existing skins, painted centrepieces and lore remain. Rooms, patrol circuits, staff entries, hiding recesses and solid exhibit footprints follow the new architecture.

The follow-up fixes art-pass silence preservation and stale throw intent, posted-guard forecasts, mirrored Archive sentry pairing, and Rookie crews abandoning the final jackpot. Route queues and sampled wall checks are optimized. Networking, score values, timers and numeric difficulty tuning remain unchanged. The existing budget is **$4,300 including the $1,200 jackpot**, not $5,500. Six-player games retain their existing $500/$400 redistribution instead of introducing $600 pieces.

## Gates

- Unit tests: **232 passed**; TypeScript: **PASS**.
- Reachability/sentries: **9/9 plans**, **54/54 mode/difficulty/population setups**. Radius 13, both docks, all art/plate/niches, collision-safe guard routes.
- Paired-art and centre-objective fairness: **0.000000% maximum difference**. Pocket-art random offsets: **0.199%** across all 25 offset combinations.

### Thirty matches per museum

A detected stop means a bot remained within 10 units of its anchor for at least 6 seconds. Escaped, tied, hidden, and active short interaction channels are excluded. One detection per bot per match. Ten games per capacity (2/4/6), with Rookie/Normal/Pro represented and a naive human collector. The literal zero-idle gate includes deliberate waits; those are **not silently discarded**. Counts describe detections, not proof that every wait is a defect.

| Museum | Matches | Detected ≥6s stops | Dock waits with only jackpot left | Dock waits while art carried | Plate holds | Rescue waits | Unexplained | Literal gate |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Echo Gallery | 30 | 6 | 2 | 1 | 2 | 0 | 1 | FAIL |
| Night Archive | 30 | 10 | 1 | 0 | 6 | 1 | 2 | FAIL |
| Crossroads | 30 | 9 | 0 | 0 | 9 | 0 | 0 | FAIL |

Rookie autonomous crews now assign a plate holder and jackpot collector when ordinary art is gone. Raw stationary detections remain in idle-0/1/2.json; deliberate plate and safe-rescue waits are still shown rather than discarded.

### Echo left behind at the van

Same idle-human/Auto-Echo policy as v73, seeds 1001–1040, 40 per difficulty.

| Difficulty | Escaped | Tied at finish | Left behind | Gate ≤2/40 |
|---|---:|---:|---:|---|
| rookie | 39 | 0 | 1 | PASS |
| normal | 37 | 2 | 1 | PASS |
| pro | 39 | 1 | 0 | PASS |

### Difficulty versus v73

Naive collector + Auto Echo, unchanged policy, seeds 1001–1040. Strict wins; ties are not wins. Required difference: ±10 percentage points per cell.

| Mode | Difficulty | Games | v73 | Candidate | Change (pp) | Gate |
|---|---|---:|---:|---:|---:|---|
| coop | rookie | 40 | 92.5% | 82.5% | -10.0 | PASS |
| coop | normal | 40 | 52.5% | 60.0% | +7.5 | PASS |
| coop | pro | 40 | 20.0% | 27.5% | +7.5 | PASS |
| duos | rookie | 40 | 90.0% | 77.5% | -12.5 | FAIL |
| duos | normal | 40 | 50.0% | 67.5% | +17.5 | FAIL |
| duos | pro | 40 | 25.0% | 55.0% | +30.0 | FAIL |

### Nearest $2,600 collection distance

Metric: minimum **sum of individual dock-to-art shortest paths** for a subset worth at least $2,600; not a multi-pickup traveling-salesperson route. Visibility graph uses radius-13 expanded rectangular obstacles. Lasers remain traversable hazards; temporary guards are excluded from architectural fairness. Each crew's actual carried-art journey still includes return trips, alarms and guards.

| Museum | Capacity | Mint distance (u) | Violet distance (u) | Difference |
|---|---:|---:|---:|---:|
| Echo Gallery | 2 | 1729.9 | 1729.9 | 0.000000% |
| Night Archive | 2 | 2095.5 | 2095.5 | 0.000000% |
| Crossroads | 2 | 1711.5 | 1711.5 | 0.000000% |
| Echo Gallery | 4 | 1754.6 | 1754.6 | 0.000000% |
| Night Archive | 4 | 2114.5 | 2114.5 | 0.000000% |
| Crossroads | 4 | 1719.4 | 1719.4 | 0.000000% |
| Echo Gallery | 6 | 1678.6 | 1678.6 | 0.000000% |
| Night Archive | 6 | 1947.4 | 1947.4 | 0.000000% |
| Crossroads | 6 | 1680.2 | 1680.2 | 0.000000% |

### Host tick cost

Three paired runs per museum, four thieves, same deterministic two-human collector policy and seed in each pair. Table shows median whole-match p95 of E.advance(40ms), alternating baseline/candidate order. Input-policy calculation is outside the timer. This is local Node simulation timing, not browser frame rate or internet latency.

| Museum | v73 p95 (ms) | Candidate p95 (ms) | Change | No-regression gate |
|---|---:|---:|---:|---|
| Echo Gallery | 2.604 | 1.247 | -52.1% | PASS |
| Night Archive | 1.342 | 2.230 | +66.1% | FAIL |
| Crossroads | 3.737 | 2.178 | -41.7% | PASS |

## Passing regression coverage

Silenced art retains its original deadline when caught or missed; expired silence produces the normal art alarm. Hot art remains hot. A bound pass cannot throw a replacement jar, including during guest prediction/reconciliation. Buttons distinguish quiet art, art with an alarm, and throwing an alarm. Phone labels were visually checked at 390×844. Wall-check broad-phase results match the old sampled implementation on 30,000 deterministic checks; 96 non-posted-guard routes matched the pre-optimization pathfinder.

## Screenshots

Frozen development fixtures, not live-match evidence. Desktop 1280×720 full map; phone 390×844 closer view near each centrepiece. Actors are positioned clear of centrepieces for architecture review.

![All three museums, desktop and phone](screenshots/museum-review.jpg)

| Museum | Desktop | Phone |
|---|---|---|
| Echo Gallery | [Full map](screenshots/museums-v2-echo-desktop.jpg) | [Closer view](screenshots/museums-v2-echo-phone.jpg) |
| Night Archive | [Full map](screenshots/museums-v2-archive-desktop.jpg) | [Closer view](screenshots/museums-v2-archive-phone.jpg) |
| Crossroads | [Full map](screenshots/museums-v2-crossroads-desktop.jpg) | [Closer view](screenshots/museums-v2-crossroads-phone.jpg) |

## Reproduce

Baseline: git worktree add --detach ../velmont-v73 7db285ee540546db14001349aedb5737fca2b8af. Run pnpm test, node scripts/run-museums-v2-gates.mjs, node --experimental-strip-types scripts/benchmark-museums-v2.ts, then node scripts/report-museums-v2.mjs. The benchmark waits for an explicitly pending idle-audit-state.json so concurrent audits do not contaminate timing. Keep the benchmark isolated from other heavy jobs.

Legacy tests that required asymmetric maps were updated to mirror fairness. Dead-end aisle access is checked without demanding a second exit; other existing two-route tests still pass. The old interaction fixture now clears modern niches/sensors so it actually tests the original fixed geometry. New 5% fairness and nearest-$2,600 assertions were added. No behavioral acceptance threshold was weakened.

Source fingerprint (engine + arenas): 07e83bf8bd7dc01073dde9c0572f5ede39f7f82e0e3ed67cd8eea567052973c0.
