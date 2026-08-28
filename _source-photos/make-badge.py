#!/usr/bin/env python3
"""
Turn a credential badge with a flat white/near-white background into a
transparent, web-sized WebP.

  python3 _source-photos/make-badge.py <source> <assets/img/badges/name.webp>

Why a flood fill rather than a plain "is it white?" test: these badges have
white *inside* them — the Cornerstone wordmark, "CORE SYSTEM", the sparkles,
the ribbon highlights. A global threshold would punch holes straight through
the artwork. Flooding inward from the border only clears background that is
actually connected to the outside edge.

The supplied JPGs sit on #F7F7F7 rather than pure white and carry JPEG ringing
around the badge outline, so the test is "near-white" with tolerance, not exact.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

NEAR_WHITE = 232   # every channel at or above this counts as background
FEATHER = 0.7      # px of blur on the mask edge before downscaling
MAX_EDGE = 260     # badges render at ~56px, so 260 covers 2x displays


def make_badge(src_path, out_path):
    im = Image.open(src_path).convert("RGB")
    rgb = np.asarray(im)

    is_bg = (rgb >= NEAR_WHITE).all(axis=2)
    h, w = is_bg.shape

    reached = np.zeros((h, w), bool)
    queue = deque()

    def seed(y, x):
        if is_bg[y, x] and not reached[y, x]:
            reached[y, x] = True
            queue.append((y, x))

    for x in range(w):
        seed(0, x); seed(h - 1, x)
    for y in range(h):
        seed(y, 0); seed(y, w - 1)

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                seed(ny, nx)

    alpha = np.where(reached, 0, 255).astype(np.uint8)
    mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(FEATHER))

    out = im.convert("RGBA")
    out.putalpha(mask)
    out = out.crop(out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())

    scale = MAX_EDGE / max(out.size)
    if scale < 1:
        out = out.resize(
            (max(1, round(out.width * scale)), max(1, round(out.height * scale))),
            Image.LANCZOS,
        )

    out.save(out_path, format="WEBP", quality=90, method=6)
    return out.size


if __name__ == "__main__":
    print(f"wrote {sys.argv[2]} at {make_badge(sys.argv[1], sys.argv[2])}")
