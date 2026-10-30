# Flagship playability release acceptance

2026-10-30. All gates pass on the source identified below. No failed-gate waiver is used.

## Changes

- Full lighting is the default; Shadows remains optional. Guards total 3/5/6 on Rookie/Normal/Pro, including the vault sentry; lockdown adds one.
- Fresh thrown jars divert chasing guards within 200u unless they are within 70u of the thief. Losing sight for 1.5 seconds sends pursuit to the last-seen position.
- Echo uses existing drop/capture/throw/recover actions to quiet ordinary art when working alone. Crown alarms remain unremovable. Local distraction targets avoid the teammate and stay within the pursuer's hearing range.
- Early empty-handed boarding requires confirmation within four seconds. Holding loot, already banked loot, and the final minute preserve normal boarding.
- Both vans occupy a bottom-left L. Opposing dock zones allow movement but reject banking and boarding. Rematches swap dock assignments.
- Teammates always render, including HIDING outlines and aboard markers. Shadows uses three-second last-seen rival silhouettes and never retains removed exhibit art.
- Host-controlled MINT/VIOLET team columns, team-specific bot buttons, presets, and an accurate museum preview fit desktop and phone. Results now correctly name The Velmont.
- Rookie patrols include the Archive. Pro rival bots start promptly, take calculated routes and prioritize independent collection; Pro co-op patrol/search speed was calibrated separately. Legacy maps and networking are unchanged by this final calibration.
- Static navigation edges are prepared during the briefing instead of the first gameplay tick. No extra simulation tick or dynamic state is precomputed.

## Acceptance results

| Gate | Result |
| --- | --- |
| Unit tests | 278 passed, 0 failed |
| TypeScript | Passed |
| Geometry and navigation | Passed |
| Chase forks, caught within 4 seconds | 7/33 (21.21%); without throw 25/33 |
| Echo alone, 40 seeds each | Rookie $2,600; Normal $1,900; Pro $1,500 median |
| Idle detector | 0 failures / 30 matches |
| Patrol | 0 stalls / 9; Archive pass 9/9 |
| Rush Crown | 0 early banks / 120 |
| Echo escapes, 40 seeds each | Rookie 40; Normal 39 (seed 1032 left); Pro 40 |
| CPU | p95 3.48 ms; maximum 37.10 ms |

### Difficulty

Co-op uses 40 seeds (1001–1040). Rivals uses the same 40 seeds in each dock assignment, 80 matches total. The combined rivals win rate is gated; both seat results are retained below. Ties are not wins. This measures the naive collector + Auto Echo policy, not human-player win probabilities.

| Mode | Difficulty | Dock 0 | Dock 1 | Combined |
| --- | --- | --- | --- | --- |
| coop | rookie | 100% | — | 100% |
| coop | normal | 50% | — | 50% |
| coop | pro | 40% | — | 40% |
| duos | rookie | 97.5% | 100% | 98.75% |
| duos | normal | 47.5% | 65% | 56.25% |
| duos | pro | 42.5% | 22.5% | 32.5% |

The dock-specific rivals spread remains visible in these results; the combined target passing does not establish identical difficulty from each dock.

## Browser verification

Full lighting displays guards. Hidden and aboard teammates, mobile empty-exit confirmation, team presets, adding/moving bots, six-player preview selection, and desktop/phone lobby layout were checked through the UI. An actual local match confirmed the two-step empty exit and the corrected recap museum name.

Screenshots in `docs/flagship-velmont/playability-*.jpg` are frozen presentation fixtures, not evidence of live simulation performance. Timing was measured locally after all parallel simulations completed; it is not a benchmark of every player's device or network.

## Reproduction and provenance

Run `node scripts/flagship-gates.mjs`. Detailed JSON, including per-seat balance and timing cases, is alongside this report. `pnpm build` checks that release evidence matches the current source before building.

- Source hash: `12f7f041379df0d97cd5b989baefcc3d1f5050847a2ad79cc742699a0a0526af`
- Engine/geometry hash: `7794fa5358b15ec390c5b557542c505957225298c3d56d5163fe1fb902d4ff03`
- Run started: `2026-10-30T11:57:54.738Z`

## Follow-up: Crown and outward getaway

Vans now face the exterior and leave beyond the map, with aboard markers following them. Explicit Hold Plate orders pre-position Echo before the time lock opens, without unlocking early. See `CROWN-AND-GETAWAY.md` for the separate diagnostic tests: current Normal/Pro solo Crown return policies did not bank the Crown in the tested samples. Passing the standard release gates is not a claim that this remaining playability question is resolved.
