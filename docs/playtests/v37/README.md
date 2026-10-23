# v37 — multiplayer lobby crash and just-in-time rules

## Changes
- Uninitialized arenas use a safe drawing definition; hiding spots remain empty before layout selection. Renderer lookup and palette fallbacks cover lobby and terminal views.
- Bank pop now says +$N BANKED at the banking event. Dock floor copy and a gold R Board van touch button explain the separate boarding action. Twenty-second and Last Call banners warn about the quarter-money penalty.
- Once-only carry, dock, tied-up, sentry and niche tips; existing near-cover warning retained.
- Four painted Basics and four Pro Moves cards, Crew & Echo / Getaway / Jackpot / Rivals tabs, internal rule scrolling, horizontal card rows on phone. Additional existing mechanics remain available in More museum rules.
- Prior v36 actor-local pop anchoring and Rookie-only co-op ease retained. No additional balance changes.

## Verification
- Full test suite: 136/136 passed. Targeted v36/v37 renderer and pop tests also passed after final drawing edits. Typecheck passed.
- Difficulty gate: 240 matches, 40 identical seeds per cell, naive collector + Auto Echo:

| Mode | Rookie | Normal | Pro |
|---|---:|---:|---:|
| Co-op | 87.5% | 70% | 22.5% |
| Rival duos | 87.5% | 47.5% | 35% |

- Two distinct browser clients used the real local server API and room storage: Codex Host created Z5B7XK; Codex Guest joined by code; both rendered lobby, readied, entered live play, boarded and saw the shared recap. Host replay reset both to the next-job ready briefing without crashing. Replay intentionally retains the existing direct-to-briefing flow, not a settings lobby.
- Automated test draws JSON-round-tripped host and guest views using the actual canvas renderer in lobby, first frame, finished and replay states.
- Screenshots: 1280x720 and 390x844. Guide and dock images use deterministic visual-review fixtures, not evidence of live match play. Phone action rows and guide overflow were corrected after inspection.

## Limits
The two-client check was against the local preview's API, not two physical devices or the public deployment. Public cross-device networking and latency remain unverified. This pass does not claim a new balance playtest by humans. The warning copy urges boarding, while the unchanged engine still protects a thief inside their own dock at departure.
