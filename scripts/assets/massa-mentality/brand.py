import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import numpy as np

FD = "fonts"
OUT = "out"
VIOLET = (75, 29, 120)       # Indelible Ink
VIOLET_LT = (150, 108, 210)  # Ink on dark
PAPER = (243, 239, 230)      # Ballot Paper
BLACK = (20, 18, 22)         # Press Black
GREEN = (0, 191, 99)         # Tribe Green (from 74 Tribe Studios)
GREY = (120, 112, 128)

THUMB = Image.open("thumb_mask_1800.png").convert("L")
THUMB = THUMB.crop(THUMB.point(lambda v: 255 if v > 20 else 0).getbbox())

def F(name, size):
    path = {"anton": "anton.ttf", "caveat": "caveat.ttf", "sans": "hanken.ttf", "serif": "bodoni.ttf", "serif-i": "bodoni-i.ttf"}[name]
    f = ImageFont.truetype(os.path.join(FD, path), size)
    if name == "sans":
        try: f.set_variation_by_axes([600])
        except Exception: pass
    return f

def sans(size, w=600):
    f = ImageFont.truetype(os.path.join(FD, "hanken.ttf"), size)
    try: f.set_variation_by_axes([w])
    except Exception: pass
    return f

def grain(img, amount=0.035, seed=1):
    rng = np.random.default_rng(seed)
    a = np.asarray(img.convert("RGB")).astype(float)
    n = rng.normal(0, 255 * amount, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))

def stamp(canvas, box_h, xy, color=VIOLET, rotate=-8, opacity=1.0):
    """Paste the thumbprint, scaled to height box_h, centred at xy."""
    t = THUMB.rotate(rotate, resample=Image.BICUBIC, expand=True)
    s = box_h / t.height
    t = t.resize((max(1, int(t.width * s)), box_h), Image.LANCZOS)
    if opacity < 1: t = t.point(lambda v: int(v * opacity))
    layer = Image.new("RGBA", t.size, color + (255,))
    layer.putalpha(t)
    canvas.alpha_composite(layer, (int(xy[0] - t.width / 2), int(xy[1] - t.height / 2)))
    return t.size

def text_size(d, s, f):
    l, t, r, b = d.textbbox((0, 0), s, font=f)
    return r - l, b - t, l, t

def draw_text(d, xy, s, f, fill, anchor="la"):
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

def wordmark(height, ink=BLACK, sig=VIOLET, with_sig=True, pad=0):
    """MASSA / MENTALITY stacked in Anton, 'by Hugo' signature tucked bottom-right."""
    f = F("anton", int(height * 0.5))
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    w1, h1, l1, t1 = text_size(tmp, "MASSA", f)
    w2, h2, l2, t2 = text_size(tmp, "MENTALITY", f)
    # scale MASSA up so both lines share a width (justified block)
    f1 = F("anton", int(height * 0.5 * w2 / w1))
    w1, h1, l1, t1 = text_size(tmp, "MASSA", f1)
    gap = int(height * 0.03)
    sigf = F("caveat", int(height * 0.24))
    sw, sh, sl, st = text_size(tmp, "by Hugo", sigf)
    W = max(w1, w2) + pad * 2
    H = h1 + gap + h2 + (int(sh * 0.55) if with_sig else 0) + pad * 2
    img = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(img)
    d.text((pad - l1, pad - t1), "MASSA", font=f1, fill=ink)
    d.text((pad - l2, pad + h1 + gap - t2), "MENTALITY", font=f, fill=ink)
    if with_sig:
        d.text((W - pad - sw - sl, pad + h1 + gap + h2 - st - int(sh * 0.40)), "by Hugo", font=sigf, fill=sig)
    return img

def save(img, name, q=None):
    path = os.path.join(OUT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if name.endswith(".jpg"):
        img.convert("RGB").save(path, quality=q or 90, optimize=True, progressive=True)
    else:
        img.save(path, optimize=True)
    return path
