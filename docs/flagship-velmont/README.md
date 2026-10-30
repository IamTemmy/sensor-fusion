# The Velmont — release validation

Approved flagship implemented on `flagship-velmont`. The first approved-revision commit `1501966` includes the updated `blueprint.png`. No second blueprint approval is required. Release deadline: 30 October 2026, 18:00 America/Chicago.

Two–four thieves use this asymmetric building; six thieves / 3v3 retain the previous museums. The Hall forces switchbacks on both approaches. Six wall recesses, five beams, the Archive patrol and posted Crown guard are active. Adjacent docks swap assignments every rematch; the bay $200 is equidistant.

The vault warns at 1:10 and opens at 1:00 remaining. Security’s plate has no effect before opening. Crown carrying is 0.8× ordinary Crown carry speed and its alarm cannot be bottled. Beam crossings trigger a four-second siren at the emitter, including crossings by thrown jars. Wall-based client visibility retains explored floor/art memory and teammate markers. Q / touch “Pass it!” requests actual art only; a chased bot can pass to a free-handed human in sight.

## Gate results

The complete machine-readable report is `../playtests/flagship-velmont/release.json`. Earlier failed iterations remain in numbered folders. These are deterministic policy simulations, not human playtest win rates.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op (40 seeds each) | 100% | 45% | 32.5% |
| Duos, initial docks (40 each) | 100% | 45% | 37.5% |
| Duos, swapped docks (40 each) | 100% | 57.5% | 35% |
| Duos, pooled | 100% | 51.25% | 36.25% |

- Unit/regression tests: 257 passed, zero failures; TypeScript passed.
- Idle: 0/30 unintended stalls of six seconds or longer, excluding intentional plate/home/rescue/tied/hidden waits.
- Patrol: 0 roaming stalls; Archive visited in 9/9 controlled patrol matches.
- Crown rush: 0/120 banks before 0:45 remaining; earliest successful bank at 52.24 seconds elapsed.
- Echo escape: Rookie 40/40, Normal 40/40, Pro 39/40; Pro’s one failure was tied up. Zero untied Echo left behind. Even counting that capture, all difficulties meet ≤2/40.
- Host advance: worst-case p95 2.76 ms; maximum 28.76 ms across six 2/4-thief difficulty fixtures.
- Geometry: 19/19 targets reached, 30/30 rival target journeys, 36 collision-safe patrol segments; plate has no line of sight to Crown. Both maze entrances force at least three turns; no empty rectangle exceeds both 260u width and 200u height.
- Blueprint grid measures: short Crown path ≈1219u; long approach ≈1485u; plate→Crown ≈749u; mirrored interior overlap 25.7%.

## Corrections made during validation

A divider pinched the Mint exit and created a severe dock bias; it was removed. Navigation now searches the next nearby grid rings when a valid narrow floor strip has no adjacent navigation node. Idle recovery avoids selecting an unsafe hide as its own destination. Echo allows enough time for the long return path. Co-op Normal/Pro have five active patrols; Normal rivals use all four authored routes and more purposeful value/return-distance selection and jar supply decisions. These flagship changes preserve the legacy maps’ tuning.

Historical map-specific regressions explicitly use the legacy arena factory, including the old requirement that Pro has more patrols than Normal. The new flagship has four roaming patrols at both rivals levels; the preserved legacy assertion was not removed. The Pro lure fixture seeds its RNG independently of how many patrols setup consumes. New flagship tests cover its mechanics directly.

## Visual evidence and scope

`blueprint.py` generates the blueprint and imported geometry. `desktop-full-map.jpg` deliberately disables fog in a development-only architecture fixture. `phone-desktop-review.jpg` and `landscape-phone.jpg` use actual client visibility at phone/desktop viewport sizes. `getaway-mid.jpg` shows the winning van departing first while the left-behind player remains. Screenshots are frozen presentation fixtures, not simulation evidence. Landscape and portrait phones default to Closer view.

The browser checks do not replace a physical-device or cross-network human playtest. This change does not claim to fix every network path; transport behavior is preserved.

Reproduce the full gate report with `node scripts/flagship-gates.mjs`. `pnpm build` refuses a missing, stale or failing report, rerunning gates as needed. `pnpm test` and `pnpm typecheck` also run independently. The report hashes engine, geometry, client files, helpers and tests so a stale report cannot silently approve changed source.
