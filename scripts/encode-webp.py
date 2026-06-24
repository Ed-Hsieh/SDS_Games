from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> int:
    parser = argparse.ArgumentParser(description="Encode one image as WebP.")
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--quality", type=int, default=90)
    args = parser.parse_args()

    source = Path(args.input)
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        has_alpha = image.mode in {"RGBA", "LA"} or ("transparency" in image.info)
        output = image.convert("RGBA" if has_alpha else "RGB")
        save_options = {"quality": args.quality, "method": 6}
        if has_alpha:
            save_options["exact"] = True
        output.save(target, "WEBP", **save_options)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
