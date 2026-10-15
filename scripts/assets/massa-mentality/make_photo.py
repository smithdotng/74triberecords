from brand import *
from make_youtube import one_line_lockup

HOST = Image.open("host_trim.png").convert("RGBA")   # 860×1784, head at top
HW, HH = HOST.size

def host(width, crop_to=None):
    """Host cutout scaled to `width`; crop_to = fraction of body height to keep (from the top)."""
    h = HOST if crop_to is None else HOST.crop((0, 0, HW, int(HH * crop_to)))
    s = width / h.width
    return h.resize((width, int(h.height * s)), Image.LANCZOS)

def host_h(height, crop_to):
    """Host cutout scaled to a given height."""
    h = HOST.crop((0, 0, HW, int(HH * crop_to)))
    s = height / h.height
    return h.resize((int(h.width * s), height), Image.LANCZOS)

def shadow(img, blur=30, alpha=70):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(blur)).point(lambda v: v * alpha // 255)
    sh = Image.new("RGBA", img.size, (30, 10, 50, 0)); sh.putalpha(a)
    return sh

def place(c, img, x, y, sh=True):
    if sh: c.alpha_composite(shadow(img), (x + 12, y + 18))
    c.alpha_composite(img, (x, y))

def cover_photo(S=3000):
    c = Image.new("RGBA", (S, S), PAPER + (255,))
    wm = wordmark(int(S * 0.42), ink=BLACK, sig=VIOLET)
    wm = wm.resize((int(S * 0.62), int(wm.height * S * 0.62 / wm.width)), Image.LANCZOS)
    top = int(S * 0.06) + wm.height + int(S * 0.02)
    stamp(c, int(S * 0.80), (int(S * 0.64), top + int(S * 0.38)), VIOLET, rotate=-14)
    h = host_h(S - top, 0.60)
    place(c, h, int(S * 0.97) - h.width, S - h.height)
    c.alpha_composite(wm, (int(S * 0.08), int(S * 0.06)))
    d = ImageDraw.Draw(c)
    y = S - int(S * 0.17)
    d.rectangle((int(S * 0.08), y - int(S * 0.02), int(S * 0.08) + int(S * 0.07), y - int(S * 0.016)), fill=GREEN)
    d.text((int(S * 0.08), y), "ROAD TO", font=sans(int(S * 0.026), 700), fill=BLACK)
    d.text((int(S * 0.08), y + int(S * 0.035)), "2027", font=F("anton", int(S * 0.08)), fill=VIOLET)
    return grain(c, 0.02)

def site_cover_photo():
    W, H = 1200, 1500
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    wm = wordmark(500, ink=BLACK, sig=VIOLET); wm = wm.resize((int(W * 0.84), int(wm.height * W * 0.84 / wm.width)), Image.LANCZOS)
    top = 80 + wm.height + 40
    stamp(c, 980, (int(W * 0.60), top + 440), VIOLET, rotate=-14)
    h = host_h(H - top, 0.66)
    place(c, h, W - h.width - 40, H - h.height)
    c.alpha_composite(wm, (int(W * 0.08), 80))
    d = ImageDraw.Draw(c)
    d.text((int(W * 0.08), H - 170), "ROAD TO", font=sans(30, 700), fill=BLACK)
    d.text((int(W * 0.08), H - 136), "2027", font=F("anton", 100), fill=VIOLET)
    return grain(c, 0.02)

def banner_photo():
    W, H = 2560, 1440
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    stamp(c, 1400, (1960, 720), VIOLET, rotate=-16)
    stamp(c, 420, (330, 1230), VIOLET, rotate=24, opacity=0.18)
    # host: face sits inside the desktop strip (y 508–931), body continues for TV view
    h = host(820, crop_to=0.80)
    hx, hy = 1520, 470
    place(c, h, hx, hy)
    lock = one_line_lockup(210); lock = lock.resize((1000, int(lock.height * 1000 / lock.width)), Image.LANCZOS)
    x0, y0 = 527, 560
    c.alpha_composite(lock, (x0, y0))
    d = ImageDraw.Draw(c)
    ty = y0 + lock.height + 30
    d.rectangle((x0, ty + 14, x0 + 70, ty + 20), fill=GREEN)
    d.text((x0 + 92, ty), "Politics, power and the road to 2027", font=sans(40, 600), fill=BLACK)
    d.text((x0 + 92, ty + 58), "with Stanley Ebosie · A 74 Tribe Studios show", font=sans(30, 500), fill=GREY)
    return grain(c, 0.02)

def social_photo(head="New episode", line="Who is the real Massa?"):
    S = 1080
    c = Image.new("RGBA", (S, S), VIOLET + (255,))
    stamp(c, 1150, (int(S * 0.74), int(S * 0.55)), VIOLET_LT, rotate=-14, opacity=0.35)
    h = host(560, crop_to=0.60)
    place(c, h, S - h.width + 40, S - h.height)
    lock = one_line_lockup(110, ink=PAPER, sig=VIOLET_LT); lock = lock.resize((600, int(lock.height * 600 / lock.width)), Image.LANCZOS)
    c.alpha_composite(lock, (70, 70))
    d = ImageDraw.Draw(c)
    d.text((70, 420), head.upper(), font=sans(36, 700), fill=GREEN)
    f = F("anton", 118); y = 470
    words, lines, cur = line.upper().split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= 520 or not cur: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur)
    for ln in lines: d.text((70, y), ln, font=f, fill=PAPER); y += 126
    d.text((70, S - 90), "Watch on YouTube", font=sans(30, 600), fill=PAPER)
    return grain(c, 0.02)

