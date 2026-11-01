# Isolated next preview

Submitted v94, its main branch and secrets remain untouched. The hosting manifest here belongs ONLY to the new preview project. Do not merge this manifest into main.

Implemented: first-device guided heist (skippable, one hint, progresses from observed play); pass receiver ring and current F action label; short, confirmed bot decision bubbles; final-state per-piece results audit. No simulation, map, scoring, protocol or TURN configuration changes.

The guided path replaces ContextTip, suppresses competing placard/event hints, and yields to action error messages. Later matches use normal contextual tips. Bot bubbles require task == announcedTask, expire at 2.3 seconds, and inherit botCall's existing 2.5-second announcement limit. Heading to the plate is distinguished from actually standing on it.

Results report final state, not a fabricated event history: a piece with a guard is 'With security'; a claimed piece back on display is 'Returned to display'; an untouched piece is 'Not collected'. Crown amount is gross and already included in the haul before penalties.

## Validation

330 unit tests passed; TypeScript passed. Idle, Echo-alone, van and rescue results match the accepted submitted release. Velmont 17/30 banking within 15s remains the previously accepted limitation; its independent 85% test still fails and is not relabeled green.

CPU sampling identified botDanger and botRoute/risk scoring, collision sampling and distance checks as dominant simulation work; GC was also visible. This identifies cumulative CPU consumers, not proof of a specific browser frame spike. Both museums passed the isolated Node tick threshold in this run (see status.json). Rendering and network costs are excluded. The engine was not changed to improve these numbers.

Manual cloud-browser checks reached the guided desktop match and the live 390×844 phone frame. These are UI checks, not a physical-device FPS certification.

Automated regression is blocked before launch: Playwright's Chromium archive was empty/truncated, leaving no executable. The suite is authored and discovered but NOT passed. Headless tab backgrounding must independently verify visibilityState === hidden. Do not publish until the suite passes and the same-device phone comparison is complete.

The preview Site was registered but has no saved/deployed version. Its TURN secrets remain unset for the owner to enter. No submitted-site secrets were read or altered.
