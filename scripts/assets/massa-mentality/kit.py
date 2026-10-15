"""Massa Mentality by Hugo — artwork in the 74 Tribe Studios house style (malachite, brass, ivory, Bodoni)."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FD = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "out")

# 74 Tribe Studios website palette
INK = (12, 35, 30)          # #0C231E page
ROOM = (18, 50, 43)         # #12322B surfaces
SEAM = (36, 80, 63)         # #24503F hairlines
BRASS = (201, 164, 92)      # #C9A45C
BRASS_SOFT = (225, 199, 143)  # #E1C78F
IVORY = (238, 231, 216)     # #EEE7D8
SAGE = (159, 181, 168)      # #9FB5A8
EMBER = (208, 138, 110)     # #D08A6E (weave only)

def font(name, size):
    return ImageFont.truetype(os.path.join(FD, name + ".ttf"), size)

display = lambda s: font("bodoni-display", s)
display_sb = lambda s: font("bodoni-display-semibold", s)
italic = lambda s: font("bodoni-italic", s)
sans = lambda s: font("hanken-medium", s)
sans_b = lambda s: font("hanken-semibold", s)

HOST = Image.open(os.path.join(HERE, "host_trim.png")).convert("RGBA")
MARK74 = Image.open(os.path.join(HERE, "logo-mark.png")).convert("RGBA")

def bbox(d, s, f):
    l, t, r, b = d.textbbox((0, 0), s, font=f)
    return r - l, b - t, l, t

def grain(img, amount=0.022, seed=3):
    rng = np.random.default_rng(seed)
    a = np.asarray(img.convert("RGB")).astype(float)
    n = rng.normal(0, 255 * amount, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))

def base(W, H, glow_xy=(0.72, 0.38), glow_r=0.75, strength=0.30):
    """Ink background with the site's soft brass radial glow."""
    y, x = np.mgrid[0:H, 0:W].astype(float)
    gx, gy = glow_xy[0] * W, glow_xy[1] * H
    r = np.sqrt(((x - gx) / (W * glow_r)) ** 2 + ((y - gy) / (H * glow_r)) ** 2)
    t = np.clip(1 - r, 0, 1) ** 1.6 * strength
    ink = np.array(INK, float); brass = np.array(BRASS, float)
    img = ink * (1 - t[..., None]) + brass * t[..., None]
    return Image.fromarray(img.astype(np.uint8)).convert("RGBA")

# The woven strip (aso-oke) exactly as the site's .weave class
WEAVE = [(0, 7, BRASS), (9, 11, BRASS_SOFT), (16, 19, EMBER), (21, 33, BRASS), (35, 37, SAGE), (45, 47, BRASS_SOFT),
         (49, 57, EMBER), (60, 62, BRASS), (70, 76, SAGE), (78, 92, BRASS), (94, 100, BRASS_SOFT)]

def weave(c, x, y, w, h):
    d = ImageDraw.Draw(c)
    for a, b, col in WEAVE:
        d.rectangle((x + w * a / 100, y, x + w * b / 100 - 1, y + h), fill=col)

def host(height, keep=0.62):
    h = HOST.crop((0, 0, HOST.width, int(HOST.height * keep)))
    s = height / h.height
    return h.resize((int(h.width * s), height), Image.LANCZOS)

def place_host(c, h, x, y, fade=0.18):
    """Soft shadow + fade the bottom of the cut-out into the background."""
    a = h.getchannel("A")
    sh = Image.new("RGBA", h.size, (0, 0, 0, 0)); sh.putalpha(a.filter(ImageFilter.GaussianBlur(max(8, h.width // 30))).point(lambda v: v * 90 // 255))
    c.alpha_composite(sh, (x + h.width // 60, y + h.width // 40))
    if fade:
        g = np.ones((h.height, 1)); n = int(h.height * fade)
        g[-n:, 0] = np.linspace(1, 0, n) ** 1.3
        mask = (np.asarray(a).astype(float) * g).astype(np.uint8)
        h = h.copy(); h.putalpha(Image.fromarray(mask))
    c.alpha_composite(h, (x, y))

def title_block(width, ivory=IVORY, accent=BRASS_SOFT):
    """'Massa / Mentality' in Bodoni with 'by Hugo' in brass italic — the show wordmark."""
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    base_size = 400
    f = display(base_size)
    w1, h1, l1, t1 = bbox(tmp, "Massa", f)
    w2, h2, l2, t2 = bbox(tmp, "Mentality", f)
    fi = italic(int(base_size * 0.42))
    w3, h3, l3, t3 = bbox(tmp, "by Hugo", fi)
    gap = int(base_size * 0.10)
    W = max(w1, w2) + 10
    H = h1 + gap + h2 + int(h3 * 1.25)
    img = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(img)
    d.text((-l1, -t1), "Massa", font=f, fill=ivory)
    d.text((-l2, h1 + gap - t2), "Mentality", font=f, fill=ivory)
    d.text((W - w3 - l3 - 6, h1 + gap + h2 + int(h3 * 0.30) - t3), "by Hugo", font=fi, fill=accent)
    s = width / W
    return img.resize((width, int(H * s)), Image.LANCZOS)

def title_line(height, ivory=IVORY, accent=BRASS_SOFT):
    """One-line lockup: 'Massa Mentality' + 'by Hugo'."""
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    f = display_sb(300); fi = italic(150)
    w, h, l, t = bbox(tmp, "Massa Mentality", f)
    w3, h3, l3, t3 = bbox(tmp, "by Hugo", fi)
    W, H = w + 50 + w3, h + 30
    img = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(img)
    d.text((-l, -t), "Massa Mentality", font=f, fill=ivory)
    d.text((w + 50 - l3, h - h3 - t3 + 4), "by Hugo", font=fi, fill=accent)
    s = height / H
    return img.resize((int(W * s), height), Image.LANCZOS)

def studio_tag(c, x, y, size, color=SAGE):
    """Small 74 Tribe Studios mark + 'A 74 Tribe Studios show'."""
    m = MARK74.resize((size, size), Image.LANCZOS)
    c.alpha_composite(m, (x, y))
    d = ImageDraw.Draw(c)
    d.text((x + int(size * 1.35), y + size // 2), "A 74 Tribe Studios show", font=sans(int(size * 0.5)), fill=color, anchor="lm")

def monogram(S):
    """Ivory 'MM' inside a brass ring on ink — mirrors the site's 74 logo ring."""
    c = base(S, S, (0.5, 0.35), 0.9, 0.22)
    d = ImageDraw.Draw(c)
    r = int(S * 0.40); cx = S // 2
    d.ellipse((cx - r, cx - r, cx + r, cx + r), outline=BRASS, width=max(3, S // 90))
    f = display_sb(int(S * 0.36))
    w, h, l, t = bbox(d, "MM", f)
    d.text((cx - w // 2 - l, cx - h // 2 - t - int(S * 0.01)), "MM", font=f, fill=IVORY)
    weave(c, cx - int(S * 0.12), cx + h // 2 + int(S * 0.05), int(S * 0.24), max(3, S // 110))
    return c

def save(img, rel, q=92):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if rel.endswith(".jpg"): img.convert("RGB").save(p, quality=q, optimize=True, progressive=True)
    else: img.save(p, optimize=True)
    return p
