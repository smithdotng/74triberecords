"""
Builds every logo asset from the master logo (scripts/assets/source/74tribe-logo.png,
white + green artwork on a flat #303030 background).

    python3 scripts/assets/make_brand.py <fonts_dir>

fonts_dir must hold bodoni.ttf and hanken.ttf (static TTFs converted from the
@fontsource-variable woff2 files) — used only for the social-share image.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FD = sys.argv[1] if len(sys.argv) > 1 else None
SRC = np.array(Image.open("scripts/assets/source/74tribe-logo.png").convert("RGB")).astype(float)
BG = np.array([48, 48, 48.0])
GREEN = np.array([0, 191, 99.0])
WHITE = np.array([255, 255, 255.0])
INK = (12, 35, 30)

def unmix(region, fg, keep_inner=False):
    """Recover the artwork's alpha by projecting each pixel onto the bg→fg line."""
    v = fg - BG
    a = np.clip(((region - BG) @ v) / (v @ v), 0, 1)
    rgb = np.where(a[..., None] > 0.97, region, fg) if keep_inner else np.broadcast_to(fg, region.shape)
    return Image.fromarray(np.dstack([rgb, a * 255]).clip(0, 255).astype(np.uint8), "RGBA")

def trim(img):
    return img.crop(img.getchannel("A").point(lambda x: 255 if x > 8 else 0).getbbox())

mark = trim(unmix(SRC[440:1260, 560:1440], GREEN, keep_inner=True))
tribe = trim(unmix(SRC[1270:1450, 600:1400], WHITE))
studios = trim(unmix(SRC[1470:1600, 600:1400], GREEN))

def stack(gap1, gap2):
    w = max(mark.width, tribe.width)
    h = mark.height + gap1 + tribe.height + gap2 + studios.height
    out = Image.new("RGBA", (w, h))
    y = 0
    for part, gap in ((mark, gap1), (tribe, gap2), (studios, 0)):
        out.alpha_composite(part, ((w - part.width) // 2, y))
        y += part.height + gap
    return out

def wordmark():
    w = max(tribe.width, studios.width)
    out = Image.new("RGBA", (w, tribe.height + 40 + studios.height))
    out.alpha_composite(tribe, (0, 0))
    out.alpha_composite(studios, ((w - studios.width) // 2, tribe.height + 40))
    return out

def fit(img, size):
    img = img.copy()
    img.thumbnail(size, Image.LANCZOS)
    return img

# ---- Logo files used by the site ----
fit(mark, (512, 512)).save("public/brand/logo-mark.png", optimize=True)
fit(wordmark(), (600, 600)).save("public/brand/logo-wordmark.png", optimize=True)
fit(stack(97, 57), (800, 1200)).save("public/brand/logo-full.png", optimize=True)

# ---- App icons ----
def icon(size, scale, bg=INK):
    canvas = Image.new("RGBA", (size, size), bg + (255,))
    m = fit(mark, (int(size * scale), int(size * scale)))
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas.convert("RGB")

icon(192, 0.86).save("public/icons/icon-192.png")
icon(512, 0.86).save("public/icons/icon-512.png")
icon(512, 0.66).save("public/icons/maskable-512.png")  # inside the 80% safe zone
icon(180, 0.8).save("public/icons/apple-touch-icon.png")
icon(180, 0.8).save("app/apple-icon.png")
# Browser-tab icon: the bare circle on transparency reads best at tiny sizes
fit(mark, (256, 256)).save("app/icon.png")
ico = Image.new("RGBA", (256, 256)); ico.alpha_composite(fit(mark, (256, 256)))
ico.save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# ---- Default social-share image (1200×630) ----
W, H = 1200, 630
og = Image.new("RGBA", (W, H), INK + (255,))
# soft green glow behind the mark
glow = Image.new("L", (W, H), 0)
ImageDraw.Draw(glow).ellipse((60, 40, 620, 600), fill=70)
from PIL import ImageFilter
glow = glow.filter(ImageFilter.GaussianBlur(90))
og = Image.composite(Image.new("RGBA", (W, H), (0, 120, 70, 255)), og, glow)
full = fit(stack(97, 57), (330, 470))
og.alpha_composite(full, (150, (H - full.height) // 2))
d = ImageDraw.Draw(og)
d.line((560, 160, 560, 470), fill=(36, 80, 63), width=2)
if FD:
    serif = ImageFont.truetype(f"{FD}/bodoni.ttf", 64)
    try: serif.set_variation_by_axes([500, 96])
    except Exception: pass
    sans = ImageFont.truetype(f"{FD}/hanken.ttf", 28)
    try: sans.set_variation_by_axes([450])
    except Exception: pass
    y = 200
    for line in ["Conversations", "worth sitting", "down for."]:
        d.text((620, y), line, font=serif, fill=(238, 231, 216)); y += 74
    d.text((622, y + 26), "Shows, reels and studio bookings", font=sans, fill=(159, 181, 168))
og.convert("RGB").save("public/og-default.png", optimize=True)
print("brand assets written")
