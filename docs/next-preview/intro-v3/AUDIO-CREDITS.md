# Audio provenance — six-shot pass

All currently shipped intro effects and gameplay music are original procedural Web Audio synthesis from this repository. No third-party music, samples, asset downloads, paid API or API key was used. There are no added audio files.

- components/noise/intro-sound.ts: intro rain/noise bed, suspense drone, searchlight hum, footsteps, alarm and deep closing hit.
- lib/noise/heist-score.ts and music.ts: original 100 bpm sparse low pulse, filtered drone/tension notes and noise ticks for gameplay. Existing music toggle unchanged; alert/Last Call change note density only.
- Optional vo-01 through vo-06 recordings: not supplied. Exact script and delivery directions in public/cinematics/intro-v3/README.md. Their source/permission must be recorded when supplied.
- Existing PCM preparation trims silence with breath margin, normalizes with peak headroom and lightly reverberates voice; ambience is ducked 10 dB during voice.
- Intro SFX toggle mutes intro audio. Gameplay retains its separate music control.

No audio recording of this revision was exported. Browser control/mute and scheduler unit tests passed; listening balance and integrated LUFS are unmeasured. No claim of a mastered -16 LUFS mix.
