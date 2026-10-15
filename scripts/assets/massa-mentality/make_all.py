from kit import *
from ballot import ballot_art

def art_h(height, seed=7):
    a = ballot_art(1000, seed=seed)
    return a.resize((int(a.width * height / a.height), height), Image.LANCZOS)


# ---------------- Podcast cover 3000² ----------------
def podcast_cover(S=3000):
    c = base(S, S, (0.70, 0.55), 0.62, 0.34)
    tb = title_block(int(S * 0.62))
    top = int(S * 0.08) + tb.height + int(S * 0.02)
    a = art_h(int((S - top) * 0.98))
    c.alpha_composite(a, (S - a.width - int(S * 0.03), S - a.height - int(S * 0.02)))
    c.alpha_composite(tb, (int(S * 0.07), int(S * 0.08)))
    d = ImageDraw.Draw(c)
    weave(c, int(S * 0.07), int(S * 0.08) + tb.height + int(S * 0.04), int(S * 0.20), int(S * 0.008))
    d.text((int(S * 0.07), int(S * 0.08) + tb.height + int(S * 0.075)), "Politics, power and", font=sans(int(S * 0.028)), fill=SAGE)
    d.text((int(S * 0.07), int(S * 0.08) + tb.height + int(S * 0.112)), "the road to 2027", font=sans(int(S * 0.028)), fill=SAGE)
    studio_tag(c, int(S * 0.07), S - int(S * 0.10), int(S * 0.045))
    return grain(c)

# ---------------- YouTube ----------------
def banner():
    W, H = 2560, 1440
    c = base(W, H, (0.72, 0.45), 0.55, 0.32)
    # ballot box sits just right of the mobile safe area (x > 2053) so phones never show it cut in half;
    # desktops (full width, y 508–931) and TVs see it whole
    a = art_h(740)
    c.alpha_composite(a, (1940, 160))
    tl = title_line(120)
    x0, y0 = 527, 580
    c.alpha_composite(tl, (x0, y0))
    d = ImageDraw.Draw(c)
    weave(c, x0, y0 + tl.height + 34, 260, 8)
    d.text((x0, y0 + tl.height + 70), "Politics, power and the road to 2027", font=sans(42), fill=IVORY)
    d.text((x0, y0 + tl.height + 128), "with Stanley Ebosie", font=italic(44), fill=BRASS_SOFT)
    studio_tag(c, 120, H - 160, 64)   # TV-only corner
    return grain(c)

def avatar():
    return grain(monogram(800), 0.012)

def watermark():
    m = monogram(600)
    mask = Image.new("L", (600, 600), 0); ImageDraw.Draw(mask).ellipse((0, 0, 599, 599), fill=255)
    out = Image.new("RGBA", (600, 600)); out.paste(m, (0, 0), mask)
    return out.resize((150, 150), Image.LANCZOS)

def thumbnail(title=None, ep=None, photo=True):
    W, H = 1280, 720
    c = base(W, H, (0.80, 0.40), 0.55, 0.38)
    if photo:
        a = art_h(H - 40, seed=(ep or 7) + 3)
        c.alpha_composite(a, (W - a.width - 40, 20))
    d = ImageDraw.Draw(c)
    tl = title_line(54); c.alpha_composite(tl, (56, 48))
    text = title or "Your headline here"
    words = text.split(); box_w = 640; size = 120
    while size > 50:
        f = display_sb(size); lines, cur = [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if d.textlength(t, font=f) <= box_w or not cur: cur = t
            else: lines.append(cur); cur = wd
        lines.append(cur); lh = int(size * 1.05)
        if len(lines) * lh <= 380 and all(d.textlength(l, font=f) <= box_w for l in lines): break
        size -= 4
    y = 170 + (380 - len(lines) * lh) // 2
    for i, ln in enumerate(lines):
        last = i == len(lines) - 1 and len(lines) > 1
        d.text((56, y + i * lh), ln, font=italic(size) if last else f, fill=BRASS_SOFT if last else IVORY)
    weave(c, 56, H - 70, 220, 7)
    if ep:
        d.text((300, H - 66), f"Episode {ep}", font=sans_b(30), fill=IVORY, anchor="lm")
    return c

def end_screen():
    W, H = 1920, 1080
    c = base(W, H, (0.22, 0.55), 0.5, 0.3)
    d = ImageDraw.Draw(c)
    tl = title_line(70); c.alpha_composite(tl, (120, 90))
    cx, cy, r = 400, 560, 190
    d.ellipse((cx - r - 10, cy - r - 10, cx + r + 10, cy + r + 10), outline=BRASS, width=3)
    d.text((cx, cy + r + 80), "Subscribe", font=display(64), fill=IVORY, anchor="mm")
    vw, vh = 820, 461
    for lbl, y in [("Watch next", 150), ("Latest episode", 150 + vh + 90)]:
        x = W - vw - 120
        d.rounded_rectangle((x, y, x + vw, y + vh), radius=6, outline=SEAM, width=3)
        d.text((x, y - 18), lbl, font=sans(30), fill=SAGE, anchor="ls")
    weave(c, 120, H - 90, 300, 8)
    return grain(c)

# ---------------- Social ----------------
def insta_post(kicker="New episode", line="Who is the real Massa?"):
    S = 1080
    c = base(S, S, (0.78, 0.55), 0.6, 0.34)
    a = art_h(int(S * 0.60))
    c.alpha_composite(a, (S - a.width - 30, S - a.height - 30))
    tl = title_line(56); c.alpha_composite(tl, (70, 70))
    d = ImageDraw.Draw(c)
    d.text((70, 430), kicker, font=sans_b(34), fill=BRASS_SOFT)
    f = display_sb(96); y = 480; lines, cur = [], ""
    for wd in line.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= 500 or not cur: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur)
    for ln in lines: d.text((70, y), ln, font=f, fill=IVORY); y += 108
    weave(c, 70, S - 100, 200, 7)
    d.text((70, S - 70), "Watch on YouTube", font=sans(28), fill=SAGE)
    return grain(c)

