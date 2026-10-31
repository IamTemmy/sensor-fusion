# F / Throw input mapping

Client resolves the existing passTarget before shake. Eligible receiver gets an art pass with automatic aim; ringing/quiet state remains handled by unchanged engine rules. No receiver plus ringing selects existing one-second shake. No receiver plus quiet sends no action and shows a 2.2-second hint. Button label uses the same resolver; its tooltip distinguishes alarm vs quiet art. Briefing, guide and practice copy updated.

317 unit tests pass, including three new cases exercising the mapping and existing engine execution. Ringing and quiet passes are caught correctly; shake retains art and uses the existing 1s timer; distance, occupied hands and blocked sight produce no-op for quiet art. TypeScript passed. Engine/protocol unchanged byte-for-byte. Previous CPU gate remains unresolved; this is an input/UI-only release.
