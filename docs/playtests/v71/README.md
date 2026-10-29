# Guest reconciliation repair

The guest no longer advances its own thief by RTT/2 on each snapshot. It records sent sequence numbers and local direction-change times, maps the acknowledged lastSeq/inputAt to that timeline, restores authoritative position and replays local movement in <=40ms substeps using the engine's move/thiefWalls/carrySpeed functions. Small corrections blend over 80ms within 20px; larger corrections snap. Rendering responds to current keyboard/touch direction every frame. Outstanding input history is bounded, and stops predicting through extended outages.

Remote humans, bots and guards now render from buffered snapshots 100ms behind receipt time, interpolating a bracketing pair and holding at the end rather than extrapolating. The host engine, AI, scoring and game balance are unchanged.

Movement remains on the unordered zero-retransmit state channel and includes the previous two movement inputs. The host validates that history and uses monotonically increasing sequences, with no historical action re-execution. Action acknowledgements already existed in the checked-out v70 host/packet path: the reported always-zero ack could not be reproduced. Added a 50-action test through authenticated PeerRoom state messages, per-seat packet acknowledgements and actual predictor pruning. Guest acknowledgements are now monotonic within a match.

Local development only: ?lag=200 or ?lag=400 adds MS/2 to both outgoing and incoming guest DataChannel messages. Timers are canceled on disconnect. A Run latency acceptance panel drives the actual page's keyboard handlers, samples rendered positions and performs 50 action taps. It is absent in production. Phone initial view is Closer; tied-up help now asks the player to remain still while a teammate unties them.

## Validation

- All 215 tests pass; TypeScript and git diff --check pass.
- Deterministic host/guest delay simulation, 50 actions at 100ms intervals:
  - 200ms round trip: release overshoot 1.6174px; pending maximum 2; final pending 0; ack 50.
  - 400ms round trip: release overshoot 2.7756px; pending maximum 4; final pending 0; ack 50.
- Added interpolation/hold, authenticated channel ack, redundant-sequence tests. Updated two old tests that explicitly required the removed remote extrapolation.
- Browser attempt: two local game pages created/joined and started a real match with guest ?lag=200. Offer and answer exchanged, but neither side gathered ICE candidates (ICE 0/0, local answer/remote offer, new/new connection). Both remained on HTTP fallback. Therefore the requested 200/400ms Direct Playwright acceptance is NOT verified. The local probe remains available for Claude or a browser that permits WebRTC networking. No claim that deterministic tests substitute for that acceptance or the physical Mac/PC retest.
- TURN activation remains separate: no provider credentials have been supplied or configured. These fixes address presentation even on a Direct connection; TURN alone would not repair this predictor.

GitHub main was an older v47 snapshot (b480791) in a separate source history. Its commit history is preserved when syncing the current deployed source and this fix; no force push is used.
