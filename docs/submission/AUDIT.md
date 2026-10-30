# Submission readiness audit

## Changes

- Closed and finished rooms no longer issue TURN/ICE credentials on bootstrap or refresh. Valid human seat credentials are still required; tests cover eight allowed/denied cases.
- Menu portrait sheet reduced from 162,312 to 141,626 bytes, bringing loaded art back under the existing 3 MB budget.
- Corrected stale Jackpot help: the Crown no longer has its old extra speed penalty or irremovable alarm. Both flagship museums are named.
- No gameplay tuning, layouts, timers, scoring or multiplayer transport changes.

## Verification

- Final unit/regression suite: 317 passed, 0 failed.
- TypeScript: passed.
- Desktop: actual home, host creation, rivals preset, bot-fill, help tabs, co-op briefing and match launch reviewed.
- Phone: actual home at 360 × 740 and practice launch reviewed. Lobby at 390 × 844, result screen at 390 × 844 and gameplay at 844 × 390 reviewed with frozen presentation fixtures. Fixtures are layout evidence, not multiplayer or gameplay outcomes.
- Controls remain separated from the map; lobby and recap primary actions remain visible while their content scrolls.
- Empty-handed boarding confirmation observed in a live local match.
- User separately reported a lag-free real multiplayer test with on-campus and off-campus friends. This is user-reported evidence, not a latency measurement from the audit browser.

Full simulator results and CPU measurements are recorded in `full-run-original.json`. All gameplay checks passed, but BOTH CPU gates failed. The source differs from the simulation hash only by the corrected help sentence; the engine, layout, tuning, client transport and input files are byte-identical to main. No passing release certificate was issued.

Screenshots: [phone lobby](phone-lobby.jpg), [phone recap](phone-recap.jpg). Both are frozen presentation fixtures.

## Limits

UI checks and deterministic simulations cannot guarantee every device/network or every possible match. TURN credentials previously produced no candidates in this cloud browser environment; the successful real-network friend test is the relevant external connectivity evidence. Do not describe TLS candidate gathering as independently verified by this sweep.

## Blocking result — not deployed

| CPU gate | p95 | Maximum |
|---|---:|---:|
| Velmont first run | 10.00 ms | 108.77 ms |
| Archive first run | 13.09 ms | 517.31 ms |
| Velmont isolated recheck | 10.39 ms | 398.36 ms |
| Required | <8 ms | <40 ms |

The same engine's checked-in previous measurements were Velmont 6.43/31.36 ms and Archive 7.10/32.59 ms (p95/max). The unchanged code suggests environment sensitivity, but this audit does not establish its cause. Do not call the new CPU gate passed. The deployed game remains unchanged; fixes are on a review branch pending performance review.

Gameplay results: both museums idle 0/30; rush 0 early pickups/120; patrol stalls 0/9. Human Crown banks Rookie/Normal/Pro: Velmont 20/19/15 of 20, Archive 20/20/17 of 20. Echo Crown Normal 19/20 and 20/20. Normal Echo-alone medians $1,950 and $2,000. Chase-fork caught rates 7/33 (21.2%) and 14/44 (31.8%). Echo left behind across 40 seeds per difficulty: Velmont 0/0/0; Archive 0/2/0. Win rates are informational in the full report.
