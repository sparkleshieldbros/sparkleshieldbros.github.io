"""Lay out five book-inspired courses with distinct gap and platform geometry."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
assets = root / 'assets/levels'
template = (assets / 'cash-chapter-4.json').read_text()
routes = [
    ('trellis-scout', 273, [(29,2),(46,2),(69,2),(92,3),(121,2),(155,2),(180,3),(211,2)], [14,13,12,13], 415, [2210,4670]),
    ('kite-scout', 290, [(25,3),(54,3),(81,2),(110,3),(134,3),(169,3),(198,3),(228,2)], [13,12,13], 391, [1800,5000]),
    ('storm-scout', 306, [(30,2),(51,3),(79,3),(97,2),(118,3),(151,2),(170,3),(207,3),(236,2)], [14,12,14,13], 420, [2580,5830]),
    ('veil-scout', 320, [(24,2),(45,2),(72,2),(111,3),(137,2),(160,3),(204,2),(242,3),(257,2)], [12,14,13,14], 454, [2710,6010]),
    ('jubilee-scout', 344, [(32,3),(50,2),(76,3),(104,3),(136,2),(179,3),(210,3),(233,2),(272,3),(290,2)], [13,14,12,14], 403, [1940,5400,7950]),
]

def marker(name, x, y, kind=''):
    return dict(name=name, x=x, y=y, type=kind, point=True, visible=True,
                width=0, height=0, rotation=0)

for chapter, (scout, width, gaps, rows, scout_y, springs) in enumerate(routes, start=5):
    game = json.loads(template)
    floor, markers = game['layers']
    game['width'] = floor['width'] = width
    floor['data'] = [0] * (width * 16) + [1] * width
    lower_edge = width * 16
    for index, (start, span) in enumerate(gaps):
        floor['data'][lower_edge+start:lower_edge+start+span] = [0] * span
        row = rows[index % len(rows)]
        shelf = row * width + start - 2
        floor['data'][shelf:shelf+span+4] = [1] * (span+4)
    objects = []
    for fraction in (.24,.47,.69):
        tile = int(width * fraction)
        while not all(floor['data'][lower_edge+tile+step] for step in range(5)):
            tile += 1
        objects.append(marker('portal',tile*32,452))
    for gap_index in (1,3,6):
        start, _ = gaps[gap_index]
        row = rows[gap_index % len(rows)]
        # Ground-level collection remains possible when the highest shelf is optional.
        objects.append(marker('star',start*32-58,min(451,row*32+29)))
    objects += [marker('spring',x,498) for x in springs
                if all(floor['data'][lower_edge+(x+offset)//32] for offset in (0,94))]
    objects += [marker('scout',x,scout_y,scout) for x in range(720,width*32-1090,375-(chapter-5)*18)]
    objects += [marker('lamp',width*32-1670,448),marker('boss',width*32-180,415)]
    for ident,obj in enumerate(objects,1):
        obj['id'] = ident
    markers['objects'] = objects
    game['nextobjectid'] = len(objects)+1
    (assets/f'cash-chapter-{chapter}.json').write_text(json.dumps(game,separators=(',',':'))+'\n')
