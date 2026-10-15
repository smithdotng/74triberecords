"""Procedural inked thumbprint: orientation field (whorl, Sherlock–Monro model) + iterative Gabor growth."""
import numpy as np
from PIL import Image, ImageFilter
from scipy.signal import fftconvolve

def smooth_noise(n, scale, seed):
    rng = np.random.default_rng(seed)
    k = max(2, n // scale)
    small = rng.standard_normal((k, k))
    img = Image.fromarray(((small - small.min()) / np.ptp(small) * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC)
    return np.asarray(img).astype(float) / 255 - 0.5

def orientation(n):
    y, x = np.mgrid[0:n, 0:n].astype(float) / n
    z = (x - 0.5) + 1j * (y - 0.5)
    # whorl: two cores close together, two deltas low on either side
    cores = [complex(-0.03, -0.07), complex(0.03, -0.03)]
    deltas = [complex(-0.30, 0.22), complex(0.30, 0.25)]
    th = np.zeros_like(x)
    for c in cores:
        th += np.angle(z - c)
    for d in deltas:
        th -= np.angle(z - d)
    return 0.5 * th + np.pi / 2

def gabor(theta, freq, sigma=3.6, size=19):
    h = size // 2
    y, x = np.mgrid[-h:h + 1, -h:h + 1].astype(float)
    xr = x * np.cos(theta) + y * np.sin(theta)
    g = np.exp(-(x ** 2 + y ** 2) / (2 * sigma ** 2)) * np.cos(2 * np.pi * freq * xr)
    return g - g.mean()

def thumbprint(size=900, seed=74, period=11.0, iters=7):
    n = size
    rng = np.random.default_rng(seed)
    th = orientation(n) + 0.12 * smooth_noise(n, 25, seed + 9)
    bins = 24
    q = np.round((th % np.pi) / np.pi * bins).astype(int) % bins
    kernels = [gabor(np.pi * b / bins, 1 / period) for b in range(bins)]
    img = rng.standard_normal((n, n))
    for _ in range(iters):
        out = np.zeros_like(img)
        for b, k in enumerate(kernels):
            m = q == b
            if m.any():
                out[m] = fftconvolve(img, k, mode="same")[m]
        img = np.tanh(out / (out.std() + 1e-6) * 1.6)
    ridges = np.clip(img * 1.2 + 0.1, 0, 1)
    y, x = np.mgrid[0:n, 0:n].astype(float) / n
    X, Y = x - 0.5, y - 0.52
    ov = np.sqrt((X / 0.36) ** 2 + (np.where(Y > 0, Y / 0.42, Y / 0.44)) ** 2)
    edge = np.clip((1.0 - ov) * 34 + 1.4 * smooth_noise(n, 26, seed + 2), 0, 1)
    pressure = np.clip(1.05 + 1.2 * smooth_noise(n, 60, seed + 3) - 0.45 * ov ** 4, 0, 1)
    a = ridges * edge * np.clip(pressure * 1.4, 0, 1)
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.5))

if __name__ == "__main__":
    import time; t = time.time()
    m = thumbprint(900)
    print("t", round(time.time() - t, 1))
    m.save("thumb_mask.png")
    out = Image.new("RGB", m.size, (243, 239, 230))
    out.paste(Image.new("RGB", m.size, (75, 29, 120)), (0, 0), m)
    out.resize((600, 600)).save("thumb_prev.png")
