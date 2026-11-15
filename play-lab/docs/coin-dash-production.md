# Coin Dash production track

Baseline: 2f6aa32, latest local build. Public Coin Dash returned HTTP 503 during discovery, so deployed behavior was not established. Phase 13 and later local changes are retained in history.

ADR: retain Phaser 3 Arcade and native JS modules. Static delivery and compatibility with existing games outweigh introducing an unneeded build migration. Node unit tests cover input parity and time-based acceleration. The Phaser collision and gameplay paths still require browser testing. Art uses existing pose sheets with provisional animation rather than newly approved frames.

Manual smoke: open Coin Dash, run right, jump the gaps, pause/resume, restart, collect stars, light the lantern and finish the Ogre duel. Repeat with touch, reduced motion and sound off. Repeat offline after the cache is ready.

Known gaps: full campaign clears beyond the first showcase chapter, ricochets, moving platforms, additional target varieties, distinct authored frames, WebKit, physical-device performance and CI remain open. Do not treat these snapshots as six accepted releases. Production requires explicit approval and a separate integration branch based on the current remote website tree.

## Art and sound pass
The three chapter backdrops are derivative crops of the existing Echo Ogre adventure plates. The opening course retains its mid-course lantern scene, and the Ogre retains the production pose guide. Cash uses a brief boot-shot recoil and landing feedback; no authored frames were added. Reduced motion disables recoil, parallax differences and particles. Synthesized dash, landing, coin, charged shot and impact cues are provisional. Approved hand-drawn frames, isolated scenery layers and played audio review remain open.
