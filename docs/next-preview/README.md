# Isolated next review fixes

Review target: `next@b85ddec`. No deployment was performed. Main, submitted site and secrets were not touched. `.openai/hosting.json` remains the separate preview project; never merge it into main.

## Fixes

- First-heist progress follows the player's bank or a personally held piece banked by their crew. Other seats' deposits do not skip lessons. Held IDs are observed each render and persisted with step/code/match/attempt count. Same-match reload resumes; Skip/escape dismiss; unfinished matches get one retry.
- Explicit touch copy, intrinsic guide height and clear action/status spacing. No Echo sentence for human-only teams. The guide also overrides the placard visibility rule that otherwise hid it on desktop.
- Echo bubbles require live held-art, captive, incoming-pass, loose-art, plate-distance or unbanked-Crown conditions; they still expire at 2.3 seconds. Loose recovery uses available crew drop/pass events, so incomplete event history can conservatively omit a bubble.
- Guest unavailable-action checks use the same predicted view as buttons, falling back to the authoritative snapshot. Sent packets/protocol are unchanged.
- Neutral loose-art recap advice unless a pass is airborne; no Crown heading when this crew did not bank it; audit margins align with crew cards; dead aria-disabled CSS removed.
- Preview suite readiness order corrected. Separate raw-CDP guest script checks actual 20-second background visibility and restoration.

## Actual validation

- `node scripts/check-preview-isolation.mjs`: PASS, all nine protected files identical to ce1ce1f.
- `pnpm test`: 341 tests pass, zero fail.
- `pnpm typecheck`: PASS.
- `node --experimental-strip-types scripts/verify-rescue-pass.ts`: Velmont 30/17/30; Archive 29/26/30 (art-first / banked within 15s / captive freed, out of 30). Exact accepted baseline. Command exits 1 because the existing Velmont 85% banking threshold remains unmet; this is not relabeled green.
- Playwright local suite: BLOCKED. All 20 cases fail before launch because Chromium is absent. `playwright install chromium` was attempted and failed with a truncated archive.
- Raw background-guest script: BLOCKED at browser launch, not passed.
- Cloud-browser visual fixtures: all four guide steps fit at 390×844, 360×740 and 1280×800 with scrollHeight equal to clientHeight and no action/status overlap. Phone heights 49/62/62/49 px. Desktop guide visibility checked after correcting the placard CSS conflict. These are frozen fixtures, not multiplayer or physical-device FPS certification.
- Idle/Echo/CPU figures in status.json are explicitly historical from the previous next pass, not rerun here. Gameplay source remains unchanged.

## Screenshots (frozen presentation fixtures)

| View | 1280×800 | 390×844 |
|---|---|---|
| Grab | [Desktop](screenshots/next-guide-grab-1280.jpg) | [Phone](screenshots/next-guide-grab-390.jpg) |
| Alarm | [Desktop](screenshots/next-guide-alarm-1280.jpg) | [Phone](screenshots/next-guide-alarm-390.jpg) |
| Bank | [Desktop](screenshots/next-guide-bank-1280.jpg) | [Phone](screenshots/next-guide-bank-390.jpg) |
| Board | [Desktop](screenshots/next-guide-board-1280.jpg) | [Phone](screenshots/next-guide-board-390.jpg) |
| Echo bubble | [Desktop](screenshots/next-bubble-1280.jpg) | [Phone](screenshots/next-bubble-390.jpg) |
| Receiver ring | [Desktop](screenshots/next-ring-1280.jpg) | [Phone](screenshots/next-ring-390.jpg) |
| Results audit | [Desktop](screenshots/recap-coop-1280.jpg) | [Phone](screenshots/recap-coop-390.jpg) |

## Follow-up review of 0e57950

Solo progress now stores `soloStart` from the game's start timestamp. Component identity includes that start, clearing held-ID memory between solo games. A new PRACTICE/match-1 game consumes the next attempt; reloading the same identity resumes. Online code+match identity is unchanged. A new unit test covers new-game/reload/attempt-cap/Skip and online behavior.

The raw guest launches at 1280×800 and scrolls each target button to the center before measuring/clicking it. The canvas receives the existing touch-controls state and omits `F · ` on touch labels.

Actual follow-up validation: isolation PASS; `pnpm test` 342 passed / 0 failed; `pnpm typecheck` exit 0. `node scripts/run-framework.mjs build` completed (production framework build, not the full `pnpm build` simulation gate). Started the generated Worker locally using `pnpm start --port 4184`; HTTP GET returned 200. Against that local production server the background helper exited 1 with:

```json
{"status":"BLOCKED","reason":"browserType.launch: Failed to launch chromium because executable doesn't exist at /root/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"}
```

Chromium installation was retried and failed again. The Join/hidden-20s behavior is therefore not claimed as verified. Earlier screenshots/rescue/suite results above belong to the prior review pass. No deploy, secrets, main or protected-file changes.
