# Velmont six-shot opening

28-second illustrated 2.5D opening: six color compositions with aligned approximate depth maps, separately composed for landscape and portrait. These are NOT real video clips. Small depth-driven camera movement, rain, beams and glow animate the artwork; character limbs and van doors are not articulated. Shot 6 depicts the rescue aboard the van, then the camera pulls back and the logo appears.

## Exact recording script

Narrator: the mint-beanie planner. Youthful, wry, quietly confident; natural delivery, not a trailer announcer. Record one line per file, with no extra words. Captions must match these lines exactly.

| File (MP3 or WAV) | Minimum shot | Exact line |
|---|---|---|
| vo-01 | 5 s | The plan is simple. Get in. Get the Crown. Get out. |
| vo-02 | 4 s | Every crew in town wants what's behind that glass. |
| vo-03 | 4 s | Ninety seconds. One very nervous alarm system. |
| vo-04 | 4 s | Rule one: the crew moves together. |
| vo-05 | 6 s | Rule two: somebody's setting off the alarms. Make sure it's not on you. |
| vo-06 | 5 s | Rule three… no matter what happens… don't get left behind. |

No voice recordings are present. Add these files here; replace any earlier-script recordings. Voice starts 0.3 seconds after the cut. Decoded narration extends a shot to its natural length plus a 0.6-second tail; silence trimming, peak normalization, light room reflection and 10 dB ambience ducking remain. Missing recordings use captions. Supplied recordings must be checked against the script by a human; this player does not transcribe them.

## Optional real clips

Revision-qualified filenames prevent old-script videos playing by mistake: `six-shot-01-landscape.mp4` through `six-shot-06-landscape.mp4`, plus `-portrait` versions. WebM is also supported. Embedded sound follows SFX; synthesized sound is stopped during clips. Each clip must contain the matching line above and its full natural duration. No clips were generated or added in this pass.

Reduced motion, slow/save-data connections or unavailable WebGL use the calm poster version. The menu remains underneath while the first poster decodes; a 450 ms fade introduces it. Later shots retain the preceding image until the next is decoded. Optional-media probes run concurrently rather than blocking initial art. Skip remains reachable while loading. End: final illustration and logo → 350 ms black with deep hit → 650 ms menu fade.

## Asset and audio provenance

Original generated art in the established Velmont style; no external asset downloads, paid APIs or new keys. Shots 1–3 are retained. New 4 and 6 and corrected rival stride in 5 have landscape/portrait depth passes. Native generated color images are 1672×941 / 941×1672, resampled to 1920×1080 / 1080×1920 WebP. Depth exports are 512×288 / 288×512. This is approximate art-directed depth, not reconstructed 3D geometry.

Intro ambience and gameplay underscore are original Web Audio synthesis; there are no downloaded samples or music files. See `docs/next-preview/intro-v3/AUDIO-CREDITS.md` and `assets.json` for provenance and sizes.

## Adding voice recordings or clips

After adding/removing files, run `node scripts/update-intro-media.mjs`, commit the updated `media.json`, then build. `node scripts/update-intro-media.mjs --check` verifies it is current. The player reads this manifest once per opening and never probes unlisted optional files.
