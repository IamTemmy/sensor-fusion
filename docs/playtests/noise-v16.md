# Noise Thieves v16 — situational Echo, centre routes and difficulty

October21,2026 (America/Chicago). No van raids. Preserved$3,300 jobs, value/carry-speed rules, seeded slots/events, shared jackpot, separate vans, Last Call, straggler penalties, and rescue safety.

## Changes

1. **E priority:** reachable loot wins over an alarm unless the alarm is strictly closer. Equal distance favors loot. Rescue priority and occupied-hand behavior are unchanged. Retained noise-capture tests now place the noise closer explicitly rather than relying on obsolete global alarm priority.
2. **Plate teamwork:** plate jobs run before capsule Follow behavior and bottling. Held capsules are thrown, then the job resumes. Empty-handed transit sneaks. A human waiting at the locked jackpot sends Echo to the plate; a human holding the plate sends Echo to the jackpot. The plate still opens for any crew.
3. **Auto default:** selects cover when the human carries art, the appropriate plate job, safe rescue, or a visible-route-safe ordinary exhibit. Manual Follow/Cover/Fetch/Hold remain available. Decision callouts are rate limited; idle fetch rechecks route exposure every700ms. A bot already carrying art banks it rather than abandoning it when the human picks something up.
4. **Rescue with art:** bank first if home is closer or the rescue approach is exposed; otherwise rescue a close safe captive. Visible approach paths are sampled against current guard vision, excluding guards still retreating; the close-facing-captor check remains. Waiting bots can decoy with a capsule. All bot movement honors carried-value speed and Sneak. Protection after rescue is unchanged.
5. **Roomier rivals centres:** horizontal expansion of about20% (coordinate snapping makes exact local widths vary), preserving pillars/maze/hub. Gallery and Crossroads get lower side exits. Archive uses two separate aisle exits on each side, separated by a small wall island, retaining its rotational symmetry. Jackpot/plate coordinates in Archive were adjusted to preserve fair shared access. Normal guard count is unchanged. A finer20-unit navigation grid plus symmetric route handling removes asymmetric coarse-grid detours; JSON round-trip navigation is tested for online rooms.
6. **Crowd clarity:** caught thieves fade and show a drawn lock/countdown arc; released thieves have a bright FREE countdown; the local player is drawn after other actors with a white outline; retreating guards and their cones are dimmed.
7. **Canvas art:** small figurines for cheap relics, framed paintings for middle values, busts for big exhibits, and a golden crown-mask for the jackpot. The carried icon matches the artwork. Value labels, screams and glows remain. No external assets.
8. **Difficulty:** Rookie/Normal/Pro in solo setup and hosted lobby; recap shows the selected effective level. Human-controlled opposing crews always use Normal. Device bests are keyed by difficulty, crew mode and layout.
9. **Rival strategy:** some Normal/Pro bot seats prioritize unbanked far-side exhibits near the opposing approach during the opening35s. They cannot enter or steal banked loot from a van. Rookie skips this raid policy.

| Difficulty | Initial guards relative to Normal | Guard speed | Spotting range | Rival movement/strategy |
|---|---:|---:|---:|---|
| Rookie | −1 |85%|80%|85%; no far-side raid priority|
| Normal | baseline |100%|100%|100%; occasional far-side raids|
| Pro | +1 |112%|115%|108%; occasional far-side raids|

Count differences apply to initial patrols; Lockdown can still add its guard. Practice retains its lesson guard. Normal remains3 initial rivals guards; co-op baseline can vary with seed. These settings are implemented, not proof that every scripted policy's win rate is monotonic by level.

## Tests and targeted simulations

83 automated tests and TypeScript pass, including retained rescue/safe-zone/replay/loot/fairness tests. New regressions cover E distance priority, Auto/manual behavior, difficulty/forced Normal, centre exits, record separation and online JSON navigation equivalence.

Jackpot completion means pickup within10 seconds, with sensors active but guards removed; it does not mean banking within10 seconds. Other crew bots are disabled to isolate the handoff.60 seeds for each cell:

| Mode | Human on plate → Echo takes jackpot | Human at jackpot → Echo holds plate |
|---|---:|---:|
| coop | 60/60 | 60/60 |
| duos | 60/60 | 60/60 |

Carrying rescue probe:40 natural captures; **0/40** runs lost Echo's carried art during the next10 seconds. This is a controlled geometry/patrol regression, not a universal rescue-loss guarantee. The verification script asserts≥80% handoff completion and<25% loss.

