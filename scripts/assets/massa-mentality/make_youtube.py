from brand import *

TAGLINE = "Politics, power and the road to 2027"

def one_line_lockup(height, ink=BLACK, sig=VIOLET):
    f = F("anton", height)
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    w, h, l, t = text_size(tmp, "MASSA MENTALITY", f)
    sf = F("caveat", int(height * 0.55))
    sw, sh, sl, st = text_size(tmp, "by Hugo", sf)
    W, H = w + int(height * 0.12) + sw, h + int(sh * 0.45)
    img = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(img)
    d.text((-l, -t), "MASSA MENTALITY", font=f, fill=ink)
    d.text((w + int(height * 0.12) - sl, h - st - int(sh * 0.62)), "by Hugo", font=sf, fill=sig)
    return img

def banner():
    W, H = 2560, 1440
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    stamp(c, 1320, (2330, 700), VIOLET, rotate=-16)          # big inked thumb, right (mostly outside the mobile safe area)
    stamp(c, 420, (330, 1230), VIOLET, rotate=24, opacity=0.18)  # faint second print, TV-only area
    d = ImageDraw.Draw(c)
    # safe area 1546×423 centred: x 507–2053, y 508–931
    lock = one_line_lockup(210)
    lock = lock.resize((int(lock.width * 1240 / lock.width), int(lock.height * 1240 / lock.width)), Image.LANCZOS)
    x0, y0 = 507 + 20, 508 + 40
    c.alpha_composite(lock, (x0, y0))
    f = sans(46, 600)
    ty = y0 + lock.height + 34
    d.rectangle((x0, ty + 14, x0 + 70, ty + 20), fill=GREEN)
    d.text((x0 + 92, ty), TAGLINE, font=f, fill=BLACK)
    d.text((x0 + 92, ty + 66), "A 74 Tribe Studios show", font=sans(34, 500), fill=GREY)
    return grain(c, 0.02)