def story_photo():
    W, H = 1080, 1920
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    wm = wordmark(500, ink=BLACK, sig=VIOLET); wm = wm.resize((int(W * 0.86), int(wm.height * W * 0.86 / wm.width)), Image.LANCZOS)
    d = ImageDraw.Draw(c)
    y0 = 170
    c.alpha_composite(wm, (int(W * 0.07), y0))
    ty = y0 + wm.height + 40
    d.text((int(W * 0.07), ty), "NEW EPISODE · LINK IN BIO", font=sans(38, 700), fill=BLACK)
    d.rectangle((int(W * 0.07), ty + 58, int(W * 0.07) + 90, ty + 64), fill=GREEN)
    top = ty + 120
    stamp(c, 1100, (int(W * 0.56), top + 520), VIOLET, rotate=-14)
    h = host_h(H - top, 0.72)
    place(c, h, int(W / 2 - h.width / 2 + 20), H - h.height)
    return grain(c, 0.02)

if __name__ == "__main__":
    save(cover_photo(), "podcast/massa-mentality-cover-3000.jpg", 92)
    save(site_cover_photo(), "site/massa-mentality-cover-1200x1500.jpg", 90)
    save(banner_photo(), "youtube/channel-banner-2560x1440.jpg", 92)
    save(social_photo(), "social/instagram-post-1080.jpg", 92)
    save(story_photo(), "social/instagram-story-1080x1920.jpg", 92)
    from make_youtube import thumbnail
    save(thumbnail("Who is the real Massa?", ep=1, photo="host_trim.png").convert("RGB"), "youtube/thumbnail-sample-ep01.jpg", 92)
    save(HOST, "photos/hugo-cutout.png")
    W = Image.new("RGB", (1700, 1100), (70, 70, 70))
    def P(p, box, xy):
        i = Image.open("out/" + p).convert("RGB"); i.thumbnail(box); W.paste(i, xy)
    P("podcast/massa-mentality-cover-3000.jpg", (540, 540), (10, 10))
    P("youtube/channel-banner-2560x1440.jpg", (1100, 620), (560, 10))
    P("youtube/thumbnail-sample-ep01.jpg", (560, 320), (10, 560))
    P("social/instagram-post-1080.jpg", (420, 420), (580, 640))
    P("social/instagram-story-1080x1920.jpg", (240, 430), (1010, 640))
    P("site/massa-mentality-cover-1200x1500.jpg", (330, 430), (1260, 640))
    W.save("photo_prev.png")