60 seeded setup audits: **0** valuable-loot distance violations; largest measured objective spread **16.7 units** (<40). Solo optimistic bound remains63.6%, without an external plate holder. Full route rows are in `v16/verification.json`.

Stationary plate baseline at Normal, eight seeds per arena/mode, museum events disabled:

| Arena | Co-op catches/90s | Rivals catches/90s |
|---|---:|---:|
| Gallery | 3 | 2.5 |
| Archive | 2.12 | 2.38 |
| Crossroads | 2.75 | 3 |

## Full-match simulations by difficulty

20 seeds per row;11 rows per difficulty;660 matches total. Scripted map-aware players, not human skill measurements. Auto uses a naive human collector with default Auto Echo; teamwork uses the existing plate-seeking human policy. Strict wins exclude ties.

| Difficulty | Mode | Policy/Echo | Win | Mean bank | Three stars |
|---|---|---|---:|---:|---:|
| rookie | coop | naive/follow | 80% | $1,990 | 0% |
| rookie | coop | naive/cover | 80% | $1,990 | 0% |
| rookie | coop | noise/follow | 10% | $1,010 | 0% |
| rookie | coop | fetch/repeated-fetch | 100% | $2,100 | 0% |
| rookie | coop | teamwork/cover | 95% | $3,129 | 80% |
| rookie | coop | auto/auto | 100% | $2,100 | 0% |
| rookie | duos | naive/follow | 10% | $1,400 | 0% |
| rookie | duos | noise/follow | 0% | $545 | 0% |
| rookie | duos | fetch/repeated-fetch | 35% | $1,600 | 0% |
| rookie | duos | teamwork/cover | 70% | $2,160 | 0% |
| rookie | duos | auto/auto | 25% | $1,500 | 0% |
| normal | coop | naive/follow | 80% | $1,990 | 0% |
| normal | coop | naive/cover | 85% | $2,015 | 0% |
| normal | coop | noise/follow | 30% | $1,271 | 0% |
| normal | coop | fetch/repeated-fetch | 95% | $2,105 | 0% |
| normal | coop | teamwork/cover | 100% | $2,790 | 55% |
| normal | coop | auto/auto | 95% | $2,070 | 0% |
| normal | duos | naive/follow | 25% | $1,500 | 0% |
| normal | duos | noise/follow | 10% | $875 | 0% |
| normal | duos | fetch/repeated-fetch | 25% | $1,560 | 0% |
| normal | duos | teamwork/cover | 70% | $2,065 | 0% |
| normal | duos | auto/auto | 20% | $1,325 | 0% |
| pro | coop | naive/follow | 80% | $1,990 | 0% |
| pro | coop | naive/cover | 75% | $1,940 | 0% |
| pro | coop | noise/follow | 0% | $881 | 0% |
| pro | coop | fetch/repeated-fetch | 95% | $2,075 | 0% |
| pro | coop | teamwork/cover | 95% | $2,235 | 10% |
| pro | coop | auto/auto | 75% | $1,940 | 0% |
| pro | duos | naive/follow | 5% | $1,180 | 0% |
| pro | duos | noise/follow | 5% | $945 | 0% |
| pro | duos | fetch/repeated-fetch | 15% | $1,250 | 0% |
| pro | duos | teamwork/cover | 65% | $1,970 | 0% |
| pro | duos | auto/auto | 10% | $1,210 | 0% |

## Visual review and limitations

24 updated engine SVGs: four distinct-position seeds per arena/mode. Inspected the contact sheets: Gallery retains open pillars, Archive shelves with twin centre passages, Crossroads a widened hub and lower escape openings. Walls do not vary with seed.

No fresh browser playtest or real-device latency measurement: the previous browser access-policy rejection remains; no bypass attempted. Map diagrams were visually inspected, but live canvas art, capture rings, lobby fit, sound and input feel still need browser/human QA. Route exposure predicts current guard vision, not future patrol positions. No claim that all rescue approaches are safe. Auto may make ordinary co-op collection too easy; noise-skill advantage and rival difficulty progression require playtesting. No multiplayer fairness claims beyond the measured route/engine gates.

Reproduce: `npm test`; `npx tsc --noEmit`; `node --experimental-strip-types scripts/verify-noise-v16.ts`; `node --experimental-strip-types scripts/audit-noise-v16.ts`; `node --experimental-strip-types scripts/render-noise-v16.ts`; `SIM_DIFFICULTY=normal node --experimental-strip-types scripts/simulate-noise-v16.ts` (also rookie/pro).
