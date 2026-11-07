# Velmont: After Hours

**Steal the art. Steal the alarm.** A 90-second cooperative museum heist: capture sound, throw it away from your crew, bank the loot, and escape. Built with OpenAI for Temmy's multiplayer challenge.

This repository keeps its original `sensor-fusion` name at the user's request. The active game is Velmont: After Hours. Obsolete Sensor Fusion and Last Lift source has been removed. Git history retains earlier prototypes. Blackout is a separate repository.

- Play: https://sensor-fusion-temmy.iamtemmy.chatgpt.site
- Design, controls, limitations: [docs/NOISE-THIEVES.md](docs/NOISE-THIEVES.md)
- Coordination / reviews: issue #1

## Development

Node 22.13+, pnpm. Use the existing Sites build setup.

```sh
npm test
npm run typecheck
npm run build
```

The current page is `app/page.tsx`. Simulation and canvas drawing are `lib/noise/engine.ts` and `lib/noise/draw.ts`. Online rooms use `/api/noise` with the existing D1 schema. Local solo mode runs the same engine without network delay. Online movement is predicted locally and reconciled with authoritative state; HTTP polling responsiveness requires two-device verification before expanding the prototype.

Original procedural canvas artwork and synthesized sounds; no external assets or runtime LLM dependency.

## Repository housekeeping

Active game code lives in `app/page.tsx`, `components/noise`, and `lib/noise`. The `noise` directory names belong to Velmont and remain in use. `tests/helpers/legacy-engine.ts` supplies Velmont map regression fixtures and is also still used.

Keep build output, local databases, dependency caches, logs, and temporary QA output out of Git. Existing design references, regression tests, asset credits, and JSON release evidence are retained; gameplay build gates read some of those JSON files. Earlier screenshots remain as design and review references.
