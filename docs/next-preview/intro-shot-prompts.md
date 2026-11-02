# Velmont opening: real-video prompts and drop-in contract

Status: no video-generation or OpenAI TTS tool is available in this environment. These are prompts, NOT generated video. The implemented fallback is layered 2D animation. No API key is required by the player.

## Reference uploads

Upload these repository assets with every prompt (download them from GitHub first):
- `public/art/concept/hideout-planning-v1.webp`: crew faces, materials, hideout and final composition.
- `public/art/concept/museum-getaway.webp`: mint/violet character identity and museum palette.
- `public/cinematics/intro-v2/van.webp`: exact van identity, repeated in shots 1 and 4.
- `public/cinematics/intro-v2/museum.webp`: facade for shots 1 and 4.
- `public/art/concept/planning-desk.webp`: blueprint reference for shots 2 and 5.

Prefer image-to-video with these references; independent text prompts alone cannot guarantee character consistency. Generate each landscape clip at 1280×720, 24fps. Generate a separate 720×1280 portrait composition with the same actions; keep hands, jar, van and faces inside the central safe region. Reserve top 12% for Skip and bottom 22% for code captions.

## Shot 1: Outside — 5 seconds

```text
Generate a 5-second continuous shot at 24fps, 16:9, 1280×720.
Match the uploaded Velmont reference artwork: playful high-quality stylized 3D illustration, soft rounded faces, black domino eye masks, visible expressive eyes, black gloves. The lead wears a mint knitted beanie and teal scarf over a charcoal jacket; Echo wears a teal hood, and the second heist thief wears a violet hood over a charcoal outfit. Same facial identity, proportions and clothing throughout all clips. The same compact vintage dark-teal delivery van has a cream roof, brass trim, round headlamps, black tyres and twin rear doors. Warm museum gold against deep midnight blues; cinematic but playful, no gore. No text, no logos, no subtitles, no watermarks.
Low three-quarter street-level establishing shot at night. Rain streaks and small splashes; wet cobblestones reflect amber street lamps. A narrow searchlight slowly sweeps the ornate museum facade. The dark-teal van enters from the LEFT, driving RIGHT; headlights illuminate rain. It eases to a stop by the museum steps with a gentle suspension bounce. Camera makes a very slow lateral dolly; keep the full van visible. No character dialogue or lip-sync.
Keep essential action clear of the top 12% and bottom 22% caption-safe zones.
For the portrait version, compose the same shot at 9:16, 720×1280; reframe deliberately rather than cropping out the action.
```

## Shot 2: The plan — 4 seconds

```text
Generate a 4-second continuous shot at 24fps, 16:9, 1280×720.
Match the uploaded Velmont reference artwork: playful high-quality stylized 3D illustration, soft rounded faces, black domino eye masks, visible expressive eyes, black gloves. The lead wears a mint knitted beanie and teal scarf over a charcoal jacket; Echo wears a teal hood, and the second heist thief wears a violet hood over a charcoal outfit. Same facial identity, proportions and clothing throughout all clips. The same compact vintage dark-teal delivery van has a cream roof, brass trim, round headlamps, black tyres and twin rear doors. Warm museum gold against deep midnight blues; cinematic but playful, no gore. No text, no logos, no subtitles, no watermarks.
Inside the warm brick hideout, overhead close-up of a blue museum blueprint under a brass lamp. The mint thief’s black-gloved index finger traces a red dashed route through corridors toward a crown-vault symbol. The route illuminates behind the finger. Teal-clad crew members listen at the table, watching the explaining thief and the route. Subtle lamp flicker; slow overhead push-in. Do not put the violet rival colour on the planning crew. No lettering on blueprint.
Keep essential action clear of the top 12% and bottom 22% caption-safe zones.
For the portrait version, compose the same shot at 9:16, 720×1280; reframe deliberately rather than cropping out the action.
```

## Shot 3: The heist — 5 seconds

```text
Generate a 5-second continuous shot at 24fps, 16:9, 1280×720.
Match the uploaded Velmont reference artwork: playful high-quality stylized 3D illustration, soft rounded faces, black domino eye masks, visible expressive eyes, black gloves. The lead wears a mint knitted beanie and teal scarf over a charcoal jacket; Echo wears a teal hood, and the second heist thief wears a violet hood over a charcoal outfit. Same facial identity, proportions and clothing throughout all clips. The same compact vintage dark-teal delivery van has a cream roof, brass trim, round headlamps, black tyres and twin rear doors. Warm museum gold against deep midnight blues; cinematic but playful, no gore. No text, no logos, no subtitles, no watermarks.
Inside a warm golden museum corridor, medium wide shot keeping the action clear. The mint-beanie masked thief lifts a framed painting from its pedestal. A small glass alarm jar glows and flashes red. The thief tosses the JAR, not the painting, in a readable arc to the violet-hooded masked teammate. The teammate catches and immediately hurls it down the open corridor. Two navy-uniformed guards turn toward the noise and run after the jar, away from the thieves. Track the jar gently; preserve spatial continuity and distinct catch then throw. The painting stays with the mint thief.
Keep essential action clear of the top 12% and bottom 22% caption-safe zones.
For the portrait version, compose the same shot at 9:16, 720×1280; reframe deliberately rather than cropping out the action.
```

