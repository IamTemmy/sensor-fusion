# v28 final polish

Visual/layout only. Engine, bots, balance, geometry and difficulty data unchanged.

- Desktop lobby uses side-by-side controls and crew cards plus a short arena strip. Checked with six seats at 1280×720: panel height 553px, bottom 662px, scrollHeight equals clientHeight (551px). All actions fit without scrolling. Phone remains scrollable for readable controls.
- Guards: 18% sprite brightness boost, glowing blue-white cap badge, existing torch retained. All painted actors now have light 2px rims on four sides. Capture/retreat dimming and crew colours retained.
- Border decor was already present: plants at outer corners, benches and banners along top/bottom borders, busts at outer sides, sconces on upper border. Retained without placing new objects on routes.
- Removed the redundant summary paragraph below Pro tip; result, haul, individual receipts and escape status remain.

## Verification

Typecheck passed; 105 tests passed, 0 failed. Difficulty gate passed using the unchanged hash-matched 240-match matrix. Co-op Rookie/Normal/Pro: 97.5/67.5/22.5%; rivals: 65/62.5/50%. No fresh simulations needed for unchanged engine.

Screenshots use frozen presentation fixtures, not completed matches. Laptop 1280×720; phone 390×844. Physical-phone performance and online multiplayer were not retested.

| Screen | Desktop | Phone |
|---|---|---|
| Lobby | [image](lobby-desktop.jpg) | [image](lobby-phone.jpg) |
| Centre | [image](centre-desktop.jpg) | [image](centre-phone.jpg) |
| Recap | [image](recap-desktop.jpg) | [image](recap-phone.jpg) |
