"""Build the observatory route and its book-art districts."""
import json
from pathlib import Path

assets = Path(__file__).resolve().parents[1] / 'assets/levels'
level = json.loads((assets / 'cash-chapter-3.json').read_text())
terrain, markers = level['layers']
width = 303
level['width'] = terrain['width'] = width
terrain['data'] = [0] * (width * 16) + [1] * width
for gap, span in [(28, 2), (46, 3), (75, 2), (102, 3), (141, 3), (165, 2), (204, 3), (229, 2), (252, 3)]:
    terrain['data'][width * 16 + gap:width * 16 + gap + span] = [0] * span
for row, start, span in [(13, 26, 4), (14, 44, 6), (13, 72, 5), (14, 99, 4),
                         (13, 138, 5), (14, 162, 4), (13, 202, 5), (14, 227, 4), (13, 250, 5)]:
    terrain['data'][row * width + start:row * width + start + span] = [1] * span

def marker(name, x, y, kind=''):
    return dict(name=name, x=x, y=y, type=kind, point=True, visible=True,
                width=0, height=0, rotation=0)

objects = [marker('portal', x, 452) for x in (2016, 4160, 6624)]
objects += [marker('star', x, y) for x, y in [(896, 389), (3232, 409), (6512, 388)]]
objects += [marker('spring', 2192, 498), marker('spring', 4752, 498),
            marker('lamp', 7010, 448), marker('boss', width * 32 - 180, 415)]
objects += [marker('scout', x, 437, 'prism-scout') for x in range(600, 8620, 343)]
for i, obj in enumerate(objects, start=1):
    obj['id'] = i
markers['objects'] = objects
level['nextobjectid'] = len(objects) + 1
(assets / 'cash-chapter-4.json').write_text(json.dumps(level, separators=(',', ':')) + '\n')