## Shot 4: The getaway — 3 seconds

```text
Generate a 3-second continuous shot at 24fps, 16:9, 1280×720.
Match the uploaded Velmont reference artwork: playful high-quality stylized 3D illustration, soft rounded faces, black domino eye masks, visible expressive eyes, black gloves. The lead wears a mint knitted beanie and teal scarf over a charcoal jacket; Echo wears a teal hood, and the second heist thief wears a violet hood over a charcoal outfit. Same facial identity, proportions and clothing throughout all clips. The same compact vintage dark-teal delivery van has a cream roof, brass trim, round headlamps, black tyres and twin rear doors. Warm museum gold against deep midnight blues; cinematic but playful, no gore. No text, no logos, no subtitles, no watermarks.
Low rear three-quarter view of the SAME dark-teal cream-roof van beside the museum steps in night rain. Twin rear doors swing shut and meet firmly. Red tail-lights flare; tyres kick up a fan of rainwater as the van accelerates away to the RIGHT along the wet street. Brief restrained motion blur, camera remains steady. No collisions, no characters left in the road.
Keep essential action clear of the top 12% and bottom 22% caption-safe zones.
For the portrait version, compose the same shot at 9:16, 720×1280; reframe deliberately rather than cropping out the action.
```

## Shot 5: The title — 3 seconds

```text
Generate a 3-second continuous shot at 24fps, 16:9, 1280×720.
Match the uploaded Velmont reference artwork: playful high-quality stylized 3D illustration, soft rounded faces, black domino eye masks, visible expressive eyes, black gloves. The lead wears a mint knitted beanie and teal scarf over a charcoal jacket; Echo wears a teal hood, and the second heist thief wears a violet hood over a charcoal outfit. Same facial identity, proportions and clothing throughout all clips. The same compact vintage dark-teal delivery van has a cream roof, brass trim, round headlamps, black tyres and twin rear doors. Warm museum gold against deep midnight blues; cinematic but playful, no gore. No text, no logos, no subtitles, no watermarks.
Overhead blueprint in the SAME hideout, warm brass lamp, the same teal-clad crew listening to their mint-beanie teammate explaining the plan. A brief soft golden flash on an empty area of blueprint, reserved for a logo added later in code. Camera pulls back and settles into the reference hideout-menu composition: dark uncluttered left third for interface, crew and blueprint table on the right, van visible through an open garage doorway. End completely stable, no baked-in typography.
Keep essential action clear of the top 12% and bottom 22% caption-safe zones.
For the portrait version, compose the same shot at 9:16, 720×1280; reframe deliberately rather than cropping out the action.
```

## Drop-in files (no code changes)

Put clips in `public/cinematics/intro-v2/`, named `shot-01-landscape.mp4` / `.webm` through `shot-05-landscape.mp4` / `.webm`. Portrait: `shot-01-portrait.mp4` / `.webm`, etc. Use exactly 5, 4, 5, 3, 3 seconds; silent video, captions remain in code. WebM is tried first, H.264 MP4 second. Missing portrait clips fall back to landscape. A missing, stalled, rejected or ended clip reveals the code animation beneath. Slow/data-saving connections and reduced motion use the fallback.

Aim below 3 MB per clip and 12 MB per complete five-shot rendition. The browser loads one format and orientation, not every rendition. Encode H.264 with fast-start metadata, yuv420p, CRF 25–28; VP9 WebM CRF 32–36. Inspect quality before raising compression. No real clips are included yet, so video visual QA remains pending.

Optional voice: `voice-01.mp3` (“Velmont closes at nine.”), `voice-02.mp3` (“Ninety seconds. In and out.”), `voice-04.mp3` (“Don’t be the one left behind.”). Echo is calm and wry, natural rather than theatrical. Keep each line within its shot duration. Optional 03/05 files are also supported. Captions work without audio; SFX OFF mutes optional voice and synthesized cues. No external audio downloads or paid service calls are used.
