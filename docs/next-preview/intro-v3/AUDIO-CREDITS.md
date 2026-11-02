# Opening audio and narrator — 2026-11-02 revision

## Direction

The user's latest preference overrides the pasted jazz-score suggestion: retain the sparse thriller ambience; **no new background song or jazz score**. There is no music.mp3 dependency and no licensed-track download.

Narrator: the **mint-beanie male planner**, with a youthful teenage character voice, quiet confidence and a wry, conversational delivery. Not a deep adult trailer announcer; no imitation of a real person. Read the exact five captions in public/cinematics/intro-v3/README.md. The artwork identifies who is speaking; no lip-sync is claimed.

## Sources and rights

| Sound | Source | External licence / download |
|---|---|---|
| Sparse tension tones, edit accent | Original Web Audio synthesis in intro-sound.ts | None; no sampled recording |
| Rain | Original seeded procedural noise, high-pass filtered | None |
| Thunder / hum | Original oscillators and envelopes | None |
| Footsteps | Original short synthesized transients | None |
| Alarm | Original two-Hz modulated oscillator, same phase as visual glow | None |
| Closing deep hit | Original synthesized low-frequency transient | None |
| Light room reflection | Original procedural impulse response | None |
| Narration | Not supplied | No recording or voice licence claimed |

No third-party samples (CC0 or otherwise), API keys, paid audio APIs, voice-generation tools, or video-generation tools were used. No audio files added to the shipped assets: **0 bytes**. Ambient audio is synthesized locally after clicking.

## Voice preparation and mixing

Drop in vo-01.mp3 … vo-05.mp3 or .wav. MP3 is preferred when both exist. The loader checks audio MIME types and uses bounded fetches. Leading/trailing silence is trimmed with 30ms breathing margin; RMS normalization is capped by peak headroom and a 4× gain limit. A quiet 160ms synthetic reflection adds room tone. This is RMS normalization, **not a measured LUFS normalization of future recordings**.

Voice begins 300ms after the cut. A long line extends the final segment of its illustrated shot, with 150ms tail allowance. Shot 4 resumes after its three-second segment boundary without repeating the line. Ambience ducks 10dB during narration and recovers gently. Master SFX gain mutes everything synthesized; video follows SFX separately. Skip fades synthesized audio for 160ms before closing its context. Supplied video retains its own audio; separate narration is not layered over it.

A compressor provides additional peak protection; a final -16 LUFS claim would require the actual recordings and a measured mixed export. The current quiet ambience was deliberately not boosted to a voice/program loudness target.

## Review export and verification limits

/intro-review has **Export ambience WAV**, using OfflineAudioContext and the same IntroSound scheduler as the player. It renders the six segments plus closing hit to a 27s mono 44.1kHz WAV (2,381,444 bytes when exported), without narration. It is a review-only download, not an additional game asset.

Browser execution of that export is **BLOCKED / unverified in this pass**: local preview attempts returned connection refused, then ERR_BLOCKED_BY_CLIENT. No recording was produced, and no subjective listening or measured loudness/clipping pass is claimed. Do not mistake the expected WAV size above for an existing file. Unit fixtures verify actual scheduler calls for 300ms onset, split-shot resumption, long-line duration, 10dB ducking and SFX mute. A future browser review must check audible fade, recording quality, and the mix with the supplied voice.
