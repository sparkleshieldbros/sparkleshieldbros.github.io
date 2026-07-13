#!/usr/bin/env python3
"""Local Sparkle Shield World Bible server.

This serves the static GUI and exposes a narrow API for reading/writing
book project records and spread README files inside this repository.
"""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import json
import re


REPO_ROOT = Path(__file__).resolve().parents[2]
BEAT_ROOT = REPO_ROOT / "assets/images/production/SparkleShieldUniverse/03_StoryContinuity/EchoOgre"
SPREAD_RE = re.compile(r"^/api/spreads/(EO-SP\d{2})/markdown$")
STORY_ROOT = REPO_ROOT / "assets/images/production/SparkleShieldUniverse/03_StoryContinuity"
PROJECT_DATA_PATH = REPO_ROOT / "tools/world-bible/projects.json"
BOOK_SPREAD_RE = re.compile(r"^/api/books/([A-Za-z0-9_-]+)/spreads/([A-Za-z0-9_-]+)/markdown$")


def beat_path_for(spread_id: str) -> Path:
    beat_number = spread_id.replace("EO-SP", "")
    return BEAT_ROOT / f"Beat{beat_number}" / "README.md"


def is_safe_beat_path(path: Path) -> bool:
    try:
        path.resolve().relative_to(BEAT_ROOT.resolve())
        return path.name == "README.md"
    except ValueError:
        return False


def is_safe_story_path(path: Path) -> bool:
    try:
        path.resolve().relative_to(STORY_ROOT.resolve())
        return path.name == "README.md"
    except ValueError:
        return False


def safe_segment(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_-]+", "", value or "")
    return cleaned[:80] or "Untitled"


def generic_beat_path_for(book_id: str, spread_id: str) -> Path:
    book_folder = "EchoOgre" if book_id == "EO" else safe_segment(book_id)
    match = re.search(r"(\d+)$", spread_id)
    beat_number = match.group(1).zfill(2) if match else "01"
    return STORY_ROOT / book_folder / f"Beat{beat_number}" / "README.md"


def read_project_data():
    if not PROJECT_DATA_PATH.exists():
        return {"books": [], "spreads": [], "assets": []}
    return json.loads(PROJECT_DATA_PATH.read_text(encoding="utf-8"))


class WorldBibleHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self.send_json({"ok": True, "root": str(REPO_ROOT)})
            return

        if self.path == "/api/project-data":
            self.send_json(read_project_data())
            return

        match = SPREAD_RE.match(self.path)
        if match:
            self.handle_get_markdown(match.group(1))
            return

        match = BOOK_SPREAD_RE.match(self.path)
        if match:
            self.handle_get_generic_markdown(match.group(1), match.group(2))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/project-data":
            self.handle_save_project_data()
            return

        match = SPREAD_RE.match(self.path)
        if match:
            self.handle_save_markdown(match.group(1))
            return

        match = BOOK_SPREAD_RE.match(self.path)
        if match:
            self.handle_save_generic_markdown(match.group(1), match.group(2))
            return

        self.send_error(404, "Unknown API route")

    def handle_get_markdown(self, spread_id: str):
        path = beat_path_for(spread_id)
        if not is_safe_beat_path(path):
            self.send_error(403, "Unsafe path")
            return

        if not path.exists():
            self.send_error(404, "Spread brief not found")
            return

        content = path.read_text(encoding="utf-8")
        self.send_json({
            "spreadId": spread_id,
            "path": str(path.relative_to(REPO_ROOT)),
            "content": content
        })

    def handle_save_markdown(self, spread_id: str):
        path = beat_path_for(spread_id)
        if not is_safe_beat_path(path):
            self.send_error(403, "Unsafe path")
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(400, "Body must be JSON")
            return

        content = payload.get("content")
        if not isinstance(content, str):
            self.send_error(400, "Missing text content")
            return

        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content.rstrip() + "\n", encoding="utf-8")
        self.send_json({
            "ok": True,
            "spreadId": spread_id,
            "path": str(path.relative_to(REPO_ROOT))
        })

    def handle_get_generic_markdown(self, book_id: str, spread_id: str):
        path = generic_beat_path_for(book_id, spread_id)
        if not is_safe_story_path(path):
            self.send_error(403, "Unsafe path")
            return

        if not path.exists():
            self.send_error(404, "Spread brief not found")
            return

        self.send_json({
            "bookId": book_id,
            "spreadId": spread_id,
            "path": str(path.relative_to(REPO_ROOT)),
            "content": path.read_text(encoding="utf-8")
        })

    def handle_save_generic_markdown(self, book_id: str, spread_id: str):
        path = generic_beat_path_for(book_id, spread_id)
        if not is_safe_story_path(path):
            self.send_error(403, "Unsafe path")
            return

        payload = self.read_json_body()
        if payload is None:
            return

        content = payload.get("content")
        if not isinstance(content, str):
            self.send_error(400, "Missing text content")
            return

        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content.rstrip() + "\n", encoding="utf-8")
        self.send_json({
            "ok": True,
            "bookId": book_id,
            "spreadId": spread_id,
            "path": str(path.relative_to(REPO_ROOT))
        })

    def handle_save_project_data(self):
        payload = self.read_json_body()
        if payload is None:
            return

        safe_payload = {
            "books": payload.get("books", []),
            "spreads": payload.get("spreads", []),
            "assets": payload.get("assets", [])
        }
        if not all(isinstance(safe_payload[key], list) for key in safe_payload):
            self.send_error(400, "Project data must contain book, spread, and asset lists")
            return

        PROJECT_DATA_PATH.write_text(json.dumps(safe_payload, indent=2) + "\n", encoding="utf-8")
        self.send_json({"ok": True, "path": str(PROJECT_DATA_PATH.relative_to(REPO_ROOT))})

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(400, "Body must be JSON")
            return None

    def send_json(self, payload, status=200):
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description="Run the local Sparkle Shield World Bible GUI.")
    parser.add_argument("--port", type=int, default=8781)
    args = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), WorldBibleHandler)
    print(f"Sparkle Shield World Bible running at http://127.0.0.1:{args.port}/tools/world-bible/")
    print(f"Writing spread briefs under {STORY_ROOT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