def monogram(S, ring=False):
    """Violet disc, faint inked ridges, paper 'MM' monogram. Used for the avatar and watermark."""
    c = Image.new("RGBA", (S, S), VIOLET + (255,))
    stamp(c, int(S * 1.05), (S // 2, int(S * 0.53)), VIOLET_LT, rotate=-10, opacity=0.38)
    d = ImageDraw.Draw(c)
    f = F("anton", int(S * 0.44))
    w, h, l, t = text_size(d, "MM", f)
    d.text(((S - w) // 2 - l, (S - h) // 2 - t - int(S * 0.01)), "MM", font=f, fill=PAPER)
    d.rectangle((S // 2 - int(S * 0.07), (S + h) // 2 + int(S * 0.045), S // 2 + int(S * 0.07), (S + h) // 2 + int(S * 0.06)), fill=GREEN)
    return c

def avatar():
    return grain(monogram(800), 0.015)

def watermark():
    S = 600
    m = monogram(S)
    mask = Image.new("L", (S, S), 0); ImageDraw.Draw(mask).ellipse((0, 0, S - 1, S - 1), fill=255)
    out = Image.new("RGBA", (S, S)); out.paste(m, (0, 0), mask)
    return out.resize((150, 150), Image.LANCZOS)

def thumbnail(title=None, ep=None, photo=None):
    """1280×720 episode thumbnail. Title in caps, ≤ 4 short words reads best."""
    W, H = 1280, 720
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    # right panel: host photo, or the inked thumb as a placeholder
    px = 690
    cut = Image.open(photo) if photo else None
    if cut is not None and cut.mode in ("RGBA", "LA") and cut.getchannel("A").getextrema()[0] < 250:
        # transparent cut-out: host stands on paper in front of the inked thumb
        cut = cut.convert("RGBA").crop(cut.getbbox())
        stamp(c, 760, (px + 290, 400), VIOLET, rotate=-14)
        keep = cut.crop((0, 0, cut.width, int(cut.height * 0.58)))
        s = 520 / keep.width
        keep = keep.resize((520, int(keep.height * s)), Image.LANCZOS)
        if keep.height < H - 40:
            s2 = (H - 40) / keep.height
            keep = keep.resize((int(keep.width * s2), H - 40), Image.LANCZOS)
        c.alpha_composite(keep, (W - keep.width + 30, H - keep.height))
    elif photo:
        p = Image.open(photo).convert("RGB")
        r = max((W - px) / p.width, H / p.height)
        p = p.resize((int(p.width * r), int(p.height * r)), Image.LANCZOS)
        p = p.crop(((p.width - (W - px)) // 2, 0, (p.width - (W - px)) // 2 + W - px, H))
        c.paste(p, (px, 0))
        # violet ink bleed over the photo edge
        stamp(c, 300, (px + 40, H - 50), VIOLET, rotate=20, opacity=0.95)
    else:
        ImageDraw.Draw(c).rectangle((px, 0, W, H), fill=VIOLET)
        stamp(c, 820, (px + 300, 360), PAPER, rotate=-12, opacity=0.22)
        d0 = ImageDraw.Draw(c)
        d0.text((px + (W - px) // 2, H // 2), "HOST PHOTO", font=sans(30, 700), fill=PAPER, anchor="mm")
        d0.text((px + (W - px) // 2, H // 2 + 42), "(right 590 px, full height)", font=sans(22, 500), fill=PAPER + (180,), anchor="mm")
    d = ImageDraw.Draw(c)
    # logo chip
    lock = one_line_lockup(120); lock = lock.resize((430, int(lock.height * 430 / lock.width)), Image.LANCZOS)
    c.alpha_composite(lock, (54, 46))
    d = ImageDraw.Draw(c)
    if ep:
        d.rectangle((54, H - 92, 54 + 150, H - 46), fill=BLACK)
        d.text((54 + 75, H - 69), f"EP {ep:02d}", font=sans(28, 700), fill=PAPER, anchor="mm")
        d.rectangle((54 + 150, H - 92, 54 + 150 + 14, H - 46), fill=GREEN)
    # headline: auto-fit into the left column
    text = (title or "YOUR HEADLINE HERE").upper()
    words = text.split()
    box_w, box_top, box_bot = px - 54 - 40, 190, H - 150
    size = 150
    while size > 50:
        f = F("anton", size)
        lines, cur = [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if d.textlength(t, font=f) <= box_w or not cur: cur = t
            else: lines.append(cur); cur = wd
        lines.append(cur)
        lh = int(size * 1.02)
        if len(lines) * lh <= box_bot - box_top and all(d.textlength(l, font=f) <= box_w for l in lines): break
        size -= 6
    y = box_top + ((box_bot - box_top) - len(lines) * lh) // 2
    for i, ln in enumerate(lines):
        d.text((54, y + i * lh), ln, font=f, fill=VIOLET if i == len(lines) - 1 and len(lines) > 1 else BLACK)
    return c

def end_screen():
    W, H = 1920, 1080
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    stamp(c, 1300, (360, 560), VIOLET, rotate=-14, opacity=0.95)
    d = ImageDraw.Draw(c)
    # subscribe element zone (YouTube places the channel circle here)
    cx, cy, r = 360, 560, 190
    d.ellipse((cx - r - 14, cy - r - 14, cx + r + 14, cy + r + 14), fill=PAPER)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=BLACK, width=3)
    d.text((cx, cy + r + 70), "SUBSCRIBE", font=F("anton", 64), fill=BLACK, anchor="mm")
    # two video element zones (16:9)
    vw, vh = 820, 461
    for i, (lbl, y) in enumerate([("WATCH NEXT", 120), ("LATEST EPISODE", 120 + vh + 90)]):
        x = W - vw - 120
        d.rectangle((x, y, x + vw, y + vh), outline=BLACK, width=3)
        d.text((x, y - 16), lbl, font=sans(30, 700), fill=BLACK, anchor="ls")
    lock = one_line_lockup(80); lock = lock.resize((520, int(lock.height * 520 / lock.width)), Image.LANCZOS)
    c.alpha_composite(lock, (120, 70))
    return grain(c, 0.02)

if __name__ == "__main__":
    b = banner(); save(b, "youtube/channel-banner-2560x1440.jpg", 92)
    a = avatar(); save(a.convert("RGB"), "youtube/profile-picture-800.png")
    save(watermark(), "youtube/video-watermark-150.png")
    save(thumbnail(), "youtube/thumbnail-template-1280x720.png")
    save(thumbnail("Who is the real Massa?", ep=1), "youtube/thumbnail-sample-ep01.jpg", 92)
    save(end_screen(), "youtube/end-screen-1920x1080.png")
    # preview sheet
    sheet = Image.new("RGB", (1400, 1150), (60, 60, 60))
    sheet.paste(b.convert("RGB").resize((1024, 576)), (10, 10))
    av = a.resize((300, 300)); m = Image.new("L", (300, 300), 0); ImageDraw.Draw(m).ellipse((0, 0, 299, 299), fill=255)
    sheet.paste(av.convert("RGB"), (1060, 10), m)
    sheet.paste(Image.open(os.path.join(OUT, "youtube/thumbnail-sample-ep01.jpg")).resize((640, 360)), (10, 600))
    sheet.paste(Image.open(os.path.join(OUT, "youtube/thumbnail-template-1280x720.png")).convert("RGB").resize((640, 360)), (660, 600))
    wm = watermark(); sheet.paste(wm, (1100, 340), wm)
    sheet.paste(Image.open(os.path.join(OUT, "youtube/end-screen-1920x1080.png")).convert("RGB").resize((320, 180)), (1060, 960))
    # draw banner safe area guide on preview
    dd = ImageDraw.Draw(sheet); s = 1024 / 2560
    dd.rectangle((10 + 507 * s, 10 + 508 * s, 10 + 2053 * s, 10 + 931 * s), outline=(255, 0, 80), width=1)
    sheet.save("yt_prev.png")
