from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "src/assets/images/art/prototype/hunt-demo"
OUT = SOURCE_ROOT / "south-gate"
BASE_SOURCE = OUT / "base.webp"

WORLD_SIZE = (4096, 2304)


def polygon_mask(size, polygons):
    image = Image.new("L", size, 0)
    draw = ImageDraw.Draw(image)
    for polygon in polygons:
        draw.polygon(polygon, fill=255)
    return image


def remove_dark_islands(base, mask):
    gray = np.asarray(base.convert("L"))
    blurred = np.asarray(base.convert("L").filter(ImageFilter.GaussianBlur(5)))
    visible_ground = np.where((gray > 22) | (blurred > 30), 255, 0).astype(np.uint8)
    result = np.minimum(np.asarray(mask), visible_ground)
    return Image.fromarray(result, "L").filter(ImageFilter.MaxFilter(11))


def copy_polygon(source, polygon):
    clip = polygon_mask(source.size, [polygon])
    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    output.paste(source.convert("RGBA"), mask=clip)
    return output


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "props").mkdir(exist_ok=True)
    (OUT / "traveler").mkdir(exist_ok=True)

    base = Image.open(BASE_SOURCE).convert("RGB")
    if base.size != WORLD_SIZE:
        base = base.resize(WORLD_SIZE, Image.Resampling.LANCZOS)
    base.save(OUT / "base.webp", "WEBP", quality=94, method=6)

    # These areas are authored as traversable first. The visual ground and the
    # masks share the same 4096x2304 coordinate space.
    walk_regions = [
        [(1640, 2304), (2470, 2304), (2490, 1980), (2670, 1760),
         (2840, 1570), (2750, 1360), (2530, 1210), (2300, 1030),
         (1930, 1010), (1650, 1190), (1450, 1440), (1510, 1760)],
        [(1500, 1730), (1260, 1580), (1030, 1490), (770, 1400),
         (540, 1260), (390, 1050), (470, 820), (720, 700),
         (1020, 720), (1260, 870), (1540, 1010), (1900, 1160),
         (1970, 1440), (1780, 1660)],
        [(1780, 1190), (1570, 940), (1550, 690), (1650, 430),
         (1740, 0), (2350, 0), (2440, 350), (2540, 660),
         (2520, 930), (2380, 1200)],
        [(2360, 1420), (2630, 1210), (2920, 1030), (3210, 800),
         (3510, 580), (3820, 460), (4096, 560), (4096, 950),
         (3800, 1020), (3520, 1150), (3300, 1390), (2920, 1580),
         (2560, 1650)],
        [(690, 1250), (950, 1150), (1260, 1120), (1600, 1210),
         (1900, 1340), (2140, 1490), (2380, 1510), (2530, 1650),
         (2340, 1800), (2040, 1760), (1780, 1620), (1430, 1500),
         (1060, 1480), (790, 1400)],
    ]
    walk = remove_dark_islands(base, polygon_mask(WORLD_SIZE, walk_regions))

    # Explicit structural blockers match visible walls and the most substantial
    # fence runs. They are cut after ground detection so no invisible wall is
    # introduced in open ground.
    blockers = [
        [(0, 2080), (1450, 2080), (1640, 2190), (1640, 2304), (0, 2304)],
        [(2470, 2190), (2780, 2110), (4096, 2050), (4096, 2304), (2470, 2304)],
        [(0, 0), (1680, 0), (1590, 330), (1450, 500), (1080, 560), (0, 530)],
        [(2380, 0), (4096, 0), (4096, 430), (3690, 390), (3400, 510),
         (3060, 670), (2660, 900), (2480, 760)],
        [(1300, 1600), (1460, 1540), (1580, 1670), (1470, 1780)],
        [(2680, 1510), (2830, 1420), (2940, 1510), (2780, 1630)],
    ]
    walk_draw = ImageDraw.Draw(walk)
    for obstacle in blockers:
        walk_draw.polygon(obstacle, fill=0)
    walk = walk.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))
    walk.save(OUT / "walk-mask.png", optimize=True)

    height = Image.new("L", WORLD_SIZE)
    height_pixels = np.zeros((WORLD_SIZE[1], WORLD_SIZE[0]), dtype=np.uint8)
    for y in range(WORLD_SIZE[1]):
        height_pixels[y, :] = np.uint8(210 - 145 * (y / (WORLD_SIZE[1] - 1)))
    Image.fromarray(height_pixels, "L").save(OUT / "height-mask.png", optimize=True)

    material = Image.new("RGB", WORLD_SIZE, (0, 0, 0))
    mat_draw = ImageDraw.Draw(material)
    mat_draw.bitmap((0, 0), walk, fill=(62, 122, 64))
    mud_paths = [
        [(1670, 2304), (2410, 2304), (2410, 1900), (2660, 1650),
         (2450, 1230), (2130, 1030), (1820, 1110), (1560, 1450), (1590, 1800)],
        [(1780, 1140), (1640, 820), (1740, 0), (2330, 0), (2440, 820), (2320, 1160)],
    ]
    for path in mud_paths:
        mat_draw.polygon(path, fill=(146, 82, 46))
    stone = [(1830, 2304), (2300, 2304), (2290, 2070), (2210, 1910),
             (1870, 1910), (1770, 2070)]
    mat_draw.polygon(stone, fill=(112, 118, 126))
    material.putalpha(walk)
    material.convert("RGB").save(OUT / "material-mask.png", optimize=True)

    foreground = Image.new("RGBA", WORLD_SIZE, (0, 0, 0, 0))
    occluder_polygons = [
        [(0, 2040), (1410, 2040), (1650, 2180), (1650, 2304), (0, 2304)],
        [(2460, 2170), (2790, 2070), (4096, 2010), (4096, 2304), (2460, 2304)],
        [(1190, 1510), (1510, 1450), (1660, 1590), (1420, 1700)],
        [(2630, 1440), (2930, 1350), (3040, 1510), (2750, 1640)],
    ]
    fg_rgba = base.convert("RGBA")
    for poly in occluder_polygons:
        clip = polygon_mask(WORLD_SIZE, [poly])
        foreground.paste(fg_rgba, mask=clip)
    foreground.save(OUT / "foreground.webp", "WEBP", lossless=True, method=6)

    print(f"South Gate masks and foreground rebuilt from {BASE_SOURCE}")


if __name__ == "__main__":
    main()
