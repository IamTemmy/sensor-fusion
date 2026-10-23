# Velmont v36 — gameplay freeze

Only two user-requested changes:

1. Pop text now starts at its event's actor/object position and uses the existing local label collision stack. The previous global minimum over all labels sharing the same x-column could pull a capture pop up to the jackpot. The shared fix covers capture/TIED UP, FREED, bank amounts and other existing pops; durations and effects are unchanged. Added regressions for distant labels and nearby collisions. `capture-desktop.jpg` is a frozen visual fixture, not a live-match result.
2. Rookie co-op patrol/investigation speed multiplier: 0.85 → 0.78; patrol sight: 0.85 → 0.80. Chase settings, Normal, Pro and all rivals settings are unchanged and tested explicitly. Same 40 naive-collector seeds: Rookie co-op 87.5% (was 77.5%).

No rules, map geometry, bot decisions, rewards or other UI were changed. Existing gates remain intact. Final full-matrix results are recorded in difficulty-matrix.json.

No new two-device online latency or human-vs-human testing was performed for this narrow pass. Simulation percentages describe the fixed naive collector plus Auto Echo policy, not expected human win rates.

Validation: 134/134 tests passed; TypeScript passed. All original tests were retained; three focused regressions were added.

Final difficulty gate: 240 matches, 40 seeds per cell, unchanged thresholds passed.

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 87.5% | 70% | 22.5% |
| Rivals | 87.5% | 47.5% | 35% |

Claude rescue fixture: 35/40 rescues, 0 captures while held and 0 within 3s after release. Gameplay is frozen after these two fixes.
