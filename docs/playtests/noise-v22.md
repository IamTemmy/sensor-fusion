# Noise Thieves v22 — Museum after hours

Presentation-only update. Engine, physics, layouts, timing, routes, economy and bot policy are unchanged from v21.

- Original SVG masked-thief portrait shared by the title, briefing and crew badges. No downloaded art or new runtime dependencies.
- Canvas thieves have faces, masks, caps and crew colors; guards have uniforms, caps and directional flashlights. Existing capture/protection outlines remain.
- Fixed museum tile inlays, brass wall trim, glass-case finishes and Archive shelving details. Decoration adds no obstacles.
- Noise objects rendered as bottled sound; existing ripple, throw, scream and protection systems retained.
- Crew vans have wheels, windows and headlights, keeping the exact safe-zone boundary.
- Title, briefing and recap share ink-blue, brass and mint styling. Desktop status/control bands reduced; right-side feed remains outside the arena.

Validation: TypeScript passed. All 98 existing tests passed. Browser checked title, briefing, solo launch, live rendering and bot command menu at 1363×936. All five controls fit within the viewport. This was a UI smoke test, not a complete manually played heist. Browser timing is throttled; no latency claim. Mobile, exact 1280×720 and real two-device multiplayer remain unverified. Production build runs the unchanged difficulty gate (cached only for matching engine/policy hashes).
