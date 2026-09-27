"""Render the 1443/1446 classroom typography card with Skia.

The characters are drawn from a real Korean font, never invented by a video model.
Run with the bundled Python runtime after installing skia-python and imageio-ffmpeg
into the repository's .motion-tools directory.
"""

from __future__ import annotations

import math
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / ".motion-tools"))
import imageio_ffmpeg  # noqa: E402
import skia  # noqa: E402


WIDTH, HEIGHT, FPS, DURATION = 1280, 720, 30, 5
OUT = ROOT / "site" / "dist" / "videos" / "hangeul-timeline-skia.mp4"
POSTER = ROOT / "site" / "dist" / "assets" / "timeline-skia.png"
FACE = skia.Typeface.MakeFromFile(r"C:\Windows\Fonts\malgunbd.ttf")
if FACE is None:
    raise RuntimeError("Korean Malgun Gothic Bold font is unavailable")


def rgba(hex_code: str, opacity: float = 1.0) -> int:
    value = int(hex_code.lstrip("#"), 16)
    return skia.ColorSetARGB(round(max(0, min(1, opacity)) * 255), value >> 16, (value >> 8) & 255, value & 255)


def paint(hex_code: str, opacity: float = 1.0) -> skia.Paint:
    return skia.Paint(Color=rgba(hex_code, opacity), AntiAlias=True)


def ease(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return 1 - (1 - value) ** 3


def text(canvas: skia.Canvas, value: str, x: float, y: float, size: float, color: str, opacity: float = 1.0) -> None:
    font = skia.Font(FACE, size)
    canvas.drawString(value, x - font.measureText(value) / 2, y, font, paint(color, opacity))


def rounded(canvas: skia.Canvas, x: float, y: float, w: float, h: float, radius: float, color: str, opacity: float = 1.0) -> None:
    canvas.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x, y, w, h), radius, radius), paint(color, opacity))


def draw_card(canvas: skia.Canvas, t: float, start: float, x: float, number: str, label: str, detail: str) -> None:
    reveal = ease((t - start) / 0.75)
    if reveal <= 0:
        return
    y = 272 + 34 * (1 - reveal)
    rounded(canvas, x, y, 420, 308, 28, "#F7F3E8", reveal)
    rounded(canvas, x + 24, y + 24, 7, 65, 3, "#D66B40", reveal)
    text(canvas, number, x + 210, y + 150, 120, "#153A2B", reveal)
    text(canvas, label, x + 210, y + 221, 48, "#A7502E", reveal)
    text(canvas, detail, x + 210, y + 275, 26, "#496455", reveal)


def frame(t: float) -> bytes:
    surface = skia.Surface(WIDTH, HEIGHT)
    canvas = surface.getCanvas()
    canvas.clear(rgba("#143426"))
    # A restrained paper-like texture without a historical motif or fake script.
    for row in range(8):
        for col in range(15):
            opacity = 0.025 + 0.015 * math.sin(row * 1.8 + col * 0.9)
            canvas.drawCircle(48 + col * 86, 42 + row * 87, 1.4, paint("#F8F4E8", opacity))
    rounded(canvas, 96, 207, 1088, 3, 1, "#D4BE91", 0.28)
    draw_card(canvas, t, 0.2, 156, "1443", "창제", "새 글자를 만들다")
    progress = ease((t - 1.65) / 0.85)
    if progress > 0:
        rounded(canvas, 607, 423, 66 * progress, 5, 2, "#D66B40", progress)
        text(canvas, "›", 687, 448, 57, "#F2D49C", progress)
    draw_card(canvas, t, 2.15, 704, "1446", "반포", "새 글자를 널리 알리다")
    return bytes(surface.makeImageSnapshot().encodeToData())


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    POSTER.parent.mkdir(parents=True, exist_ok=True)
    command = [
        imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-y",
        "-f", "image2pipe", "-vcodec", "png", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUT),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        assert process.stdin is not None
        for index in range(FPS * DURATION):
            process.stdin.write(frame(index / FPS))
    finally:
        if process.stdin:
            process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding Skia typography")
    POSTER.write_bytes(frame(DURATION))
    print(f"Skia typography: {OUT} ({OUT.stat().st_size} bytes)")
    print(f"Poster: {POSTER} ({POSTER.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
