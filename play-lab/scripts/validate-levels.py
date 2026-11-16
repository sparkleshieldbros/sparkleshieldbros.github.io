import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
for path in sorted((root/'assets/levels').glob('*.json')):
    level=json.loads(path.read_text())
    assert level['width']*level['tilewidth']>=2880, path
    terrain, markers=level['layers']
    assert len(terrain['data'])==level['width']*level['height'], path
    assert set(terrain['data'])<={0,1}, path
    assert all(terrain['data'][-30:]), f'{path}: Ogre arena floor has a gap'
    objects=markers['objects']
    names=[o['name'] for o in objects]
    assert names.count('star')==3 and names.count('boss')==1 and names.count('portal')==(2 if path.stem=='cash-chapter-3' else 3), path
    assert all(0<o['x']<level['width']*level['tilewidth'] and 0<o['y']<540 for o in objects), path
    floor = terrain['data'][-level['width']:]
    tile_width = level['tilewidth']
    for portal in (obj for obj in objects if obj['name'] == 'portal'):
        arrival = portal['x'] + 65
        while arrival < portal['x'] + 260 and not floor[int(arrival // tile_width)]:
            arrival += 32
        assert all(floor[int(x // tile_width)] for x in (arrival, arrival - 45)), (
            f'{path}: portal at {portal["x"]} needs solid ground for both players'
        )
    for tileset in level['tilesets']:
        assert (path.parent/tileset['image']).is_file(), path
    print(path.name, 'valid:', level['width']*level['tilewidth'], 'pixels')
