from brand import *
from make_youtube import one_line_lockup, monogram
from make_cover import cover
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

# ---------- Logos (PNG) ----------
for name, ink, sig in [("black", BLACK, VIOLET), ("paper", PAPER, VIOLET_LT)]:
    w = wordmark(600, ink=ink, sig=sig, pad=20); save(w, f"logo/massa-mentality-stacked-{name}.png")
    o = one_line_lockup(260, ink=ink, sig=sig); save(o, f"logo/massa-mentality-horizontal-{name}.png")
m = Image.new("RGBA", (1200, 1200)); stamp(m, 1150, (600, 600), VIOLET, rotate=-10); save(m, "logo/thumbprint-mark-violet.png")
m2 = Image.new("RGBA", (1200, 1200)); stamp(m2, 1150, (600, 600), PAPER, rotate=-10); save(m2, "logo/thumbprint-mark-paper.png")
save(monogram(1200), "logo/mm-monogram-1200.png")

# ---------- Logo (SVG, outlined text) ----------
def glyph_paths(fontfile, text, size, x, y, fill):
    f = TTFont(fontfile); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    sc = size / upm; out = []; pen_x = 0
    for ch in text:
        g = cmap.get(ord(ch)); 
        if g is None: continue
        p = SVGPathPen(gs); gs[g].draw(p)
        d = p.getCommands()
        if d: out.append(f'<path transform="translate({x + pen_x * sc:.2f} {y:.2f}) scale({sc:.5f} {-sc:.5f})" d="{d}" fill="{fill}"/>')
        pen_x += f["hmtx"][g][0]
    return out, pen_x * sc

def svg_logo(ink, sig, fname):
    anton, caveat = "fonts/anton.ttf", "fonts/caveat.ttf"
    _, w2 = glyph_paths(anton, "MENTALITY", 200, 0, 0, ink)
    _, w1 = glyph_paths(anton, "MASSA", 200, 0, 0, ink)
    s1 = 200 * w2 / w1
    ft = TTFont(anton); capH = ft["OS/2"].sCapHeight / ft["head"].unitsPerEm
    p1, _ = glyph_paths(anton, "MASSA", s1, 0, s1 * capH, ink)
    y2 = s1 * capH + 200 * 0.06 + 200 * capH
    p2, _ = glyph_paths(anton, "MENTALITY", 200, 0, y2, ink)
    _, ws = glyph_paths(caveat, "by Hugo", 96, 0, 0, sig)
    p3, _ = glyph_paths(caveat, "by Hugo", 96, w2 - ws, y2 + 40, sig)
    H = y2 + 66
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 {w2 + 20:.0f} {H + 20:.0f}" role="img" aria-label="Massa Mentality by Hugo">' + "".join(p1 + p2 + p3) + "</svg>"
    open(os.path.join(OUT, "logo", fname), "w").write(svg)

svg_logo("#141216", "#4B1D78", "massa-mentality-stacked-black.svg")
svg_logo("#F3EFE6", "#966CD2", "massa-mentality-stacked-paper.svg")

# ---------- Site show cover (4:5) ----------
def site_cover():
    W, H = 1200, 1500
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    stamp(c, 1250, (int(W * 0.68), int(H * 0.34)), VIOLET, rotate=-14)
    wm = wordmark(500, ink=BLACK, sig=VIOLET); wm = wm.resize((int(W * 0.84), int(wm.height * W * 0.84 / wm.width)), Image.LANCZOS)
    c.alpha_composite(wm, (int(W * 0.08), int(H * 0.9) - wm.height))
    d = ImageDraw.Draw(c)
    d.text((int(W * 0.08), int(H * 0.06)), "ROAD TO 2027", font=sans(34, 700), fill=BLACK)
    d.rectangle((int(W * 0.08), int(H * 0.06) + 50, int(W * 0.08) + 84, int(H * 0.06) + 55), fill=GREEN)
    return grain(c, 0.025)

# ---------- Social ----------
def social_square(head="New episode", line="Who is the real Massa?"):
    S = 1080
    c = Image.new("RGBA", (S, S), VIOLET + (255,))
    stamp(c, 1300, (int(S * 0.78), int(S * 0.42)), VIOLET_LT, rotate=-14, opacity=0.35)
    d = ImageDraw.Draw(c)
    lock = one_line_lockup(110, ink=PAPER, sig=VIOLET_LT); lock = lock.resize((620, int(lock.height * 620 / lock.width)), Image.LANCZOS)
    c.alpha_composite(lock, (70, 70))
    d.text((70, 520), head.upper(), font=sans(40, 700), fill=GREEN)
    f = F("anton", 150); y = 580
    words, lines, cur = line.upper().split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= S - 140 or not cur: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur)
    for ln in lines: d.text((70, y), ln, font=f, fill=PAPER); y += 158
    d.text((70, S - 90), "Watch on YouTube  ·  74 Tribe Studios", font=sans(30, 500), fill=PAPER + (200,))
    return grain(c, 0.02)

def story():
    W, H = 1080, 1920
    c = Image.new("RGBA", (W, H), PAPER + (255,))
    stamp(c, 1500, (int(W * 0.62), int(H * 0.33)), VIOLET, rotate=-14)
    wm = wordmark(500, ink=BLACK, sig=VIOLET); wm = wm.resize((int(W * 0.86), int(wm.height * W * 0.86 / wm.width)), Image.LANCZOS)
    c.alpha_composite(wm, (int(W * 0.07), int(H * 0.60)))
    d = ImageDraw.Draw(c)
    d.text((int(W * 0.07), int(H * 0.60) + wm.height + 60), "NEW EPISODE · LINK IN BIO", font=sans(40, 700), fill=BLACK)
    d.rectangle((int(W * 0.07), int(H * 0.60) + wm.height + 120, int(W * 0.07) + 90, int(H * 0.60) + wm.height + 126), fill=GREEN)
    return grain(c, 0.02)

save(site_cover(), "site/massa-mentality-cover-1200x1500.jpg", 90)
save(social_square(), "social/instagram-post-1080.jpg", 92)
save(story(), "social/instagram-story-1080x1920.jpg", 92)
print("done")
