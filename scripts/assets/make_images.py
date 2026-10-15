"""Generates the demo catalogue artwork (sample covers, thumbnails and reels). Run: python3 scripts/assets/make_images.py <fonts_dir>"""
import sys, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FD = sys.argv[1]
BG = (12, 35, 30); SURF = (18, 50, 43); BRASS = (201, 164, 92); IVORY = (238, 231, 216)

def bodoni(size, italic=False, wght=500, opsz=96):
    f = ImageFont.truetype(f"{FD}/bodoni{'-i' if italic else ''}.ttf", size)
    try: f.set_variation_by_axes([wght, opsz])
    except Exception: pass
    return f

def hanken(size, wght=500):
    f = ImageFont.truetype(f"{FD}/hanken.ttf", size)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

def hexrgb(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def mix(a,b,t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))

def grain(img, amt=10, seed=1):
    rnd = random.Random(seed)
    n = Image.effect_noise(img.size, amt).convert("L")
    return Image.blend(img, Image.merge("RGB",(n,n,n)), 0.05)

def centered(d, box, text, font, fill):
    l,t,r,b = d.textbbox((0,0), text, font=font)
    w,h = r-l, b-t
    x = box[0] + (box[2]-box[0]-w)/2 - l
    y = box[1] + (box[3]-box[1]-h)/2 - t
    d.text((x,y), text, font=font, fill=fill)

# App icons and logos are built from the real logo by make_brand.py

# ---------- Demo art: woven-strip motif ----------
SHOWS = {
  "the-tribe-table": "#C9A45C", "seventy-four": "#D08A6E", "after-hours": "#8FB3C9",
  "kinship": "#B9A3D6", "the-ledger": "#9CC5A1",
}
TITLES = {"the-tribe-table":"The Tribe Table","seventy-four":"Seventy-Four","after-hours":"After Hours","kinship":"Kinship","the-ledger":"The Ledger"}

def woven(w, h, accent, seed, horizontal=False):
    rnd = random.Random(seed)
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    # soft orb
    orb = Image.new("RGB", (w, h), BG); od = ImageDraw.Draw(orb)
    ox, oy = rnd.uniform(0.25,0.75)*w, rnd.uniform(0.2,0.6)*h; R = min(w,h)*rnd.uniform(0.35,0.55)
    od.ellipse((ox-R, oy-R, ox+R, oy+R), fill=mix(BG, accent, 0.55))
    orb = orb.filter(ImageFilter.GaussianBlur(min(w,h)*0.18))
    img = Image.blend(img, orb, 0.9)
    d = ImageDraw.Draw(img)
    # strips
    n = rnd.randint(5, 9)
    span = (h if horizontal else w)
    x = span * rnd.uniform(0.05, 0.5)
    for i in range(n):
        sw = span * rnd.uniform(0.012, 0.05)
        col = rnd.choice([accent, mix(accent, IVORY, 0.4), mix(BG, accent, 0.35), BRASS])
        alpha_box = Image.new("RGB", img.size, col)
        mask = Image.new("L", img.size, 0); md = ImageDraw.Draw(mask)
        if horizontal: md.rectangle((0, x, w, x+sw), fill=int(255*rnd.uniform(0.35,0.85)))
        else: md.rectangle((x, 0, x+sw, h), fill=int(255*rnd.uniform(0.35,0.85)))
        img = Image.composite(alpha_box, img, mask)
        x += sw + span*rnd.uniform(0.004, 0.03)
    return grain(img, seed=seed)

for slug, hx in SHOWS.items():
    acc = hexrgb(hx)
    for i in range(3):
        woven(1280, 720, acc, hash((slug,i)) & 0xffff).save(f"public/demo/{slug}-{i+1}.jpg", quality=86)
    cov = woven(1000, 1250, acc, hash((slug,'c')) & 0xffff, horizontal=True)
    d = ImageDraw.Draw(cov)
    title = TITLES[slug]
    f = bodoni(118, wght=500)
    # wrap title
    words = title.split(); lines=[]; cur=""
    for wd in words:
        t = (cur+" "+wd).strip()
        if d.textlength(t, font=f) > 820 and cur: lines.append(cur); cur=wd
        else: cur=t
    lines.append(cur)
    y = 1250 - 90 - len(lines)*124
    for ln in lines:
        d.text((90, y), ln, font=f, fill=IVORY); y += 124
    d.text((92, 92), "74 Tribe Studios", font=hanken(30, 500), fill=mix(IVORY, BG, 0.25))
    cov.save(f"public/demo/{slug}-cover.jpg", quality=88)
print("done")

# ---------- Demo reels (9:16) ----------
REEL_ACCENTS = ["#C9A45C", "#D08A6E", "#8FB3C9", "#B9A3D6", "#9CC5A1", "#E1C78F"]
for i, hx in enumerate(REEL_ACCENTS):
    woven(720, 1280, hexrgb(hx), 900 + i * 37, horizontal=(i % 2 == 1)).save(f"public/demo/reel-{i+1}.jpg", quality=84)
print("reels done")
