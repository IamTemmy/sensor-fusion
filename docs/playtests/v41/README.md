# v41 — guided practice and competitor review

2026-10-24. Training-only controller and UI changes; normal engine, bots, arena definitions, balance and networking unchanged.

## Delivered
- Six action-completing lessons in a quiet practice annex: grab; Cover + bank; lure a sentry + take its exhibit; pass; stash + hide; board.
- Unlimited practice time, no loot penalties, target rings, retry current lesson, completion and real-heist button.
- Phone/tablet practice banner visible above actions; competing objective hidden. NO RUSH does not wrap. Practice briefing states the correct goal.
- Nearby room names suppressed around actors, compact dock hint. Removed obsolete tutorial radio instruction.

## Evidence and limits
The 14 JPEGs here are browser screenshots of development-only frozen lesson fixtures at 1280×720 and 390×844, including completion. They demonstrate layout, not a completed manual run. Parent manually entered practice, moved into range, grabbed the exhibit, advanced to lesson 2 and ordered Cover; observed Echo taking the alarm. All six action transitions are covered using actual engine actions in noise-v41.test.ts. Full continuous manual completion and physical touch-device play remain unverified. Cloud browser timing was slow. Multiplayer responsiveness is explicitly out of scope.

## Featured-game comparison — direct browser observations
These are featured examples, not verified finalists or winners. Test depth differs; no defensible overall numeric leaderboard follows from these sessions.

| Game | What was tested | Strongest takeaway for Velmont |
|---|---|---|
| [Couch Movers](https://couch-movers.couch-movers.workers.dev/) | Completed first delivery using two browser seats: 1:01.1, 100 HP, $500, one star. Not all 12 jobs. | One obvious shared object, contextual door/parking prompts. Velmont needs similarly clear next actions. Post-round attribution incorrectly said one mover did nothing. |
| [Pudding Brawl](https://pudding-sites-validation-20261010.syrupy-whale-5936.chatgpt.site/) | Movement/charge tutorial then skipped remainder; completed one 1v3 bot match, finished second with zero recorded hits. Used movement, launch and Q; observed out-of-range skill feedback. | Strong character selection, distinctive abilities, readable silhouettes, immediate rematch and action-based tutorial. This limited loss is not a balance verdict. |
| [Hollow Fellowship](https://hollowfellowship.netlify.app/) | Two seats, Guardian/Mage; played Spark and Battle Readiness against first threat. Did not finish a round/match or test hidden traitor. | Cohesive fantasy identity and class contributions, but more reading and setup than Velmont's short heists. |
| [Pumpkin Watch](https://pumpkinwatch.io/) | Entered solo run and observed HUD; arena blank with unsupported WebGL message. | Clear solo entry and coherent theme. Gameplay cannot be fairly rated in this browser. |
| [The Alibi](https://the-alibi.lucadidio34.chatgpt.site/) | Created lobby and read briefing. Needs four participants; second tab resumed same seat. No actual social round. | Its core premise is explained in one compact paragraph. Cannot simulate a real social-deduction experience alone. |

## Priority after practice
1. Fresh-player test: can a newcomer deliberately lure a sentry, bank, and board without verbal help? Measure completion and confusion, not just wins.
2. Make the alarm trick the submission's unmistakable signature in the first minute and demo video; avoid adding new systems.
3. Continue reducing label/copy inconsistencies and verify real phone controls.
4. Multiplayer latency and real-device validation remain the largest execution risk. Do not raise the provisional Execution score merely because practice improved.
