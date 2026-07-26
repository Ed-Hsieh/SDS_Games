from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/assets/images/art/prototype/hunt-demo/south-gate/traveler"
FRAMES = OUT / "frames"
FRAME_SIZE = 192
DIRECTIONS = [
    "south", "southwest", "west", "northwest",
    "north", "northeast", "east", "southeast",
]
ANIMATIONS = [("idle", 4), ("walk", 8), ("roll", 8)]


def main():
    atlas = Image.new("RGBA", (8 * FRAME_SIZE, 24 * FRAME_SIZE), (0, 0, 0, 0))
    row = 0
    for animation, frame_count in ANIMATIONS:
        for direction in DIRECTIONS:
            for frame in range(frame_count):
                source = Image.open(
                    FRAMES / f"{animation}-{direction}-{frame:02}.png"
                ).convert("RGBA")
                atlas.alpha_composite(source, (frame * FRAME_SIZE, row * FRAME_SIZE))
            row += 1
    atlas.save(OUT / "traveler-atlas-v2.webp", "WEBP", lossless=True, method=6)
    print(f"Packed traveler atlas: {atlas.size[0]}x{atlas.size[1]}")


if __name__ == "__main__":
    main()
