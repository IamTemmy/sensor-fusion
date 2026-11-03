# Host removal is final for this lobby

Seats record removed, stale, or left. Only stale loss automatically rejoins.
Direct transport sends an explicit seat-left notice with the reason. Missing-token HTTP responses also carry the reason.
Removed guests see The host removed you from the crew with only Back to hideout.
An opaque HttpOnly browser cookie and the old session token are blocked for fresh admissions to that room. Device/session metadata is omitted from public seat views. The host and existing seats survive shared-browser tests; a same-device admission racing the removal cannot survive the authoritative merge.
Own Leave still goes home. Different devices can join; stale devices can rejoin.

Validation: 457 tests, typecheck, isolation, production compilation pass.
Real two-tab check: host removes guest, guest shows removal notice and remains absent; manual fresh join from the same browser is rejected with The host removed you from this crew.
