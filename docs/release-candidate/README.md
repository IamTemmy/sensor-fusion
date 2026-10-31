# Release candidate UI review

Scope: rules, guide emphasis, image preloading, refresh and departure UI. Engine, balance, API and peer protocol files are unchanged.

Validation: 314 unit tests passed; TypeScript passed. Desktop 1280x720 home body is 720px with no overflow; briefing content is 489px/489px with no scrolling. Phone 390x844 briefing retains the penalty warning and actions outside its scroll region. Guide tabs and important rules reviewed on phone. Hero image loaded successfully; compressed menu and briefing assets are preloaded. This is not a cold-network speed guarantee.

Real two-tab local test: guest joined LMY2Q5; navigating back through its invite restored Release Guest, retained exactly two seats and removed the crew query. Host Leave prompted confirmation; accepting it produced the single host-ended guest card without stars, penalties or waiting-for-rematch text. Local preview database schema was initialized for this test; production data was not touched.

Browsers choose the native beforeunload text. The exact warning is also shown in the hosting notice and explicit Leave confirmation. Closing mobile browsers may bypass beforeunload.

The 1v1 permanent unlock is confirmed in engine.ts, but only after the 1:00 time lock. Crown carry speed uses the ordinary art-carrying speed.

Screenshots are actual local UI captures (phone/desktop viewport frames), not match balance results.

Known unresolved issue: prior CPU p95/max target remains failed. This release does not claim a performance pass. The existing UI-only release exception is limited by exact source hash and protected-file hashes. The assertion accepts additional passing tests (314, previously 309).
