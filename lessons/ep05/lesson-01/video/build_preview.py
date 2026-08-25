#!/usr/bin/env python3
"""Build a preview MP4 from slide manifest using ffmpeg."""

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent
SLIDES = ROOT / "slides-16x9"
MANIFEST = json.loads((ROOT / "slide-manifest.json").read_text())
OUT = ROOT / "lesson-01-preview.mp4"


def main():
    concat_lines = []
    for item in MANIFEST:
        slide = SLIDES / item["file"]
        dur = item.get("durationSec", 5)
        concat_lines.append(f"file '{slide}'")
        concat_lines.append(f"duration {dur}")

    # ffmpeg concat demuxer needs last file repeated
    if MANIFEST:
        concat_lines.append(f"file '{SLIDES / MANIFEST[-1]['file']}'")

    concat_file = ROOT / "concat.txt"
    concat_file.write_text("\n".join(concat_lines) + "\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-vf", "fps=30,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        str(OUT),
    ]
    subprocess.run(cmd, check=True)
    total = sum(i.get("durationSec", 5) for i in MANIFEST)
    print(f"✓ {OUT} ({total}s)")


if __name__ == "__main__":
    main()
