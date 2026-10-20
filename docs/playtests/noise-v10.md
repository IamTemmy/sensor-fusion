# Noise Thieves v10 — alarm and guard interaction repair

October 20, 2026. Based on user playtest of c7997fd.

## Implemented

- One exact 70×70 green getaway rectangle drives drawing, guard collision/pathing, safety, banking and escape. Guards cannot enter it.
- Noise attracts the nearest guard (two for attached screams); guards sweep for ~3 seconds, then resume routes. Persistent carried screams can be heard again after 8 seconds; static noises are not endlessly retargeted.
- Capture silences dropped art and planted alarms. Capturing guard retreats for 3.5 seconds; release/rescue protects from all guards for 3 seconds.
- Bots refuse rescues with a nearby guard in line of sight; they wait, retreat, or throw a held distraction first.
- Human plate holding automatically sends allied bots to fetch the jackpot, with a callout.
- F passes art only to an available teammate within 60 units and line of sight. Otherwise disabled. G still drops; F throws capsules. Attached scream follows an art pass.
- Visible crossing-triggered sensors replace random timed alarms. Shift / Sneak bypasses sensors empty-handed; carrying art always triggers them. Standing still does not repeatedly trigger a sensor.
- Capsule landing within 30 units of a rival plants a 15-second removable scream. Safe-zone occupants cannot be targeted. Bots can remove a planted scream.
- Practice allows a 3-second hold without losing art or adding alert. First lesson: art → Cover me → bank. Second lesson: bottle a supplied alarm and plant it on a practice rival. Practice does not escalate guards.
- Desktop status/feed/controls sit outside canvas. Full museum fits the desktop canvas. Bot orders collapse, and thief labels avoid each other. Mobile retains a cropped tracking camera.

## Verification

52 automated tests passed (41 Noise Thieves + 11 retained Last Lift). TypeScript passed. Production build passed. Regression fixtures cover pass/scream ownership, silent capture drops, release immunity, safe-zone pathing, bounded search, safe rescue, automatic plate fetch, sensor crossings, rival planting, and practice completion. Existing local RAF replay-twice tests retained.

Browser-control skill is unavailable in this managed environment. No manual browser replay, screenshot layout verification, or real-device latency claim is made. The 1280×720 layout was changed in code but remains visually unverified.

## 120 simulated matches

20 seeds per row (1001–1020), same visible-map pathfinding for both policies. Noise policy drops/captures/throws its own scream; it is not a skilled human, does not plan rival planting, and does not plan jackpot teamwork. Strict wins; ties are not wins.

| Mode | Policy | Echo | Win | Mean haul | Range | SD | Lockdown | Captures suffered |
|---|---|---|---:|---:|---|---:|---:|---:|
| coop | naive | follow | 100% | $2300 | $2300–$2300 | 0 | 50% | 2.05 |
| coop | naive | cover | 100% | $2300 | $2300–$2300 | 0 | 55% | 2.45 |
| coop | noise | follow | 100% | $2300 | $2300–$2300 | 0 | 65% | 2.45 |
| coop | noise | cover | 100% | $2300 | $2300–$2300 | 0 | 75% | 2.55 |
| duos | naive | follow | 60% | $1650 | $800–$2300 | 421 | 90% | 1.25 |
| duos | noise | follow | 55% | $1530 | $500–$2700 | 531 | 95% | 1.4 |

## Remaining design risk

Co-op is now too forgiving for this pathfinding policy: both strategies win all runs with $2,300. Removing capture camping exposes that the original difficulty depended too much on unfair recapture loops. Rival noise policy wins 55% versus naive 60%; noise has not demonstrated a strategic advantage in this benchmark. Do not reinstate camping to hit a target. Further difficulty/reward tuning and a genuine human browser playtest remain necessary. This release repairs the reported interaction faults; it is not evidence that game balance or fun is finished.
