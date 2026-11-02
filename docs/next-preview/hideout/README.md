# Mint crew hideout implementation

Presentation-only change on `next`. The submitted site, main, secrets, engine,
networking, maps, and balance are not edited.

- Replaced the exterior menu background with the approved three-person mint/teal
  planning scene. The leader explains a blueprint while teammates listen.
- Real HTML title, mode selections, codename, host/join and footer controls sit over
  the background. No interface text is baked into the artwork.
- Moved Back to the panel's top-right corner and removed the bot portrait badge.
- Added compact desktop and portrait phone styles.
- Background: 1672 × 941 WebP, 239,674 bytes. Existing art budget remains 3 MB;
  the additional hideout asset has a separate 250 KB ceiling.

Validation this pass:
- Unit tests: 352 passed, 0 failed.
- TypeScript: passed.
- Preview isolation: passed (approved engine and protected maps/network unchanged).
- Cloud browser: desktop entrance, friends setup, bots setup inspected. Portrait
  setup inspected in 390 × 844 and 360 × 740 iframe viewports. Final phone friends and bots setup fit without scrolling: scrollHeight equals
  clientHeight (794 px and 690 px respectively). 
- Full production gate: all non-CPU checks passed; failed flagship-velmont/cpu, night-archive/cpu.
  - flagship-velmont: p95 6.861 ms, max 44.289 ms (limits <8 / <40 ms).
  - night-archive: p95 7.064 ms, max 54.907 ms (limits <8 / <40 ms).
- Not deployed: CPU gate failure retained. Standalone framework build passed.

Story slide artwork has not been changed in this hideout pass.
