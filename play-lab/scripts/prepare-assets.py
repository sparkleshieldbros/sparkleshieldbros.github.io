"""Extract size-limited runtime copies without changing source artwork (macOS sips)."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1] / "assets"
DESTINATION = ROOT / "runtime"
ARENAS = {"cash-opening", "cash-consequence-pause", "cash-ending-true", "ninja-arena", "opening", "echo-ogre"}
SHEETS = {"cash-poses", "kairo-poses", "ninja-poses", "ogre-action"}

DESTINATION.mkdir(exist_ok=True)
for image in sorted((ROOT / "portraits").iterdir()) + sorted((ROOT / "book").iterdir()):
    if image.suffix not in {".jpg", ".png", ".webp"}:
        continue
    if image.parent.name == "portraits":
        size, quality = (480, 83) if image.stem == "echo-ogre-book-cover" else (112, 89)
    elif image.stem in SHEETS:
        size, quality = 960, 82
    elif image.stem in ARENAS:
        size, quality = 1100, 76
    else:
        continue
    output = DESTINATION / f"{image.stem}.jpg"
    subprocess.run(["sips", "-Z", str(size), "-s", "format", "jpeg", "-s",
                    "formatOptions", str(quality), str(image), "--out", str(output)],
                   check=True, stdout=subprocess.DEVNULL)
    print(f"{output.relative_to(ROOT)}: {output.stat().st_size:,} bytes")
