# Noise Thieves v30

## Scope
Small gameplay/clarity pass on v29. Loot budget, arenas, rescue rules, hiding rules, sentries, noise diversion and painted UI remain intact.

- Rivals collection tuning is isolated to autonomous bot crews. Rookie retains pickup hesitation and no plate teamwork. Normal starts collecting after 1s (previously 3s), collects at 1.125× the base bot speed, and carries at the same value-dependent speed as human thieves (previously 90%). Rookie collection is 0.55×; Pro is 1.3× to preserve strict ordering after fairer guard entry. Plate teamwork and planting retain their existing rules. No extra loot, immunity or score manipulation.
- An empty-handed bot in rivals mode completes its short guard-aware recovery move even while a teammate is captive; previously the captive check could cancel recovery every tick. This fixes a seven-second wait found during regression testing while leaving co-op and art-carrying rescue decisions unchanged.
- Central rivals security enters through a centre staff door. Gallery and Crossroads use top-centre; rotational Archive alternates top/bottom centre doors by seeded match parity. Wing sentries keep their paired wing entrances. Centre lockdown reinforcements also use a central entrance.
- Quiet, free thieves within 40 units of available cover see a bright plant ring and SHIFT / Hide in the existing action button. Screams, cooldown, occupied cover and capture suppress the prompt. Touch players tap the same button.
- How to Play now says: “Sneak into tall plants to hide. Screaming art gives you away.” A one-time nearby-plant tip appears when a guard targets the player, using the existing dismiss/6s tip behavior.

## Verification
116/116 tests pass; TypeScript check passes. Existing tests were kept unchanged. Three new tests cover centre-door approaches across 40 seeds, quiet/occupied/cooldown hiding availability, and guide/action-bar/tip wiring.

Exact Claude fixture: 38/40 rescues, 0 Echo captures during the hold, 2 within 3s after release. The existing carrying-rescue and guard-aware routing gates pass. Thirty Normal matches (15 co-op, 15 duos) found zero qualifying 6s bot idles after the waiting fix; the later Pro-only speed change does not affect that Normal fixture. Both matched capsule-diversion scenarios still pass.

240 simulated matches, identical seeds 1001–1040 per cell, naive collector + Auto Echo:

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 90% | 75% | 27.5% |
| Rivals | 77.5% | 47.5% | 37.5% |

Strict difficulty order passes. Build checks additionally require Rookie rivals >70% and Normal rivals 45–50%. These are deterministic scripted-policy results, not estimated human win probabilities. Normal’s plate teamwork and planting rules are unchanged: earlier jackpot commitment was tested and rejected because it handed the shared vault to the human crew.

Guard-entry tests cover all three arenas, both Archive centre doors, hidden grace starts, and centre approach paths that remain in the shared centre. Existing route-fairness gates pass unchanged. No arena geometry was changed.

Reproduce with `node --experimental-strip-types --test tests/*.test.ts`, `node scripts/difficulty-gate.mjs`, and `node --experimental-strip-types scripts/verify-noise-v29.ts`. The matrix includes the exact engine and simulation-policy hashes.

Screenshots are frozen development fixtures for UI inspection, NOT evidence of a complete live playtest. Desktop 1280×720 and phone 390×844 show the prompt and ring. Guide copy was also inspected in the browser. Real-device latency and physical phone touch response were not measured.
