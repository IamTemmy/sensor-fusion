# v23 — Moonlit museum heist

Visual-only change. Engine, bot policies, collision, rules, timings, balance and difficulty gate are byte-for-byte unchanged from v22.

## Shipped
- Darker tiled floors and contrasting wall caps; 11-unit wall front faces, raised plinths and soft shadows. The wall top is raised from the existing footprint, not a new obstacle.
- Blue-white torch cones, gold displays, coral/red alarm rings, mint/violet crews. Static SVG film grain and vignette.
- Actors drawn at 1.2× size, masked thieves with bags, uniformed guards with caps and torches. Local thief rendered after other actors with white outline and YOU pip; blue-grey capture state, lock, named LOCKED/FREE labels and protection ring retained.
- Art grabs trigger squash/bounce/sparkle; guard catches trigger 150ms shake/red edge and CAUGHT pop. Alarm captures do not trigger a guard-catch flash. Rescue/free pop excludes art-pass events. Bank amount is parsed from actual secured-value event, not invented. Event text floats above the actor and expires before 400ms. Last Call pulses; event banners slide in.
- Google Fonts Bungee headings and large numbers, chunky outlined/offset buttons. Staggered recap stars, 850ms haul count-up, compact two-column desktop receipt and fitting phone receipt.
- Muted title-only all-bot simulation runs existing engine, restarts completed jobs, and stops while tab hidden or reduced motion is preferred. No production game policy changes.
- Radio wraps and scrolls within reserved space. Phone map is collapsible in HUD; bot command toggle is above arena. Alert panel fits its reserved lower strip.
- Reduced motion disables canvas bounce, shake, particle movement, noise pulsing and title simulation; CSS animation/transitions are disabled, haul displays final value immediately. Preference changes are listened to at runtime.

## Validation
- 98/98 existing tests pass; TypeScript passes.
- Production build retains the unchanged difficulty gate, using its matching engine/policy-hash cache.
- Exact CSS viewports rendered in development-only iframe harness: desktop 1280×720 and phone 390×844. Actual page/components/canvas renderer, no recreated artwork. Files in v23/: desktop/phone × home/centre/capture/recap.
- Centre/capture/recap are explicitly **staged frozen visual fixtures**, not successful gameplay runs or simulation outcomes. Visual fixtures cannot activate in production and do not save device records.
- Observed Google font loaded. Phone expanded minimap bounds y=114–162, arena starts y=170, no overlap. Opened map toggle through browser. Both recap action buttons visible in compact phone render.
- Title simulation headless check: after 20 simulated seconds all four bots had moved 160–346 units; phase playing.
- No full manual heist, physical touch-device test or two-device network test this pass. Exact real-time durations, operating-system reduced-motion switching and performance on low-end phones remain unverified in browser. Captured animation screenshots show a frozen 80ms catch frame, not measured animation timing.

External typography: https://fonts.google.com/specimen/Bungee (Google Fonts). Original v22 SVG mascot retained; no third-party illustration assets added.
