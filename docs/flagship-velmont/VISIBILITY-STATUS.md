# Visibility, sound and dock candidate — not yet merged

Implemented readable Shadows/Full lighting, three-second guard silhouettes, nearby unseen footsteps, faint flashlight cues, exhibit values, an accessible title, and a boarding notice below the timer. Restored solid dinosaur/statue/orrery exhibits. Rivals docks now leave a 34u walk-through gap (was 15u); a 13u-radius thief fits, with a continuous clear center line from the front approach to the rear. Co-op keeps its original dock.

Sound fixtures cover a thrown jar luring a guard around the Clock doorway, a throw triggering a Hall emitter, and a throw stopping at a solid centerpiece. Existing art-pass tests ensure a queued pass cannot substitute a sound jar. Both loading-bay entrances reach either van after either rematch assignment.

The most recent completed candidate (iteration 4, 42u dock gap) passed 263 tests, typecheck, reachability, idle, patrol, Crown rush, Echo escape and CPU gates. Co-op rates were 100% / 45% / 32.5%. Rivals pooled Normal was 43.75% and Pro 45%, outside the requested ranges. Its report is retained under visibility-iteration-4. The 34u-gap candidate is still being validated; no main merge or deployment is authorized by those earlier numbers.

No scoring, timers, guard speed, rival skill or network transport changes. Current candidate reports are source-hashed. Screenshots are frozen development fixtures, not physical-device or multiplayer human tests.
