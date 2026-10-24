# v42 clarity pass

## Changes
- Persistent hand status distinguishes sounding art, quiet art, empty hands and a held alarm; action copy says Grab alarm.
- Echo's existing task is shown in plain language. Tied-up, boarded and active rescue states override task copy.
- Confirmed guard listeners get a short LURED marker, ring and dashed line to the thrown alarm. It uses actual heardAt/heardBy evidence, not predicted success.
- Radio artwork names match the canvas identities; close-range artwork tags yield more space to actor labels.
- Practice banner no longer scrolls its short instruction on narrow screens.
- Engine, bot policy, arena geometry, balance and networking unchanged.

## Manual playthrough
Completed all six lessons from the normal Practice button using browser controls: grab; Cover and auto-bank; capture/throw alarm and take sentry art; pass; stash/hide; board. Completion screenshot is an actual run, not a fixture. Deliberately dropped instead of passing; it did not advance; Retry lesson restored the setup and a subsequent pass succeeded. Initial lure attempt was retried after movement carried the player outside capture range.

## Automated verification
154 tests pass, including held-state distinctions, factual lure expiry, artwork copy, wrong-drop recovery and a missed catch (receiver moves after release) followed by retry. Typecheck passes. Production build re-runs the unchanged difficulty gate.

## Limits
Physical phone and real human multiplayer responsiveness remain unverified. A missed catch was tested at engine level, not manually in-browser. Browser timing is too slow to infer normal-device input latency.
