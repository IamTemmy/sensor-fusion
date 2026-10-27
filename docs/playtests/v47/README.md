# v47 — clarity and stuck patrol investigation

## Shipped changes

- Reproduced frozen Archive patrols: waypoints inside forbidden loading bays. Guards skip invalid waypoints without entering bays. Existing guard separation remains unchanged.
- Rivals plate-job bots can grab an already reachable, safe alarm when the jackpot approach is exposed; the existing capsule throw then resumes the job. This is deliberately not enabled in co-op yet: enabling it moved Normal beyond the existing difficulty gate.
- Restore Normal rivals to its gate with rival movement multiplier 1.14 (was 1.10). No guard-count, arena-size, transport, prediction or worker-loop changes.
- Bot orders are floating desktop popovers / six-order phone sheets. Escape, outside click, selection and opening Help close them; Help stays on top.
- Guide width stays 1080px across all five desktop tabs. Previously buried museum rules are a visible tab. Matching phone card layouts; G/drop and stash visibility explained.
- Recap finish message no longer overlaps totals. Empty aborted rooms cannot earn “all normal art”. Alarm counts now say “alarms grabbed”. Count-up clamps negative animation progress.
- Stashed art is visibly drawn for thieves, with a stash/value tag. POST EMPTY is hidden when an active guard is within 60 units. Remove one redundant decorative guard light; remaining lights are badge/torch, not a score.
- Hide room labels near staff doors, posted guards and actors. Single hand-state line; redundant objective card removed. Radio deduplicates identical events within ten seconds and strips tutorial prose.
- Museum Alert label and 30/60 threshold copy. Phone tips moved above controls, briefing gets scroll padding, camera includes an edge margin, canvas pixel ratio capped at 1.5 on phones (2 desktop).
- Visible game wordmark; rotating preparation tips; Copy invite link with ?crew= prefill; read-only saved-seat validation before showing Rejoin crew CODE.

## Verification

- 188 automated tests passed. Includes existing rescue fixture, freeze/lure, route-fairness, host-authority, prediction, rollback and replay tests.
- Six new tests: forbidden dock patrol, 96 stash/hide/retrieve checks, empty recap, radio deduplication, full-job RAF/fixed-tick equivalence, rivals jackpot distraction.
- TypeScript passes.
- 240-match difficulty gate, same naive collector + Auto Echo, seeds 1001–1040:

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 87.5% | 70% | 22.5% |
| Rivals | 90% | 50% | 35% |

- Initial 12 rivals matches: no six-second non-sentry stalls after waypoint fix. Broader 30-match check found one chase stall (duos seed 8, Crossroads, ~67.7s). This remains unresolved; do not claim every frozen-guard case is fixed.
- CPU benchmark in performance.json: host mean 1.09ms, p95 5.18ms, max 15.04ms, zero ticks above 40ms; guest snapshot plus 12 frames mean 0.55ms, max 1.32ms. Same benchmark script as v46. Original strict p95<=4ms/max<=15ms targets are NOT fully met. These are executor CPU measurements, not mobile FPS or network latency.
- Browser layout QA at iframe viewports 1280x720 and 390x844. Verified phone all-six-order sheet, selection/Escape dismissal, Help layering; all five guide tabs remain same desktop width. Screenshots are staged UI fixtures, not evidence of live multiplayer.

## Not yet verified / intentionally deferred

- No new real-phone or two-person network test. User reported v46 latency resolved; transport files are unchanged. Samsung frame rate still needs device testing.
- Echo's reported 40-second browser carry was not reproduced. A full-job RAF vs fixed-tick comparison matched positions, hands and banking exactly; that does not rule out every local-loop issue.
- One chase stall remains in the expanded guard sweep. Guard artwork can still overlap at existing physical separation; no new separation/balance change is claimed.
- Full screenshot matrix of every requested state/tab was not completed. Kept only selected verified captures; mobile recap legitimately scrolls.
- Co-op jackpot distraction autonomy, arena expansion/art redistribution and practice redesign deferred to avoid unvalidated balance/performance changes.
- Refresh still returns home. Saved guests can rejoin a valid crew. A host refresh can end the authoritative match; refresh is not a reconnect remedy. Read-only resume validation and invite prefill need production expired/active room checks.
- Competition mobile-specific requirement not independently verified from the inaccessible Handshake mission page in this pass.
