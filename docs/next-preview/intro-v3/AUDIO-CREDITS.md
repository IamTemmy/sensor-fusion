# Audio provenance — six-shot pass

Intro effects and gameplay music are original procedural Web Audio synthesis from this repository. Six narration MP3 files now come from ElevenLabs (Gerard, eleven_v4), generated with the user's authorization through their connected account. No API keys are stored. See voice-assets.json for sizes and durations. ElevenLabs service terms apply; these recordings are not CC0. The user subscribed before the final opening-line generation; no retroactive commercial-license claim is made for earlier recordings. This release targets only the owner-private preview.

- components/noise/intro-sound.ts: intro rain/noise bed, suspense drone, searchlight hum, footsteps, alarm and deep closing hit.
- lib/noise/heist-score.ts and music.ts: original 100 bpm sparse low pulse, filtered drone/tension notes and noise ticks for gameplay. Existing music toggle unchanged; alert/Last Call change note density only.
- vo-01 through vo-06: Gerard narration, supplied via ElevenLabs. Exact scripts in public/cinematics/intro-v3/README.md.
- Existing PCM preparation trims silence with breath margin, normalizes with peak headroom and lightly reverberates voice; ambience is ducked 10 dB during voice.
- Intro SFX toggle mutes intro audio. Gameplay retains its separate music control.

No audio recording of this revision was exported. Browser control/mute and scheduler unit tests passed; listening balance and integrated LUFS are unmeasured. No claim of a mastered -16 LUFS mix.
