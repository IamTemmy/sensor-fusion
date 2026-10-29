# Population-aware museums

Three independently authored arenas replace the mirrored competitive layouts: Echo Gallery (sculpture), Fossil Archive (long exhibit and circulation loop), and Celestial Crossroads (observatory). Each has distinct 2-, 4-, and 6-seat geometry. Three seats use the four-seat plan; five use the six-seat plan. Six-seat games spread the same $4,300 across ten pieces rather than eight. Practice retains its existing lesson geometry.

Every objective, pressure plate, and hiding niche has two independently usable approaches from both rival docks. Shared objective route differences are bounded to 80 world units; total collection access costs differ by less than 15%. This is a geometric fairness check, not proof of equal human win probability. The plate is separated from the crown, alternative collections exceed the jackpot value, and decoration shares real collision footprints. Guards follow the authored routes through pathfinding; sentries must satisfy the existing visibility, clearance, and escape-route tests.

Normal co-op exhibit relief protects the eastern masterpiece and enters from the east staff door to avoid converging with the opening patrol on the first rescue corridor. Rookie reinforcements enter at 28 seconds; Normal co-op gets a relief patrol at 55 seconds. The staff-entry regression checks both the opening grace period and delayed arrival. Difficulty-specific hearing and rival collection pace are calibrated using the unchanged 240-match gate, not by weakening its thresholds.

Guard path budgeting now counts cached and uncached requests consistently. Previously a cache populated by another simulation could change movement; the full-job local/direct determinism regression exposed this during reinforcement testing.

## Verification

- `tests/museum-arenas.test.ts`: nine distinct plans, all objective routes, geometry fairness, 54 mode/population/difficulty combinations across the three maps, network arena metadata, camera edge visibility and inverse pointer mapping, isolated records.
- Older tests that asserted exact mirrored coordinates or straight-line patrol segments were replaced with current authored-map invariants. Rescue, safety, teamwork, and difficulty thresholds remain intact. The self-release fixture starts Echo 320 units away (previously 160), because the new rescue routes otherwise produced too few natural timeouts; no forced stun, immunity, or guard removal is used.
- `scripts/audit-museum.ts` generates the nine SVG plans and `routes.json` from actual engine geometry.
- Browser review: 360×740 and 390×844 portrait, 844×390 landscape, and desktop. Whole-museum view reserves a separate control region; closer view follows the thief. Frozen fixtures are visual checks, not evidence of full matches. Live responsive controls were also exercised. Physical-device and multi-device human match validation remain necessary.

## Visuals and asset provenance

The reference informs warm brass, dark marble, substantial exhibits, and a quieter gold HUD. This remains the existing responsive top-down game, not an isometric 3D conversion. The current thief branding is retained.

`public/art/museum/fossil.webp` was created with the built-in image generation tool, then resized/encoded as WebP. Brief: transparent stylized premium 3D museum dinosaur skeleton, overhead 55-degree view, tail left and skull right, brass mounts on a black marble plinth; no room, people, lettering, or background. Sculpture and orrery are code-rendered. Actors are drawn above exhibits for legibility.

## Final release checks

- All 201 regression tests passed (`arena-regression15`).
- Strict 240-match difficulty gate passed on seeds 1001–1040 in all six mode/difficulty cells. Exact results and engine/policy hashes are retained in `../v37/difficulty-matrix.json` (the established build gate location).
- TypeScript and whitespace checks passed. Human multiplayer balance still requires real multi-device playtesting; these are deterministic scripted-policy results.
