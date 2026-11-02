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
