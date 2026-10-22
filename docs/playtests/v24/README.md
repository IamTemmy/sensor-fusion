# Noise Thieves v24 — moonlit museum UI

Presentation-only pass. Engine, bot policies, movement reconciliation, rules and difficulty gate remain byte-for-byte unchanged from the v23 source commit a46122c1d2ff3365efe9b63eca1b48f039321f46.

## Shipped

- Bungee display typography, heavy gold buttons, desktop body text at least 15px / phone 16px, labels at least 12px, enlarged money and timer.
- Four illustrated How to Play cards, three rule tabs, keyboard focus containment, dismissible first-time contextual tips. Existing rules remain in the tabs.
- Generated painted hero, getaway scene, mint Rookie/Echo portraits, violet rival portrait and three arena cards. All text is live HTML/canvas. No images are painted into the live arena.
- 10 WebP files including portrait phone hero/recap crops: **501,184 bytes total**, below 1.5 MB. Artwork generated with OpenAI image generation specifically for this project; no third-party game art copied. Bungee is loaded via Google Fonts with an Impact fallback.
- Top-down canvas: larger distinct figurines, paintings, vase, bust/statue and crown-mask; warm lit plinths, tier glows, name plaques and bold value tags. Carried art appears above the thief. Artwork names are presentation identities; engine IDs/values are unchanged.
- Mint colours shared by the human and Echo in co-op, crew cards and canvas; violet for rivals.
- Combined actor name/status labels with measured collision spacing. Nearby art tags disappear in crowds. Pops start above the actor-label stack and vanish within 400ms. Existing reduced-motion behavior preserved.
- Crew assembly with portrait cards, informational arena cards (not fake arena selection), difficulty pills, live room-code copy. Recap adds painted backdrop, portrait receipts, existing animated stars/haul and dominant replay.
- Reserved HUD/control space on phone, collapsible map and bot-order menu, readable scrolling radio on laptop. No gameplay geometry changed.
- Static noscript description and existing page metadata.

## Evidence

These are **actual browser screenshots of the implemented UI**, not image-generation concepts. Match/capture/recap screenshots use development-only frozen presentation fixtures to reproduce crowded states; they are **not evidence of a won match or a network playtest**. The fixture is disabled in production. Home and guide use the ordinary UI.

| View | Laptop 1280×720 | Phone viewport 390×844 |
|---|---|---|
| Home | [desktop-home.jpg](desktop-home.jpg) | [phone-home.jpg](phone-home.jpg) |
| How to Play | [desktop-help.jpg](desktop-help.jpg) | [phone-help.jpg](phone-help.jpg) |
| Centre fight | [desktop-centre.jpg](desktop-centre.jpg) | [phone-centre.jpg](phone-centre.jpg) |
| Capture | [desktop-capture.jpg](desktop-capture.jpg) | [phone-capture.jpg](phone-capture.jpg) |
| Carried art | [desktop-carried.jpg](desktop-carried.jpg) | [phone-carried.jpg](phone-carried.jpg) |
| Recap | [desktop-recap.jpg](desktop-recap.jpg) | [phone-recap.jpg](phone-recap.jpg) |

## Verification and limits

- `npm test`: **101/101 passed**, including new presentation identity, crowded label spacing and image-budget checks.
- `npm run typecheck`: passed.
- Browser checked all 12 requested views, rule-tab switching, fresh solo briefing/start, bot-order menu and phone action bounds (including R, within 390×844). Desktop visible-label audit found no labels below 12px in the lobby.
- Existing 240-match difficulty gate uses the unchanged engine/policy hash. Baseline: co-op Rookie 97.5%, Normal 67.5%, Pro 22.5%; rivals 65%, 62.5%, 50%. These are the existing gate's policy win rates, not new human playtest claims.
- Not verified: physical phone/touch hardware, cross-device online latency, a full public-URL multiplayer match, every possible six-player label arrangement, subjective enjoyment, or contest scoring. Public deployment status is checked separately after packaging.
- Phone guide, lobby and detailed recap scroll when needed; the replay button appears before the recap details. Arena cards describe rotation; they do not change map selection.
