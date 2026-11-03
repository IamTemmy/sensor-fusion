# Entrance concept — local implementation

A generated concept was shown before implementation. The implementation reuses the existing museum-getaway.webp and masked-O wordmark, keeping the artwork separate from real HTML controls. No generated screenshot is used as UI.

Initial entrance now presents Start a heist and Play with friends. The former reveals the existing mode/difficulty setup; the latter reveals existing host/join controls. Learn to play, Practice and saved-seat rejoin remain available. Invite links still reveal the friends flow directly. Back to hideout returns to the entrance.

Verification: 352 unit tests passed; typecheck and isolation passed. Cloud-browser checks: desktop entrance, Start a heist -> setup, 360x740 setup -> existing briefing, 390x844 friends host/join controls. Entrance scrollHeight equals clientHeight at 390x844 (794px) and 360x740 (690px). Friends setup fits 390x844. No fresh multiplayer or physical-device FPS certification. No engine, networking, targets, secrets or hosting-manifest changes. Local only; no deployment.

This is the entrance pass only. Opening film, in-game visual redesign and expanded getaway presentation are not implemented.
