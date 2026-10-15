from kit import *
from candidates import CANDIDATES, lineup, grid2, portrait

ELECTION_DAY = "Election day · 16 January 2027"


# ---------------- Podcast cover 3000² ----------------
def podcast_cover(S=3000):
    c = base(S, S, (0.55, 0.70), 0.75, 0.30)
    tb = title_block(int(S * 0.56))
    c.alpha_composite(tb, (int(S * 0.07), int(S * 0.07)))
    d = ImageDraw.Draw(c)
    y = int(S * 0.07) + tb.height + int(S * 0.035)
    weave(c, int(S * 0.07), y, int(S * 0.20), int(S * 0.008))
    d.text((int(S * 0.07), y + int(S * 0.03)), "Politics, power and the road to 2027", font=sans(int(S * 0.027)), fill=SAGE)
    studio_tag(c, int(S * 0.70), int(S * 0.085), int(S * 0.035))
    row = lineup(int(S * 0.88), gap_ratio=0.07, aspect=1.30, stagger=0.06, name_size=int(S * 0.034))
    c.alpha_composite(row, (int(S * 0.06), S - row.height - int(S * 0.045)))
    return grain(c)

# ---------------- YouTube ----------------
def banner():
    W, H = 2560, 1440
    c = base(W, H, (0.62, 0.50), 0.55, 0.30)
    # everything that matters sits inside the 1546x423 mobile-safe area (x 507-2053, y 508-931)
    tb = title_block(560)
    x0, y0 = 527, 528
    c.alpha_composite(tb, (x0, y0))
    d = ImageDraw.Draw(c)
    weave(c, x0, y0 + tb.height + 24, 200, 7)
    d.text((x0, y0 + tb.height + 50), "The road to 2027 · with Stanley Ebosie", font=sans(30), fill=SAGE)
    row = lineup(860, gap_ratio=0.09, aspect=1.36, name_size=30)
    c.alpha_composite(row, (2053 - 860 - 10, 931 - row.height - 6))
    studio_tag(c, 120, H - 160, 64)   # TV-only corner
    return grain(c)

def avatar():
    return grain(monogram(800), 0.012)

def watermark():
    m = monogram(600)
    mask = Image.new("L", (600, 600), 0); ImageDraw.Draw(mask).ellipse((0, 0, 599, 599), fill=255)
    out = Image.new("RGBA", (600, 600)); out.paste(m, (0, 0), mask)
    return out.resize((150, 150), Image.LANCZOS)

