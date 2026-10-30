# The Velmont — implementation candidate

Branch: `flagship-velmont`. Not merged or deployed. Approved revision, with no second blueprint approval round. Release deadline: Friday 30 October 2026, 18:00 America/Chicago.

`blueprint.py` generates `blueprint.png`, `blueprint.json`, `measurements.json` and the imported `lib/noise/flagship-arena.ts`. The first approval-revision commit includes the updated blueprint. Two–four thieves use this building; six thieves / 3v3 retain the existing museums.

Implemented: asymmetric rooms and switchbacks, six wall recesses, five meaningful beams, Archive patrol, posted Crown sentry, shared adjacent docks with the bay $200 equidistant and rematch seat swaps. Crown opens at 1:00 remaining, warns at 1:10, requires the Security plate, carries at 0.8× normal Crown speed, and cannot have its alarm bottled. Laser emitters sound for four seconds; thrown jars trip beams. Client-only wall visibility retains explored floor/art memory and teammate markers. Q / touch “Pass it!” requests an item-bound art pass; chased bots pass to an eligible human.

Validation is recorded under `docs/playtests/flagship-velmont`. Iteration folders preserve failed runs rather than overwriting their evidence. Historical map-specific tests use `tests/helpers/legacy-engine.ts`; flagship tests exercise the new map directly. This keeps the old rotation/mirror/grace regressions meaningful while testing the new rules separately.

Current checkpoint: core mechanic tests pass; static paths reach all 19 targets, both docks reach all 15 art/plate/hide targets, posted guard exclusion remains passable. No empty floor rectangle exceeds both 260u width and 200u height. The first 120 rush attempts produced zero banks before 45s elapsed (73 banks, earliest 52.24s elapsed). Initial balance and escape failures are under correction; these are not release passes. Do not merge until the final gate report passes.

Run:

```sh
python docs/flagship-velmont/blueprint.py
node --experimental-strip-types docs/flagship-velmont/check-blueprint.ts
pnpm test
pnpm typecheck
FLAGSHIP_GATE=idle node --experimental-strip-types scripts/verify-flagship.ts
FLAGSHIP_GATE=rush node --experimental-strip-types scripts/verify-flagship.ts
FLAGSHIP_GATE=cpu node --experimental-strip-types scripts/verify-flagship.ts
V48_MODE=escape node --experimental-strip-types scripts/verify-v48.ts
SIM_MODE=duos SIM_DIFFICULTY=normal SIM_COUNT=40 SIM_SEED=1001 SIM_DOCK_SWAP=1 node --experimental-strip-types scripts/simulate-noise-v17.ts
```

Development-only `/visual-review` embeds the actual application at phone and desktop sizes. Its frozen fixtures demonstrate presentation, not gameplay outcomes.
