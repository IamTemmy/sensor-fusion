# v32 — Velmont: After Hours

The game's player-facing name is now **Velmont: After Hours**, with “Quiet hours. Loud company.” as its tagline. The public URL, room protocol, storage keys and saved bests are unchanged. Historical playtest reports retain their original titles.

## Changes

- Hiding selection now scores wall-adjacent candidates around wing approaches and return routes instead of taking the first four positions in a top-to-bottom scan. Four spots per arena, symmetric in rivals, clear of staff doors (80 units), posted sentries (120 units), and van bays. Each is within 150 units of art or a sampled wall-aware art-to-van route.
- LOADING BAY is painted in the bay floor near its lower edge. Actor labels remain in the separate push-apart layer.
- Co-op now uses lighter patrol/investigation tuning. Rookie uses a patrol-only initial roster without the optional extra patrol; Normal reserves dedicated sentry coverage for the jackpot/big exhibits; Pro retains its additional security. Chase tuning remains separate from patrol tuning.
- Useful hiding changes rival outcomes even with unchanged bot settings. Normal rival movement receives a compensating adjustment from 1.1275 to 1.15 (about 2%). Rookie/Pro rival settings, guard settings, rules and objectives are unchanged. The existing strict order and Normal-rivals 45–50% gate are retained.

## Verification

See the accompanying deterministic simulation, route and fixture JSON. Renders cover four seeds for all three arenas in both modes. The 1280×720 and 390×844 browser previews were inspected for hiding prompts, loading-bay text and the renamed home header.

The frozen visual-review screens are presentation checks, not live gameplay evidence. Physical-phone controls and two-device online latency were not re-tested in this pass. Scripted policy win rates are a balance benchmark, not a prediction of human win rates.

## Final results

40 seeds (1001–1040) per cell, unchanged naive collector with Auto Echo:

| Mode | Rookie | Normal | Pro |
| --- | ---: | ---: | ---: |
| Co-op | 80% | 60% | 22.5% |
| Rival duos | 85% | 45% | 35% |

120/120 tests pass; TypeScript passes. Difficulty gate preserves strict ordering, Rookie rivals >70%, and Normal rivals 45–50%, and now also bounds co-op near the requested targets. These are approximate targets over 40 deterministic seeds, not measured player win rates.

- Claude natural-capture fixture: 36/40 rescues, 0 Echo captures while held, 1 within three seconds after release. Gates pass.
- Thirty-match idle regression: zero qualifying six-second stalls.
- Chase lure fixtures at 130 and 220 units: control caught in both; throw escapes in both.
- Maximum matched route spread: 16.67 units (<40).
- Four hiding spots checked across 240 mode/difficulty/seed setups for usefulness, wall adjacency, bay exclusion, door/post clearance, and rival symmetry.

Balance caveat: relocating usable cover changes rival bot behavior. Normal's compensating movement adjustment is 1.1275 → 1.15 (~2%); Rookie and Pro rival tuning is unchanged. This preserves the pre-existing balance gate rather than loosening it. No new game rules were added.
