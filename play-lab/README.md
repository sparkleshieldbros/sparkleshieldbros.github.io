# Sparkle Shield Play Lab

Four static Phaser 3.90 games. Serve this folder over HTTP to load the native JavaScript modules. Phaser, images, and code are served from the same origin. Chapter progress is stored locally by game. No account is needed.

For a preview, run `python3 -m http.server 8765 --bind 127.0.0.1` from the parent folder and open `http://127.0.0.1:8765/play-lab/`. To deploy after approval, copy the complete folder to the publishing branch of the existing GitHub Pages site. Keep the four game URLs and back up the previous release.

The asset manifest lists source and approval status. Runtime derivatives leave the source files intact. Animated poses and synthesized audio remain provisional. See the Phase A Gate 2 report for validation evidence and unrun checks. The test interface is available only with `?test=1`.
