"""Contact sheets from a folder of QA screenshots, and a pixel comparison of two such folders.

  python .qa/sheet.py sheet <shots-dir> <out-dir>      thumbnails, grouped, for looking over by eye
  python .qa/sheet.py diff <before-dir> <after-dir>    which screenshots changed, and by how much
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


def sheet(src: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    groups: dict[str, list[Path]] = {}
    def order(file: Path):
        parts = file.stem.split("-")
        return (parts[0], parts[1], int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0)

    for file in sorted(src.glob("*.png"), key=order):
        parts = file.stem.split("-")
        groups.setdefault("-".join(parts[:2]) if parts[1] in ("1826", "2026") else "door", []).append(file)
    for name, files in groups.items():
        phone = name.startswith("phone") or name == "door"
        width, height = (230, 472) if name.startswith("phone") else (470, 294)
        columns = 7 if name.startswith("phone") else 4
        rows = -(-len(files) // columns)
        page = Image.new("RGB", (columns * (width + 8) + 8, rows * (height + 26) + 8), "#202020")
        draw = ImageDraw.Draw(page)
        for i, file in enumerate(files):
            image = Image.open(file).convert("RGB")
            image.thumbnail((width, height))
            x, y = 8 + (i % columns) * (width + 8), 8 + (i // columns) * (height + 26)
            page.paste(image, (x, y + 18))
            draw.text((x, y + 2), file.stem.split("-", 2)[-1], fill="#ffffff")
        page.save(out / f"{name}.jpg", quality=82)
        print(out / f"{name}.jpg", len(files))


def diff(before: Path, after: Path) -> None:
    changed = 0
    for file in sorted(before.glob("*.png")):
        other = after / file.name
        if not other.exists():
            print("MISSING", file.name); changed += 1; continue
        a, b = Image.open(file).convert("RGB"), Image.open(other).convert("RGB")
        if a.size != b.size:
            print("SIZE   ", file.name, a.size, b.size); changed += 1; continue
        box = ImageChops.difference(a, b).getbbox()
        if box:
            pixels = sum(1 for p in ImageChops.difference(a, b).convert("L").getdata() if p > 12)
            share = 100 * pixels / (a.width * a.height)
            if share > 0.02:
                print(f"CHANGED {file.name}  {share:.2f}% of pixels, in {box}"); changed += 1
    print(f"{changed} of {len(list(before.glob('*.png')))} screenshots differ")


if __name__ == "__main__":
    mode, first, second = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    sheet(first, second) if mode == "sheet" else diff(first, second)
