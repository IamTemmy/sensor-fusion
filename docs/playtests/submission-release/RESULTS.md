# Release results

## Shipped

Museums-v2 merged to main; connection recovery and getaway deployed as v76. Echo defender subsequently passes the complete release suite.

| Gate | Final result |
|---|---|
| Integrated tests | 240/240; typecheck passes |
| Duos Rookie / Normal / Pro | 77.5% / 55% / 40% (40 seeds each) |
| Co-op Rookie / Normal / Pro | 87.5% / 67.5% / 22.5% (within ±10pp baseline) |
| Idle Echo / Archive / Crossroads | 0/30 / 0/30 / 0/30 |
| Echo left outside, untied R/N/P | 1/40 / 1/40 / 0/40 |
| Tied at finish, separately R/N/P | 0/40 / 2/40 / 1/40 |
| Mirrored opportunity / collection imbalance | 0%; geometry 54 setups passes |
| Tick p95 Echo / Archive / Crossroads | 1.471 / 2.163 / 2.656 ms |
| Tick max Echo / Archive / Crossroads | 13.116 / 9.194 / 10.853 ms |
| Two-second carrier-lead fixture | Cover 40/40 banks; without Cover 0/40 |

## Held, not deployed

Each candidate retains its exact code, engine hash, raw logs, and CPU report on a separate branch. These are experiments, not merge-ready updates.

| Candidate branch | Co-op R/N/P | Duos R/N/P | Idle E/A/C | Blocking result |
|---|---|---|---|---|
| candidate/crown-vault | 85/52.5/32.5% | 85/55/42.5% | 0/1/0 | Plate pickup 25/60, required45; Rookie outside3/40; Pro>40% |
| candidate/laser-emitter | 90/85/52.5% | 57.5/57.5/50% | 0/0/0 | Co-op drift and Rookie/Pro rivals outside bounds |
| candidate/exhibit-shuffle | 92.5/62.5/22.5% | 72.5/67.5/60% | 0/2/0 | Four tests fail: cheap high-value routes, niche usefulness, carrying rescue; rivals outside bounds |
| candidate/archive-darkness | 87.5/62.5/25% | 72.5/52.5/32.5% | 0/1/0 | Combined pre-balance defender candidate: Rookie below75%, six-player Archive return-to-van stall |

The vault's early-pickup check passes all40 seeds but does not override its other failures. All held candidates pass CPU limits. Their p95 E/A/C (ms): vault1.791/1.850/3.351; emitter1.375/2.193/1.516; shuffle2.689/1.727/4.084; darkness1.426/1.851/2.628. Max tick across maps respectively32.865,13.338,19.190,14.746ms. Crossroads rotating-beam/top-docks step was not attempted because its explicit1–6 prerequisite is unmet.

[Independent review](REVIEW.md). [Detailed released defender gates](../echo-defender-release/README.md).

## Screenshots

Frozen visual-review fixtures; not a live multiplayer playtest.

| Museum | Desktop | Phone closer view |
|---|---|---|
| Echo | [Desktop](../getaway/velmont-echo-desktop.jpg) | [Phone](../getaway/velmont-echo-phone.jpg) |
| Archive | [Desktop](../getaway/velmont-archive-desktop.jpg) | [Phone](../getaway/velmont-archive-mobile-review.jpg) |
| Crossroads | [Desktop](../getaway/velmont-crossroads-desktop.jpg) | [Phone](../getaway/velmont-crossroads-phone.jpg) |

Getaway frames: [Doors](../getaway/velmont-getaway-doors.jpg), [Winner leaves first](../getaway/velmont-getaway-mid.jpg), [Off-map, stranded player remains](../getaway/velmont-getaway-out.jpg). Actual timed fixture was observed proceeding to recap.
