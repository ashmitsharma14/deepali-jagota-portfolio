#!/usr/bin/env python3
"""
Turn a portrait shot on a white studio background into a web-ready cut-out.

  python3 _source-photos/make-cutout.py <source.jpg> <assets/img/name.webp>

What it does, and why:
  • builds an alpha channel from "distance from white", then floods in from the
    border so white *inside* her (teeth, catchlights) stays opaque;
  • erodes the edge by ~2px before re-feathering — the supplied JPGs have a pale
    rim left over from an earlier cut-out, which reads as a halo on the cream
    page and screams on the dark theme;
  • fades the bottom rows out, because the sources are cropped mid-torso and
    would otherwise end in a hard horizontal line;
  • saves WebP, which is ~10x smaller than PNG for a photo with transparency.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

LO, HI = 20, 52        # alpha ramp: transparent below LO, opaque above HI
ERODE = 5              # MinFilter size — eats the leftover white rim
FEATHER = 0.9          # gaussian blur on the mask, in px
MAX_HEIGHT = 1200
FADE_FRACTION = 0.085  # share of the height that fades out at the bottom
FADE_CURVE = 2.4       # higher = stays solid longer, then drops off faster


def cut_out(src_path, out_path):
    im = Image.open(src_path).convert("RGB")
    rgb = np.asarray(im).astype(np.int16)

    dist = (255 - rgb).max(axis=2)
    alpha = np.clip((dist - LO) * 255.0 / (HI - LO), 0, 255).astype(np.uint8)

    h, w = alpha.shape
    background = np.zeros((h, w), bool)
    seen = np.zeros((h, w), bool)
    queue = deque()

    def seed(y, x):
        if alpha[y, x] < 40 and not seen[y, x]:
            seen[y, x] = True
            queue.append((y, x))

    for x in range(w):
        seed(0, x); seed(h - 1, x)
    for y in range(h):
        seed(y, 0); seed(y, w - 1)

    while queue:
        y, x = queue.popleft()
        background[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                seed(ny, nx)

    alpha = np.where(background, alpha, 255).astype(np.uint8)

    mask = (Image.fromarray(alpha)
            .filter(ImageFilter.MinFilter(ERODE))
            .filter(ImageFilter.GaussianBlur(FEATHER)))

    out = im.convert("RGBA")
    out.putalpha(mask)
    out = out.crop(out.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox())
    out = out.resize(
        (round(out.width * MAX_HEIGHT / out.height), MAX_HEIGHT), Image.LANCZOS
    )

    al = np.asarray(out.getchannel("A")).astype(np.float32)
    height = al.shape[0]
    fade = int(height * FADE_FRACTION)
    al[height - fade:, :] *= (np.linspace(1.0, 0.0, fade) ** FADE_CURVE)[:, None]
    out.putalpha(Image.fromarray(al.clip(0, 255).astype(np.uint8)))

    out.save(out_path, format="WEBP", quality=86, method=6)
    return out.size


if __name__ == "__main__":
    size = cut_out(sys.argv[1], sys.argv[2])
    print(f"wrote {sys.argv[2]} at {size[0]}x{size[1]}")
