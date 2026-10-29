# Approved concept artwork — Velmont: After Hours

Implemented on the review branch; not a production deployment. These are UI-only changes. Museum release gates remain separate.

- `public/art/concept/museum-getaway.webp`: edited from the user's first attached concept, preserving the mint-beanie alarm carrier, purple-hooded art carrier, museum exterior and van. Removed the baked-in old title, menu controls and wanted stamp so live controls can be rendered accessibly.
- `public/art/concept/planning-desk.webp`: edited from the user's second concept, retaining the painted wooden desk, decorative museum blueprint, photographs and pen. This is atmosphere, not a claim about the current arena geometry.
- `components/noise/velmont-wordmark.tsx`: scalable live wordmark spelling VELMONT with a robber mask inside its O and AFTER HOURS beneath it; used in the header and front-page title.

Both raster edits used the built-in ImageGen tool; WebP compression used ImageMagick. No model CLI/API fallback was used. Generative cleanup reconstructs hidden areas; it is not a pixel-identical extraction of covered artwork.

## Prompts

Hero: “Edit target: the attached approved game menu concept. Produce a clean background plate for the actual website, landscape same composition. REMOVE ONLY the NOISE THIEVES title, tagline, three menu buttons on the left and red WANTED stamp lower right, seamlessly filling those regions with the existing dark moonlit museum exterior. Preserve the exact mint-beanie masked cartoon thief holding the glowing red alarm jar and purple-hooded masked thief holding the gold-framed painting: same faces, proportions, poses, costumes, rendering style, placement and scale. Preserve museum, moon, van and blue/gold lighting. Do not redesign or replace characters. No added text or UI. The left side should remain dark and usable for live website title and controls. Existing museum banners may remain but remove any old V monogram. This is extraction/cleanup of this exact art, not a new scene.”

Planning desk: “Use case: precise-object-edit. Edit the attached approved museum crew screen concept into a clean website background plate. Remove all foreground UI: ASSEMBLE THE CREW title, crew-code box, both character cards, all three museum cards, difficulty labels and buttons, START THE JOB button. Reveal and preserve the SAME underlying warm dark wooden heist-planning desk, large cream paper blueprint with blue drafting lines and VELMONT MUSEUM title near upper center, scattered old museum photos, black-and-gold fountain pen along bottom left, brass objects and notes at edges. Reconstruct only areas hidden by UI. Keep the same composition, richly painted materials, warm lighting and game-art style. Blueprint is decorative concept art, NOT an actual playable map. No UI, character cards, foreground buttons or large title. Retain edge props and mostly clear usable central desk/blueprint space for live controls. Wide landscape.”

Validation: TypeScript check; desktop 1280×720 and phone 390×844 front-page review, bots/friends control switching, and planning-room review. Screenshots are local development fixtures, not live deployment evidence.

### Briefing artwork loading

Quick Start now preloads its five image dependencies at low priority from the initial document, before the briefing is opened. A shared URL manifest keeps preload and rendering URLs identical. The step 03 guard uses an exact lossless crop of the existing atlas (161×240, 42,530 bytes), removing the 571,136-byte atlas dependency from that illustration (92.6% smaller). Gameplay and advanced-guide atlas usage is unchanged.

Validation: `pnpm typecheck` and `git diff --check` passed. Browser inspection confirmed low-priority image preload hints before opening the briefing; the local briefing preview renders all four cards, including the guard and jar. See `briefing-preloaded.jpg`. No throttled-network timing claim is made. Branch-only change, not deployed to main.
