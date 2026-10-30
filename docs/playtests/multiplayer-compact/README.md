# Multiplayer compact transport

Transport-only change based on main f03eb6e. No engine, map, scoring, timer, bot, guard or difficulty edits.

## Wire contract

- Protocol capability negotiated in the authenticated hello. Old clients retain the existing full snapshot protocol.
- Reliable per-link field dictionary with a stream ID. Deltas use short numeric field IDs, integer positions and byte-quantized angles. Other numerical fields remain lossless.
- Deltas reference the latest acknowledged decoded frame, not the previous send. Missing/reordered packets cannot silently become a new baseline.
- Initial baseline, dictionary changes, events and geometry/identity changes go over the reliable channel. Frames over 3 KB also use the reliable channel; movement input continues over its existing unordered channel.
- Initial reliable baseline is sent once while waiting for acknowledgment, avoiding a full-state burst every tick during high RTT.
- HTTP fallback uses the same codec, newest input coalescing and per-client acknowledgments. A bounded disposable worker cache can be lost safely; a cold worker supplies a new baseline. This does not remove HTTP round-trip latency or guarantee worker affinity.
- Unchanged guest polls no longer rewrite the shared D1 room row. Compare-and-swap remains authoritative for actual changes.
- Host-only lobby telemetry: guest connection, RTT, received snapshots/s and average snapshot bytes. Guest reports are diagnostics, never gameplay authority.

## Packet gates

`packet-sizes.json` records eight 90-second runs: both museums, three humans + Echo and four humans, acknowledgments delayed 200/400 ms, 25% deterministic unreliable packet loss. Humans follow normal route inputs with capture immunity solely to keep traffic active. The production engine and geometry run normally otherwise. This is a traffic stress test, not a gameplay success-rate test.

Ongoing snapshot medians 529–619 bytes; maximum 2,659 bytes. Estimated three-guest host application upload 52,613–72,965 bytes/s, including reliable initial dictionaries/baselines/events and the full-game HTTP heartbeat every 850 ms. These are whole-match averages, not a cap on the initial reliable download burst. SCTP/IP/TLS headers and ICE negotiation are excluded. Initial static dictionary/baseline transfers are not subject to the ongoing 3 KB snapshot limit.

## Reconciliation and recovery

`tests/compact-wire.test.ts`: roundtrip all public fields; remove state; literal strings that resemble markers; dropped/reordered updates; old stream rejection; missing dictionary and cold HTTP worker recovery; real prediction with the compact wire.

Compact prediction results: 200 ms RTT: 1.706 px release overshoot, pending maximum 2; 400 ms RTT: 3.020 px, pending maximum 4. All 50 actions acknowledged and pending returns to zero. Existing noncompact tests are retained.

`transport-integration.ts` drives three authenticated guests through actual PeerRoom send/receive handlers with in-memory channels. All reconstruct current host revisions and acknowledge correctly. It is not an ICE or NAT traversal test.

## Deployment/network limitation

Production environment inspection returned zero runtime variables: TURN is not configured. The user confirmed they do not yet have TURN credentials. Smaller packets help host upload pressure but do not establish a peer connection through restrictive NAT/firewalls. Configure VELMONT_TURN_KEY_ID and VELMONT_TURN_API_TOKEN as server-side secrets, deploy, then verify relay candidates and Direct (TURN) from a restrictive real network. Existing broker supports the provider's TLS/TCP 443 URL.

The cloud browser produced no ICE candidates. Four browser clients joined and reached playing over HTTP fallback; this cannot certify cross-device Direct/TURN performance. Real friends' network retesting remains required.

Four browser clients completed a full match via fallback with zero HTTP conflicts. A 20-second sample reported: guest with +200ms delay: 2.886 snapshots/s, median request RTT 296.6ms; +400ms: 1.746/s, median 496.8ms; no artificial delay: 5.424/s, median 83.8ms. Peaks 1.4–1.6 seconds occurred while local simulation suites were also running. This confirms synchronization and fallback operation, not smooth low-latency remote gameplay. Screens show the completed four-player room.

## Regression provenance

309 tests and typecheck pass on the final source. A full replay suite attempt was interrupted by the execution environment (the preview also logged a runner-worker connection loss); it is not counted as completed. `certify.mjs` retains the passing f03eb6e gameplay certificate only after checking every pre-existing lib/noise file except peer-client.ts is byte-identical, restricting all non-doc changes to the reviewed transport/UI/test files, and checking the new test/packet/integration evidence. The certificate explicitly preserves baseline timing and simulation provenance. The new renderer has no gameplay simulation changes. Browser preview logged one HTTP error after the measured match; the zero-conflict result applies to the measured sample, not an assertion of no environment errors for the whole session.