def insta_story():
    W, H = 1080, 1920
    c = base(W, H, (0.6, 0.62), 0.7, 0.34)
    tb = title_block(int(W * 0.78)); c.alpha_composite(tb, (90, 170))
    d = ImageDraw.Draw(c)
    y = 170 + tb.height + 50
    weave(c, 90, y, 200, 7)
    d.text((90, y + 30), "New episode · link in bio", font=sans(38), fill=SAGE)
    top = y + 140
    a = art_h(int((H - top) * 0.92))
    c.alpha_composite(a, ((W - a.width) // 2, H - a.height - 80))
    return grain(c)

def site_cover():
    W, H = 1200, 1500
    c = base(W, H, (0.62, 0.62), 0.7, 0.34)
    tb = title_block(int(W * 0.80)); c.alpha_composite(tb, (90, 90))
    top = 90 + tb.height + 70
    a = art_h(int((H - top) * 0.96))
    c.alpha_composite(a, (W - a.width - 40, H - a.height - 30))
    weave(c, 90, 90 + tb.height + 30, 180, 6)
    return grain(c)

# ---------------- Logos ----------------
def logos():
    save(title_block(1800), "logo/massa-mentality-stacked-ivory.png")
    save(title_block(1800, ivory=INK, accent=(150, 112, 40)), "logo/massa-mentality-stacked-ink.png")
    save(title_line(220), "logo/massa-mentality-line-ivory.png")
    save(title_line(220, ivory=INK, accent=(150, 112, 40)), "logo/massa-mentality-line-ink.png")
    save(monogram(1200), "logo/mm-monogram-1200.png")

if __name__ == "__main__":
    save(podcast_cover(), "podcast/massa-mentality-cover-3000.jpg")
    save(banner(), "youtube/channel-banner-2560x1440.jpg")
    save(avatar(), "youtube/profile-picture-800.png")
    save(watermark(), "youtube/video-watermark-150.png")
    save(thumbnail(), "youtube/thumbnail-template-1280x720.png")
    save(grain(thumbnail("Who is the real Massa?", ep=1)), "youtube/thumbnail-sample-ep01.jpg")
    save(end_screen(), "youtube/end-screen-1920x1080.png")
    save(insta_post(), "social/instagram-post-1080.jpg")
    save(insta_story(), "social/instagram-story-1080x1920.jpg")
    save(site_cover(), "site/massa-mentality-cover-1200x1500.jpg", 90)
    save(ballot_art(2000), "logo/ballot-illustration.png")
    logos()
    # preview
    P = Image.new("RGB", (1700, 1130), (55, 55, 55))
    def put(rel, box, xy):
        i = Image.open(os.path.join(OUT, rel)).convert("RGB"); i.thumbnail(box); P.paste(i, xy)
    put("podcast/massa-mentality-cover-3000.jpg", (540, 540), (10, 10))
    put("youtube/channel-banner-2560x1440.jpg", (1130, 640), (560, 10))
    put("youtube/thumbnail-sample-ep01.jpg", (540, 304), (10, 560))
    put("youtube/profile-picture-800.png", (220, 220), (10, 880))
    put("social/instagram-post-1080.jpg", (420, 420), (570, 660))
    put("social/instagram-story-1080x1920.jpg", (250, 450), (1000, 660))
    put("site/massa-mentality-cover-1200x1500.jpg", (360, 450), (1265, 660))
    put("youtube/end-screen-1920x1080.png", (300, 170), (250, 900))
    P.save(os.path.join(HERE, "prev.png"))
