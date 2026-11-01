# Next preview regression gate

Never point this suite at the submitted site. The config rejects its hostname.

```sh
pnpm exec playwright install chromium
PREVIEW_TEST_URL=http://terminal.local:4173 pnpm exec playwright test --config playwright.preview.config.ts
```

Uses three isolated browser contexts for host, code guest and invite guest. Runs actual match time (no fake engine clock). No traces, request dumps or credential logging. Failed screenshots must be reviewed before sharing.

Required additional checks before deployment:
- Run `node scripts/check-preview-isolation.mjs`, `pnpm test`, `pnpm typecheck`.
- Idle, Echo-alone/van and rescue simulations must match the accepted release.
- Compare frame pacing on the same mid-range phone at 390×844, same match conditions, before/after. Desktop viewport emulation is not evidence of device FPS.
- Verify background visibility really changes on the test browser. Headless browsers may keep both pages visible; a tab switch alone is not a pass for the 20-second background scenario.
- A browser launch/download failure is **blocked**, never a passed regression.

Preview TURN secrets must be entered by the owner. Do not read or copy the submitted site's secrets.
