# v72 — museum identity, records and patrol corner correction

## Delivered
- Glossy purple/teal friends artwork with warm skin tones; painted brass orrery.
- Contact shadows, brass posts and velvet ropes on unchanged exhibit footprints. Statue carpet cleared beneath its footprint.
- Cream/gold Echo Gallery, walnut/green Night Archive with bookshelf wall caps, blue/brass Crossroads with star-chart inlays. Museum-specific room and collection names, briefing lore and three timed security radio lines.
- Once-per-exhibit, hands-free proximity placards outside the map; closer phone view retained. Dock tip anchored to its team's corner.
- First recorded run, saved device best and new device best are distinct. Record panel remains visible above the result buttons; desktop compact layout fits at1280x720.
- One engine bug correction: guards finish navigation corner steps below3u. Bot deadzone, geometry, collision sizes, routes, scoring, networking and tuning unchanged.

## Scope decision
User directly requested fixing freezes as well as supplying a visual-only Claude brief. The confirmed guard bug is included as a narrow exception, with explicit test coverage. It changes trajectories, so exact v71 simulation equivalence is NOT claimed. Larger map, sentry shift and bot policy changes are deliberately not included in this submission polish release.

## Validation
- Existing215 tests pass; two additional v72 tests pass (patrol corner and record status). TypeScript passes.
-18-match guard experiment:11 baseline stalls across8 scenarios ->0. See audit artifacts. This is not proof all twitching is eliminated.
-240-match difficulty gate passes: coop Rookie92.5%, Normal52.5%, Pro20%; duos90%,50%,25%.
- Existing hold, Echo-van, freeze and path-budget tests remain green. No assertion of identical gameplay outcomes.
- Frozen visual fixtures: all three museums desktop full map and390x844 closer view, placard, desktop and phone results. These screenshots are visual fixtures, not multiplayer latency evidence.
- Real WAN peer acceptance remains unverified from prior release; no networking edits here.

## Remaining design work
Audit found sentries intentionally remain posted during shift events. Bots can already throw to a human under active chase and safe receiver conditions, but generic dodging/stall handoffs are not implemented. Jackpot is1200/4300; jackpot plus entire1300 wing guarantees majority. Multiple alternative scoring routes exist mathematically, but risk/time balance has not been established. Architectural differentiation, changed loot placement and sentry shift windows require a separate gameplay iteration.

## Screenshot index
- [Echo desktop](v72-echo-desktop.jpg), [Archive desktop](v72-archive-desktop.jpg), [Crossroads desktop](v72-crossroads-desktop.jpg)
- [Echo phone](v72-echo-phone.jpg), [Archive phone](v72-archive-phone.jpg), [Crossroads phone](v72-crossroads-phone.jpg)
- [Placard](v72-placard.jpg), [Results desktop](v72-recap.jpg), [Results phone](v72-recap-phone.jpg)

## Public competition research
Official Handshake post featured Pudding Brawl, Couch Movers, Hollow Fellowship, Pumpkin Watch and The Alibi. These were promoted submissions, not confirmed winners; gameplay was not independently evaluated. Source: https://gp.linkedin.com/company/team-handshake

Official previous Codex Creator Challenge winners: TraceCode (realtime line-by-line debugger), InfraMap (interactive energy atlas), Where Dragons Dwell (dragon mythology narrative). The announcement describes clarity, usefulness, creativity, execution and polish as judging criteria; it does not disclose individual scores or causal reasons for each placement. Inference for Velmont: a clear, demonstrable teamwork hook and reliable first match matter more than adding untested features. Source: https://joinhandshake.com/blog/students/handshake-openai-codex-challenge-student-winners/

## Asset provenance
Generated with image_gen; existing menu friends and bots images used as editing/finish references. Transparent output, resized and encoded WebP for production.

Friends prompt: Three human friends in compact bust composition. Central man in royal purple hoodie and cap, two rear friends in saturated teal. Natural warm brown skin with golden highlights. Premium glossy dimensional illustrated game-sprite finish matching bots reference: reflective fabric, rich shadows, gold rim light, teal/violet bounce, clean contours. Clear expressive faces, no robots/glowing eyes, no text, transparent wide composition. Output: public/art/menu/friends-rich.webp.

Orrery prompt: Single museum game sprite, antique brass orrery with ivory sun, thin intersecting orbital rings and deep blue/teal planets mounted on low dark navy marble pedestal with gold rim. Polished illustrated3D style matching ivory fossil and statue. Elevated orthographic front view, entire silhouette visible, genuine transparent background, no scene/floor/text/rope. Output: public/art/museum/orrery.webp.
