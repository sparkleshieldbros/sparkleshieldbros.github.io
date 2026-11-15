"""Validate that each shipped asset is covered by provenance metadata."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
assets = root / "assets"
manifest_path = assets / "art-manifest.json"
manifest = json.loads(manifest_path.read_text())
files = {p.relative_to(root).as_posix() for p in assets.rglob("*")
         if p.is_file() and not p.name.startswith(".") and p.suffix.lower() in {".webp",".jpg",".png",".gif",".svg",".ogg",".mp3"}}
entries = {entry["path"]: entry for entry in manifest["assets"]}
if len(entries) != len(manifest["assets"]):
    raise SystemExit("Duplicate entries")
if files != set(entries):
    raise SystemExit(f"Missing: {sorted(files - set(entries))}; stale: {sorted(set(entries) - files)}")
for path, entry in entries.items():
    if not all(field in entry for field in ("status", "source", "license", "approvedBy", "dimensions")):
        raise SystemExit(f"Incomplete metadata: {path}")
    if entry["status"] not in {"canon", "approved", "provisional", "placeholder"}:
        raise SystemExit(f"Invalid status: {path}")
print(f"Manifest covers {len(files)} shipped media files.")
