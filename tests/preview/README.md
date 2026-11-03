# Local next regression gate

Do not deploy or point tests at the submitted site. Use a local development server (fixtures are development-only).

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm exec playwright install chromium
PREVIEW_TEST_URL=http://terminal.local:4173 pnpm exec playwright test --config playwright.preview.config.ts
PREVIEW_TEST_URL=http://terminal.local:4173 node scripts/preview-background-guest.mjs
```

`pnpm install` is required before typecheck because `@playwright/test` is a new devDependency. Preview builds rerun the full gameplay gates when the source hash changes (over 10 minutes), rewriting `docs/playtests/*`; review those generated diffs before committing. This review used a development server, not a deploy/build.

The suite uses host, code guest and linked guest contexts, acknowledges both guests before asserting match readiness, then checks invite refresh, rematch and host departure. It checks all four guide steps at 390×844, 360×740 and 1280×800, persistence of Skip, and captures cues/results.

## Real background guest

Playwright pages can remain `visibilityState=visible` even after a tab switch. `scripts/preview-background-guest.mjs` therefore hosts with Playwright but launches the guest in a separate raw Chromium process using `--remote-debugging-port=0`. It creates and activates a cover tab using `/json/new` and `/json/activate`, and reads guest visibility using CDP `Runtime.evaluate`. Playwright never attaches to the guest.

The script requires hidden visibility for the full 20-second sampled interval (100ms checks), restores the guest, and asserts active heist, Direct/Relay connection, no host-ended card, and a clock within 2 seconds of the host. Failure to become/remain hidden is a failure, never a pass. `CHROMIUM_EXECUTABLE` can select an installed Chromium; `RAW_CHROMIUM_HEADED=1` uses a headed raw guest when a display is available. Only localhost, 127.0.0.1 and terminal.local are allowed.

Current execution: Chromium installation failed (truncated download); all 20 suite cases failed before browser launch and the raw helper reported BLOCKED. Neither regression is certified. No traces, request dumps or credential logging.

Before any future deployment, rerun isolation, unit tests, typecheck, browser regressions and same-device phone frame pacing. Desktop emulation is not physical-phone FPS evidence. Owner supplies preview TURN secrets; never read/copy submitted-site secrets.
