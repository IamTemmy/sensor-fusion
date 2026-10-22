# Noise Thieves v15 — wing value and real slot variety

October 21, 2026 (America/Chicago). Reviewed v14 and preserved fixed walls, $3,300 total, carry-speed scaling, Follow bodyguard, vans, rescue safety, Last Call, straggler penalties, shared plate access, event systems and route-fairness gates.

## Implemented

1. Rivals now has **six exhibits**: each wing contains a $200 relic and a $600 masterpiece; the shared centre contains the $1,200 jackpot and a $500 contested collection. Valuable wing sites lie on wing patrol paths and are at least250 navigable units from either van. Wing pairs mirror/rotate with equal values. Centre pieces have different x coordinates.
2. Every rivals arena has three cheap wing slot pairs, three deep wing slot pairs and three centre configurations. Select deep slots at least65 units from cheap pieces; no exhibit overlaps. Architecture and shared plate coordinates remain fixed. Co-op retains its v14 random placement system.
3. Events start between20 and65 seconds, with the same three-second warning and sound. The rival side vault reserves the central $500 piece, never just one crew's wing prize. Other events retain their symmetry rules.
4. Follow Echo waits before approaching a captive if the captor is within40 units of the captive or Echo, facing Echo with line of sight—even when the captor's retreat timer is active. If holding a capsule, Echo can throw a distraction while waiting. Post-rescue safety is unchanged.
5. Optional hidden crates remain deferred; there is no hidden-value implementation claimed.

## Necessary budget decision

The requested value ranges conflict with the requested percentage split. The minimum two wings cost2×($200+$600)=$1,600, or48.5% of$3,300. Keeping the$1,200 jackpot leaves$500 for the other central exhibit. Implemented **48.5% wings /51.5% centre**, prioritizing meaningful wing loot, the fixed total and unchanged jackpot. The contested item is consequently medium-value, not a$1,000+ big piece. Neither a40–45% wing split nor the original big-piece tier can coexist with those minimum amounts.

## Verification

**77 tests pass**, including all retained tests. TypeScript passes. Added120-seed checks for equal valuable wing pairs, navigable distance, centre separation, patrol exposure, plate separation, slot coverage, event timing and vault symmetry; added a facing-captor approach regression. Existing40-seed natural-capture/rescue protection test still passes. Updated only superseded v14 expectations (rivals value tiers and which pieces are central).

60 setup audits (30 seeds per mode): zero valuable-loot distance violations. Largest two-crew spread among audited objectives: **31.8 units**. The unassisted solo planner bound remains63.6% ($2,100/$3,300), assuming nobody else holds the shared plate. It is an optimistic route-planning bound, not human gameplay.

Measured route lengths by arena, range across30 rival seeds, in game units. For wing pairs each crew targets its corresponding wing; shared targets are the same piece.

| Arena | Target | Mint route range | Violet route range | Max spread |
|---|---|---:|---:|---:|
| Echo Gallery | cheap wing pair | 126–362 | 126–362 | 0.5 |
| Echo Gallery | valuable wing pair | 264–492 | 264–492 | 0.0 |
| Echo Gallery | Jackpot | 531–579 | 531–579 | 0.4 |
| Echo Gallery | Contested collection | 411–435 | 408–432 | 20.9 |
| Echo Gallery | plate | 483–483 | 480–480 | 3.0 |
| Night Archive | cheap wing pair | 93–336 | 93–336 | 0.0 |
| Night Archive | valuable wing pair | 294–420 | 294–422 | 2.2 |
| Night Archive | Jackpot | 561–587 | 548–555 | 31.8 |
| Night Archive | Contested collection | 474–489 | 474–489 | 15.4 |
| Night Archive | plate | 551–551 | 572–572 | 21.0 |
| Crossroads | cheap wing pair | 90–330 | 90–330 | 0.0 |
| Crossroads | valuable wing pair | 255–410 | 255–410 | 0.0 |
| Crossroads | Jackpot | 605–645 | 611–648 | 6.1 |
| Crossroads | Contested collection | 498–524 | 495–519 | 20.7 |
| Crossroads | plate | 608–608 | 609–609 | 0.7 |

