# Noise Thieves — first playable (2026-10-20 UTC)

Temmy explicitly approved this prototype in the sensor-fusion repo after the research review. This supersedes the Last Lift redesign proposals. Blackout is untouched. This is a fun-test slice, not a claim of competition readiness.

## Play

The landing page offers **Play with Echo** (immediate, device-local simulation) and **Create a crew / Join** (shared authoritative room). All humans confirm readiness before the 90-second clock starts. Up to four seats; helpers can be added/removed in the lobby.

Move with WASD/arrows or the touch pad. E grabs nearby art, captures a nearby alarm when the hand is empty, drops what is held, or frees a captured teammate. Mouse or floor tap aims; F throws. Deliver treasure to the mint van zone to bank it; R gets in the van. Q toggles helpers between following and fetching nearby loot. One escape and $500 banked qualifies as success; four treasures total $3,500.

Picking up treasure emits an alarm. An empty-handed player can bottle it within 115 world units, with line of sight. Capturing silences it; throwing makes a new guard distraction. A capsule bursts after ten seconds. Guards investigate audible noise, chase visible thieves, and hold captured thieves for 4.5 seconds. Captures drop loot but do not destroy banked value. Helpers use the same collision and capture rules.

## Scope and implementation

- New shared engine: `lib/noise/engine.ts`; old `lib/game/` retained as historical implementation.
- New authoritative API: `/api/noise`, reusing the existing D1 rooms schema with an explicit game-version guard. Old room codes cannot be mistaken for Noise Thieves.
- Optimistic revision updates protect shared state; seat tokens never enter public projection. Input sequences prevent a retried input/throw from repeating.
- Fixed 40 ms simulation. Solo runs locally and renders with requestAnimationFrame. Online sends intents at most every 140 ms (one outstanding request), predicts own movement, interpolates actors, and reconciles large corrections. This is HTTP/D1, not WebSockets, and **online responsiveness remains a material prototype limitation**. Do not describe local control feel as measured online latency.
- Fixed original canvas scene, visible sound, line-of-sight cones clipped by walls, minimap, synthesized audio, reduced-motion CSS, phone controls in the same viewport. No third-party image or sound assets and no runtime LLM calls.
- Echo follows/supports by default, does not loot while reading readiness, and can fetch when asked. It is simple rule-based assistance, not a learned agent.
- One map; replay uses a new sequence of periodic alarms, not procedural architecture.

## Verification

13 new engine checks plus 11 retained Last Lift checks: capture/drop/throw, wall occlusion, expiry, banking exactly once, rescue and protection, collision/input clamping, stale inputs, token projection, replay reset, all four loot paths in both directions, onboarding bot behavior, authority/capacity. TypeScript and production build are separate checks.

No compatible control-browser skill is available in this managed environment, so interactive browser/phone QA is not claimed. Canvas visual feel, mobile usability, and real network latency still need human testing. Simulation passing does not establish fun.

## First review questions

1. Is capturing then redirecting an alarm enjoyable within the first minute?
2. Can a fresh player recover treasure and escape without narration?
3. Does Echo help without taking away the player's job?
4. Are touch movement, aim and action targets clear on a phone?
5. Does online prediction feel acceptable on two real devices? If not, freeze expansion until transport is replaced through supported hosting.
6. Does the player want another attempt? If not, change or reject the central interaction before adding systems.

## Known limits

No host migration, public matchmaking, persistent progression, chat or voice. All joined humans must press ready; a missing player can require a new room. Online rooms expire after two hours. Background/offline gaps have bounded catch-up rather than a continuously running server. Bots may still need navigation tuning near corners and complicated rescues. Solo uses the same game rules but is not multiplayer evidence.
