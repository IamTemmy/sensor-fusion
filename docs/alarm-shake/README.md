# Alarm shake and Night Archive escapes

30 October 2026. Scope: the requested self-release action, explanatory controls,
and two 80-unit shelf cuts. No timer, loot value, guard tuning or networking changes.

## Alarm action

When carrying noisy art, F / the touch action button starts **Shake off alarm**.
The player keeps the art and can keep moving during the one-second wind-up. The
attached jar then launches toward the aim point selected on press, using ordinary
jar range, collision and lure physics. The art stays quiet for six seconds.

A teammate taking the alarm is still immediate and retains the existing quiet
period. Drop, stash, pass, capture, boarding/banking, or removal of the original
alarm cancels the pending shake. Repeated presses do not restart the timer, and
item-bound actions cannot accidentally release a different exhibit's alarm.
Quiet art retains the existing F pass; bots and Q pass requests retain their
existing art-passing behavior. Briefing card 02 and touch wording were updated.

## Archive geometry

- West long shelf at x=250: opening from y=250 to y=330.
- East long shelf at x=470: opening from y=190 to y=270.
- Both openings are 80 units tall and tested with 13-unit-radius thieves.
- Existing rooms, art, plate, lasers and patrol waypoints remain in place.

`archive-cross-aisles.png` is a data-derived collision plan, not a mockup.
`briefing-desktop.jpg` and `briefing-phone.jpg` show actual local UI rendering;
the phone image is an explicitly frozen development presentation fixture.

## Chase results and limits

The required held-jar test uses both directions through both new gaps, with a
Normal pursuing guard 50–150 units behind in 10-unit increments. There are 44
throws and 44 matched no-throw controls. Normal movement, production geometry,
no immunity, four-second observation window.

- Thrown jar: 14/44 caught (31.8%), passing the requested ≤35% gate.
- No throw: 44/44 caught.
- This gate now runs inside the normal release runner for Night Archive.

A separate, deliberately late self-shake stress test starts a $500 art carrier
with an attached alarm at those same close chase distances. It includes the
one-second wind-up and four further seconds. **44/44 were caught**, also 44/44
without shaking. The requested wind-up is not an instantaneous panic escape:
start it before a guard closes, or have a teammate take the alarm immediately.
This limit is retained in `carrier-chase.json`, not presented as a passing gate.
No timings or guard rules were relaxed to conceal it.

Reproduce:

```sh
node --experimental-strip-types --test tests/alarm-shake.test.ts
GATE_MUSEUM=night-archive PLAY_GATE=chase node --experimental-strip-types scripts/verify-playability.ts
GATE_MUSEUM=night-archive PLAY_GATE=chase node --experimental-strip-types docs/alarm-shake/carrier-chase.ts
node scripts/flagship-gates.mjs
```

The release certificate is `docs/playtests/flagship-velmont/release.json`.

## Release results

303 tests and typecheck passed. Both museums: idle 0/30, patrol stalls 0/9,
early Crown pickups 0/120. Human-led Crown banking (Rookie/Normal/Pro): Velmont
20/19/15 of 20; Archive 20/20/17. Echo-led Normal Crown: 19/20 and 20/20.
Echo-alone Normal median haul: $1,950 / $2,000. Echo left behind by difficulty:
Velmont 0/0/0 of 40; Archive 0/2/0 of 40.

Velmont CPU passed at p95 6.43 ms, maximum 31.36 ms. Archive initially missed
at p95 8.28 ms, maximum 46.67 ms; two unchanged-engine/geometry serial repeats
passed at p95 6.77/7.10 ms and maximum 26.02/32.59 ms. The original variation's
cause is not established. All measurements and recheck history are retained.

After the simulation suite started, only the Practice instruction and its touch
translation were corrected. `validate-copy.mjs` reconstructs the exact original
release hash to verify that no additional source differences were introduced;
303 tests and typecheck were rerun on the final wording.
