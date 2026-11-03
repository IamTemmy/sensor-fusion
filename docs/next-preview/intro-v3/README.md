## Cinematic polish pass

Removed the final-shot focus blur. Corridor crew uses a rigid central depth plane with reduced lateral displacement; surrounding floor/background retain depth motion. Final title is vertically centered and the artwork dims behind it. Sparse elliptical rain impacts stay on the pavement.

The intro and game now share the original sine alarm chirp (1150→100 Hz, 0.26 seconds); gameplay timing is unchanged. Intro repeats it at 0.7-second intervals. Optional media loads only from media.json: no missing-file HEAD probes. Run node scripts/update-intro-media.mjs whenever recordings change.

Validation: 377 unit tests passed; typecheck and isolation passed; framework build passed. All 12 software GLES2 reference renders passed. Local browser: centered title observed, full intro returned to menu, no optional-media 404s (unrelated browser-extension metadata errors present). Physical phone FPS and final audio loudness remain unmeasured. No new voice recordings, clips, keys, secrets or gameplay changes.

# Six-shot opening — current pass

Presentation-only, branch next. NOT DEPLOYED. Exact narration and media filename instructions: public/cinematics/intro-v3/README.md.

- Six shots, 5/4/4/4/6/5 seconds (28 total); supplied voice extends shots with 0.6-second breathing tail.
- New teal crew laser corridor and dock rescue, corrected violet rival stride, separate portrait art and approximate aligned depth maps. Shots 1–3 retained.
- Menu remains visible until first poster decode, then fades in. Previous shot retained during next-image loading. Optional video and voice probes are concurrent.
- Original restrained gameplay score: 100 bpm low D pulse, dark drone, sparse filtered ticks; alert only changes orchestration. Intro suspense ambience retained.
- Shot 6 uses depth-camera push/pull and title reveal, not articulated doors/limbs or a real driving clip. No real video or recorded voice supplied.

## Validation in this pass
- pnpm test: 373 passed, 0 failed.
- pnpm typecheck: exit 0.
- node scripts/check-preview-isolation.mjs: PASS. Manifest unchanged.
- python scripts/check-intro-shader.py: vertex/fragment compile, link and all 12 landscape/portrait draws PASS. depth-reference-strip.jpg is production GLSL rendered with software GLES2, not browser screenshots.
- Managed local browser: opening, captions, SFX toggle, Skip and automatic menu return observed. First poster load 96 ms; decoded-ready marker 129 ms in one local run. Not a cold-network SLA.
- Physical phone FPS and audio loudness/listening quality not measured. No -16 LUFS or audible-quality claim.
- 24 WebP color/depth assets: 3,559,738 bytes across both orientations; one orientation loaded per device, next shot prefetched. No audio file download.
- Full gameplay simulation gate suite / production build not rerun in this presentation pass. Unit suite and protected-file isolation passed.

## Reproduce
pnpm test
pnpm typecheck
node scripts/check-preview-isolation.mjs
python scripts/check-intro-shader.py

Use sites-preview start with this checkout for browser QA; /intro-review?shot=0&frame through shot=5 provide deterministic frames. Voice recordings remain absent.