def thumbnail(title=None, ep=None, photo=True, slugs=None):
    """photo=False drops the candidates; slugs picks who appears (1-4), e.g. ["tinubu", "obi"] for a head-to-head."""
    W, H = 1280, 720
    c = base(W, H, (0.78, 0.45), 0.55, 0.34)
    box_w = 600
    if photo:
        slugs = slugs or [x["slug"] for x in CANDIDATES]
        area_x, area_w = 690, W - 690 - 36
        if len(slugs) == 4:
            g = grid2(area_w, gap_ratio=0.05, slugs=slugs, aspect=0.93, name_size=32)
        else:
            g = lineup(area_w if len(slugs) > 1 else 300, gap_ratio=0.06, slugs=slugs, aspect=1.25 if len(slugs) > 1 else 1.55, name_size=40)
        g.thumbnail((area_w, H - 40), Image.LANCZOS)
        c.alpha_composite(g, (area_x + (area_w - g.width) // 2, (H - g.height) // 2))
    else:
        box_w = 1100
    d = ImageDraw.Draw(c)
    tl = title_line(54); c.alpha_composite(tl, (56, 48))
    text = title or "Your headline here"
    words = text.split(); size = 120
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
    c = base(S, S, (0.5, 0.75), 0.7, 0.30)
    tl = title_line(52); c.alpha_composite(tl, (64, 64))
    d = ImageDraw.Draw(c)
    d.text((64, 170), kicker, font=sans_b(30), fill=BRASS_SOFT)
    f = display_sb(78); y = 212; lines, cur = [], ""
    for wd in line.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= 900 or not cur: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur)
    for ln in lines: d.text((64, y), ln, font=f, fill=IVORY); y += 88
    row = lineup(S - 128, gap_ratio=0.07, aspect=1.30, stagger=0.06, name_size=34)
    c.alpha_composite(row, (64, S - row.height - 40))
    return grain(c)

def insta_story():
    W, H = 1080, 1920
    c = base(W, H, (0.5, 0.65), 0.75, 0.30)
    tb = title_block(int(W * 0.62)); c.alpha_composite(tb, (90, 130))
    d = ImageDraw.Draw(c)
    y = 130 + tb.height + 36
    weave(c, 90, y, 200, 7)
    d.text((90, y + 28), "New episode · link in bio", font=sans(36), fill=SAGE)
    g = grid2(W - 220, gap_ratio=0.08, aspect=1.05, name_size=44)
    c.alpha_composite(g, (110, H - g.height - 100))
    return grain(c)

def site_cover():
    W, H = 1200, 1500
    c = base(W, H, (0.5, 0.72), 0.75, 0.30)
    tb = title_block(int(W * 0.74)); c.alpha_composite(tb, (90, 90))
    d = ImageDraw.Draw(c)
    y = 90 + tb.height + 34
    weave(c, 90, y, 180, 6)
    d.text((90, y + 28), "Politics, power and the road to 2027", font=sans(34), fill=SAGE)
    row = lineup(W - 140, gap_ratio=0.07, aspect=1.85, stagger=0.07, name_size=38)
    c.alpha_composite(row, (70, H - row.height - 50))
    return grain(c)


def whatsapp_status(headline="Who gets your vote?", kicker="The road to 2027", slugs=None):
    """1080x1920 WhatsApp status. Top ~220px (name bar) and bottom ~260px (reply box) kept clear of key content."""
    W, H = 1080, 1920
    c = base(W, H, (0.5, 0.58), 0.8, 0.32)
    d = ImageDraw.Draw(c)
    tl = title_line(58); c.alpha_composite(tl, ((W - tl.width) // 2, 250))
    weave(c, (W - 200) // 2, 340, 200, 7)
    d.text((W // 2, 400), kicker.upper(), font=sans_b(30), fill=BRASS_SOFT, anchor="mt")
    f = display_sb(104); lines, cur = [], ""
    for wd in headline.split():
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= 920 or not cur: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur)
    y = 455
    for i, ln in enumerate(lines):
        last = i == len(lines) - 1 and len(lines) > 1
        d.text((W // 2, y), ln, font=italic(104) if last else f, fill=BRASS_SOFT if last else IVORY, anchor="mt"); y += 116
    slugs = slugs or [x["slug"] for x in CANDIDATES]
    if len(slugs) == 4:
        g = grid2(860, gap_ratio=0.07, slugs=slugs, aspect=1.02, name_size=42)
    else:
        g = lineup(900, gap_ratio=0.07, slugs=slugs, aspect=1.45, name_size=48)
    gy = y + 40
    g.thumbnail((900, 1600 - gy), Image.LANCZOS)
    c.alpha_composite(g, ((W - g.width) // 2, gy))
    d.text((W // 2, 1625), ELECTION_DAY, font=sans_b(32), fill=IVORY, anchor="mt")
    d.text((W // 2, 1672), "Watch Massa Mentality on YouTube", font=sans(30), fill=SAGE, anchor="mt")
    return grain(c)

# ---------------- Logos ----------------
def logos():
    save(title_block(1800), "logo/massa-mentality-stacked-ivory.png")
    save(title_block(1800, ivory=INK, accent=(150, 112, 40)), "logo/massa-mentality-stacked-ink.png")
    save(title_line(220), "logo/massa-mentality-line-ivory.png")
    save(title_line(220, ivory=INK, accent=(150, 112, 40)), "logo/massa-mentality-line-ink.png")
    save(monogram(1200), "logo/mm-monogram-1200.png")

def main():
    import kit
    global OUT
    OUT = kit.OUT
    save(podcast_cover(), "podcast/massa-mentality-cover-3000.jpg")
    save(banner(), "youtube/channel-banner-2560x1440.jpg")
    save(avatar(), "youtube/profile-picture-800.png")
    save(watermark(), "youtube/video-watermark-150.png")
    save(thumbnail(), "youtube/thumbnail-template-1280x720.png")
    save(grain(thumbnail("Who is the real Massa?", ep=1)), "youtube/thumbnail-sample-ep01.jpg")
    save(grain(thumbnail("Tinubu vs Obi: the rematch", ep=2, slugs=["tinubu", "obi"])), "youtube/thumbnail-sample-ep02-head-to-head.jpg")
    save(end_screen(), "youtube/end-screen-1920x1080.png")
    save(insta_post(), "social/instagram-post-1080.jpg")
    save(insta_story(), "social/instagram-story-1080x1920.jpg")
    save(whatsapp_status(), "whatsapp/status-who-gets-your-vote-1080x1920.jpg")
    save(whatsapp_status("Tinubu or Obi: who takes it?", kicker="New episode", slugs=["tinubu", "obi"]), "whatsapp/status-head-to-head-1080x1920.jpg")
    save(site_cover(), "site/massa-mentality-cover-1200x1500.jpg", 90)
    save(lineup(2400, gap_ratio=0.07, aspect=1.30, name_size=90), "logo/candidate-lineup.png")
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

if __name__ == "__main__":
    main()
