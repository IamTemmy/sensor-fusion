# Opening story v2 — local implementation, no deployment

Completed: Path B (layered 2D animation) and Path A prompts/drop-in player. **No real video clips or generated voice are included.** This environment exposes no video-generation or OpenAI TTS tool. No paid key was added, no secrets read, no third-party media downloaded.

Five shots last 5/4/5/3/3 seconds. New transparent museum, van and hand layers are combined with existing artwork, CSS/SVG movement and locally synthesized rain/engine/alarm/door cues. The chase uses existing game sprites; this is an illustrated animation, not 3D character animation or real video. Captions and optional voice slots are independent of clips.

## Validation performed in this pass

- `node scripts/check-preview-isolation.mjs`: PASS — “Preview project and next branch verified; approved departure/rating engine revision pinned; maps and networking unchanged.”
- `git diff --exit-code 5a5a133 -- lib/noise/engine.ts`: exit 0, no output.
- `pnpm test`: 356 tests, 356 pass, 0 fail, 0 skipped. Full output: `unit-tests.log`.
- `pnpm typecheck`: exit 0 (`tsc --noEmit`).
- `node scripts/run-framework.mjs build`: exit 0, “Build complete.” This is a framework build, **not** a rerun of gameplay difficulty/CPU gates.
- Cloud Chromium against the local preview: first Start opens the intro; replay works; pressing X skips and restores the usable setup menu. Dismissal survives returning to Start; a full replay returns automatically with Start heist enabled. Fifteen DOM layout checks (5 shots × 1280×800, 390×844, 844×390): Skip and captions inside viewport, scrollHeight <= clientHeight.
- Measured local click-to-first-frame: **175 ms** (rAF timestamp exposed on the story dialog). This is one local-browser measurement, not a connection-speed benchmark.
- Frame strips: `frame-strip.jpg` and `reduced-motion-strip.jpg`. They are rendered frames from the code scenes, **not video clips**. Reduced-motion fixture uses the same calm scene branch as the preference setting.
- Real video playback/cropping and voice playback: pending supplied files. No Path A frame strip can be produced without clips.
- Normal-connection cold-load menu within 3 s: not benchmarked. Intro images and media probes start only after the intro is requested; menu initialization does not await them. Physical phone FPS and audio listening QA are not measured here.

## Reproduce the visual review

Run `pnpm dev`; `/intro-review?shot=0&frame` through `shot=4&frame` render deterministic frames; append `&calm` for the calm rendition. The frame-strip HTML used for screenshots is kept in `frame-strip.html`; copy temporarily into public when reviewing. It uses real-sized iframes, scaled only in the parent contact sheet.

`asset-sizes.json` lists every referenced raster. New layers total **387,540 bytes**; all six referenced images total **1,397,004 bytes**, including artwork already used elsewhere. Logo and animation geometry are code. Optional MP4/WebM/voice assets: none present.

See `../intro-shot-prompts.md` for five ready-to-paste Sora prompts, reference upload paths, filenames, voice lines and encoding targets. Generate clips outside this environment, then add files without changing the player.

This pass does not modify engine, bots, maps, gameplay, networking, main, the submitted site, the preview hosting manifest or secrets. No deployment was attempted.
