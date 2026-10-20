# Noise Thieves v9: October 20, 2026

## Implemented

- Browser local RAF driver extracted into `lib/noise/client-loop.ts`. Replay resets keys, pointer, action queue, pending requests, prediction positions, sequence state, and accumulated time. Match epoch invalidates old network inputs. This is a defensive fix: the original browser freeze was not independently reproduced in this environment.
- Regression exercises the exact local driver through initial play + two replays in co-op, duos, trios. This is NOT a full browser keyboard/DOM regression.
- Local Help/inactive tabs pause simulation. Online Help does not pause other players.
- Van radius 35 for immunity, banking and boarding. Spectator panel/countdown; end-job option once every human and their allied bots are aboard. All loot banked also settles the game immediately.
- Capture: six seconds, +15 alert, dropped loot remains at the location. Rescue requires 1.5 seconds within 45 units, started with E within 40 units; walking away/capture interrupts it. Cover bots bottle for one second, remain vulnerable. Carriers move at 100 units/sec (was125), automatic-release protection 800ms (was2500). Banked loot stays safe.
- Dropped art has world/minimap markers and crew/location broadcast. After12sec unattended, security returns it to its pedestal. Dropped jackpot stays unlocked until returned; rivals can take it.
- Carried screams heard through walls within170; alert only once per heard alarm, not per tick. Unsafe throws near own crew +8alert. Lockdown adds one guard at60; louder/faster tier at30. New visible scream/rescue/jackpot labels.
- A new thrown diversion can draw a guard's attention for1.8sec, but detection within45 remains dangerous. Rival throw selection deliberately values nearby rival carriers.
- Three collision layouts, eight possible pedestal spots, randomized patrol phase/direction and2–4 initial guards. Replay never repeats its previous layout. Routing tests verify all spots and plates in all maps. $1200 jackpot changes location, plate remains teammate-gated.
- Optional safe alarm practice, improved crew identifiers and result copy, museum-alarm tip.
- Co-op contract raised from$500 to$1800, explicitly shown in HUD/briefing/help. Practice stays$500. Smaller banked amounts are partial jobs. Rivals still use highest banked score.
- No snatch/shove combat system, global slow motion, or surprise door traps added.

## Validation

43 tests pass:32 Noise Thieves tests +11 retained legacy Last Lift tests. TypeScript and production build pass. Full browser replay, phone feel, and two-device input latency are NOT verified in this turn: the supported managed-preview control-browser capability is unavailable. Existing live-browser playtest was against v8, not this release.

## Simulations

`node --experimental-strip-types scripts/simulate-noise.ts`
120 matches; six conditions ×20 paired seeds1001–1020. Both policies have equal perfect static-map pathfinding and only public state. Naive never captures/throws alarms; noise policy drops its screaming art, captures, throws, and recovers it. The policies do not model human skill. Neither pursues the plate jackpot intentionally (a previously unlocked dropped jackpot can be recovered). The noise policy does not strategically target rival carriers; therefore rival skill metrics are limited. Win requires strict lead in rivals; ties are not wins. Co-op uses the NEW$1800 goal, so old $500 success rates are not directly comparable.

| Mode | Policy | Echo | Wins | Average bank | Bank range | Bank SD | Lockdown | Human captures by guards |
|---|---|---|---|---|---|---|---|---|
|Co-op|Naive|Follow|25%|$1395|$0–2300|$618|85%|8.25|
|Co-op|Naive|Cover|40%|$1535|$500–2300|$538|90%|8.85|
|Co-op|Noise|Follow|85%|$2085|$800–2300|$513|55%|3.85|
|Co-op|Noise|Cover|85%|$2110|$800–2300|$470|55%|3.85|
|Rival pairs|Naive|Follow|75%|$1295|$500–2300|$584|95%|5.70|
|Rival pairs|Noise|Follow|65%|$1520|$0–3500|$732|100%|3.60|

## Honest disposition

Co-op now distinguishes the policies in haul and captures as well as contract completion; noise policy lockdown meets40–60%. Noise policy wins85%, above the suggested70%. Rival target NOT MET: naive75% exceeds40%, and rivalry lockdown95–100% is too frequent. Do not call this competitively balanced. Next review: investigate bot rescue/loot priorities, and use a strategic diversion policy that targets rivals before proposing stronger penalties. Do not weaken the naive policy or bias seeds just to meet numbers.

Fresh rooms required: schema3. Public URL unchanged. Playtest practice, repeated replay, spectator exit, and rival fairness before submission.
