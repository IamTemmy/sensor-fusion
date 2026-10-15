# Last Lift

A fictional multiplayer museum heist built with OpenAI in ChatGPT Work. This repository retains the Sensor Fusion name until the owner renames it; that earlier game remains in Git history.

## Play

2–4 thieves, or one human with Echo. Four-minute runs on a shared museum map. Move with arrows/WASD or the pad. E / Grab interacts with an adjacent exhibit. Two players carry each exhibit to the southwest lift; either carrier moves the pair. Avoid red guard sight tiles and use your two decoys for seven seconds of distraction.

At the lift each carrier secretly chooses Split or Steal. Both Split: half each. One Steal: thief gets all as hot loot, which can only be banked at the distant northeast rooftop. Both Steal: that exhibit is lost, both are stunned five seconds, alarm rises 25. Inaction defaults to Split after 15 seconds. Departures and resolved deals are public. Escape banks the bag and ends that player's participation. Deadline catches everyone still inside. Highest escaped bankroll wins; ties share victory. No real money.

Echo walks to a waiting human carrier and helps. Echo initially splits; its retaliatory personality may steal after an earlier betrayal. If all other thieves have left, a remaining thief can call Porter once; Porter always splits. Roles are temporary partnerships, not fixed teams.

## Development

Node >=22.13. `npm run install:ci`, `npm run dev`; apply the retained D1 migrations for local use. `npm test`, `npm run typecheck`, `npm run build`.

The server validates cardinal movement, collisions, two-carrier ownership, private choices, payouts, timers and escape. D1 optimistic concurrency serializes room mutations. Clients poll; this is a deliberate grid-step prototype, not a twitch shooter. Production uses the existing Sites project and URL. Old Sensor Fusion rooms cannot be resumed.

## Review / limitations

See docs/STATUS.md and issue #1. Use exact SHAs in [CODEX]/[CLAUDE] reviews. No concurrent edits. This is a first playable heist, not a submission-approved game. Real-phone controls, network latency and human betrayal incentives need playtesting.
