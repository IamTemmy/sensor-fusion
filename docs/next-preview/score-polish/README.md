# Claude review: Velmont preview polish

Review only. Do not merge to main, deploy to the submitted site, rename its URL, or change engine rules.

## Target and baseline

- GitHub repository: IamTemmy/sensor-fusion, branch `next`.
- Baseline: `efa8afbac4f5c91f63450f4af49dec78fad8380e`.
- Preview: https://velmont-next-preview.iamtemmy.chatgpt.site
- Preview project: `appgprj_6ae6f13dfc708191875cde1e84d8bfc3`.
- Submitted site and main are untouched by this polish pass.

## Changes to verify

1. **Narration:** six original 128 kbps MP3s peak-compressed and loudness-normalized; filenames, decoded sample counts and container durations retained. Runtime uses the original per-shot speech windows, retaining breath margins and previous timing at 44.1/48 kHz, with gain 1 instead of a second RMS normalization. Voice gain compensates for the existing 0.65 effects master while retaining mute/fade behavior. Intro background effects/ambience duck by 14 dB during lines. Default voice fetch reloads the same file URL to avoid stale browser audio. No new narration or provider calls.
2. **Title hook:** original tagline retained; adds “Grab the alarm. Throw it at someone else.” in Manrope. It sits in the existing gap rather than normal layout flow. At 375 px, measured hook width 211.94 px with no horizontal overflow; CTA stays at y=638 with 56 px height in a 375×720 viewport.
3. **Briefing:** two compact lines for co-op/rivals in both museums. Velmont names Security, Night Archive names Map Room. Longer sound explanation is now the first Museum rules item. Existing Jackpot rules retain the 1v1 permanent-plate exception. The long exception is removed from the briefing heading and plan. Echo advice depends only on the viewer’s own crew having a bot, including co-op; all-human crews do not see it. Four illustrated cards and Last Call strip retain their original markup.
4. **Removal:** heading retained; body now reads “Ask the host for a new invite.” Removed guests still have only Back to hideout, never Rejoin. Removal remains final for the same room/device; the wording does not grant a bypass. A genuinely fresh invitation must be to a new crew.

## Narration measurements

Decoded MP3 measurements using FFmpeg loudnorm (EBU R128). File duration and decoded sample count match the originals. True peaks include MP3 decoding; all files remain 128 kbps.

| File | Before LUFS-I | After LUFS-I | After dBTP |
|---|---:|---:|---:|
| vo-01.mp3 | -28.28 | -18.04 | -2.63 |
| vo-02.mp3 | -28.86 | -18.05 | -2.58 |
| vo-03.mp3 | -30.21 | -18.01 | -2.61 |
| vo-04.mp3 | -28.00 | -18.04 | -2.65 |
| vo-05.mp3 | -30.00 | -17.99 | -3.08 |
| vo-06.mp3 | -31.76 | -18.00 | -2.61 |

Detailed values: [narration-loudness.json](narration-loudness.json). These are file measurements, not a claim that the complete film mix measures -18 LUFS. Physical laptop-speaker intelligibility still needs listening verification at normal volume.

## Validation

- 459 tests pass, including new mastered-audio timing and both-museum/all-human/helper briefing regressions.
- TypeScript passes.
- Preview isolation passes against its existing pinned gameplay/network hashes.
- Framework production compilation passes.
- No gameplay, engine, map, network, score, timer, font-asset, dependency or submitted-site hosting changes.
- The lengthy gameplay/performance acceptance simulations were not rerun for this presentation/audio-only pass.

## Screenshots

These show the actual UI in frozen QA fixtures at 375×720, not completed gameplay or physical-device FPS evidence. Title/removal views are cropped to the known iframe bounds without altering page content. QA harnesses remain gated to development/the isolated preview host.

| View | Screenshot |
|---|---|
| Title | [375 px](screenshots/title-375.png) |
| Co-op, Velmont, bot on own crew | [375 px](screenshots/coop-velmont-375.png) |
| Rivals, Night Archive, all-human | [375 px](screenshots/rivals-archive-375.png) |
| More rules: sound explanation | [375 px](screenshots/more-rules-375.png) |
| More rules: 1v1 plate exception | [375 px](screenshots/more-rules-jackpot-375.png) |
| Host removal | [375 px](screenshots/removal-375.png) |

## Independent review checklist

- Compare `efa8afb..next`; flag every change outside presentation/audio, review fixtures, tests and evidence.
- Rerun `npm test`, `npm run typecheck`, and `node scripts/check-preview-isolation.mjs` on `next`.
- Verify each MP3 with `ffmpeg -hide_banner -i FILE -af loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json -f null -`; read `input_i` and `input_tp` as the measurement of the already-mastered file. Require -18 LUFS within 0.1 LU and <= -1.5 dBTP.
- Listen to all six lines, especially vo-06, on real laptop speakers at normal system volume. Check speech against the alarm shot, ambience duck/recovery, SFX mute/unmute, replay/Skip and resumed narration.
- At 375 px, confirm the new hook is one line, does not overlap the art/CTA, and does not move the CTA.
- Check both museums in co-op, rivals and 1v1, with/without a bot on the viewer’s own crew; plan text is two lines, More rules retains exceptions, human-only crews have no Echo hint.
- Check a removed guest: exact heading/body, no Rejoin, no automatic rejoin; existing same-room block must remain.
- Check desktop and 375 px, and confirm review routes return 404 on the submitted host.
- Return PASS/FAIL per item with evidence and severity; do not release to live.
