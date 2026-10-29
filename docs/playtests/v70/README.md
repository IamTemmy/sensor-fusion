# Exhibits, winner recap and relay readiness

Replaced the procedural center statue and old fossil with transparent exhibit sprites. Wall/bookcase rendering beneath decor footprints is suppressed; collision geometry remains unchanged. Desktop frozen gallery/archive views and the 390px mobile recap were visually inspected. These are layout checks, not live multiplayer tests.

Rival results identify the winning player or crew members and show their total banked haul, including when the viewer loses. Ties show the shared winning amount; empty banks do not invent a winner. The viewer's own haul remains separately visible.

The reported HTTP Relay 100–500ms confirms polling fallback was active. Host 0ms measured no network round trip, so it now reads Host · local. HTTP latency is explicitly labeled per request. Runtime configuration inspection found no TURN credentials. This release does NOT establish that the reported WAN lag is fixed.

An authenticated server-side Cloudflare TURN broker is ready but inactive. Activation requires a Cloudflare Realtime TURN key and its API token in secure runtime settings as VELMONT_TURN_KEY_ID and VELMONT_TURN_API_TOKEN. Never put the provider token in client code or public environment variables. The broker issues one-hour credentials, caches them per authenticated seat for 25 minutes, filters browser-blocked port 53, and clients refresh ICE configuration. Existing static TURN configuration remains supported. Provider failure safely retains the existing fallback.

Official setup: https://developers.cloudflare.com/realtime/turn/generate-credentials/

Validation: 32 targeted transport, authentication, recovery, winner/tie and broker tests passed; TypeScript and whitespace checks passed. Broker tests use mocked provider responses. Real provider activation and a Mac-host/PC-guest WAN retest remain outstanding.

## Asset provenance

Generated using the built-in image_gen tool with transparent backgrounds; resized and encoded as WebP for runtime use. Assets: public/art/museum/fossil-v2.webp and public/art/museum/victory-statue.webp.

Fossil prompt: Use case: stylized-concept. Production game sprite, single isolated museum exhibit, genuinely transparent background. A beautifully modeled mounted ivory dinosaur skeleton, clear recognizable tyrannosaurus skull at right, coherent ribcage, two hindlegs and long tapering tail extending left. Premium charming 3D mobile heist game art with strong readable shapes and restrained detail, warm bone cream and bronze mounts. Camera orthographic elevated front at 55 degrees, straight horizontal orientation, NOT diagonal isometric. Entire skeleton stands securely on ONE low rectangular dark navy marble plinth with thin brass trim. Plinth front edge perfectly horizontal. Wide compact silhouette, all limbs tail skull and base fully visible, centered, little empty margin. No bookshelves, no room, no floor, no writing, no labels, no glow, no extra pedestal, no floating bones. Transparent RGBA asset for drawing as one sprite in a top-down museum game.

Statue prompt: Use case: stylized-concept. Production game sprite of one elegant cream marble museum statue: classical winged victory sculpture holding a small laurel wreath, detailed draped robe, graceful balanced pose and clearly sculpted face. Premium charming 3D mobile heist game style, sculptural rounded forms with warm ivory highlights and cool shadows, readable at small scale. Orthographic elevated front view about55 degrees, aligned squarely to screen, not tilted or diagonally isometric. Stands on ONE low rectangular navy marble museum plinth with thin brass rim, front edge horizontal. All wings wreath head and base visible, compact centered silhouette with little empty margin. Genuinely transparent background. No scenery, no lettering, no other items, no floor, no extra pedestal, no crude stick limbs. Isolated finished game asset.