Stationary plate baseline, eight seeds per arena/mode, mid-job events disabled: co-op3.0 /2.125 /2.75 catches per90s; rivals3.0 /2.625 /3.0 (Gallery/Archive/Crossroads). No new immunity or capture camping added.

## 180-match engine simulation

20 seeds per row (1001–1020). These are scripted map-aware policies, not human win-rate estimates. Strict wins exclude ties; repeated Fetch issues another command after each delivery; teamwork goes for the plate. Noise policy remains the existing scripted drop/capture/throw heuristic.

| Mode | Policy / Echo | Win | Mean bank | 0 /1 /2 /3 stars |
|---|---|---:|---:|---|
| coop | naive / follow | 75% | $1,935.00 | 25% / 0% / 75% / 0% |
| coop | naive / cover | 80% | $1,970.00 | 20% / 0% / 80% / 0% |
| coop | noise / follow | 65% | $1,847.50 | 35% / 0% / 65% / 0% |
| coop | fetch / repeated-fetch | 95% | $2,070.00 | 5% / 0% / 95% / 0% |
| coop | teamwork / cover | 90% | $2,778.75 | 10% / 5% / 25% / 60% |
| duos | naive / follow | 20% | $1,255.00 | 100% / 0% / 0% / 0% |
| duos | noise / follow | 15% | $1,170.00 | 95% / 5% / 0% / 0% |
| duos | fetch / repeated-fetch | 40% | $1,465.00 | 80% / 20% / 0% / 0% |
| duos | teamwork / cover | 60% | $1,975.00 | 40% / 60% / 0% / 0% |

Interpretation: rival teamwork60% vs naive20%; co-op teamwork60% three-star runs. Repeated Fetch still wins95% in co-op. Noise policy does not outperform naive in either mode (co-op65% vs75%, rivals15% vs20%). The content update does not prove alarm skill is rewarding enough; that remains open for human playtesting.

## Visual self-check

[24 SVGs and raw JSON](v15/): four distinct-position seeds per arena per mode. The render script skips duplicate position signatures and records the selected seeds; it does not promise arbitrary seeds never repeat. I inspected both contact sheets: valuable loot now occupies both rival wings, central items are staggered, and each arena retains its recognizable wall geometry. No two of the four displayed seeds in any arena/mode share all loot positions. The centre offsets are deliberately modest to maintain route fairness.

| Mode / Arena | Rendered seeds |
|---|---|
| coop / Echo Gallery | 1, 11, 12, 13 |
| coop / Night Archive | 2, 3, 4, 5 |
| coop / Crossroads | 6, 7, 8, 9 |
| duos / Echo Gallery | 1, 11, 12, 13 |
| duos / Night Archive | 2, 3, 4, 5 |
| duos / Crossroads | 6, 7, 8, 9 |

## Still unverified / deferred

Hidden crates omitted. No hands-on browser playtest or real-device latency measurement in this release; the previous browser-policy denial remains a verification limitation, and no bypass was attempted. The reviewed SVGs are engine diagrams, not live gameplay screenshots. The new approach test covers the reported facing-captor condition; the retained40-seed regression covers successful rescue safety, not a guarantee of zero rescuer captures in all natural approaches. Fun, noise-skill advantage, and six-player online balance still need human playtests. Some different seeds may legitimately repeat a loot configuration.

Reproduce: `npm test`; `npx tsc --noEmit`; `node --experimental-strip-types scripts/verify-noise-v15.ts`; `node --experimental-strip-types scripts/render-noise-v15.ts`; `node --experimental-strip-types scripts/simulate-noise-v15.ts > docs/playtests/v15/simulation.json`.
