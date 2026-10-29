# Follow-up fixes — review only

The redesign is on `museums-v2`, not `main`, and is not deployed. README.md and summary.json contain the completed follow-up gate run for the current engine.

Implemented:
- Preserve the original silence deadline when passed art is caught, intercepted, or lands after a miss. Expired silence and already noisy art retain normal alarm behavior.
- Bind the player's throw command to the held item ID. Replaying a delayed art pass cannot throw a newly acquired alarm jar.
- Label the action as “Pass quiet art”, “Pass art + alarm”, or “Throw alarm”; phone controls reviewed at 390×844.
- Forecast posted guards scanning at their posts instead of inventing a patrol turn.
- Pair Archive sentry posts using the new mirror symmetry.
- Let autonomous Rookie crews assign the final jackpot instead of abandoning it at the dock.
- Do not enter guard-spacing mode around a teammate already inside a safe dock.
- Optimize weighted pathfinding with a stable indexed heap and cached body-clear edges. Use a wall broad phase while preserving the original collision samples. Avoid copying whole guard objects for sight-range queries.

Verification added: pass silence/expiry/miss cases, hot-art behavior, stale pass with substituted jar, guest reconciliation/ack, posted forecast, Rookie jackpot assignment, safe-dock spacing, stable route priority, and 30,000 wall/sight equivalence checks. A separate comparison found 96 route outputs identical to the pre-optimization engine with non-posted guards. Existing pass tests also exercise interception, walls, receiver movement and Auto Echo banking a catch.

Full 90-match idle, 240-match difficulty, 120-match escape, geometry and isolated CPU gates have completed. All 232 tests pass; geometry and escape gates pass. Rival difficulty, Archive p95 CPU, and the literal stationary-bot gate remain outside release limits. The isolated safer-art-selection experiment did not improve Pro balance and was not adopted. A reading-desk geometry experiment was also not adopted; it has not met full validation. Do not interpret this follow-up as release approval. Values, timers, networking and numeric difficulty tuning are unchanged.
