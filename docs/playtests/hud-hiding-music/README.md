# HUD and original music

Shipped:
- Crown unlock status is in the HUD, never over museum artwork. Desktop 1280×720 and phone 390×844 visual fixture screenshots are alongside this note.
- Original procedural Web Audio score, with no samples or licensed/downloaded tracks. Independent music mute. Scheduling stops while hidden, in Help, or outside playing matches; missed beats are skipped.
- Guard recovery label says RETURNING ART. Existing physical art return, five-second unattended delay, captor retreat and rescue protection remain unchanged.

Validation:
- Desktop/phone fixtures inspected. Music mute/unmute checked in browser; production home and normal match start checked. No application error during these actions; browser extension metadata errors were present.
- Music scheduler regression passes, including mute and background backlog. Guard physical-return regression passes.
- The initial expanded-hiding candidate passed 189 existing tests plus three added tests, and the 240-match difficulty gate. However, extended 30-match idle checks found a new 8.44-second wait (rivals seed 10); baseline seed 10 did not stall. Candidate hiding was therefore reverted completely. The published final engine is byte-for-byte the previous c24df14 engine. The extra hiding tests were removed with that unshipped behaviour; the music test remains.
- Reverted engine difficulty matrix: co-op 87.5/70/22.5%; rivals 90/50/35%, Rookie/Normal/Pro, 40 seeds per cell.

Not completed:
- Deliberate bot-hiding changes, niche relocation and asymmetric arena redesign are NOT shipped.
- No real-phone listening test or full two-device multiplayer test this turn. Network and guest prediction code unchanged.
- Performance runs varied heavily under host contention; strict frame-time budgets were NOT certified. The candidate profiling files have been removed to avoid presenting them as evidence for the reverted engine.

Next arena design should compare different approaches (short exposed gallery versus longer covered archive) by travel time, guarded value, escape alternatives and plate access, then side-swap crews in simulations. Existing symmetry gates remain until an asymmetric candidate has equivalent measured fairness gates.
