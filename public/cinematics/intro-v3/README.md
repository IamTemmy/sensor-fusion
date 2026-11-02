# Velmont opening v3 assets

Five authored 2.5D compositions, separately generated for landscape and portrait. These are **not video clips**. Generated color art and approximate art-directed depth maps use the existing hideout style. No downloaded third-party artwork, audio, paid APIs or new keys.

Color exports are 1920×1080 / 1080×1920 WebP. The image tool returned 1672×941 / 941×1672 originals; exports are resampled, not native 2K generation. Depth maps are 512×288 / 288×512; white is near. Small displacement is deliberate: these are approximate depth passes, not reconstructed 3D geometry. Characters do not articulate in the illustrated version. Supplied video provides the actual mask-pull, jar throw and running.

## Drop-in video with embedded audio

Use these exact filenames, in this directory, with either H.264 MP4 (preferred) or WebM. Supply both `-landscape` and `-portrait` versions; portrait falls back to landscape if missing. No code change needed. Do not reuse the old v2 script recordings.

| Story shot | Segment filename stem | Target length | Caption / narration |
|---|---|---|---|
| 1 Exterior | shot-01 | 5 s | Every night, Velmont locks its doors on things that were never theirs to keep. |
| 2 Collection | shot-02 | 5 s | Paintings stolen once already. Crowns taken from people who never got them back. |
| 3 Hideout | shot-03 | 5 s | So we take them back. Ninety seconds. In and out. |
| 4 Heist, first half | shot-03a | 3 s | The alarms will scream. Let them. |
| 4 Heist, second half | shot-03b | 3 s | Same caption continues; do not repeat the voice line. |
| 5 Close-up | shot-05 | 5 s | Just don't get left behind. |

Example: `shot-03a-portrait.mp4`. The unusual 03a/b names preserve the user's supplied clip naming even though the heist is now the fourth story shot. Color image `shot-04` belongs to that fourth shot; it is not the video filename.

Captions follow the active clip, not a parallel wall clock. Each clip runs until `ended`; supply the target duration to preserve the 26-second edit. Audio follows SFX. Synthesized ambience/effects and separate voice files are stopped during video playback, preventing double audio. The player adds the final deep hit after the last clip ends; omit a duplicate ending hit from that clip.

If a browser refuses unmuted autoplay after decoding, the player tries muted playback and shows **Enable sound**. A missing/stalled clip uses the illustrated fallback without a blank loading screen. Reduced motion and slow/save-data connections use calm stills with a 1.2% gentle zoom and no moving cut-outs, flashing effects or fast pans. WebGL failure also falls back safely.

## Optional narration for the illustrated version

Add `vo-01.mp3` … `vo-05.mp3` (or `.wav`), each containing its corresponding exact caption above. Narrator: the mint-beanie male planner, youthful, quietly confident and wry. No narration files currently exist. The player cannot transcribe/validate supplied recordings: verify the words against the captions before adding them.

Voice starts 0.3s after the cut. Leading/trailing silence is trimmed with a breathing margin; levels are normalized with peak headroom, a light room reflection, and 10dB ambience ducking. Longer lines extend the illustrated shot instead of being cut off. For shot 4, the second fallback segment resumes at voice offset 2.7s. Recordings preload with the next shot; missing, invalid or late first-shot recordings leave captions rather than delaying the opening indefinitely.

The user's preferred subtle suspense ambience remains; no jazz score or background song was added. Generated rain, hum, footsteps, alarm and closing hit need no downloaded audio. See docs/next-preview/intro-v3/AUDIO-CREDITS.md for sources, mix policy and unverified playback limits.

The ending is deliberately opaque: finish close-up → 350 ms black with deep hit → 650 ms menu reveal. No blueprint transparency or menu bleed during the shot.
