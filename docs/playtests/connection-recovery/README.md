# Direct connection recovery

- Google STUN plus Cloudflare's public `stun:stun.cloudflare.com:3478` endpoint; no account or new secret.
- Initial Direct window is 12 seconds. Host performs one actual ICE restart at 6 seconds (or an earlier failed ICE state), retaining the same PeerConnection and command queue. HTTP remains available while negotiating so play is not blocked. A late authenticated DataChannel automatically resumes Direct through the existing revision/action-ack reconciliation path.
- One console failure reason per peer connection session: no srflx candidates, ICE failed, or timeout. Hidden lobby diagnostic text repeats only these labels, not credentials or IP addresses.
- `/network-check` runs a public-candidate probe and a real local DataChannel round trip. It compares STUN mapping replies only when they describe the same local transport. Browsers can deduplicate identical candidates; missing comparable replies yield unknown, never a guessed NAT classification. Matching ports are a clue, not proof of reachability through a friend's firewall.

Validation: 236/236 tests passed; typecheck passed. Regression tests cover the twelve-second label boundary, exactly one restart preserving pending commands, late Direct upgrade retaining world state, comparable vs incomparable STUN observations, and existing unreliable-input/relay behavior. Browser UI check completed: this cloud browser observed no srflx candidate and its local loopback timed out. That is a reported diagnostic result, not a successful restrictive-network test. No claim that this adds TURN or guarantees Direct on the user's friend's network.

Primary references: https://developers.cloudflare.com/realtime/turn/ and https://www.w3.org/TR/webrtc/ . Gameplay source and the release-baseline gameplay results are unchanged.
