# Lobby presence and recovery

- Lobby human seats expire after 60 seconds of silence. Engine tests retain a guest at 30 seconds and prune at 70.
- Authenticated direct hello, ping, state acknowledgment, arena acknowledgment, and input traffic refresh presence; HTTP transport presence is batched at five seconds.
- Missing seats detected by a snapshot or HTTP 401 stop the old transport and attempt fresh admission to the same room with the same codename. Failure shows You left the crew, Rejoin, and Back to hideout. A bfcache pagehide does not explicitly leave.
- Guest lobby text never uses the host invitation waiting line.
- MAP component removed from the HUD; camera control retained.
- /api/noise ordinary peer-backed lobby and finished polls are read-only again. Legacy lobby polls persist heartbeats at five-second intervals.
- Mocked D1 concurrency tests cover four clients, 320 peer requests with no Room busy responses, zero writes for ordinary peer-backed lobby/finished polls, and throttled legacy presence.
- Browser integration: remove Raven Return, observe automatic rejoin to the same room with the same codename; no missing-seat lobby or toast. HUD DOM has zero .hud-map and one .camera-toggle.

Validation: 447 tests, typecheck, preview isolation, and production compilation pass.
