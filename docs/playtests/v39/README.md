# Velmont v39 — network responsiveness

## Hosting decision
The supported Sites hosting manifest and storage documentation expose D1 and R2, but no Durable Object namespace/migration provisioning or supported WebSocket room binding. The installed Sites workflow contains no DO provisioning path. Therefore this deployment uses HTTP polling; this is not a claim that Cloudflare Workers generally lack WebSockets or Durable Objects.

## Changes
- Full local world simulation between authoritative views (same unchanged engine), including bots, guards, alarms and remote velocity extrapolation. Prediction is capped during outages rather than advancing forever.
- Actor corrections blend over 120ms, snapping positional errors over 90 units. Collision-aware presentation prevents correction through walls.
- Grab, alarm throw, art pass, drop, stash, untie initiation and boarding/exit execute speculatively on input. Server acknowledgments remove completed attempts; authoritative state quietly rolls back rejected actions. Sneak input updates every local frame.
- Two concurrent request lanes with immediate next-send on response. Reliable, ordered action IDs are independent of latest-wins movement sequence numbers; retry and reordering cannot duplicate boarding toggles or lose an earlier action. Existing gameplay cooldowns still apply.
- Arena geometry is delivered once per match/layout, then cached. Sensor cooldown/occupancy remains dynamic. Replays and missing geometry request a full arena. HTTP compatibility remains for old clients.
- Ping readout and Connection slow above 400ms. Failed requests time out and retry without discarding pending actions.

## Verification
136 existing tests plus 9 new network tests passed; typecheck and unchanged difficulty gate passed. No edits to engine.ts or arenas.ts. Difficulty gate uses the unchanged hash-verified 240-match results: co-op 87.5/70/22.5%, rivals 87.5/47.5/35%.
New tests cover wire/static reconstruction and token redaction, out-of-order/deduplicated actions, local advance and remote extrapolation, correction thresholds, speculative rollback, replay reset, pass/stash/untie/boarding, and delayed continuous motion.
Two real browser clients joined a local API room with 300ms added round-trip delay and reached live play. The preview exhibited additional multi-second network overhead, so it is not presented as evidence of production throughput or guaranteed visual smoothness.

Run `node --use-env-proxy scripts/load-noise-v39.mjs` for four bounded production cases: 2 and 4 clients, each for 20s, with 0 and 300ms injected RTT. Credentials are never logged. The injected delay is 150ms before sending and 150ms before consuming the response, not a server timing change.

Initial production measurements missed the 6Hz target and exposed substantial CAS contention (see network-load-before-contention-fix.json). A best-effort per-isolate room queue and jittered CAS retries were added; cross-isolate D1 revision checks remain authoritative. This is not an in-memory authoritative room service.

## Final deployed production measurements (2026-10-24 UTC)

Each row reports the range across individual clients, not a pooled percentile. All four cases ran for 20 seconds on the public URL. These are authoritative snapshot rates, not rendering FPS.

| Clients | Added RTT | Updates/s per client | Median ms | p90 ms | Worst ms | HTTP 409 |
|---|---|---|---|---|---|---|
| 2 | 0 ms | 3.05–3.60 | 381.88–383.62 | 583.75–984.39 | 3987 | 0 |
| 2 | 300 ms | 3.20–3.25 | 486.03–489.19 | 929.09–1099.66 | 1484 | 0 |
| 4 | 0 ms | 1.40–2.55 | 544.22–915.00 | 1390.44–2467.16 | 3959 | 0 |
| 4 | 300 ms | 1.50–2.30 | 644.57–858.92 | 1614.49–1740.25 | 5703 | 0 |

**Acceptance: throughput FAILED.** The two-player 6Hz polling target was not reached. The queue eliminated observed HTTP conflicts but did not improve throughput in this run; cross-isolate CAS retries and long request tails remain. These short runs do not isolate how much delay comes from D1, Worker scheduling, the proxy or regional networking. Client prediction does not fix authoritative latency.

**Still unverified:** one-frame local action presentation and teleport-free movement on physical phones under a controlled 300ms network profile. Synthetic prediction/correction and rollback regressions pass, but production responses sometimes exceeded the 750ms prediction horizon. No supported Durable Object/WebSocket provisioning is available through the current Sites interface; a true real-time authoritative room service remains the recommended next architecture if that hosting capability becomes available. No claim is made that multiplayer is now fully resolved.
