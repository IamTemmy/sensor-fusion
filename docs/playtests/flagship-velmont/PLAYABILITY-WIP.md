# Playability pass — review checkpoint, not deployed

2026-10-30. Branch: `flagship-playability`.

Implemented: Full default lighting; total guard budgets 3/5/6 plus one lockdown arrival; fresh-jar chase diversion and last-seen investigation; early empty-handed boarding confirmation; passable opposing docks in a bottom-left L with rematch swap; current-state exhibit rendering; own-crew hiding/aboard markers and three-second rival silhouettes; two-column host-controlled team board and actual museum preview.

Last completed targeted measurements (before the latest rival-only endgame adjustment):
- Chase forks: 7/33 caught within four seconds (21.2%), versus 25/33 without a throw.
- Echo alone, 40 seeds/difficulty: Rookie median $3,100, Normal $1,900, Pro $1,500.
- Duos, 40 seeds in each dock assignment: Normal 57.5% / 75% (66.25% combined); Pro 52.5% / 70% (61.25% combined). Both combined balance gates still fail.
- Last full unit run: 275 passed. A further focused throw-aim test has since been added.

The current rival adjustment is under test. No new release approval is requested or implied. Existing release.json and historical playtest-approval.json describe v79, not this candidate. New deployment remains blocked until the current-source playability, balance, idle, escape, geometry and CPU gates pass.

Browser checks: Full lighting displays guards; hiding/aboard crew markers and mobile empty-exit confirmation are readable. Team presets, adding a Mint bot, moving it to Violet, filling 3v3, and the preview-to-actual Crossroads selection were exercised through the UI. Screenshots from visual-review are frozen presentation fixtures, not live simulation evidence.

Bot fixes use existing actions: drop, capture, throw and recover ordinary art; aim local distractions within a pursuer's hearing range; treat solid cover as usable routing space; use existing release protection for progress. Crown alarms remain unremovable. The old release regression mistakenly used the alarm-bottling counter as an arrest counter; it now checks the authoritative tied state.
