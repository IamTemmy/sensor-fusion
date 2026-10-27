# v46 — progressive match hitching

The user reported that both players started smoothly, then hiccupped/froze as the match progressed. Production error logs showed no new room API exceptions after the v45 queue fix, so this pass investigated client CPU work rather than treating every stall as networking.

## Changes

- Guest prediction no longer reruns the entire AI/world engine on every snapshot and animation frame. It predicts local movement/actions, dead-reckons remote movement briefly, and reconciles to host snapshots. The host remains responsible for bots, captures, sensors and scores.
- Exact grid BFS routes and walkable cells are cached by collision geometry with bounded cache sizes. Final continuous-position visibility checks still run. Pure cover/unstick candidate scores are computed once per selection instead of repeatedly inside sorting comparisons.
- Guard-danger checks avoid unnecessary searches/allocations for clearly safe or already-visible points.
- Constant actor outline/tint effects are rasterized once into bounded sprite caches instead of running four drop-shadow filters per actor per frame. Original painted art is retained.
- HUD publications are throttled to about 10Hz independently of canvas drawing.
- The worker clock permits only one pending message. Host catch-up yields after its CPU budget rather than executing five expensive ticks consecutively.

## Measurements

Run `node --experimental-strip-types scripts/profile-runtime.ts`. Before and after reports are in this folder. Baseline source: Sites a9351d4 (GitHub 21733d0). One identical seeded 90-second four-seat match, two scripted human collectors and two bots, measured sequentially on the same executor. These are CPU timings, not phone FPS or network latency.

| CPU work | Before | After |
|---|---:|---:|
| Mean host tick | 4.13 ms | 1.73 ms |
| Host tick p95 | 12.76 ms | 6.53 ms |
| Mean host tick, last 30s | 4.92 ms | 1.77 ms |
| Mean guest snapshot + 12 frames | 46.54 ms | 0.42 ms |
| Maximum guest snapshot + 12 frames | 221.13 ms | 2.05 ms |

The authoritative result was identical: $3,100 total, seat banks [1300,1800,0,0], alarm-capture counts [1,0,0,0]. 2 host ticks exceeded 40ms in this sample (worst 241.61ms); occasional host stalls are not ruled out. This does not prove hitch-free performance on all devices.

## Verification and limits

- 182 automated tests passed, including rescue, fairness, movement prediction, rollback, replay, networking and new no-guest-AI / worker-backpressure checks.
- TypeScript passed.
- Final 240-match difficulty gate passed unchanged: co-op 87.5/70/22.5%, rivals 87.5/47.5/35% (Rookie/Normal/Pro).
- Preview normal UI: host and guest joined a rivals match with two bots; both completed a full 90-second match with matching results, then replayed and completed a second match. Guest movement after replay was verified. Actor outlines and painted art visually inspected.
- Real phones, the user's networks, Direct connections and sustained frame rate on those devices remain unverified. Relay network latency is not eliminated by this CPU optimization.
