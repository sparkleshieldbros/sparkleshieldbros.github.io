# Phase 13 Sprite Atlas Standard

- Atlas: 7 columns (states) × 4 rows (animation frames), 112×112 pixel cells, 784×448 per hero.
- State order: idle, run, jump, fall, dash, power, celebrate.
- Canonical official portrait: composited without recoloring or redrawing; remote image load is required.
- Body: provisional vector silhouette, intentionally not represented as approved book-accurate artwork.
- Frames: Phaser `textures.addSpriteSheet` and `anims.create`, played via `sprite.play`.
- Reduced motion: switches state to idle where supported; test on devices.
- Next art gate: replace generated atlases with hand-authored, approved full-body PNG/WebP sprite sheets.
