# Noise Thieves v14 — seeded jobs, fixed arenas

October 21, 2026. All v13 walls/arena architectures remain fixed. Shared jackpot access is intentional: any crew holding the plate opens it for everyone. Existing vans, Last Call, 25% straggler penalty, rescue protection and route-fairness checks remain.

## Changes

- Jobs contain 5 or 6 pieces (within the requested 5–7), exactly **$3,300** in both modes: cheap $200–300, mid $500–600, big $1,000–1,100, plus the $1,200 jackpot. Rival wing pieces are equal mirrored pairs; larger contested pieces remain central. Co-op values/placements vary among near and deep slots. No item above $300 is within 250 navigable route units of either active crew van.
- Carry speed decreases linearly with value: $200 at 110 units/s; $1,500 at 80. Humans and bots use the same curve. Unassisted solo access is capped at $2,100 of $3,300 (63.6%); the remaining jackpot needs a plate holder.
- Exactly one seeded event, warned three seconds ahead with a honk: 8-second blackout (60-unit guard sight), alternate-route shift without teleportation, same-danger curator transfer, or a 15-second side vault. The vault is reserved within the fixed budget, not extra value. Claimed vault art remains available after the window. A curator move cancels visibly if no eligible unclaimed equivalent slot remains. Rival moves are paired; central vault and blackout are shared.
- Six rival patrol routes per arena, paired wing selection and staggered starts. Co-op pools contain 4–6 routes. Captors keep walking their patrol during retreat instead of parking at a waypoint. Plate captors patrol for 36 seconds before reacquiring; other guards remain dangerous and rescue safety stays unchanged.
- Follow Echo stays in passing range, warns of approaching guards, moves toward a receive position and uses bottled distractions when a guard closes in. Rescue remains higher priority.
- Arena title moved out of the canvas into the HUD; ordinary actor labels suppressed inside vans; van labels staggered.
- Rivals now supports two crews only: 2v2 or 3v3. Three-crew Amber was excluded because its van invalidated the any-van valuable-loot distance constraint. Existing three-crew rooms normalize on a new job.
- **Hidden crates were cut**, as explicitly permitted. Values are visible; no crate implementation or crate verification is claimed.

## Verification

75 automated tests and TypeScript passed. Retained prior tests, including the 40-seed rescuer protection regression and v13 route fairness gates. Added budget/danger, symmetric values, event lifecycle/replay, nonteleporting alternate shift, patrol geometry, Follow passing/warnings and central route fairness tests. Historical v13 image fixtures are preserved.

60 seeded setup audits found **zero valuable-loot distance violations**. The route planner enumerates every collectible subset under 90 seconds using outbound/return paths and value-dependent carry speeds. An even more optimistic upper bound ignores walls, guards, delays and event windows; maximum haul is still **63.6%**, close to but not exactly 60%. This assumes no other thief holds the shared plate. A lone thief exploiting another crew's plate holder can exceed it by design. This is a route-planning model and budget bound, not a manually played perfect-human run.

Stationary plate captures per 90 seconds, eight seeds per arena/mode, with mid-job events disabled to isolate patrol pressure:

| Arena | Co-op | Rivals |
|---|---:|---:|
| Echo Gallery | 3.00 | 3.00 |
| Night Archive | 2.12 | 2.62 |
| Crossroads | 2.75 | 3.00 |

## Full-engine simulations

20 seeds per row, 180 matches total. These scripted policies have map knowledge and identical pathfinding. They are balance probes, not measured human skill or enjoyment. Fetch repeatedly reissues its one-piece command; teamwork holds the plate after initial collection.

| Mode | Policy / Echo | Win | Mean bank | 0 / 1 / 2 / 3 stars |
|---|---|---:|---:|---|
| coop | naive / follow | 80% | $1,960.00 | 20% / 0% / 80% / 0% |
| coop | naive / cover | 75% | $1,886.25 | 25% / 0% / 75% / 0% |
| coop | noise / follow | 85% | $2,020.00 | 15% / 0% / 85% / 0% |
| coop | fetch / repeated-fetch | 100% | $2,100.00 | 0% / 0% / 100% / 0% |
| coop | teamwork / cover | 70% | $2,282.50 | 30% / 0% / 35% / 35% |
| duos | naive / follow | 55% | $1,400.00 | 75% / 25% / 0% / 0% |
| duos | noise / follow | 55% | $1,330.00 | 90% / 10% / 0% / 0% |
| duos | fetch / repeated-fetch | 75% | $1,530.00 | 65% / 35% / 0% / 0% |
| duos | teamwork / cover | 60% | $1,938.75 | 45% / 55% / 0% / 0% |

**Open balance concern:** repeated Fetch still clears ordinary co-op art reliably (100% wins, no jackpot). The teamwork policy reached three stars in 35% of co-op runs; no tested rival policy reached three stars. Noise-use did not improve rival wins over naive play in this sample. This release does not prove the game is balanced or that noise skill is sufficiently rewarded.

## Map visual review

[18 SVG maps and raw reports](v14/) show three seeds per arena in both modes. I inspected rendered contact sheets: Gallery keeps an open pillar hall, Archive its shelving maze, Crossroads its central hub. Walls stay identical within an arena while loot values/slots, patrol starts and events vary. These are engine-data diagrams, not screenshots of live browser gameplay.

## Still unverified

Browser QA was attempted but rejected by the browser access policy. No workaround was used. Thus actual 1280×720 label readability, animation/sound feel, hands-on replay and real-device online latency remain unverified. No fresh manual gameplay is claimed. Follow bodyguard geometry/warnings are tested, but its tactical usefulness needs a human playtest. Plate averages isolate patrols, not all event combinations. Crates are omitted. The solo bound depends on no external plate assistance. Public multiplayer fairness and fun require real players.

Reproduce: `npm test`; `npx tsc --noEmit`; `node --experimental-strip-types scripts/verify-noise-v14.ts`; `node --experimental-strip-types scripts/simulate-noise-v14.ts`; `node --experimental-strip-types scripts/render-noise-v14.ts`.
