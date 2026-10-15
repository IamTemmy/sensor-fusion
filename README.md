# Last Lift — extraction edition

A fictional four-minute multiplayer museum heist built with OpenAI in ChatGPT Work. The repository and public URL retain the old Sensor Fusion name. Prior prototypes remain in Git history; current rules are below.

1–4 humans, up to four total thieves with independent rival bots. Walk onto small loot to collect it; three items fit in a bag. Tap the isometric floor for an authoritative path, hold WASD/arrows or the phone pad, E to work a station, Q to smoke, Escape to stop. Shift-click a floor tile to throw a decoy; the ordinary Decoy button lures a nearby guard to your own location.

The vault needs different thieves working Security and Vault simultaneously for four seconds. The helper gets 40% automatically when that cold bag banks, including if the helper already escaped. The carrier gets 60%. Go Hot voids that contract and permits a 100% payout only at the roof hatch. A recovered cold vault bag retains its helper; a recovered hot bag stays hot. Recovering your own helper's share as carrier gives you the full bag. The roof accepts bags containing hot loot; ordinary loot uses the lift.

Lift doors open for eight seconds every thirty. In the final thirty seconds, the last window is the final ten seconds. Banking protects money while you keep playing; riding out ends your part. At closure, unbanked value is confiscated. Highest banked money wins, including ties. No real money.

Guards patrol, investigate decoys, chase for five seconds, and search. Capture requires adjacency on two consecutive guard steps. Smoke blocks sight. Capture drops the whole bag and holds a thief for eight seconds; banked value is safe. All rivals obey the same capture and pickup rules. Loyal honors deals, Opportunist may go hot, Magpie prioritizes loose bags. Bot goals are based on public state.

## Development

Node >=22.13. `npm run install:ci`, `npm test`, `npm run typecheck`, `npm run build`. Retained Sites/D1 room API uses revision compare-and-swap for serialized actions and token-based reconnect. Room version5 rejects older rooms. Source artwork is original SVG/CSS, not third-party game assets.

Read docs/STATUS.md for verification limits. Issue #1 coordinates exact-SHA Claude reviews; Codex owns implementation. Archived sensor scenarios/specs are not current game instructions.
