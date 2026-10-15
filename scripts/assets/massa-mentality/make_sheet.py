from brand import *
from make_youtube import one_line_lockup, monogram

W, H = 2400, 1640
c = Image.new("RGBA", (W, H), PAPER + (255,))
d = ImageDraw.Draw(c)
M = 100
# header
wm = wordmark(300, ink=BLACK, sig=VIOLET); wm = wm.resize((560, int(wm.height * 560 / wm.width)), Image.LANCZOS)
c.alpha_composite(wm, (M, M))
d.text((M, M + wm.height + 40), "Brand guide", font=F("serif", 60), fill=BLACK)
d.text((M, M + wm.height + 115), "Politics, power and the road to 2027.\nHosted by Stanley Ebosie (Hugo).\nA 74 Tribe Studios show.", font=sans(30, 500), fill=GREY, spacing=10)

# concept
cx = 900
d.text((cx, M), "THE IDEA", font=sans(26, 700), fill=VIOLET)
concept = ("“Massa” is the boss who expects to be served. The show asks who\n"
           "really holds power in Nigeria — and the answer is the inked thumb.\n"
           "The violet thumbprint is the voter’s indelible-ink mark: the one\n"
           "moment every citizen is the Massa. It anchors every piece of the\n"
           "brand, and keeps the identity free of any party’s colours.")
d.text((cx, M + 44), concept, font=sans(30, 500), fill=BLACK, spacing=12)

# palette
py = 560
d.text((cx, py), "COLOUR", font=sans(26, 700), fill=VIOLET)
sw = [("Indelible Ink", VIOLET, "#4B1D78", "Primary accent"),
      ("Ballot Paper", PAPER, "#F3EFE6", "Backgrounds"),
      ("Press Black", BLACK, "#141216", "Headlines and text"),
      ("Ink on Dark", VIOLET_LT, "#966CD2", "Violet on dark"),
      ("Tribe Green", GREEN, "#00BF63", "Tiny accents only")]
for i, (n, col, hx, use) in enumerate(sw):
    x = cx + i * 280
    d.rectangle((x, py + 44, x + 250, py + 214), fill=col, outline=(200, 194, 184) if col == PAPER else None, width=2)
    d.text((x, py + 232), n, font=sans(28, 700), fill=BLACK)
    d.text((x, py + 270), hx, font=sans(26, 500), fill=GREY)
    d.text((x, py + 306), use, font=sans(20, 500), fill=GREY)

# type
ty = 980
d.text((cx, ty), "TYPE", font=sans(26, 700), fill=VIOLET)
d.text((cx, ty + 40), "ANTON", font=F("anton", 110), fill=BLACK)
d.text((cx + 330, ty + 70), "Headlines, show name,\nthumbnail titles. Always caps.", font=sans(24, 500), fill=GREY, spacing=8)
d.text((cx + 760, ty + 40), "by Hugo", font=F("caveat", 100), fill=VIOLET)
d.text((cx + 1070, ty + 70), "Caveat Bold — the host’s\nsignature only. Never body text.", font=sans(24, 500), fill=GREY, spacing=8)
d.text((cx, ty + 210), "Hanken Grotesk", font=sans(56, 700), fill=BLACK)
d.text((cx + 460, ty + 222), "Labels, captions, descriptions, social copy.", font=sans(24, 500), fill=GREY)

# marks
my = 780
d.text((M, my), "MARKS", font=sans(26, 700), fill=VIOLET)
t = Image.new("RGBA", (300, 300)); stamp(t, 290, (150, 150), VIOLET, rotate=-10); c.alpha_composite(t, (M, my + 50))
mm = monogram(300); mask = Image.new("L", (300, 300), 0); ImageDraw.Draw(mask).ellipse((0, 0, 299, 299), fill=255)
c.paste(mm, (M + 360, my + 50), mask)
d.text((M, my + 370), "Thumbprint mark", font=sans(24, 700), fill=BLACK)
d.text((M + 360, my + 370), "MM monogram (avatar)", font=sans(24, 700), fill=BLACK)
lock = one_line_lockup(80); lock = lock.resize((660, int(lock.height * 660 / lock.width)), Image.LANCZOS)
c.alpha_composite(lock, (M, my + 450))
d.text((M, my + 450 + lock.height + 16), "Horizontal lockup", font=sans(24, 700), fill=BLACK)

# rules
ry = 1420
d.text((M, ry), "DO", font=sans(26, 700), fill=VIOLET)
d.text((M, ry + 40), "Keep the thumbprint violet on paper, or soft violet on violet.\nLet it bleed off the edge — it’s a stamp, not a badge.", font=sans(24, 500), fill=BLACK, spacing=8)
d.text((cx, ry + 40 - 40), "DON’T", font=sans(26, 700), fill=VIOLET)
d.text((cx, ry + 40), "Use party colours, flags or candidate logos. Recolour the thumbprint\nin green or red. Set the show name in anything but Anton.", font=sans(24, 500), fill=BLACK, spacing=8)
d.line((cx - 50, M, cx - 50, H - M), fill=(214, 208, 198), width=2)
grain(c, 0.015).save(os.path.join(OUT, "massa-mentality-brand-guide.png"), optimize=True)
c.convert("RGB").resize((1200, 750)).save("sheet_prev.png")
