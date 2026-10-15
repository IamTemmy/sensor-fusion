# Night Shift — playtest update, October 15, 2026

Entertainment-first redesign authorized by Temmy after the first playtest. The live URL remains https://sensor-fusion-temmy.iamtemmy.chatgpt.site.

## Implemented
- Original illustrated night city with animated atmosphere, shuttle and route progress. UI controls and sensor geometry are real components, not baked into an image.
- Twelve authored scenes in six paired families. Each route samples one variant per family and shuffles the order; rematches rotate sensor ownership.
- Private camera / lidar / radar / map drawings from server-projected observations. Public tag sharing and two structured questions per player per stop. Answers use only that sensor's facts; bots answer after one second and absent humans after ten.
- Six-stop shared mission: integrity, connection buffer, explicit success/failure. Correct required stopping is not penalized; unsupported actions and unnecessary delays have different consequences. All nine decision scores tested.
- Solo fill-crew button, staggered bot signals, two team observation extensions, immediate rematch.
- Independent heartbeat, stable host identity, host failover, any-human guarded Continue, automatic debrief departure, saved seat recovery, guarded storage access, bounded room-code collisions, schema validation, committed-state CAS retry on GET.

## Verification
9 engine tests, TypeScript and production build passed before publication. Test cases include hidden projections, all nine outcomes, mission win/loss, host loss, stale Continue, asks and authority, bot pacing, extension exhaustion, route diversity and role rotation.

Browser preview QA is unavailable in this managed environment because the required control-browser capability is absent. Do not claim phone/browser usability or human fun has been verified. Production HTTP checks are recorded in the handoff comment. Claude's prior approval does not cover this redesign; request an exact-SHA review.

## Remaining playtest questions
- Does sharing a visual observation feel useful with 2, 3 and 4 humans?
- Is the 60-second window too generous? Keep accessibility in mind before shortening it.
- Are integrity and connection-buffer consequences clear without the guide?
- Is a replay compelling after learning the six situation families?

This is a fictional cooperative game, not driver training or AV validation. No live AI calls, accounts, payments, leaderboard service, or third-party game code/assets.
