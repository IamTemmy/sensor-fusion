# Crown play-test and outward getaway

2026-10-30. Follow-up to v80. No manual browser Crown win is claimed.

## Play-test method

The deployed browser was opened, movement was attempted and Echo's **Hold Plate** order was issued through its actual controls. A manual Crown bank was not completed in the browser.

The input-driven simulations use real engine guards, timers, collisions and Echo AI, with normal movement and interaction commands. There are no teleports, removed guards, altered timers or added immunity. Ten seeds per difficulty (1001–1010) were used. These policies do not use a prepared distraction jar, deliberate hiding or coordinated rescue; they are diagnostic scenarios, not estimates of skilled human success.

## Found and fixed

**Hold Plate failed to position Echo before the vault opened.** The movement branch required `vaultReady`; before then, Echo could follow the player toward the Crown instead of preparing at Security. Hold Plate now routes to Security immediately. The plate still cannot unlock the Crown until 1:00 remains. A regression test checks both pre-positioning and the unchanged time lock.

Before the correction, Echo reached the plate in 3/10 Rookie, 7/10 Normal and 9/10 Pro runs. Afterward, it reached the plate and the player picked up the Crown in all 30 runs.

## Banking results and limits

| Policy | Rookie banks | Normal banks | Pro banks |
| --- | --- | --- | --- |
| Before fix: player rush, Echo holds plate throughout | 3/10 | 1/10 | 0/10 |
| After fix: player rush, Echo holds plate throughout | 10/10 | 0/10 | 0/10 |
| After fix: player rush, switch Echo to Cover after pickup | 6/10 | 0/10 | 0/10 |
| After fix: guard-aware player path, Echo Cover after pickup | 10/10 | 0/10 | 0/10 |
| After fix: player holds plate, Auto Echo collects | 0/10 | 0/10 | 0/10 |

The pre-fix Normal success (seed 1010) banked at 86.04 seconds after five captures. It must not be presented as a current-source success. The post-fix guard-aware Rookie runs banked at 53.60–61.68 seconds, with 2–4 captures. These are banked-Crown results, not clean runs or crew-extraction wins.

The time lock and pickup work. **A dependable Normal/Pro solo Crown return has not been demonstrated by these tests.** The reverse-role policy picked up the Crown in 0/10 Rookie, 1/10 Normal and 3/10 Pro runs, another limitation worth further playtesting. No scoring, carry speed, guard difficulty or Crown-alarm rule was changed to manufacture a win. Passing the broader regression suite does not erase these diagnostic failures.

Reproduce current policies with `node --experimental-strip-types scripts/verify-crown-play.ts`, `scripts/verify-crown-aware.ts`, and `scripts/verify-crown-echo-carrier.ts`. Raw `crown-*.json` files are alongside this report. `crown-plate-only.json` keeps the plate order after pickup; `crown-with-echo.json` switches to Cover.

## Van correction

- The physical left-wall dock faces west; the bottom-wall dock faces south. Crew colours follow the existing rematch swap.
- Rendered service lanes and chevrons point through the exterior edge.
- Departure distance is computed to the destination edge plus full-vehicle clearance instead of a fixed 200-unit move.
- Aboard markers follow the van; stranded players remain behind.
- Banking zones, collision walls, gameplay routes and scoring are unchanged.

The getaway regression checks both swapped dock assignments, outward travel, fully off-map endpoints and no game-state mutation. Frozen browser frames in `docs/flagship-velmont/outward-vans-*.jpg` show the presentation; they are not live match outcomes. The separate release regression report is `release.json`.
