# v44 — connections and planning-room art direction

- Immediate SDP publication with trickled ICE; removed the 2.2s gathering wait. New seats negotiate on discovery, with 2/4/8s bounded retries. Lobby shows Connecting/Direct/Relay and a soft relay warning.
- STUN-first configurable TURN: VELMONT_TURN_URLS (comma-separated turn:/turns: URLs), VELMONT_TURN_USERNAME, VELMONT_TURN_CREDENTIAL. Authenticated bootstrap supplies configuration to both host and guest. Selected candidate-pair statistics distinguish Direct (TURN); unused relay candidates do not change the label. Credentials are not logged.
- No TURN service provisioned: Sites has no configured credentials, and Metered/Open Relay currently requires an account/API key. TURN remains optional and disabled; HTTP fallback remains available.
- Worker pulse drives the 40ms host authority loop and signaling independently of requestAnimationFrame. Desktop hidden tabs attempt to continue. A mobile hidden host explicitly pauses; clients freeze simulation/prediction and display Host is away. Resume resets elapsed timing. A bounded 120s away lease prevents indefinite orphan rooms. OS suspension cannot be prevented by a Worker.
- Blueprint desk lobby, crew cards and beveled gold/navy buttons. Existing home hero and recap illustrations retained. Blueprint uses authored map geometry decoratively, not new gameplay geometry.

## Verification
171 tests passed before final bootstrap adjustment; final build reruns the focused network tests and typecheck. Existing difficulty gate uses unchanged engine/arena/policy hashes: co-op 87.5/70/22.5%; rivals 87.5/47.5/35% (Rookie/Normal/Pro, 40 seeds/cell).
Two browser preview clients: Worker active, host-away propagated to guest with frozen revision 537. Cloud browser exposes zero ICE candidates, as in v43. It reports all tabs visible, so neither time-to-Direct nor hidden-host Direct rate can honestly be measured here. Real-phone background/foreground and restrictive NAT/TURN remain unverified.
Claude's separately supplied v43 real-machine result: 17.9 snapshots/s, ping median 1.7ms and max 6ms. Those are not v44 measurements.

Diagnostics at /network-check display Worker/window timer, visibility, first-Direct milliseconds and candidate counts, plus 20-second measurement and simulated mobile-away controls.
