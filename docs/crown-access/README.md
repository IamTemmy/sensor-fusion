# Crown access pass — 30 October 2026

The player's report was reproducible: the Archive Crown was below a final shelf with very little floor space, and the Velmont vault's internal wall constrained the grab/turn area.

Both Crown rooms now have two doorway approaches into a loop, at least 90×90 units of clear pedestal floor, and a wall recess within 120 units. Crown-route doorways are at least 80 units wide. Normal has four guards including the vault sentry; Rookie remains three and Pro six. Lockdown adds one.

The 1:00 pickup lock remains. The Crown now moves at the ordinary empty-handed movement speed (165u/s), with no weight penalty. Its alarm can be captured by a teammate. The vault sentry leaves for the plate room at unlock, and its subsequent patrol stays in the public museum. Regular patrol routes do not re-enter the vault maze; pursuit and investigation remain possible.

Picking up the Crown releases an inside-triggered staff door. It stays physically open to both crews and guards for the rest of the match. Collision snapshots refresh for guests immediately, and both navigation geometries are prepared during the briefing. The radio announces “Staff exit unlocked!”

Measured Mint-dock return paths:

| Museum | Before exit | Through exit | Distance reduction |
|---|---:|---:|---:|
| The Velmont | 1089u | 876u | 20% |
| The Night Archive | 1212u | 766u | 37% |

These physical paths are **not halved**. Combined with removing the prior weight-based Crown speed (about 87u/s → 165u/s), the ideal uninterrupted return time is reduced by approximately 58% and 67%, respectively. No inbound detour was added solely to inflate that reduction.

## Approved timing clarification

The user explicitly selected **“Allow fast escapes”**: a coordinated crew may bank before 0:45 remains, provided pickup cannot occur before the 1:00 unlock. The release gate now checks zero pre-unlock pickups across 120 rush runs per museum. Earlier banking counts remain visible in the raw report; they are not hidden or called failures.

## Presentation

“Play with friends” reuses the actual Rookie, Violet, and Echo portraits from the co-op/rival cards. The middle portrait is purple; the flank portraits retain the same mint palette as their source cards. All are masked.

Sealed event loot is absent from the renderer, lighting, and shadow exhibit list. Its arrival announces “UNEXPECTED LOOT · A new exhibit has arrived! 15s to claim it.” Locked Crown art shows its lock reason. Art9/art10 are excluded from interaction and drawing in 2–4-player arenas. Stashes remain stealable by either crew under the existing rules.

## Evidence

- `../playtests/flagship-velmont/release.json`: full current-source release report, including both museums.
- `*-annotated.jpg`: frozen local UI screenshots with measured inbound/return paths overlaid. These are presentation fixtures, **not** human playtest victories.
- `*-routes.png`: exact collision-geometry route diagrams.
- `friends-phone.jpg` and `friends-desktop.jpg`: visual checks.
- `unlock-cpu.json`: additional first-door-opening CPU check.

Crown success simulations use ordinary inputs, with alarm capture and recovery. “Echo runs” means the human holds the plate and then supports the run, including legitimate passes/recovery. It does not mean an unattended Echo with the human permanently staying on the plate. Win rates from a scripted collector are informational, not a human-skill estimate.

Six-player legacy layouts and the third-museum work are outside this focused Crown pass.

## Final gate results

| Check | The Velmont | The Night Archive |
|---|---:|---:|
| Human Crown banks, Rookie / Normal / Pro | 20/20 / 19/20 / 15/20 | 20/20 / 20/20 / 18/20 |
| Echo-led Crown banks, Normal | 19/20 | 19/20 |
| Idle stalls | 0/30 | 0/30 |
| Echo left behind, Rookie / Normal / Pro | 0/40 / 0/40 / 0/40 | 1/40 / 1/40 / 2/40 |
| Echo-alone Normal median haul | $1950 | $2000 |
| Pickup before 1:00 unlock | 0/120 | 0/120 |
| CPU p95 / maximum | 6.16 / 26.02 ms | 6.65 / 22.85 ms |

292 regression tests and TypeScript passed. The final two presentation-only adjustments were rechecked in the browser and with tests/typecheck; the report retains the original simulation hash separately from the final source hash.
