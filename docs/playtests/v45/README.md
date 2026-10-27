# v45 — setup responsiveness and connection recovery

User reported slow typing/buttons, signal timeout, repeated relay retry messages, and generic unavailable actions. Screenshots show the v44 lobby and Relay interrupted toast; they do not establish the historical HTTP status.

## Changes
- Removed invisible full bot simulation behind the painted home screen; skip canvas/render work entirely in the lobby. Gameplay simulation unchanged.
- Idle lobby no longer generates 20 movement messages/s, advances an authority clock or repeatedly clones the game into a second predicted world. Host uses its own authoritative world directly; local actions still execute immediately. Guest prediction remains.
- Stable connection statuses are deduplicated. Host lobby changes publish immediately. Lobby polling reduced to roughly 600ms including request duration, with at least 200ms between requests.
- Failed bootstrap retries bootstrap until the host authority exists. Buttons explain that connection is still in progress rather than reporting a false invalid action. Leaving/replacing a room cancels old requests and stops the old transport; closed transports cannot post late retry errors onto the home screen.
- Browser timeout wording replaced with clear reconnection text; non-JSON service responses include HTTP status. Diagnostics display requests, HTTP status and error counts. Exponential retry backoff caps at 5s. Active-host lease is 30s so one slow request does not immediately terminate the job; announced mobile pause remains 120s.
- Negotiation retains immediate SDP/trickle ICE but gives incomplete negotiation at least 12s before replacement. The old 2s restart could discard an offer before a slow network answered it.
- Host command errors preserve the engine's actual reason (e.g. balance crews/fill slots). No rules or balance changed.
- D1 CAS revision and game revision are separate on admission; host merges admission revisions before publishing, so an idle host does not erase a guest or leave its lobby stuck.
- Exposed blueprint inset, lighter panel; existing illustrations retained.

## Validation
176 tests passed. Five regressions cover idle-lobby work, immediate controls and rejection reason, failed-bootstrap recovery, host action execution without duplicate simulation, and no idle movement mailbox entries. Typecheck and final network suite rerun after diagnostic changes. Difficulty gate retained (unchanged engine/arena inputs).
Browser preview: create, guest join, rival selection, and detailed unbalanced-crew rejection observed. Current production v44 connection was available during investigation; the user's historical HTTP failure was not reproduced. Physical two-device Direct, TURN/restrictive NAT and real-phone responsiveness are still unverified in this cloud browser, which has previously produced zero ICE candidates. Do not claim all network failure causes are eliminated.

Public v45 browser follow-up: host and guest joined Y3HTMJ, both remained present; rival selection and Fill empty slots updated; host reached briefing. Guest readout was Relay 128–160ms during setup, with no relay retry toast in this check. This is not a Direct/network-throughput benchmark.

### Live failure found during final verification
Public host/guest start reproduced HTTP 500 on both clients. Worker logs reported requests hung with no possible response, including immediate failures on subsequent requests. Removed the isolate-global promise queue from both API routes: a request must not await a promise owned by a different Workers request. Database revision compare-and-swap and bounded retries remain the authority. Added a regression guard against reintroducing the cross-request queue.
