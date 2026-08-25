#!/usr/bin/env python3
"""Generate 1920x1080 video-ready lesson slides from beats.json."""

import json
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).parent
BEATS = json.loads((ROOT / "beats.json").read_text())
SCREENSHOTS = Path("/workspace/screenshots")
OUT = ROOT / "slides-16x9"
GHIBLI = ROOT / "ghibli-4x3"

W, H = 1920, 1080
BAR_H = 300

# Font paths
FONT_CN = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
FONT_LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_LATIN_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def find_source(name):
    if not name:
        return None
    p = SCREENSHOTS / name
    return p if p.exists() else None


def find_ghibli(source_name):
    if not source_name:
        return None
    stem = Path(source_name).stem
    for ext in (".png", ".jpg"):
        p = GHIBLI / f"{stem}{ext}"
        if p.exists():
            return p
    return None


def get_scene_image(source_name):
    """Prefer ghibli 4:3, fall back to source screenshot."""
    g = find_ghibli(source_name)
    if g:
        return Image.open(g).convert("RGB")
    s = find_source(source_name)
    if s:
        return Image.open(s).convert("RGB")
    return None


def draw_gradient_bar(draw, y0, y1):
    for y in range(y0, y1):
        t = (y - y0) / max(y1 - y0, 1)
        alpha = int(210 * (0.3 + 0.7 * t))
        draw.line([(0, y), (W, y)], fill=(8, 12, 20, alpha))


def paste_4x3_scene(canvas, scene_img):
    """Center 4:3 image on 16:9 canvas, letterbox top/bottom."""
    sw, sh = scene_img.size
    target_h = H
    target_w = int(target_h * sw / sh)
    if target_w > W:
        target_w = W
        target_h = int(target_w * sh / sw)
    resized = scene_img.resize((target_w, target_h), Image.LANCZOS)
    x = (W - target_w) // 2
    y = (H - target_h) // 2
    canvas.paste(resized, (x, y))
    return canvas


def make_dialogue_slide(beat, scene_img):
    canvas = Image.new("RGB", (W, H), (12, 14, 20))
    paste_4x3_scene(canvas, scene_img)

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_gradient_bar(draw, H - BAR_H - 40, H)

    # Timestamp badge
    if beat.get("timestamp"):
        draw.rounded_rectangle([40, 40, 200, 88], radius=8, fill=(0, 0, 0, 160))
        f = load_font(FONT_LATIN, 28)
        draw.text((60, 48), beat["timestamp"], fill=(255, 220, 160), font=f)

    # Speaker badge
    if beat.get("speaker"):
        draw.rounded_rectangle([40, H - BAR_H - 20, 320, H - BAR_H + 30], radius=6, fill=(196, 92, 62, 220))
        f = load_font(FONT_CN, 30)
        draw.text((60, H - BAR_H - 8), beat["speaker"], fill=(255, 255, 255), font=f)

    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # Text in bottom bar
    y = H - BAR_H + 20
    draw.text((60, y), beat["chinese"], fill=(255, 255, 255), font=load_font(FONT_CN, 52))
    y += 68
    draw.text((60, y), beat["pinyin"], fill=(144, 210, 180), font=load_font(FONT_LATIN, 34))
    y += 50
    draw.text((60, y), beat["english"], fill=(200, 200, 210), font=load_font(FONT_LATIN, 32))

    return canvas


def make_fullscreen_text_slide(beat, bg_img=None, accent=(92, 130, 180)):
    canvas = Image.new("RGB", (W, H), (18, 20, 28))
    if bg_img:
        blurred = bg_img.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(12))
        canvas.paste(blurred)
        overlay = Image.new("RGBA", (W, H), (10, 12, 18, 190))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(canvas)

    slide_type = beat.get("type", "dialogue")
    labels = {"vocab": "词汇 VOCAB", "idiom": "成语 IDIOM", "grammar": "语法 GRAMMAR", "title": "课 LESSON", "outro": "下集 NEXT"}
    label = labels.get(slide_type, "")

    if label:
        draw.rounded_rectangle([760, 120, 1160, 180], radius=10, fill=accent + (255,))
        draw.text((820, 132), label, fill=(255, 255, 255), font=load_font(FONT_LATIN_BOLD, 28))

    draw.text((960, 280), beat["chinese"], fill=(255, 255, 255), font=load_font(FONT_CN, 72), anchor="mm")
    draw.text((960, 400), beat["pinyin"], fill=(144, 210, 180), font=load_font(FONT_LATIN, 40), anchor="mm")
    draw.text((960, 480), beat["english"], fill=(210, 210, 220), font=load_font(FONT_LATIN, 36), anchor="mm")

    y = 580
    for key in ("literal", "grammar", "vocab", "idiom", "notes", "breakdown"):
        val = beat.get(key)
        if not val:
            continue
        if isinstance(val, list):
            for line in val:
                draw.text((960, y), line, fill=(180, 190, 200), font=load_font(FONT_LATIN, 28), anchor="mm")
                y += 40
        else:
            draw.text((960, y), str(val), fill=(180, 190, 200), font=load_font(FONT_LATIN, 28), anchor="mm")
            y += 40

    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    generated = []

    for beat in BEATS:
        bid = beat["id"]
        btype = beat.get("type", "dialogue")
        source = beat.get("source")
        scene = get_scene_image(source) if source else None

        if btype in ("title", "outro", "vocab", "idiom", "grammar"):
            img = make_fullscreen_text_slide(beat, scene)
        elif scene:
            img = make_dialogue_slide(beat, scene)
        else:
            img = make_fullscreen_text_slide(beat)

        out_path = OUT / f"{bid}.png"
        img.save(out_path, "PNG", optimize=True)
        generated.append({"id": bid, "file": str(out_path.name), "durationSec": beat.get("durationSec", 5)})
        print(f"✓ {out_path.name}")

    (ROOT / "slide-manifest.json").write_text(json.dumps(generated, indent=2, ensure_ascii=False))
    print(f"\nGenerated {len(generated)} slides → {OUT}")


if __name__ == "__main__":
    main()
