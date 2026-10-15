"""
The 2027 presidential line-up used across the Massa Mentality artwork.

Edit CANDIDATES to change who appears or the order. Put a portrait for each person in
candidates/<slug>.jpg (or .png/.webp): the background is removed automatically and the
cut-out is cached in candidates/.cut/. Without a photo, a neutral placeholder bust is drawn.
"""
import os, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from kit import *

# brand kit layout: <kit>/candidates next to <kit>/brand-source; repo/workspace layout: ./candidates
CAND_DIR = next((p for p in (os.path.join(os.path.dirname(HERE), "candidates"), os.path.join(HERE, "candidates")) if os.path.isdir(p)),
                os.path.join(HERE, "candidates"))

# Final INEC list, 12 Sept 2026. Election day: 16 January 2027.
CANDIDATES = [
    {"slug": "tinubu",  "name": "Bola Tinubu",     "short": "Tinubu",  "party": "APC", "party_full": "All Progressives Congress"},
    {"slug": "atiku",   "name": "Atiku Abubakar",  "short": "Atiku",   "party": "ADC", "party_full": "African Democratic Congress"},
    {"slug": "obi",     "name": "Peter Obi",       "short": "Obi",     "party": "NDC", "party_full": "Nigeria Democratic Congress"},
    {"slug": "makinde", "name": "Seyi Makinde",    "short": "Makinde", "party": "APM", "party_full": "Allied Peoples Movement"},
]

_cut_cache = {}

def _find_photo(slug):
    for ext in ("jpg", "jpeg", "png", "webp"):
        p = os.path.join(CAND_DIR, f"{slug}.{ext}")
        if os.path.exists(p):
            return p
    return None

def cutout(slug):
    """Transparent head-and-shoulders cut-out for a candidate, or None if no photo yet."""
    if slug in _cut_cache:
        return _cut_cache[slug]
    src = _find_photo(slug)
    if not src:
        _cut_cache[slug] = None
        return None
    cache = os.path.join(CAND_DIR, ".cut", f"{slug}.png")
    if os.path.exists(cache) and os.path.getmtime(cache) >= os.path.getmtime(src):
        im = Image.open(cache).convert("RGBA")
    else:
        from rembg import remove, new_session
        im = remove(ImageOps.exif_transpose(Image.open(src)).convert("RGB"), session=new_session("isnet-general-use")).convert("RGBA")
        from scipy.ndimage import binary_fill_holes
        a = np.array(im.getchannel("A")) > 40
        a = binary_fill_holes(a)
        alpha = np.maximum(np.array(im.getchannel("A")), (a * 255).astype(np.uint8))
        im.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8)))
        solid = lambda x: x.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox()
        im = im.crop(solid(im))
        # full-length photos: keep head and shoulders only
        if im.height > im.width * 1.25:
            im = im.crop((0, 0, im.width, int(im.width * 1.25)))
            # re-centre on the figure in that band
            bb = solid(im); im = im.crop((bb[0], 0, bb[2], im.height))
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        im.save(cache)
    # gentle grade toward the house palette: a touch warmer, slightly lower saturation
    rgb = np.array(im.convert("RGB")).astype(np.float32)
    grey = rgb.mean(axis=2, keepdims=True)
    rgb = grey + (rgb - grey) * 0.85
    rgb = rgb * np.array([1.03, 1.0, 0.94])
    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert("RGBA")
    out.putalpha(im.getchannel("A"))
    _cut_cache[slug] = out
    return out

def placeholder_bust(w, h):
    """Neutral head-and-shoulders shape used until a real photo is added."""
    S = 2
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = (46, 96, 77, 255)
    hr = int(w * S * 0.20)
    cx = w * S // 2
    hy = int(h * S * 0.40)
    d.ellipse((cx - hr, hy - int(hr * 1.18), cx + hr, hy + int(hr * 1.18)), fill=col)
    d.rectangle((cx - int(hr * 0.42), hy + hr, cx + int(hr * 0.42), hy + int(hr * 1.6)), fill=col)
    sw = int(w * S * 0.46)
    d.rounded_rectangle((cx - sw, hy + int(hr * 1.45), cx + sw, h * S + hr * 2), radius=int(hr * 1.6), fill=col)
    return im.resize((w, h), Image.LANCZOS)

