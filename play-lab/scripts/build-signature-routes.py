"""Add each chapter's signature route to the shipped Tiled maps.

Run after the base map generators. The Observatory is authored separately.
Rows run from 0 at the top to 16 at the ground. Columns are relative to the sign.
"""
import json
from pathlib import Path

levels = Path(__file__).resolve().parents[1] / 'assets/levels'
# chapter, start column, sign, gaps, ledges (column, row, width), launch pads
routes = [
    (0, 109, 'Hop from rooftop to rooftop', [(5, 2), (10, 2), (15, 2)],
     [(3, 15, 2), (7, 14, 3), (12, 15, 3)], []),
    (1, 108, 'Ride the garden lift to the trellis', [(8, 3)],
     [(6, 13, 3), (10, 14, 3), (14, 15, 3)], [4]),
    (2, 109, 'Jump the vents. Land between them.', [],
     [(5, 15, 1), (9, 15, 2), (14, 15, 1), (18, 14, 2)], []),
    (3, 109, 'Take the floor or climb the conveyor shelves', [],
     [(4, 14, 3), (8, 13, 3), (12, 12, 4), (17, 14, 3)], []),
    (5, 5, 'Take the low trail or leap across the trellis', [(13, 2)],
     [(4, 15, 2), (7, 14, 3), (11, 13, 5)], []),
    (6, 4, 'Climb the mural steps, then drop to street level', [(11, 3)],
     [(4, 15, 2), (7, 14, 2), (10, 13, 3), (14, 14, 2)], []),
    (7, 5, 'Cross the storm one island at a time', [(5, 3), (11, 3), (17, 3)],
     [(8, 15, 3), (14, 15, 3), (20, 15, 2)], []),
    (8, 4, 'Jump through the arches, then clear the courtyard', [(13, 2)],
     [(3, 12, 4), (6, 15, 1), (9, 12, 3), (12, 15, 1), (15, 14, 2)], []),
    (9, 5, 'Ride the lift, clear the roofs, then hop the final island', [(9, 3), (17, 3)],
     [(7, 13, 3), (12, 14, 3), (15, 15, 2), (20, 15, 3)], [4]),
]

for chapter, start, hint, gaps, ledges, pads in routes:
    path = levels / ('cash-showcase.json' if chapter == 0 else f'cash-chapter-{chapter}.json')
    level = json.loads(path.read_text())
    floor, markers = level['layers']
    if any(obj['name'] == 'signature-route' for obj in markers['objects']):
        continue
    width = level['width']

    def write_tiles(row, x, span, value):
        assert 0 <= start + x <= width - span
        cell = row * width + start + x
        assert all(tile == 1 - value for tile in floor['data'][cell:cell + span])
        floor['data'][cell:cell + span] = [value] * span

    for x, span in gaps:
        write_tiles(16, x, span, 0)
    for x, row, span in ledges:
        write_tiles(row, x, span, 1)

    def point(name, x, y, kind):
        markers['objects'].append(dict(id=level['nextobjectid'], name=name,
                                       x=(start + x) * 32, y=y, type=kind,
                                       point=True, visible=True, width=0, height=0,
                                       rotation=0))
        level['nextobjectid'] += 1

    point('signature-route', 0, 332, hint)
    for x in pads:
        point('spring', x, 498, 'signature-lift')
    path.write_text(json.dumps(level, separators=(',', ':')) + '\n')
