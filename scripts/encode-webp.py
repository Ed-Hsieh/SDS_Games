from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> int:
    parser = argparse.ArgumentParser(description="Encode one image as WebP.")
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--quality", type=int, default=90)
    parser.add_argument(
        "--square-pad",
        action="store_true",
        help="Pad to a square canvas without cropping the source image.",
    )
    args = parser.parse_args()

    source = Path(args.input)
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        has_alpha = image.mode in {"RGBA", "LA"} or ("transparency" in image.info)
        output = image.convert("RGBA" if has_alpha else "RGB")
        if args.square_pad and output.width != output.height:
            side = max(output.width, output.height)
            background = (0, 0, 0, 0) if has_alpha else (5, 5, 5)
            canvas = Image.new(output.mode, (side, side), background)
            offset = ((side - output.width) // 2, (side - output.height) // 2)
            canvas.paste(output, offset, output if has_alpha else None)
            output = canvas
        save_options = {"quality": args.quality, "method": 6}
        if has_alpha:
            save_options["exact"] = True
        output.save(target, "WEBP", **save_options)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
