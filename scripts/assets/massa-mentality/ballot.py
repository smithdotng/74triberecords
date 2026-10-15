"""Election illustration in the 74 Tribe house style: ballot box, inked ballot, woven-strip confetti."""
import math, random, os
from PIL import Image, ImageDraw, ImageFilter
from kit import INK, ROOM, SEAM, BRASS, BRASS_SOFT, IVORY, SAGE, EMBER, display_sb, sans, HERE

PRINT = Image.open(os.path.join(HERE, "print_small.png")).convert("L")
PRINT = PRINT.crop(PRINT.point(lambda v: 255 if v > 20 else 0).getbbox())
CONFETTI = [BRASS, BRASS_SOFT, EMBER, SAGE, BRASS, IVORY]

def _paper(w, h):
    """An ivory ballot paper: header, candidate rows, one row marked with an inked thumb."""
    p = Image.new("RGBA", (w, h), IVORY + (255,))
    d = ImageDraw.Draw(p)
    d.rectangle((0, 0, w - 1, h - 1), outline=(200, 190, 170), width=3)
    d.rectangle((24, 24, w - 24, 64), fill=(220, 210, 188))
    rows, top = 4, 90
    rh = (h - top - 30) // rows
    for i in range(rows):
        y = top + i * rh
        d.rectangle((24, y + 10, 24 + rh - 26, y + rh - 16), outline=(150, 140, 120), width=3)   # emblem box
        d.rectangle((24 + rh, y + rh // 2 - 8, w - 120, y + rh // 2 + 2), fill=(200, 190, 170))  # name line
        d.rectangle((w - 96, y + 10, w - 26, y + rh - 16), outline=(150, 140, 120), width=3)     # thumb box
    # the vote: an inked thumbprint pressed into row 2's box
    y = top + 1 * rh
    bw, bh = 70, rh - 26
    pr = PRINT.resize((int(bw * 1.25), int(bh * 1.15)), Image.LANCZOS).rotate(-12, expand=True, resample=Image.BICUBIC)
    ink = Image.new("RGBA", pr.size, (60, 30, 95, 255)); ink.putalpha(pr)
    p.alpha_composite(ink, (w - 96 + (bw - pr.width) // 2, y + 10 + (bh - pr.height) // 2))
    return p

def ballot_art(width, seed=7, confetti=True):
    S = 2  # supersample
    W, H = 1000 * S, 1150 * S
    c = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(c)
    k = lambda pts: [(x * S, y * S) for x, y in pts]

    # ---- confetti: woven-strip pieces bursting from the slot ----
    rnd = random.Random(seed)
    pieces = []
    for _ in range(46):
        ang = rnd.uniform(-160, -20) * math.pi / 180
        dist = rnd.uniform(140, 520)
        cx, cy = 540 + math.cos(ang) * dist, 470 + math.sin(ang) * dist * 0.95
        pieces.append((cx, cy, rnd.uniform(26, 78), rnd.uniform(8, 13), rnd.uniform(0, 180), rnd.choice(CONFETTI), rnd.uniform(0.55, 1)))
    def draw_confetti(layer_filter):
        for cx, cy, L, T, rot, col, op in pieces:
            if not layer_filter(cy): continue
            strip = Image.new("RGBA", (int(L * S), int(T * S)), col + (int(255 * op),))
            strip = strip.rotate(rot, expand=True, resample=Image.BICUBIC)
            c.alpha_composite(strip, (int(cx * S - strip.width / 2), int(cy * S - strip.height / 2)))
    if confetti:
        draw_confetti(lambda y: True)

    # ---- the box (2.5D) ----
    front = [(170, 600), (800, 600), (800, 1110), (170, 1110)]
    side = [(800, 600), (890, 505), (890, 1015), (800, 1110)]
    lid = [(170, 600), (800, 600), (890, 505), (260, 505)]
    d.polygon(k(side), fill=(9, 27, 22))
    d.polygon(k(front), fill=ROOM)
    d.polygon(k(lid), fill=(32, 76, 63))
    for poly in (front, side, lid):
        d.line(k(poly + [poly[0]]), fill=BRASS, width=5 * S, joint="curve")
    # front: inset frame + 2027
    d.rectangle(k([(210, 650), (760, 1070)]), outline=SEAM, width=3 * S)
    f = display_sb(250 * S)
    d.text((485 * S, 870 * S), "2027", font=f, fill=BRASS_SOFT, anchor="mm")
    # weave band across the top of the front
    from kit import WEAVE
    x0, x1, yb = 210, 760, 625
    for a, b, col in WEAVE:
        d.rectangle(k([(x0 + (x1 - x0) * a / 100, yb), (x0 + (x1 - x0) * b / 100 - 1, yb + 9)]), fill=col)

    # ---- ballot paper sliding into the slot ----
    pw, ph = 330, 430
    paper = _paper(pw * S, ph * S).rotate(8, expand=True, resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    px, py = 560 - paper.width // (2 * S), 545 - int(paper.height / S * 0.93)
    # clip the paper at the slot line so it looks half-inserted
    slot_y = 556
    mask = Image.new("L", paper.size, 255)
    ImageDraw.Draw(mask).rectangle((0, (slot_y - py) * S, paper.width, paper.height), fill=0)
    clipped = paper.copy(); clipped.putalpha(Image.composite(paper.getchannel("A"), Image.new("L", paper.size, 0), mask))
    sh = Image.new("RGBA", paper.size, (0, 0, 0, 0)); sh.putalpha(clipped.getchannel("A").filter(ImageFilter.GaussianBlur(14 * S)).point(lambda v: v * 110 // 255))
    c.alpha_composite(sh, (px * S + 14 * S, py * S + 10 * S))
    c.alpha_composite(clipped, (px * S, py * S))
    # slot (drawn after the paper so the paper disappears into it)
    slot = [(380, 566), (700, 566), (740, 540), (420, 540)]
    d = ImageDraw.Draw(c)
    d.polygon(k(slot), fill=(4, 14, 11))
    d.line(k(slot + [slot[0]]), fill=BRASS, width=3 * S)

    out = c.resize((W // S, H // S), Image.LANCZOS)
    s = width / out.width
    return out.resize((width, int(out.height * s)), Image.LANCZOS)

if __name__ == "__main__":
    from kit import base
    a = ballot_art(800)
    bg = base(1000, 1100, (0.55, 0.45), 0.7, 0.34)
    bg.alpha_composite(a, (100, 60))
    bg.convert("RGB").save("ballot_prev.png")
