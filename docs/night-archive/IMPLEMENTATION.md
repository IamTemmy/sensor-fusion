# Night Archive candidate

The 2–4-thief pipeline alternates The Velmont and The Night Archive on rematches in both co-op and rivals. Six-thief matches keep the existing grand museums. Each museum retains its own floor, lights, wall skin, art identities, rooms and patrol routes. Docks still swap on rivals rematches.

Archive routes are independently authored: shelf aisles, a continuous southern outer loop, Reading Room, Map Room, Fossil Hall, and a southeast Rare Folio Vault with switchbacks. The vault offers a laser shortcut and a longer unlit doorway. The plate is in the Map Room, out of sight of the Crown. Centerpiece geometry is part of reachability checks.

The Crown test takes the outer loop and safe vault doorway. It departs at 25 seconds elapsed, versus 30 seconds for the shorter Velmont approach, uses ordinary inputs and guard-aware routing, bottles alarms and recovers dropped art. No entities are teleported or removed. Museum-specific route choice is intentional, not a common mirrored strategy.

Candidate checks at this checkpoint: 286 unit/regression tests pass; Archive Crown banking 18/20 Rookie and 12/20 Normal before the final late-return AI improvements; latest unattended Echo results median $2,850/$1,500/$1,500 and 1/40, 1/40, 2/40 left behind. These are preliminary checkpoints. The final exact-source release report, not these notes, decides deployment.

The full suite includes reachability, 30-match idle, patrol continuity, 40-match escape and haul per difficulty, 20-seed Crown policies, 120 rush attempts per museum, informational co-op/rivals win rates with swapped docks, and isolated CPU timing. Old fixed win-rate bands are intentionally no longer release gates, per the user's October 30 instruction.

`desktop-map.jpg` and `phone-centerpiece.jpg` are frozen presentation fixtures, not match wins.
