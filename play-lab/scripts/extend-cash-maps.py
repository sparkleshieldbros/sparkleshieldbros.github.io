"""Build the four districts of each Coin Dash chapter.

Run from any directory. Coordinates in the plans are local to each district.
Ground gaps and ledges specify (first column, length), and ledges also carry a row.
"""
import json
from pathlib import Path

LEVELS = Path(__file__).resolve().parents[1] / 'assets/levels'
DISTRICT_WIDTH = 130
WIDTH = 4 * DISTRICT_WIDTH
HEIGHT = 17
TILE = 32

# (gaps, ledges, raised ground, scout columns, spring column)
CHAPTERS = (
    # Maplewood: wide sidewalks, rooftop shortcuts, and short courtyard jumps.
    (
        (((20,2),(43,2),(62,2),(74,2),(89,3),(103,2)),
         ((8,4,13),(13,4,12),(31,5,13),(49,6,13),(69,4,12),(82,5,12),(94,5,12)),
         (), (12,26,47,67,80,98,115), None),
        (((22,2),(51,2),(71,2),(92,3),(109,2)),
         ((18,3,13),(33,5,13),(39,6,12),(53,5,12),(66,4,13),(80,7,12),(95,5,13)),
         ((56,6),(99,5)), (11,28,44,63,83,101,120), 15),
        (((24,2),(46,3),(69,2),(87,2),(108,3)),
         ((15,5,13),(20,5,12),(33,8,12),(50,5,13),(65,3,13),(76,5,12),(93,6,13),(102,4,12)),
         ((55,7),(96,6)), (12,30,41,58,77,98,119), 14),
        (((17,2),(41,2),(65,3),(89,2)),
         ((12,4,13),(25,6,13),(31,7,12),(44,5,13),(58,5,12),(75,7,13),(83,5,12)),
         ((48,8),(78,5)), (10,26,36,51,75,96), 20),
    ),
    # Floating Garden: staggered island crossings and overhead scout patrols.
    (
        (((18,2),(39,4),(61,2),(75,2),(90,3),(103,3)),
         ((8,4,13),(13,4,12),(31,5,13),(49,6,13),(69,4,12),(82,5,12),(94,5,12)),
         (), (12,25,46,66,82,98,116), None),
        (((24,3),(44,3),(61,3),(84,3),(99,3),(116,2)),
         ((17,4,13),(24,5,12),(31,4,11),(44,6,13),(56,4,13),(62,4,12),
          (69,5,11),(82,6,13),(98,5,13),(107,5,12)),
         (), (12,33,51,72,92,109,124), 14),
        (((19,2),(38,3),(54,3),(72,3),(89,3),(112,2)),
         ((13,5,13),(24,6,12),(32,5,11),(39,5,13),(49,3,13),(56,5,12),
          (64,6,11),(73,5,13),(88,5,13),(99,7,12)),
         (), (12,28,46,64,81,102,120), 24),
        (((20,3),(36,3),(56,3),(72,3),(91,3)),
         ((16,5,13),(21,5,12),(29,4,11),(36,5,13),(50,5,12),(58,5,13),
          (68,4,12),(73,6,13),(89,5,13)),
         (), (10,28,46,66,84,97), 24),
    ),
    # Night Foundry: service stairs and gantries separate the vent crossings.
    (
        (((22,2),(45,4),(65,2),(75,2),(90,3),(103,4)),
         ((8,4,13),(13,4,12),(31,5,13),(49,6,13),(69,4,12),(82,5,12),(94,5,12)),
         (), (13,30,53,70,82,98,116), None),
        (((22,2),(48,3),(67,3),(93,3),(115,2)),
         ((19,4,13),(32,6,12),(46,8,13),(59,4,12),(70,6,13),(81,5,11),(95,7,13)),
         ((31,4),(35,4),(54,5),(75,5),(105,5)), (11,30,42,58,77,101,122), 13),
        (((18,2),(42,3),(65,3),(88,3),(112,3)),
         ((16,6,13),(30,6,12),(40,8,13),(56,6,12),(65,5,13),(79,7,12),(87,8,13)),
         ((26,5),(34,3),(50,5),(74,5),(98,5)), (12,31,51,61,76,100,119), 22),
        (((19,2),(42,3),(62,3),(85,3)),
         ((16,6,13),(25,6,12),(40,8,13),(52,6,12),(61,7,13),(74,6,12),(84,7,13)),
         ((31,5),(49,5),(68,5),(93,5)), (10,30,52,73,97), 22),
    ),
)

