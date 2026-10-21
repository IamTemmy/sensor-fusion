# Noise Thieves v12 verification

## Changes
- Rebuilt rivals with three genuinely distinct mirrored wing layouts: Echo Gallery doorways, Night Archive shelving, Crossroads staggered doorways. Walls and sensors mirror around x=480.
- Seed-selected mirrored wing exhibits are equal $650 prizes; the $1,000 idol, $1,200 plate jackpot and plate occupy the shared centre. Total art remains $3,500.
- Mint and Violet vans are bottom-left/right. Three-crew matches put Amber top-centre. Existing UI terminology remains: Trios is 3v3 (two crews); six players in Duos is three pairs/three vans.
- Three separate starting patrol circuits cover left wing, right wing and centre. The mirrored wing guards receive the same opening grace. Lockdown still adds its separate route.
- Removed v11 near-home core placement. Co-op's $800/$1,000 pieces now occupy seeded far-wing patrolled sites. Kept $1,800 goal: raising it to $2,000 would make a normal-art one-star haul impossible ($800+$1,000 is the only two-normal-piece qualifying haul).
- Kept rescue safety, guard retreat, silent captured drops, protected zones, last call, penalties, sensor/sneak/plant rules. Reset local best-record namespace because map comparisons changed.

## Automated checks
66 tests pass, TypeScript check passes. The existing natural capture/rescue test protects BOTH thieves across 40 seeds (zero rescuer captures in the protected three seconds).
New map checks cover 30 seeds: 15 distinct placement arrangements; all three geometries appear; equal mirrored wing art; own wing closer; no duplicate starting patrol circuit; walls mirrored; sensors and targets clear of walls; patrol segments unobstructed; each wing and centre contain loot and a patrol.

## Simulation: 20 seeds per policy, 180 matches total
These are scripted policies with full-map pathfinding, not human playtests. Noise policy drops/bottles/throws; teamwork uses Cover then the jackpot plate. No claim that these proxy policies measure enjoyment or expert skill.

| Mode | Policy / Echo | Win | 0★ | 1★ | 2★ | 3★ | Lockdown |
|---|---|---:|---:|---:|---:|---:|---:|
| coop | naive / follow | 90% | 10% | 0% | 90% | 0% | 90% |
| coop | naive / cover | 95% | 5% | 0% | 95% | 0% | 90% |
| coop | noise / follow | 90% | 10% | 0% | 90% | 0% | 80% |
| coop | fetch / repeated-fetch | 100% | 0% | 0% | 100% | 0% | 90% |
| coop | teamwork / cover | 90% | 10% | 0% | 35% | 55% | 100% |
| duos | naive / follow | 35% | 85% | 0% | 15% | 0% | 100% |
| duos | noise / follow | 10% | 100% | 0% | 0% | 0% | 100% |
| duos | fetch / repeated-fetch | 35% | 85% | 5% | 10% | 0% | 100% |
| duos | teamwork / cover | 55% | 45% | 40% | 5% | 10% | 100% |

## Route distances
World units measured using actual steer/move with other crews' zones blocked. Representative seeded placement per layout, all three vans present. Left/right walls are mathematically mirrored; the discrete navigator has a directional tie-break bias (notably Archive own-wing routes differ by 44 units). This is not claimed to be exact route equality.

| Layout | Target | Mint | Violet | Amber | Three-crew spread |
|---|---|---:|---:|---:|---:|
| 0 | Mint moon (210,100) | 434 | 800 | 353 | 447 |
| 0 | Violet moon (750,100) | 800 | 434 | 353 | 447 |
| 0 | The scream (480,120) | 601 | 600 | 54 | 547 |
| 0 | Blue idol (480,340) | 429 | 428 | 274 | 155 |
| 0 | Plate (480,440) | 396 | 396 | 374 | 22 |
| 1 | Mint moon (230,210) | 363 | 825 | 289 | 536 |
| 1 | Violet moon (730,210) | 825 | 407 | 289 | 536 |
| 1 | The scream (480,140) | 586 | 584 | 74 | 512 |
| 1 | Blue idol (480,340) | 429 | 428 | 274 | 155 |
| 1 | Plate (480,440) | 396 | 396 | 374 | 22 |
| 2 | Mint moon (230,390) | 184 | 655 | 419 | 471 |
| 2 | Violet moon (730,390) | 655 | 184 | 419 | 471 |
| 2 | The scream (480,240) | 493 | 490 | 174 | 319 |
| 2 | Blue idol (480,340) | 425 | 425 | 274 | 151 |
| 2 | Plate (480,440) | 403 | 403 | 374 | 29 |

## Unmet targets / unverified
- Co-op remains too forgiving: naive Follow gets 2★ in 90%, Cover in 95%, repeated Fetch in 100%. The requested mostly-1★ distribution is NOT achieved. Teamwork gets 3★ in 55%. Do not treat the map repair as a completed balance pass.
- Three crews are NOT balanced: Amber is closer to the centre jackpot (maximum measured per-target spread 547 units). Two mirrored wings provide two-crew fairness, not threefold symmetry. A separate threefold arena is needed for competitive three-crew fairness.
- Rivals lockdown occurs in every simulated match. Naive strict win rate is 35%; teamwork 55%; noise proxy 10%. This does not establish a human skill advantage for noise use.
- No browser/manual visual playtest, real-device latency or live multiplayer test performed in this pass. Desktop appearance and bot navigation need human replay. Existing tests cover engine properties, not all visible paths and interactions.

Reproduce: `node --experimental-strip-types --test tests/*.test.ts`; `node --experimental-strip-types scripts/simulate-noise-v12.ts`; `node --experimental-strip-types scripts/measure-v12-routes.ts`.
