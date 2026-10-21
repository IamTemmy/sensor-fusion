# Noise Thieves v13 — distinct rivals arenas

## Shipped changes
1. **Echo Gallery:** an open hall with freestanding pillars/display cases, long sightlines and crossing figure-eight wing patrols. Shared upper jackpot room and lower plate room have separate door sensors. Left/right symmetry.
2. **Night Archive:** staggered shelving creates alternate winding approaches and ambush corners; two guarded entrances connect to the central archive. Vans occupy opposite corners (Mint bottom-left, Violet top-right); walls and paired exhibits use 180-degree rotation. The plate and jackpot occupy opposite archive chambers, offset from the idol axis.
3. **Crossroads:** four large corner blocks define a plus-shaped crossing hub. The north jackpot room opens only onto the hub; the plate is in the south chamber. Left/right symmetry.
4. Each arena has three seeded, equal-value wing exhibit pairs, separate non-rectangular starting patrols and an architecture-specific reinforcement route. Sensors cover selected chokepoints. Reinforcements now start away from van safety zones.
5. Plate/jackpot separation exceeds 250 units and direct line of sight is blocked on all three arenas. One thief must stay on the plate while another travels to collect the jackpot.
6. Canvas floor treatment and arena labels now reflect the different architectures. Rival local records use a new namespace; co-op records retain their existing namespace.
7. **Three crews retained:** the lobby explicitly warns “Two crews recommended. Adding Amber enables experimental, unbalanced three-crew play.” Amber's location is unchanged; these fairness claims apply only to two crews. The existing 3-vs-3 option remains two crews.
8. Preserved v12 co-op placement/tuning, crew banking zones, last call, left-behind penalty, rescue safety, silent captured drops and guard retreat. No capture-camping behavior was reintroduced.

## Visual self-check
Ran `node --experimental-strip-types scripts/audit-noise-v13.ts`. It reads engine data and emits six SVG diagrams with walls, sensors, routes, all pedestal slots, selected loot, vans and plate. Yellow dashed routes are lockdown reinforcements. Converted these SVGs to a contact sheet locally and inspected it visually.

**Confirmed: the three rivals diagrams look clearly different.** Gallery is sparse with crossing hourglass-shaped patrols; Archive is a dense staggered shelving plan with diagonal opposite-corner starts; Crossroads has four solid corner masses and a conspicuous plus-shaped central circulation space. Co-op diagrams are included for comparison, not redesigned.

| Arena | Rivals diagram | Co-op diagram |
|---|---|---|
| Echo Gallery | [Rivals](v13/rivals-0.svg) | [Co-op](v13/coop-0.svg) |
| Night Archive | [Rivals](v13/rivals-1.svg) | [Co-op](v13/coop-1.svg) |
| Crossroads | [Rivals](v13/rivals-2.svg) | [Co-op](v13/coop-2.svg) |

## Two-crew fairness: actual navigator distance
World units from each van centre, using the gameplay `steer`/`move` functions and treating the opposing safe zone as blocked. Own-wing rows compare each crew's corresponding exhibit. Shared-target rows compare routes to the SAME target. All three possible wing pairs are measured, not just the displayed seed. Small differences arise from the discrete navigator. Every measured difference is <40 units; the maximum is 19.

| Arena | Target | Mint | Violet | Difference |
|---|---|---:|---:|---:|
| Gallery | own wing pair 1 | 362 | 362 | 0 |
| Gallery | own wing pair 2 | 316 | 314 | 2 |
| Gallery | own wing pair 3 | 126 | 126 | 0 |
| Gallery | idol | 421 | 421 | 0 |
| Gallery | jackpot | 562 | 556 | 6 |
| Gallery | plate | 482 | 480 | 2 |
| Archive | own wing pair 1 | 335 | 335 | 0 |
| Archive | own wing pair 2 | 312 | 312 | 0 |
| Archive | own wing pair 3 | 94 | 94 | 0 |
| Archive | idol | 478 | 478 | 0 |
| Archive | jackpot | 569 | 550 | 19 |
| Archive | plate | 550 | 569 | 19 |
| Crossroads | own wing pair 1 | 330 | 330 | 0 |
| Crossroads | own wing pair 2 | 210 | 210 | 0 |
| Crossroads | own wing pair 3 | 90 | 90 | 0 |
| Crossroads | idol | 506 | 506 | 0 |
| Crossroads | jackpot | 624 | 623 | 1 |
| Crossroads | plate | 605 | 605 | 0 |

## Verification
- 69 tests pass, including natural capture/rescue protection across 40 seeds.
- New tests verify patrol body clearance (not only sight lines), distinct non-rectangular circuits including lockdown, plate/jackpot occlusion, all three exhibit pairs appearing across 90 seeds, and the <40-unit route gate on every candidate pair/objective.
- Existing tests preserve banking, van exclusivity, replay, penalties, sensors, rescue and capture protections.
- TypeScript check passes.

## Simulation results

180 scripted matches: 20 seeds per row. Full-map pathfinding; these are policy probes, not human playtests. The teamwork policy clears normal loot before attempting the plate, which may be too late on these longer routes. Wins in rivals mean strictly beating the other crew; ties are not wins.

| Mode | Policy / Echo | Win | Mean bank | Lockdown | 0/1/2/3-star rates |
|---|---|---:|---:|---:|---|
| coop | naive / follow | 90% | $2160 | 90% | 10% / 0% / 90% / 0% |
| coop | naive / cover | 95% | $2250 | 90% | 5% / 0% / 95% / 0% |
| coop | noise / follow | 90% | $2210 | 80% | 10% / 0% / 90% / 0% |
| coop | fetch / repeated-fetch | 100% | $2300 | 90% | 0% / 0% / 100% / 0% |
| coop | teamwork / cover | 90% | $2881 | 100% | 10% / 0% / 35% / 55% |
| duos | naive / follow | 25% | $1650 | 95% | 100% / 0% / 0% / 0% |
| duos | noise / follow | 40% | $1582 | 100% | 100% / 0% / 0% / 0% |
| duos | fetch / repeated-fetch | 30% | $1840 | 95% | 80% / 20% / 0% / 0% |
| duos | teamwork / cover | 25% | $1950 | 100% | 75% / 25% / 0% / 0% |

## Still unverified / limitations
- No manual browser or real-device multiplayer playtest in this pass. Visual self-check covers engine-derived diagrams, not the rendered gameplay HUD, live controls or network latency.
- Two-crew route fairness is verified, but equal competitive win rates and player enjoyment are not established. Patrol phase, choice of route and captures can create different experiences.
- Three crews remain explicitly unbalanced. No claim of Amber parity.
- Co-op remains generous: naive Follow 90% two-star and repeated Fetch 100%, unchanged from v12. This task preserved that tuning as requested.
- The scripted rivals policies did not earn three stars. That is a playtest priority: assess whether earlier plate coordination makes the jackpot worthwhile within 90 seconds. Do not infer that headless proxy results demonstrate a polished human difficulty curve.

Reproduce: `node --experimental-strip-types --test tests/*.test.ts`; `node --experimental-strip-types scripts/audit-noise-v13.ts`; `node --experimental-strip-types scripts/simulate-noise-v13.ts`.
