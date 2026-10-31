# Plate clarity

Text/labels only. Both museum briefings explain the pressure plate, Crown value, time lock, room name and Echo order. Noise instruction is a separate line. Guide describes the temporary opening and the permanent 1v1 exception. Map labels use the existing label layer to avoid wall occlusion.

Engine reviewed: plateOpen requires the time lock to be over and a non-escaped, unstunned thief within 30 units. In co-op and team rivals, step-off closes the locked Crown until grabbed; in 1v1 activation permanently clears locked. Pickup clears locked. Only two engine message strings changed, verified against the previous source. No mechanics or protocol changes.

314 tests passed; TypeScript passed. Screenshots use frozen development fixtures to show exact timer and held states, not live match outcomes. Existing CPU gate remains unresolved.