def portrait(c, slug, w, h, label=True, name_size=None):
    """Arch-topped brass frame with the candidate inside; name and party underneath.
    Returns an RGBA image of size (w, h + label area)."""
    S = 2
    W, H = w * S, h * S
    r = W // 2
    cand = next(x for x in CANDIDATES if x["slug"] == slug)

    # arch mask
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((0, 0, W - 1, 2 * r), fill=255)
    md.rectangle((0, r, W - 1, H - 1), fill=255)

    # inside: room colour with a brass glow behind the head
    inner = Image.new("RGBA", (W, H), ROOM + (255,))
    g = Image.new("L", (W, H), 0)
    ImageDraw.Draw(g).ellipse((-int(W * 0.25), int(H * 0.05), int(W * 1.25), int(H * 0.85)), fill=95)
    g = g.filter(ImageFilter.GaussianBlur(W * 0.18))
    inner = Image.composite(Image.new("RGBA", (W, H), BRASS + (255,)), inner, g)

    cut = cutout(slug)
    if cut is None:
        fig = placeholder_bust(int(W * 0.92), int(H * 0.84))
        inner.alpha_composite(fig, ((W - fig.width) // 2, H - fig.height))
    else:
        # keep head and shoulders: scale so the figure fills ~1.05x the frame width
        sc = (W * 1.05) / cut.width
        fh = int(cut.height * sc)
        if fh < H * 0.88:
            sc = (H * 0.88) / cut.height
        fig = cut.resize((max(1, int(cut.width * sc)), max(1, int(cut.height * sc))), Image.LANCZOS)
        top = int(H * 0.10)
        inner.alpha_composite(fig, ((W - fig.width) // 2, top), )

    # soft ink fade at the bottom so the name sits cleanly
    fade = Image.new("L", (W, H), 0)
    fd = ImageDraw.Draw(fade)
    for i in range(int(H * 0.22)):
        y = H - int(H * 0.22) + i
        fd.line((0, y, W, y), fill=int(200 * (i / (H * 0.22)) ** 1.6))
    inner = Image.composite(Image.new("RGBA", (W, H), INK + (255,)), inner, fade)

    framed = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    framed.paste(inner, (0, 0), mask)
    od = ImageDraw.Draw(framed)
    lw = max(2, W // 120)
    od.arc((lw // 2, lw // 2, W - 1 - lw // 2, 2 * r - lw // 2), 180, 360, fill=BRASS, width=lw)
    od.line((lw // 2, r, lw // 2, H), fill=BRASS, width=lw)
    od.line((W - 1 - lw // 2, r, W - 1 - lw // 2, H), fill=BRASS, width=lw)
    framed = framed.resize((w, h), Image.LANCZOS)

    if not label:
        return framed
    ns = name_size or max(14, int(w * 0.13))
    lab_h = int(ns * 2.95)
    out = Image.new("RGBA", (w, h + lab_h), (0, 0, 0, 0))
    out.alpha_composite(framed, (0, 0))
    d = ImageDraw.Draw(out)
    nm = cand["short"]
    f = display_sb(ns)
    while d.textlength(nm, font=f) > w * 0.98 and ns > 10:
        ns -= 1; f = display_sb(ns)
    d.text((w // 2, h + int(ns * 0.25)), nm, font=f, fill=IVORY, anchor="mt")
    # party chip
    ps = max(11, int(ns * 0.62))
    pf = sans_b(ps)
    tw = d.textlength(cand["party"], font=pf)
    py = h + int(ns * 1.6)
    px = (w - tw) // 2
    pad = int(ps * 0.55)
    d.rounded_rectangle((px - pad, py - int(ps * 0.2), px + tw + pad, py + int(ps * 1.15)), radius=int(ps * 0.7), outline=BRASS, width=max(1, ps // 12))
    d.text((w // 2, py + int(ps * 0.48)), cand["party"], font=pf, fill=BRASS_SOFT, anchor="mm")
    return out

def lineup(width, gap_ratio=0.06, slugs=None, name_size=None, aspect=1.42, stagger=0.0):
    """A row of candidate portraits fitted to `width`."""
    slugs = slugs or [x["slug"] for x in CANDIDATES]
    n = len(slugs)
    gap = int(width * gap_ratio / max(1, n - 1)) if n > 1 else 0
    w = (width - gap * (n - 1)) // n
    h = int(w * aspect)
    cards = [portrait(None, s, w, h, name_size=name_size) for s in slugs]
    off = int(h * stagger)
    H = max(cd.height for cd in cards) + off
    out = Image.new("RGBA", (width, H), (0, 0, 0, 0))
    for i, cd in enumerate(cards):
        y = off if i % 2 == 1 else 0
        out.alpha_composite(cd, (i * (w + gap), y))
    return out

def grid2(width, gap_ratio=0.06, slugs=None, name_size=None, aspect=1.3):
    """2x2 grid of portraits."""
    slugs = slugs or [x["slug"] for x in CANDIDATES]
    gap = int(width * gap_ratio)
    w = (width - gap) // 2
    h = int(w * aspect)
    cards = [portrait(None, s, w, h, name_size=name_size) for s in slugs[:4]]
    ch = cards[0].height
    out = Image.new("RGBA", (width, ch * 2 + gap), (0, 0, 0, 0))
    for i, cd in enumerate(cards):
        out.alpha_composite(cd, ((i % 2) * (w + gap), (i // 2) * (ch + gap)))
    return out
