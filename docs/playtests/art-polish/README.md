# Recap and briefing art polish

- Recap art retains its natural aspect ratio and full top edge, offset 12px below the panel; a dark gradient fades it behind awards. Mobile uses a top-aligned 260px image and a stronger text-area fade.
- Back to hideout has a back arrow, outlined blue treatment, and the same desktop height as replay.
- New transparent WebP illustrations show the alarm actually held in both hands and the van from a front three-quarter view. Step 01 remains unchanged.
- Movement hints use separate W/A/S/D keycaps.

Validation: TypeScript, four presentation/touch-copy tests, build and existing difficulty gate passed. Browser checked the actual desktop briefing, replay from a completed local round, and the loss recap's image placement/buttons. Winning recap and physical phone were not visually exercised in this pass. No engine or networking edits.

The two illustrations were generated with the built-in image tool, then resized/encoded to WebP. Prompts: (1) isolated transparent chibi mint-beanie/mask character visibly lifting a brass-capped red glass waveform canister with both hands, full body, polished cartoon arcade style; (2) isolated transparent mint compact van, front three-quarter view with front and side visible, warm headlights, golden reward sparkles, polished cartoon style. Assets: public/art/briefing/take-alarm.webp and public/art/briefing/getaway-van.webp.
