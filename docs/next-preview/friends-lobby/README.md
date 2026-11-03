# Friends lobby and type review

Implemented on `next` for the isolated Next Preview site only. Main and production are unchanged.

- Waiting for one human: room code, one invitation-link action, waiting message; no setup, helpers or start control.
- Host and guest codename field uses the same 18-character limit; blank names fall back to Ghost.
- Visible host-only Co-op/Rivals switch and guest setup text. Guests retain invitation copying and navigation, with no disabled host controls.
- Co-op supports 2–4 humans and removable optional Echo helpers, capped at four seats.
- Rivals uses Normal. Two humans default to 1v1, optionally one helper per crew; three humans automatically get one helper on the short crew; four humans get none. Host moves swap players when necessary to retain human rivals and balanced crews.
- Command validation enforces invitation, host permissions, helper policy and the seat cap. New server rooms carry the friends-lobby flag; direct local solo setup remains supported.
- Removed preset/fill UI; legacy preset/fill commands reject. Human joins displace helpers and rebalance.

`/type-review` shows three pairings across actual hideout, lobby, briefing, gameplay and intro scenes. Its scoped stylesheet is loaded only by explicit typePair review URLs in development or the exact Next Preview hostname. No fonts change on ordinary game routes. Seven self-hosted subset WOFF2 files total 102,480 bytes; all seven OFL licences are included. All faces use font-display: swap.

## Validation

- `pnpm test`: 417 passed, 0 failed (387 previous; 30 added engine/rendered UI/font checks).
- `pnpm typecheck`: passed.
- `node scripts/check-preview-isolation.mjs`: passed; only the approved lobby/crew engine revision pin changed. Protected maps/network files are unchanged.
- `node scripts/run-framework.mjs build`: passed, including all routes.
- Browser visual review: seven lobby states at 1280×800 and 390×844. Screenshots are frozen fixtures of the actual application, not multiplayer transport certification.
- Real two-tab local room: host codename and two-human co-op/Rivals state converged on host and guest; Relay transport. The helper toggle is covered by an authenticated HostAuthority envelope regression test.
- Browser font inspection confirmed the review title faces are loaded from the self-hosted files.

The general `pnpm build` gameplay gate was started, then stopped: it reruns unrelated museum playability simulations because the engine hash changed. No gameplay acceptance certificate or new performance result is claimed. The production compiler is run separately after the scoped checks; no gates were edited or bypassed in source.

## Evidence

Screenshots in `screenshots/`: host alone; two-human co-op; rivals 1v1 and 2v2 with helpers; three-human rivals; four-human rivals; guest view. Both target sizes are included, plus the type review.
