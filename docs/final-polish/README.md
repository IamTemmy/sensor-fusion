# Final submission UI polish

Based on main 49f55789b6297fe08736808e9e72711483b092b5. Presentation only. Engine, geometry, balance, timers, networking, API routes and test fixtures are unchanged.

- Full lighting only: removed the setting, saved preference and active Shadows rendering path. Existing blackout event retained.
- Phone header keeps SFX, music, help and Leave on one row at 360×740 and 390×844. Hosting notice is a separate slim line.
- Jackpot guide describes the 1:00 opening, normal art carry speed, transferable alarm, staff exit, Security plate and Map Room plate.
- Match-start dock labels limited to YOU and ECHO, offset separately. Obscured room/dock labels suppressed; exhibit name appears for the current grab target.
- Guide content scrolls internally on a 720px-tall viewport, with tabs and a scroll hint visible.
- Bot order title stays on one line. Menu title baselines align within each card row. Existing hero art compressed to fit the existing asset budget.

## Validation

309 unit tests passed; TypeScript passed. Desktop 1280×720 and phone 390×844 / 360×740 reviewed in the actual development application. Screenshots use frozen presentation fixtures, not live match outcomes.

- phone-lobby-390.jpg
- phone-match-start.jpg
- desktop-match-start.jpg
- guide-jackpot.jpg

## Unresolved performance gate

Target: host simulation p95 <8ms, maximum <40ms. This is not network RTT.

The preceding readiness audit measured Velmont 10.00ms / 108.77ms and Archive 13.09ms / 517.31ms; isolated Velmont recheck 10.39ms / 398.36ms. A separate browser run of the same 12 CPU fixtures measured Velmont 11.5ms / 3611.1ms and Archive 8.2ms / 31.7ms. Both museum p95 values fail the strict gate. Large elapsed-time outliers require profiling; their cause has not been established. The browser harness and raw observations are included here.

No performance fix is claimed. The prior gameplay certificate is retained unchanged as historical evidence. The build accepts an explicitly scoped, exact-source UI-only certificate after checking protected source hashes; this does not turn the failed CPU measurements into a pass. Any source hash change invalidates that certificate and restores the full gate. This follows the final instruction to deploy UI polish without gameplay/network/balance changes, then freeze changes.
