# v43 — host-authoritative transport

## Scope and authority

No engine, balance, bot, map, practice or art changes. New rooms opt into a browser-hosted authority; existing rooms keep their original HTTP protocol. The host advances the unmodified engine at 40 ms. Guest snapshots are scheduled every 50 ms over an unordered, zero-retransmission data channel. Reliable ordered inputs authenticate the seat and preserve v39 action acknowledgments and prediction.

D1 is a signaling and fallback mailbox, not a second simulator. A relay guest sends commands to the same host. Mirrors run about once a second with direct peers, faster when relay guests need them. Thus fallback is intentionally **not** the legacy server simulation: running both would corrupt authority. There is no TURN and no host migration. A host tab should stay open and active.

SDP and bounded trickled ICE use Google public STUN. Offers retry after 10 seconds; Relay is usable while negotiating rather than leaving a guest frozen for the initial eight seconds. Direct state becomes stale after two seconds. Geometry is resent until acknowledged, then omitted. A host lease rejects a second host tab. Host departure ends the job via a reliable message and D1; abrupt departure uses a 12-second heartbeat timeout.

## Browser measurements — 2026-10-24

Public HTTPS site, separate cloud-browser tabs, each measurement approximately 20 seconds. Inputs were stationary; these are transport/load checks, not human competitive playtests. Two-client sample was in the lobby; four-client sample was during the heist approaching its end. A separate two-tab normal-UI room was also open during the four-client run.

**No Direct connection was established.** Offer/answer negotiation ran, but the observed preview SDP contained zero ICE candidates and public browser connections remained `new/new`. The exact environmental cause has not been established. Do not claim the 15 Hz Direct target or sub-150 ms peer latency passed.

| Clients | Seat | Mode | Snapshots/s | Median RTT | p90 RTT | Max RTT |
|---|---|---|---:|---:|---:|---:|
| 2 | Host | Local authority | 18.63 | 0 | 0 | 0 |
| 2 | Guest | Relay | 4.55 | 188 ms | 281 ms | 831 ms |
| 4 | Host | Local authority | 18.64 | 0 | 0 | 0 |
| 4 | Guest 1 | Relay | 1.99 | 341 ms | 1,064 ms | 1,825 ms |
| 4 | Guest 2 | Relay | 2.55 | 273 ms | 735 ms | 1,228 ms |
| 4 | Guest 3 | Relay | 2.30 | 342 ms | 728 ms | 1,206 ms |

Host rates are **local callbacks**, not network delivery. Relay RTT is HTTP round-trip time, not input-to-authority latency. Conflict counters were cumulative over the room: 0/0 for the two-client sample; 1/3/1/1 for host/guests in the four-client run. Transient non-JSON server responses also occurred and recovered. The relay performance target remains unmet.

## Verified

- Normal UI: host -> lobby, second browser joins -> both see same briefing -> both ready -> both enter the running heist.
- Guest boarding is acknowledged and appears in the host radio.
- Host leaves -> guest receives `Host left. Job ended` and the normal recap. Also verified in the diagnostic room.
- Four distinct human admissions survive host mirrors. A discovered serial-counter join race was fixed and regression tested.
- 165-test suite passed before the final bounded ICE/retry-label changes; focused transport tests and typecheck are rerun after those changes.
- Unchanged difficulty gate: co-op 87.5 / 70 / 22.5%; rivals 87.5 / 47.5 / 35%, Rookie / Normal / Pro, same 40 seeds.
- Mock-channel regressions cover seat authentication, command deduplication across transports, geometry acknowledgment, guest snapshots and Relay/Direct switching. These are not a substitute for actual WebRTC connectivity.

## Unverified / release limitations

- Real Direct connections, 2/4-client Direct throughput and ping; real Direct -> Relay -> Direct interruption recovery.
- Real phones, different networks, restrictive NAT/firewalls, background-host throttling.
- 300 ms injected-latency browser playtest. Existing v39 prediction tests remain, including delayed-snapshot continuity and action rollback.
- One-frame action feedback under real network load has not been measured; the v39 predictor remains intact.

The diagnostic page `/network-check` exposes create/join, 20-second samples, forced Relay, restoration and host leave. It uses the production PeerRoom implementation, not a separate fake transport. The implementation is available for testing, but **multiplayer responsiveness is not certified fixed**.
