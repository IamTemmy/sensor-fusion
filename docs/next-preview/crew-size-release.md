# Four-thief release validation — 2026-11-03

## Outcome
Crew-format fixes implemented on next. Full production build PASSED. Live release HELD: the required complete browser matrix and genuine 20-second background check are not complete. Neither project was deployed during this pass. Main and secrets were untouched. Rollback tag/release branch were not created because release prerequisites are incomplete.

## Changes
- Engine add, bot commands, fill and presets cap total seats at four. Human admissions replace a bot, preferring the crew with fewer humans. Host snapshot reconciliation removes the displaced bot.
- Co-op supports 2–4 thieves. Rivals support equal 1v1/2v2 crews. Online start requires two humans. The UI uses the same start-reason function as the engine.
- Friends vs bots requires exactly two humans and adds two rivals. Obsolete stored trios normalizes to duos. Standard setup always selects flagship-velmont/night-archive. Explicit historical arena factories remain test-only.
- Lobby labels, metadata, museum planning and controls reflect four thieves; the trios picker was removed. The preview hosting manifest is unchanged.
- Only the approved engine hash was repinned. Eight protected networking/map files remain identical to the isolation baseline.

## Actual validation
- pnpm test: PASS, 387 tests, zero failures.
- pnpm typecheck: PASS.
- node scripts/check-preview-isolation.mjs: PASS.
- pnpm build: PASS, full gameplay gates and framework production build; no overrides.
- CPU Velmont: p95 6.365842 ms, max 20.898956 ms.
- CPU Night Archive: p95 6.800058 ms, max 24.814159 ms.
- Limits remain p95 <8 ms and max <40 ms. Detailed gameplay results: docs/playtests/flagship-velmont/release.json.
- Playwright multiplayer: BLOCKED at browser launch, missing Chromium headless_shell-1248.
- scripts/preview-background-guest.mjs against production: BLOCKED, missing Chromium-1248 executable.
- Official Playwright Chromium installation attempted; download was invalid/empty and could not install.

## Browser matrix
Local production served via the managed preview at terminal.local:4173. Tests below used browser UI with real requests, not simulated visibility. Preview column refers to the deployed preview, which has NOT received this fix yet.

| Scenario | Local production result | Deployed preview |
|---|---|---|
| Solo co-op with Echo | Unit/gate PASS; browser NOT RUN | NOT RUN |
| Solo rivals with bots | Unit/gate PASS; browser NOT RUN | NOT RUN |
| Online co-op, 2 humans | Lobby/start eligibility PASS; match not run in this composition | NOT RUN |
| Online co-op, 2 humans +2 bots | PASS: started, completed, results showed all four escaped | NOT RUN |
| Online co-op, 3 humans +1 bot | Lobby PASS; match NOT RUN | NOT RUN |
| Online co-op, 4 humans | Lobby PASS; match NOT RUN | NOT RUN |
| Fifth human | PASS: exact full-room error | NOT RUN |
| Human replaces bot in full room | PASS: second, third and fourth human admissions displaced bots | NOT RUN |
| Rivals 1v1 | Lobby/equal crews/start eligibility PASS; match NOT RUN | NOT RUN |
| Rivals 2v2, 4 humans | PASS: equal crews, all four ready, active redesigned Velmont match | NOT RUN |
| Rivals 2 humans vs2 bots | Preset/lobby PASS; match NOT RUN | NOT RUN |
| Rivals 3 humans +1 bot | Admission/lobby PASS; match NOT RUN | NOT RUN |
| Host alone | PASS: disabled UI and invitation reason; engine rejection unit test PASS | NOT RUN |
| Code join | PASS, multiple human seats | NOT RUN |
| Link join / guest refresh | Existing guest invite-link reload auto-rejoined mid-match; fresh independent-browser link admission NOT RUN | NOT RUN |
| Guest backgrounded genuinely 20s | BLOCKED: Chromium executable unavailable | NOT RUN |
| Rematch | PASS: both players received redesigned Night Archive briefing | NOT RUN |
| Host leaves | PASS: guest saw one host-ended card and Back to hideout | NOT RUN |
| Layout 1280x800, 390x844, 844x390: lobby/spawn/HUD | BLOCKED automated viewport suite; exact-size visual assertions NOT RUN | NOT RUN |
| Opening once/narration/captions/Skip/menu | NOT RUN this pass; existing assets unchanged | NOT RUN |

No live smoke tests ran because no live deployment occurred. Local guests used HTTP Relay; Direct/TURN connectivity was not certified by these local tests.

## Test changes explained
- Added nine crew-format tests: cap, two-human start/UI rule, bot substitution, stale host reconciliation, equal crews, exact-two-human preset, arena matrix, stored-format migration, solo setup.
- noise-trios-cooperation renamed noise-crew-cooperation: obsolete six-person fixture replaced by three-person co-op; cooperation assertions retained.
- gameplay-coordination, museum-arenas, next-crew-ratings, noise-playability, noise-v2 and noise-v43: obsolete six-seat/trios populations replaced by valid four-seat/duos populations. Historical explicit arena-factory coverage retained.
- noise-flagship and noise.test now assert the four-seat rejection.
- noise-v3 adds Echo explicitly where the fixture needs two seats, because fill now fills co-op to four.
- noise-v44/v45/v46 and verify-noise-v21 use direct solo setup for one-human mechanics; online start fixtures add a friend or assert the invitation rejection.
- Museum audit/smoke tooling populations updated to four to remain executable/type-safe; historical report filenames retained.
- Preview navigation helpers now follow Start a heist → With friends and the current Join button label.
