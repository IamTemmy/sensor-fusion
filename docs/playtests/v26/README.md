# Noise Thieves v26 — visual consistency

Visual/layout only. Engine, bots, map geometry and balance are unchanged.

## Screens updated

- Home: a newly generated portrait composition keeps both mint thieves visible on phones; compact controls fit 390×844.
- Briefing and How to Play/Help: painted atlas illustrations, four short action cards, heavier headings, larger body text and navy/gold panels. Phone briefing keeps its start button visible.
- Lobby / Assemble the Crew and room-code join: shared panel/button tokens, readable code chip, gold selected modes, painted crew and arena cards retained.
- Gameplay and practice HUD: approximately 13% larger desktop arena, compact radio, alert summary in the sidebar on desktop, softer floor texture, light actor rims, blue guard badge/torch and border-only busts.
- Jackpot: nearby name/value tags disappear within 30 units; actor names are moved above the case.
- Recap: drawn filled/empty gold stars, existing haul count-up, compact left column, crew-total chips and Pro tip callout.
- Sound control (the existing inline settings toggle), errors and toasts: shared chunky controls and navy/gold presentation. There is no separate settings screen.

No old flat instruction cards remain. Minimap, key glyphs, functional icons and primitive asset-load fallbacks intentionally remain vector/canvas drawings.

## Evidence

All screenshots use frozen visual-review scenes, not completed live multiplayer matches. Desktop: 1280×720. Phone: 390×844. Long guides/lobby/recap can scroll; phone home fits without scrolling.

| Screen | Desktop | Phone |
|---|---|---|
| Home | [image](home-desktop.jpg) | [image](home-phone.jpg) |
| Briefing | [image](briefing-desktop.jpg) | [image](briefing-phone.jpg) |
| How to Play | [image](help-desktop.jpg) | [image](help-phone.jpg) |
| Lobby | [image](lobby-desktop.jpg) | [image](lobby-phone.jpg) |
| Rivals centre | [image](centre-desktop.jpg) | [image](centre-phone.jpg) |
| Jackpot close-up | [image](locked-desktop.jpg) | [image](locked-phone.jpg) |
| Recap | [image](recap-desktop.jpg) | [image](recap-phone.jpg) |

## Verification

- TypeScript typecheck: passed.
- Tests: 104 passed, 0 failed.
- Difficulty gate: passed against the existing hash-matched 240-match matrix; no new balance simulation was necessary because engine and policies are unchanged.
- Matrix win rates (Rookie / Normal / Pro): co-op 97.5 / 67.5 / 22.5%; rivals duos 65 / 62.5 / 50%.
- Engine and client-loop diff against v25: empty.
- Physical phone performance, real-device touch ergonomics, two-device online latency and a fresh complete multiplayer playthrough were not verified in this visual pass.

## Assets

Total public/art weight: 1,698,656 bytes (about 1.70 MB). New WebP images total 157,436 bytes. Existing v25 atlases are reused.

Both new assets were generated with OpenAI image tools:
- public/art/v26/hero-phone.webp: portrait moonlit museum heist painting with two masked mint-clad thieves, warm gold lighting, clear faces, no baked text; arranged for mobile title/control overlay.
- public/art/v26/scream.webp: transparent painted red glowing sound capsule with brass cap/base, matching the museum atlas; no text.

All labels, numbers and buttons remain live text. No gameplay systems were changed.
