# Lobby review follow-up

Scope: friends-lobby lifecycle, presentation, selected typography, and preview-only review route access.

- Leave and pagehide send authenticated departure; lobby humans expire after 15 seconds without a heartbeat.
- Host can remove another human; departing seats cannot be restored by stale admission snapshots.
- Helpers normalize after removals, including returning one-human rooms to waiting.
- BOT labels, viewer-crew helper advice, and briefing lore removal.
- Self-hosted Big Shoulders Stencil headings, Manrope UI/body, Cormorant story/intro captions; OFL files retained.
- Middleware returns 404 for /type-review and /intro-review on production hosts other than the isolated next preview.
- Preview hosting manifest remains confined to next.

Validation: 428 tests pass; typecheck, preview isolation, and production compilation pass.
Real two-tab relay check: join, add helper, guest Leave; host returns to one human, no helper/start controls.
Phone screenshots are frozen presentation fixtures at 390×844; they are layout evidence, not gameplay results.
