# Sparkle Shield World Bible GUI

This is a local production reference tool for building Sparkle Shield Bros book spreads.

Open it through the local World Bible server from the repository root:

```bash
python3 tools/world-bible/server.py
```

Then visit:

```text
http://127.0.0.1:8781/tools/world-bible/
```

## What it does

- Tracks book repositories, starting with `The Echo Ogre`.
- Adds new books and new spreads from the GUI.
- Saves custom book and spread setup records.
- Lists 16 Echo Ogre spreads/beats.
- Shows the required reference package for each spread.
- Attaches selected image references/photos to each spread prompt.
- Previews and downloads approved character, story, environment, and world-guide assets.
- Builds a copyable illustration prompt for each spread.
- Downloads a reference package manifest for the selected spread.
- Reads and saves each spread's living Markdown brief.
- Tracks the production pipeline through story, references, prompt, illustration, Photoshop cleanup, InDesign layout, final review, and KDP upload readiness.

## Where the data lives

- App shell: `tools/world-bible/index.html`
- Styles: `tools/world-bible/styles.css`
- Spread, asset, and pipeline data: `tools/world-bible/data.js`
- Custom books, custom spreads, and user-added image references: `tools/world-bible/projects.json`
- App behavior: `tools/world-bible/app.js`
- Local save server: `tools/world-bible/server.py`

## Production source of truth

Approved production references live under:

```text
assets/images/production/SparkleShieldUniverse/
```

Echo Ogre web story images live under:

```text
adventures/echo-ogre/images/
```

New books and spreads can now be added from the GUI. The starter Echo Ogre records still live in `data.js`; user-created records and saved edits live in `projects.json`.

## Living spread briefs

Each spread brief saves to a beat README under:

```text
assets/images/production/SparkleShieldUniverse/03_StoryContinuity/{BookFolder}/BeatXX/README.md
```

For Echo Ogre, `{BookFolder}` is `EchoOgre`. For new books, the folder is based on the book ID created in the GUI.

The browser can only save those files when the GUI is opened through `server.py`. If the app is opened through a plain static server, it can still show generated notes but cannot write back to disk.

## Adding photos to prompts

Use the spread screen's `Prompt photos and references` area.

- `Add image` attaches an existing asset-library item to the spread.
- `Add image path` creates a custom image reference and attaches it to the spread.
- Attached images are included in the generated prompt and reference manifest.

Project-relative paths preview best in the GUI. Absolute Mac paths can still be useful inside prompt text, but may not preview in the browser.