SCOUT_TYPES = ('scout', 'rift-wing', 'kiln-runner')
STAR_POSITIONS = (
    ((465,350),(1080,410),(1650,377)),
    ((445,350),(1100,410),(1580,377)),
    ((445,350),(1100,410),(1580,377)),
)


def build_chapter(chapter, filename):
    path = LEVELS / filename
    game_map = json.loads(path.read_text())
    terrain, markers = game_map['layers']
    game_map['width'] = terrain['width'] = WIDTH
    data = [0] * (HEIGHT * WIDTH)
    objects = []

    def fill(start, length, row, tile=1):
        offset = row * WIDTH + start
        data[offset:offset + length] = [tile] * length

    def marker(name, x, y, subtype=None):
        objects.append(dict(id=len(objects) + 1, name=name, type=subtype or name,
                            x=x, y=y, point=True, width=0, height=0, rotation=0, visible=True))

    for x, y in STAR_POSITIONS[chapter]:
        marker('star', x, y)
    marker('boss', 16450, 415)

    for district, (gaps, ledges, raised, scouts, spring) in enumerate(CHAPTERS[chapter]):
        start = district * DISTRICT_WIDTH
        fill(start, DISTRICT_WIDTH, 16)
        for column, length in gaps:
            fill(start + column, length, 16, 0)
        raised_columns = {cell for column, length in raised for cell in range(column, column + length)}
        pit_arcs = {cell for column, length in gaps for cell in range(column - 2, column + length + 4)}
        spring_clearance = range(spring - 2, spring + 5) if spring is not None else ()
        for column, length, row in ledges:
            for cell in range(column, column + length):
                # Leave a clear jump arc at pit edges and at the spring wall.
                if cell in spring_clearance or row == 13 and cell in raised_columns:
                    continue
                fill(start + cell, 1, min(row, 8) if cell in pit_arcs else row)
        for column, length in raised:
            for cell in range(column, column + length):
                if cell not in spring_clearance:
                    fill(start + cell, 1, 15)

        origin = start * TILE
        if district:
            marker('portal', origin + 65, 452)
            marker('lamp', origin + (3300 if district < 3 else 3900), 448)
        if spring is not None:
            marker('spring', origin + spring * TILE + 16, 498)
        if chapter or district:
            reward_column, reward_row = min(
                ((cell, row) for cell in range(9, 100) for row in (12, 13, 15)
                 if data[row * WIDTH + start + cell] and cell not in spring_clearance),
                key=lambda spot: (spot[1] != 13, abs(spot[0] - 32))
            )
            marker('medal', origin + reward_column * TILE + 16, reward_row * TILE - 33)
        scout_type = SCOUT_TYPES[chapter]
        patrol_columns = set(scouts)
        # Fill the approaches and exits of existing encounters without crowding portal landings.
        max_column = 98 if district == 3 else 124
        for column in scouts:
            for direction in (-1, 1):
                candidates = sorted(range(7, max_column + 1), key=lambda cell: abs(cell - (column + direction * 5)))
                slot = next(cell for cell in candidates
                            if cell not in spring_clearance
                            and data[16 * WIDTH + start + cell]
                            and all(abs(cell - used) >= 2 for used in patrol_columns))
                patrol_columns.add(slot)
        if chapter == 0 and district == 0:
            # A single visible scout teaches the windup before the first courtyard.
            early = sorted(column for column in patrol_columns if column < 19 and column != scouts[0])
            for column in early:
                patrol_columns.remove(column)
                slot = next(cell for cell in range(108, 125)
                            if data[16 * WIDTH + start + cell]
                            and all(abs(cell - used) >= 2 for used in patrol_columns))
                patrol_columns.add(slot)
        for column in sorted(patrol_columns):
            raised_here = column in raised_columns and column not in spring_clearance
            y = 409 if scout_type == 'rift-wing' else 449 if raised_here else 481
            if chapter == 0 and district == 0 and column == 67:
                y = 386
            marker('scout', origin + column * TILE + 16, y, scout_type)

    terrain['data'] = data
    markers['objects'] = objects
    game_map['nextobjectid'] = len(objects) + 1
    path.write_text(json.dumps(game_map, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    for chapter, filename in enumerate(('cash-showcase.json', 'cash-chapter-1.json', 'cash-chapter-2.json')):
        build_chapter(chapter, filename)
