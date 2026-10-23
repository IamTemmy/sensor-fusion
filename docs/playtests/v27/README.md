# v27 — clear heist entry menu

The homepage now follows the approved concept with live HTML controls over an OpenAI-generated, text-free painted museum backdrop. Play with bots uses a masked-thief emblem, not a robot. Play with friends uses a crew silhouette.

- Bots: choose Co-op Heist or Rival Crews, difficulty, then Start Heist.
- Friends: codename, Host a room, or crew code + Join. Existing resume remains available.
- Practice and Learn to play remain accessible.
- Phone uses the existing two-thief portrait artwork with a compact menu.
- Opening guards now have a short, presentation-only perimeter sweep during protected grace. The tested simulation remains unchanged, including the 12-second grace period. This is intentionally an animation, not new guard AI. Reduced motion disables it. Normal patrol rendering takes over at grace end.

A trial simulation-level sweep failed the exact rescue fixture (5/40 after-release catches), so it was discarded rather than weakening the test. Engine source is identical to v26.

Browser checks: desktop 1280×720 and phone 390×844; bot/friend switching, rival mode selection, Start Heist through the briefing into a running bot match. Friends host/join controls checked visually; no new two-device multiplayer test.

[Desktop screenshot](home-desktop.jpg) · [Phone screenshot](home-phone.jpg)

Asset: public/art/v27/hero.webp, generated with OpenAI image tools. Prompt: premium painted moonlit museum interior; two masked mint-clad thieves carrying framed art and red bottled sound at right; dark negative space at left; warm gold lamplight and navy moonlight; no text/UI. All menu text and controls are live.

Verification: TypeScript passed; 105/105 tests passed. Difficulty gate passed with the unchanged, hash-matched 240-match matrix (co-op 97.5/67.5/22.5%; rivals 65/62.5/50%, Rookie/Normal/Pro). No fresh balance claim: engine was restored before final verification. Physical phone performance and online latency remain unverified.
