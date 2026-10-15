from brand import *

def cover(size=3000):
    S = size
    c = Image.new("RGBA", (S, S), PAPER + (255,))
    # giant thumbprint bleeding off the top-right, like an inked vote
    stamp(c, int(S * 0.92), (int(S * 0.66), int(S * 0.36)), VIOLET, rotate=-14)
    d = ImageDraw.Draw(c)
    wm = wordmark(int(S * 0.42), ink=BLACK, sig=VIOLET)
    wm = wm.resize((int(S * 0.84), int(wm.height * S * 0.84 / wm.width)), Image.LANCZOS)
    c.alpha_composite(wm, (int(S * 0.08), int(S * 0.90) - wm.height))
    # top rail: election + studio
    f = sans(int(S * 0.026), 700)
    d.text((int(S * 0.08), int(S * 0.075)), "ROAD TO 2027", font=f, fill=BLACK)
    d.rectangle((int(S * 0.08), int(S * 0.112), int(S * 0.08) + int(S * 0.07), int(S * 0.116)), fill=GREEN)
    f2 = sans(int(S * 0.022), 500)
    d.text((int(S * 0.08), int(S * 0.935)), "A 74 TRIBE STUDIOS SHOW", font=f2, fill=GREY)
    return grain(c, 0.025)

if __name__ == "__main__":
    img = cover(3000)
    save(img, "podcast/massa-mentality-cover-3000.jpg", 92)
    img.resize((900, 900), Image.LANCZOS).save("cover_prev.png")
