# Velmont v48 — final polish verification

## Changes

- Echo commits to its own van at 15 seconds remaining, or earlier when estimated route travel plus three seconds exhausts the remaining time. It keeps and banks held art, overrides fetch/reroute tasks, and uses release protection to leave instead of waiting.
- Pro guards get a deterministic 50% chance to reject a landed alarm during a close chase. Rookie and Normal are unchanged. The existing point-blank chase protection still applies.
- New guard grid-path searches are queued and capped at two per simulation tick. Direct clear segments and existing geometry-cache hits require no new search; guards keep following those paths without a delayed waypoint cache. This does not cap bot danger-forecast queries.
- Status title appears once; POST hides near STAFF signs; phone briefings scroll above a fixed start button; Board Van uses the same button dimensions as other actions.
- Invites validate room availability before enabling a codename-and-Join card. Closed/finished rooms do not offer a rejoin. Copy feedback is specific to the clicked control.
- Recap has one headline and one crew haul total, with Escaped at / Van left at labels. Aborted lobbies say Job not started.

No WebRTC, signaling, transport, guest prediction or host-loop files were changed. Room availability checks only read D1; they never advance or mutate a room.

## Escape acceptance

Idle human at spawn, Auto Echo, co-op, seeds 1001–1040, all events enabled. Run `V48_MODE=escape node --experimental-strip-types scripts/verify-v48.ts`.

| Difficulty | Untied left behind before | After | Escaped after | Tied at end after |
|---|---:|---:|---:|---:|
| Rookie | 7/40 | 0/40 | 39/40 | 1/40 |
| Normal | 7/40 | 0/40 | 40/40 | 0/40 |
| Pro | 11/40 | 1/40 | 39/40 | 0/40 |

## UI verification

Preview browser: host created T87LNH through normal UI; a second tab opened the invite, entered a codename and joined the lobby. After host left, reopening the invite showed unavailable with Join disabled. No new gameplay/network test is claimed from this lobby check.

Screenshots in this directory are viewport-sized captures of development presentation fixtures, except `v48-invite-live.png`, which captures the actual invite test. Phone briefing screenshots show the scrollable final lines and unobstructed start button at 390×844 and 360×740. Phone dock shows matching action button sizes. The POST overlap fixture deliberately positions a sentry by STAFF to verify label suppression.

Clipboard writes are unavailable on the plain-HTTP preview; its manual code fallback was observed. The successful clipboard branch was inspected in source but not browser-verified here.

Real phones, real-device multiplayer and sustained host FPS remain unverified in this pass. CPU simulations are not a guarantee of device performance.

## Regression verification

All 195 automated tests passed on the final path-search implementation, including the Claude rescue fixture, bot freeze regressions, lure, route fairness, replay, practice and networking tests. TypeScript passed. The new focused tests cover last-call task precedence and banking, late release, the two-search queue with deferred guards making progress, and deterministic Pro lure rejection over 200 seeds.

## Difficulty matrix

Same naive collector with Auto Echo; 40 seeds per cell (240 matches). The unchanged build gate passed. No additional difficulty parameter tuning was applied.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 85% | 70% | 25% |
| Rivals | 90% | 47.5% | 32.5% |

## Host CPU comparison

Seed 1003, two scripted human collectors plus two bots, full duos match, measured sequentially with no other simulation jobs running. Before is deployed source `b60468bd89e08475680766169fd9808389a5488f`. Units are milliseconds per 40 ms engine tick. These runs include the complete v48 behavior changes, so they do not isolate the path-budget optimization alone.

| Match seconds | Before p95 | Before max | After p95 | After max |
|---|---:|---:|---:|---:|
| 0–10 | 1.24 | 38.51 | 0.84 | 25.96 |
| 10–20 | 8.68 | 39.19 | 8.88 | 24.71 |
| 20–30 | 10.90 | 17.68 | 8.91 | 12.77 |
| 30–40 | 3.77 | 15.83 | 2.83 | 8.34 |
| 40–50 | 1.75 | 154.12 | 1.37 | 8.57 |
| 50–60 | 1.61 | 3.93 | 1.25 | 3.48 |
| 60–70 | 3.23 | 7.21 | 2.92 | 7.67 |
| 70–80 | 3.40 | 7.31 | 2.97 | 6.14 |
| 80–90 | 2.19 | 4.21 | 0.19 | 1.77 |

Mean tick: **1.10 → 0.83 ms**. Observed maximum: **154.12 → 25.96 ms**. Final guard count: 6 before / 6 after. Maximum new guard path searches in any final-run tick: **2**.

This sample improves mean and worst observed tick time, but does not establish the earlier aspirational p95 ≤4 ms / max ≤15 ms budget: some intervals still exceed it. No claim of universally hitch-free phone performance is made.
