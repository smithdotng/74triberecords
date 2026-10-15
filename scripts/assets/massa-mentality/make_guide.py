from kit import *
from make_all import title_line
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

# ---- SVG logo (outlined Bodoni, so it works without the font installed) ----
def paths(fontfile, text, size, x, y, fill):
    f = TTFont(fontfile); gs = f.getGlyphSet(); cmap = f.getBestCmap(); sc = size / f["head"].unitsPerEm
    out, px = [], 0
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None: continue
        p = SVGPathPen(gs); gs[g].draw(p)
        if p.getCommands(): out.append(f'<path transform="translate({x + px * sc:.2f} {y:.2f}) scale({sc:.5f} {-sc:.5f})" d="{p.getCommands()}" fill="{fill}"/>')
        px += f["hmtx"][g][0]
    return out, px * sc, f
def svg(ink, accent, name):
    disp, ital = os.path.join(FD, "bodoni-display.ttf"), os.path.join(FD, "bodoni-italic.ttf")
    _, w1, f = paths(disp, "Massa", 200, 0, 0, ink); _, w2, _ = paths(disp, "Mentality", 200, 0, 0, ink)
    cap = f["OS/2"].sCapHeight / f["head"].unitsPerEm * 200
    asc = 200 * 0.78
    p1, _, _ = paths(disp, "Massa", 200, 0, asc, ink)
    y2 = asc + 200 * 0.92
    p2, _, _ = paths(disp, "Mentality", 200, 0, y2, ink)
    _, w3, _ = paths(ital, "by Hugo", 84, 0, 0, accent)
    p3, _, _ = paths(ital, "by Hugo", 84, w2 - w3, y2 + 96, accent)
    H = y2 + 120
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 {max(w1, w2) + 12:.0f} {H:.0f}" role="img" aria-label="Massa Mentality by Hugo">' + "".join(p1 + p2 + p3) + "</svg>"
    open(os.path.join(OUT, "logo", name), "w").write(s)
svg("#EEE7D8", "#E1C78F", "massa-mentality-stacked-ivory.svg")
svg("#0C231E", "#967028", "massa-mentality-stacked-ink.svg")

# ---- One-page brand guide ----
W, H = 2400, 1500
c = base(W, H, (0.2, 0.25), 0.6, 0.22)
d = ImageDraw.Draw(c)
M = 110
tb = title_block(560); c.alpha_composite(tb, (M, M))
y = M + tb.height + 50
weave(c, M, y, 220, 8)
d.text((M, y + 40), "Brand guide", font=display(64), fill=IVORY)
d.text((M, y + 130), "Politics, power and the road to 2027.\nHosted by Stanley Ebosie (Hugo).\nA 74 Tribe Studios show.", font=sans(30), fill=SAGE, spacing=12)
m = monogram(300); mask = Image.new("L", (300, 300), 0); ImageDraw.Draw(mask).ellipse((0, 0, 299, 299), fill=255)
c.paste(m, (M, H - M - 300), mask)
d.text((M + 340, H - M - 170), "MM monogram", font=sans_b(28), fill=IVORY)
d.text((M + 340, H - M - 130), "Avatar and watermark", font=sans(24), fill=SAGE)

cx = 900
d.line((cx - 60, M, cx - 60, H - M), fill=SEAM, width=2)
d.text((cx, M), "One family with 74 Tribe Studios", font=display(54), fill=IVORY)
d.text((cx, M + 80), "Massa Mentality uses the studio’s own look — deep malachite, brass and ivory,\nBodoni headlines and the woven aso-oke strip — so the show and the platform\nread as one. Hugo is always lit by a soft brass glow, never boxed in.", font=sans(28), fill=SAGE, spacing=12)

py = M + 290
d.text((cx, py), "Colour", font=sans_b(28), fill=BRASS_SOFT)
sw = [("Malachite", INK, "#0C231E", "Backgrounds"), ("Room", ROOM, "#12322B", "Panels"), ("Brass", BRASS, "#C9A45C", "Accents, rings"),
      ("Brass soft", BRASS_SOFT, "#E1C78F", "“by Hugo”, highlights"), ("Ivory", IVORY, "#EEE7D8", "Titles and text"), ("Sage", SAGE, "#9FB5A8", "Supporting text")]
for i, (n, col, hx, use) in enumerate(sw):
    x = cx + i * 230
    d.rounded_rectangle((x, py + 50, x + 205, py + 200), radius=6, fill=col, outline=SEAM, width=2)
    d.text((x, py + 220), n, font=sans_b(26), fill=IVORY)
    d.text((x, py + 256), hx, font=sans(24), fill=SAGE)
    d.text((x, py + 290), use, font=sans(20), fill=SAGE)
weave(c, cx, py + 345, 400, 10)
d.text((cx + 430, py + 336), "Woven strip — dividers, under titles, never as a background", font=sans(22), fill=SAGE)

ty = py + 430
d.text((cx, ty), "Type", font=sans_b(28), fill=BRASS_SOFT)
d.text((cx, ty + 50), "Bodoni Moda", font=display(96), fill=IVORY)
d.text((cx + 640, ty + 70), "Show name and headlines.\nSentence case, never all caps.", font=sans(24), fill=SAGE, spacing=8)
d.text((cx, ty + 170), "by Hugo", font=italic(84), fill=BRASS_SOFT)
d.text((cx + 340, ty + 190), "Bodoni italic in brass — the host’s\nsignature and the last line of a headline.", font=sans(24), fill=SAGE, spacing=8)
d.text((cx, ty + 290), "Hanken Grotesk", font=sans_b(52), fill=IVORY)
d.text((cx + 450, ty + 300), "Labels, captions, descriptions.", font=sans(24), fill=SAGE)

ry = H - M - 120
d.text((cx, ry), "Do", font=sans_b(28), fill=BRASS_SOFT)
d.text((cx, ry + 40), "Keep Hugo on the right with the glow behind him.\nLeave space — the dark is part of the look.", font=sans(24), fill=IVORY, spacing=8)
d.text((cx + 760, ry), "Don’t", font=sans_b(28), fill=BRASS_SOFT)
d.text((cx + 760, ry + 40), "Use party colours, flags or candidate logos.\nPut text over Hugo’s face. Recolour the woven strip.", font=sans(24), fill=IVORY, spacing=8)
grain(c, 0.015).save(os.path.join(OUT, "logo", "massa-mentality-brand-guide.png"), optimize=True)
grain(c, 0.015).resize((1200, 750)).save("guide_prev.png")
