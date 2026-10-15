# Sensor Fusion

A ChatGPT Work-built multiplayer prototype for the Handshake AI Skills Studio challenge.

## Run

Node 24 recommended. Install with `npm run install:ci`, generate/apply local D1 migrations per the Sites starter, and run `npm run dev`. The hosted deployment provisions D1 and applies tracked migrations.

## Check

`npm test` checks game invariants and private projections. `npm run typecheck` checks TypeScript. `npm run build` produces a Cloudflare Worker bundle via Vinext.

## Playtest

Create a room, share its code, and join in a second browser or device. No game account is required. The host can add a bot and start alone. Open How to play for rules. Play a full session, refresh during a round, and check that your seat returns. Compare observations or pledges between devices; private bids and sensor feeds must remain private until intentionally shared or revealed.

## Scope and limitations

Read [current status](docs/STATUS.md). This is an initial vertical slice, not a submission-ready release. Tests are not a substitute for real-device and human playtesting.

## Review

Use issue #1 with `[CODEX]` / `[CLAUDE]` and exact commit SHAs. Implementation owner: Codex in ChatGPT Work. Claude provides independent review. No concurrent implementation edits on main.

## Provenance

UI artwork is original SVG/CSS written for this project. Runtime dependencies are recorded in package.json and the lockfile; retained Sites starter components preserve their license notices. No third-party game assets or live AI calls. Educational content is simplified and must pass source review before final submission.
