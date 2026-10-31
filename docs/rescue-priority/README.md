# Rescue priority release — accepted limitation

The candidate secures incoming crew passes and nearby safe crew-owned dropped art before rescuing, and banks held art first. Last Call retains its existing behavior. The same decision path serves both teams. Bot-only memory observes held/airborne art ownership without adding fields to the networking protocol.

## Acceptance results

30 seeds (1001–1030) per museum, varying clear 120-unit human/bot pairs across the museum. A $500 piece is passed using the production action, then the human is stunned for six seconds. Guards initially within 300 units of either participant are removed; remaining guards, walls, lasers, alarms and movement stay active. Recovery must occur before the captive is freed/self-releases. Banking must occur within 15 seconds. This is a broad route sweep, not a fixed-location seed sweep.

| Museum | Secured before release | Banked within 15s | Captive freed |
|---|---:|---:|---:|
| The Velmont | 30/30 (100%) | 17/30 (56.7%) | 30/30 |
| Night Archive | 29/30 (96.7%) | 26/30 (86.7%) | 30/30 |

**Owner-approved limitation:** Velmont does not meet the 85% banking threshold. Return-route captures and subsequent alarm handling/other bot decisions remain problems after the initial pass is secured. A trial commitment to banking after self-release did not fix the gate and was removed. No balance, speed, guard, timer or route changes were made to force a pass.

## Regression results

- 326 unit tests pass, including nine new priority tests and existing rescue tests.
- TypeScript check passes.
- Idle: 0 stalls / 30 matches in each museum.
- Echo left behind, Rookie/Normal/Pro: Velmont 0/40, 0/40, 0/40; Archive 0/40, 2/40, 0/40.
- Echo-alone median haul, Rookie/Normal/Pro: Velmont $2,300 / $1,950 / $900; Archive $3,100 / $2,000 / $1,500.
- No new CPU pass or production build/deployment is claimed.

Run `pnpm test` and `pnpm typecheck` for the regression suite. Run `node --experimental-strip-types scripts/verify-rescue-pass.ts` for the acceptance test; it intentionally exits nonzero while the Velmont banking gate fails. Detailed per-seed results are in `candidate.json`; the original-engine comparison is in `baseline.json`.

The owner subsequently accepted the lower Velmont banking rate as museum-specific and explicitly requested publication of this exact tested candidate. The acceptance test remains unchanged and still reports the banking threshold failure honestly.
