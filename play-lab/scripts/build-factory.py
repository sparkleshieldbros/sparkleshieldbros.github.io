"""Build the Echo Factory using shorter districts with mixed scout patrols."""
import json
from pathlib import Path

levels = Path(__file__).resolve().parents[1] / 'assets/levels'
game_map = json.loads((levels / 'cash-chapter-2.json').read_text())
terrain, markers = game_map['layers']
width = 390
terrain['data'] = [
    tile for row in range(terrain['height'])
    for tile in terrain['data'][row * 520:row * 520 + width]
]
terrain['data'][-30:] = [1] * 30
terrain['width'] = game_map['width'] = width
objects = [o for o in markers['objects'] if o['x'] < width * 32 - 960 and o['name'] != 'boss']
for i, scout in enumerate(o for o in objects if o['name'] == 'scout'):
    scout['type'] = ('forge-scout', 'rift-wing', 'kiln-runner')[i % 3]
    if scout['type'] == 'rift-wing':
        scout['y'] = 403
boss = next(o for o in markers['objects'] if o['name'] == 'boss')
objects.append(dict(boss, x=width * 32 - 180))
markers['objects'] = objects
(levels / 'cash-chapter-3.json').write_text(json.dumps(game_map, separators=(',', ':')) + '\n')
