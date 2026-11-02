# Illustrated opening — local preview only

Four 4-second shots: museum arrival, blueprint plan, alarm handoff, existing branded title artwork. The generated storyboard's first three panels are rendered with CSS camera motion; the fourth generated logo is deliberately unused. Existing masked-O wordmark renders as HTML/SVG. This is an illustrated sequence, not fully animated 3D or an encoded video. No voiceover or dedicated soundtrack was added.

New asset: public/cinematics/velmont-opening.webp, approximately 332KB, separately capped below 350,000 bytes and requested only when the intro is shown. Gameplay art retains its existing 3MB cap. Original generated PNG encoded as WebP without changing its composition. No new external service or credentials.

First visit plays once unless an invite URL, visual-review fixture or reduced-motion setting is present. Skip and Escape dismiss and persist the seen flag; Watch intro replays. Controls behind the modal are inert, Tab stays on Skip, focus returns after closing. Shot timer pauses when document is hidden. Missing art does not disable Skip or block the automatic return to the menu.

Actual validation: 352 existing unit tests pass; typecheck and isolation pass. Cloud browser observed desktop scene progression and automatic return, phone title reveal, replay, and Escape dismissal. Fixed observed Escape propagation into the existing guide and verified dismissal without opening it. No real-device FPS or fresh multiplayer regression certification. Gameplay and networking unchanged. No deployment; main/submission/secrets untouched.

## Private-preview publication follow-up

- Fixed the event-banner selector so it excludes `.first-heist`; added browser layout cases at 390×844 and 360×740.
- `pnpm test`: 352 passed, 0 failed. `pnpm typecheck` and `node scripts/check-preview-isolation.mjs`: passed.
- `pnpm exec playwright test --config playwright.preview.config.ts --grep 'event banner preserves'`: BLOCKED before either test body ran; Playwright Chromium executable is missing. These are not layout passes.
- GitHub `next` source synchronized through the connected GitHub API after shell push authentication failed; exact source tree matched local `c13d6c9`. Remote commit: `c2574465a67fbb037b8787436273c10078cf4790`.
- Existing preview access verified owner-only, with no external visitors. Submitted project and secrets untouched.

Publication was blocked by the unchanged full-build CPU gate: Velmont p95 7.0264 ms/max 54.1096 ms; one isolated recheck after stopping the development server gave p95 7.4722 ms/max 55.5326 ms. Limit: p95 <8 ms, max <40 ms. Both failures are retained in opening-validation. All non-CPU release gates passed; Archive CPU passed. No deployment occurred. Existing hosted preview remains unchanged. Do not label either failed CPU run as passed.
