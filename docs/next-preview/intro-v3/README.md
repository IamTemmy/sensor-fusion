# Opening v3 — 2026-11-02

Presentation only, branch `next`. **Not deployed.** No secrets read or changed; preview manifest unchanged. Engine byte-identical to `5a5a133`; maps/network protected by isolation check.

## Implemented

Five shots, 26 seconds: exterior → collection → plan → noise → close-up. Separate portrait compositions. Generated approximate depth maps drive a bounded WebGL camera; rain, searchlight/torch, lamp flicker, alarm pulse, focus, grain and vignette share the renderer. No sliding character cut-outs. Calm fallback uses the same compositions and a 1.2% gentle zoom. Desktop has 2.39:1 framing. Exact serif captions remain separate from art.

Video accepts embedded audio, follows SFX (including the global toggle), and advances on each clip's `ended` event. A blocked audible start exposes Enable sound. `shot-03a` / `shot-03b` are the two halves of story shot four; see the asset README. Video and synthesized audio never deliberately run together. Hidden tabs pause both. The close-up finishes before 350 ms opaque black, then a 650 ms menu reveal. Skip and once-per-device replay work; intro art only requests after play.

## Actual validation

- `node scripts/check-preview-isolation.mjs`: PASS — preview/next verified; engine revision pinned; maps/network unchanged.
- `pnpm test`: **361 passed, 0 failed**, 14.46 s.
- `pnpm typecheck`: PASS.
- `node scripts/run-framework.mjs build`: PASS (framework build only; full gameplay/performance gates not rerun for this presentation change).
- `python scripts/check-intro-shader.py`: vertex/fragment compile and link PASS; all ten landscape/portrait draws PASS on software GLES2. Pixel brightness assertion guards against black output. This caught a mediump overflow, fixed by highp shader precision.
- Cloud browser: all five frames inspected at 1280×800 and 390×844; captions and controls inspected at 844×390. Portrait first caption clientHeight/scrollHeight 120/120; landscape 31/31. Watch intro, SFX, Skip, once-only suppression, and return to menu observed.
- Click to initial visible frame **88 ms**; first shot image **91 ms**, local warm cache. Cold/mobile-network timing is **not measured**. Intro art is absent from the initial menu's asset fetch path.

## Limits, explicitly

The browser does not provide a WebGL context; its screenshots show the safe calm fallback. Actual browser depth playback and physical-phone FPS remain **unverified**, not passed. The separate depth strip comes from the production shader rendered through software GLES2, not a browser screenshot or video.

No real video clips or narration recordings exist in this repository. Embedded clip-audio routing is implemented and its policy unit-tested, but cannot be playback-certified without those files. The code-generated music/effects use original Web Audio synthesis. Narration is captions-only until the supplied `vo-01.mp3` … `vo-05.mp3` arrive. There is no paid API or generated film claim. The 2.5D images do not articulate the hand, throw the jar or animate walking; real clips provide those actions.

Image exports are 1920×1080 and 1080×1920, resampled from the tool's native 1672×941 and 941×1672. They are not claimed as native 2K. Ten color images plus ten depth passes total **2,599,002 bytes (2.48 MiB)**; one orientation loads during playback. Full files and native/export dimensions are in assets.json.

## Evidence

- browser-fallback-strip.jpg — actual browser desktop + phone frames.
- depth-reference-strip.jpg — production shader reference draws, separately labelled.
- frame-strip.html — serve from the site's public directory temporarily to reproduce the browser grid; do not deploy this QA shell.
- public/cinematics/intro-v3/README.md — clip names, lengths, narration text and audio contract.

## Asset sizes

| File | Bytes |
|---|---:|
| shot-01-landscape.webp | 317,164 |
| shot-02-landscape.webp | 243,162 |
| shot-03-landscape.webp | 241,270 |
| shot-04-landscape.webp | 269,598 |
| shot-05-landscape.webp | 184,082 |
| shot-01-portrait.webp | 306,918 |
| shot-02-portrait.webp | 224,444 |
| shot-03-portrait.webp | 248,070 |
| shot-04-portrait.webp | 276,372 |
| shot-05-portrait.webp | 166,860 |
| shot-01-landscape-depth.webp | 11,102 |
| shot-01-portrait-depth.webp | 10,268 |
| shot-02-landscape-depth.webp | 9,800 |
| shot-02-portrait-depth.webp | 10,108 |
| shot-03-landscape-depth.webp | 13,902 |
| shot-03-portrait-depth.webp | 14,528 |
| shot-04-landscape-depth.webp | 12,994 |
| shot-04-portrait-depth.webp | 13,932 |
| shot-05-landscape-depth.webp | 11,252 |
| shot-05-portrait-depth.webp | 13,176 |
