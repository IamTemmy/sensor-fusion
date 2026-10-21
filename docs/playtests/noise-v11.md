# Noise Thieves v11 — rescue safety, crew vans, and escape stakes

October 21, 2026. Review baseline: GitHub 42cbd6e307136e5682db0cf95e3e58bb43aea8a9; Sites 83267670d7b1e8c6d6f04480e3655509d3826631.

## Changes by request

1. Rescuer and rescued thief both receive 3s protection. Captor retreat extends during rescue and for 1s after completion. Rescuing bots retreat toward their own van for 3s. The 40-seed controlled regression uses engine capture then actual Echo rescue without deleting guards or manually freeing the human; both remain uncaught throughout the protection window. This is not 40 human playtests.
2. Separate crew-colored vans and exact 70×70 zones. Other crews cannot enter/use a bay; guards path around every bay. Co-op keeps its original van. Rival layouts use a symmetric central exhibit spine and distinct side partitions so opposite crews have equal routes; three-crew spread is at most31 world units. Rival bot ambush behavior is intermittent, targeting a carrier’s return route and collecting nearby alarms.
3. Deadline settlement deducts25% of each stranded thief’s personal bank, rounded to coins and applied once. Recap itemizes it. Own-zone occupants count as escaped. All art banked starts LAST CALL with 15 seconds, including when the last item is banked near the original deadline. Only all thieves boarding ends early; the old human-only end shortcut is removed. Briefing/feed explain the penalty.
4. Cumulative tiers:1★ needs$1800 and an escape;2★ adds all normal art;3★ adds jackpot. Recap includes personal escape time. Local best is separated by layout and crew mode, ranked by stars, then net crew haul, then faster personal escape. Browser localStorage integration is not manually verified.
5. Allied Fetch is one piece per order, returns to Follow, approaches at115u/s and carries at85u/s. Repeating orders remains possible and is explicitly simulated. Bot carriers use the same sensors as humans. Co-op retains randomized placements but reserves nearer sites for the$1800 core haul and farther sites for the optional$500 piece. Lockdown guard patrol crosses central routes. Difficulty target NOT MET: naive still normally gets2★. Slowing all carriers to75u/s was tested, did not meet the target, and was reverted.
6. Static alarms are heard through walls within220u; longer range up to420u requires sight. Sneak is45% slower and halves spotting range180→90u. It bypasses sensors only empty-handed; a screaming piece of art still trips them.
7. Capsules check rivals within40u during their last0.2s of flight, require line of sight, and lead a visible carrier when aim is close. Controlled clear-corridor moving-target trials:20/20 at80u,14/14 at240u. Those are not measured human accuracy rates. Bots select visible carriers, announce a plant attempt, and successfully plant in full simulations.
8. Each co-op layout has different doorway/route sensors. Rival layouts have their own different central-route sensors; none cross walls. Sensors remain crossing-triggered, not periodic random alarms.
9. Footer uses five bounded grid slots including R, with min-width fixes and responsive sizing. Empty E target says No target nearby and is disabled. The1280×720 visual result remains unverified without browser control.

## Verification

63 tests pass (52 Noise Thieves +11 legacy Last Lift), TypeScript passes, production build checked for publication. Anti-camping, art passing, practice, replay and guard-safe-zone regressions retained. No manual browser play, screenshot, real-device networking, or human-fun claim.

## Routes on each rival layout

Measured by actual steer/move navigation from van center to target, in world units. All routes reachable. At100u/s carrying,31u is about0.31s. Spawn slots use equal vertical offsets within each bay. These measurements establish travel-distance symmetry, not strategic balance.

|Layout|Target|Mint|Violet|Amber|Spread|
|---|---|---:|---:|---:|---:|
| 0 | Golden echo | 436 | 436 | 449 | 13 |
| 0 | Moon vase | 351 | 351 | 359 | 8 |
| 0 | The scream | 259 | 259 | 259 | 0 |
| 0 | Blue idol | 199 | 199 | 189 | 10 |
| 0 | Plate | 149 | 150 | 119 | 31 |
| 1 | Golden echo | 436 | 436 | 449 | 13 |
| 1 | Moon vase | 351 | 351 | 359 | 8 |
| 1 | The scream | 259 | 259 | 259 | 0 |
| 1 | Blue idol | 199 | 199 | 189 | 10 |
| 1 | Plate | 149 | 150 | 119 | 31 |
| 2 | Golden echo | 436 | 436 | 449 | 13 |
| 2 | Moon vase | 351 | 351 | 359 | 8 |
| 2 | The scream | 259 | 259 | 259 | 0 |
| 2 | Blue idol | 199 | 199 | 189 | 10 |
| 2 | Plate | 149 | 150 | 119 | 31 |

## Final180-match simulation

20 seeds per row,1001–1020. Full-map pathfinding for all human proxies. Noise policy drops/bottles/throws its own scream; Fetch repeatedly reissues orders; teamwork uses Cover then stands on the jackpot plate. Rivals wins are strict bank leads; ties are not wins. Human play can differ substantially. Bot plant matches count the whole event stream.

|Mode|Policy|Echo|Win|0★|1★|2★|3★|Mean haul|Lockdown|Matches with bot plants|
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| coop | naive | follow | 100% | 0% | 0% | 100% | 0% | $2300 | 60% | 0/20 |
| coop | naive | cover | 100% | 0% | 0% | 100% | 0% | $2300 | 50% | 0/20 |
| coop | noise | follow | 100% | 0% | 0% | 100% | 0% | $2300 | 55% | 0/20 |
| coop | fetch | repeated-fetch | 100% | 0% | 0% | 100% | 0% | $2300 | 60% | 0/20 |
| coop | teamwork | cover | 95% | 5% | 0% | 20% | 75% | $3171.25 | 100% | 0/20 |
| duos | naive | follow | 95% | 5% | 50% | 45% | 0% | $2010 | 100% | 15/20 |
| duos | noise | follow | 70% | 30% | 25% | 45% | 0% | $1785 | 100% | 10/20 |
| duos | fetch | repeated-fetch | 95% | 5% | 50% | 40% | 5% | $2045 | 100% | 15/20 |
| duos | teamwork | cover | 95% | 5% | 55% | 20% | 20% | $2825 | 100% | 18/20 |

## Remaining gaps

- Naive co-op typically earns2★, not the requested1★. One-piece Fetch does not by itself make co-op hard. Do not report difficulty balance as solved.
- Rivals naive95% win versus noise70%; richer bot tactics do not establish balanced rivals. All rival runs hit lockdown; this may be too repetitive.
- Teamwork co-op earns3★ in75% of these ideal-pathfinding runs; whether that feels earned to humans still needs playtesting.
- Browser control is unavailable in this managed environment. Footer fit, local best persistence, readability, controls and online latency require manual validation.
- Existing online rooms may retain the prior map. Start a new room for v11.
