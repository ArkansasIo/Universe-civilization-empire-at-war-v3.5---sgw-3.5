"""Procedural galaxy banner art for the 90-galaxy roster.

Six galaxy types x 3 colour variants = 18 banners, 640x320 .webp.
Stars are splatted as particles into an HDR buffer, then layered glows,
dust lanes and nebula gas are added and tone-mapped.

usage: python3 galaxies.py OUT_DIR
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from planets import fbm, smooth, hexc  # shared noise helpers

W, H = 640, 320
SS = 2
NW, NH = W * SS, H * SS
yy, xx = np.mgrid[0:NH, 0:NW]
U = (xx + 0.5 - NW / 2) / (NH / 2)   # -2..2 horizontally
V = (yy + 0.5 - NH / 2) / (NH / 2)   # -1..1 vertically

VARIANTS = [
    # core, arm, knot (star-forming regions), gas
    dict(core='#ffd9a0', arm='#7fc8ff', knot='#ff7aa8', gas='#0f4a52'),
    dict(core='#ffe6b8', arm='#9fb4ff', knot='#ff9a5a', gas='#3a1f5c'),
    dict(core='#fff0c8', arm='#6fe6d8', knot='#ffb06a', gas='#5a2a12'),
]


def col(h):
    return np.array(hexc(h), dtype=float) / 255


def blur(a, r):
    if r <= 0:
        return a
    from scipy.ndimage import gaussian_filter
    return gaussian_filter(a, sigma=(r, r, 0), mode='constant')


def splat(buf, x, y, c, w):
    """x,y in galaxy plane units (U,V space); c (n,3) colour; w (n,) weight."""
    px = ((x * (NH / 2)) + NW / 2).astype(int)
    py = ((y * (NH / 2)) + NH / 2).astype(int)
    ok = (px >= 0) & (px < NW) & (py >= 0) & (py < NH)
    for k in range(3):
        np.add.at(buf[..., k], (py[ok], px[ok]), c[ok, k] * w[ok])


def project(x, y, z, tilt, ang):
    ca, sa = np.cos(ang), np.sin(ang)
    xr, yr = x * ca - y * sa, x * sa + y * ca
    return xr, yr * tilt + z * 0.15


def mix(a, b, t):
    t = np.clip(t, 0, 1)[..., None]
    return a * (1 - t) + b * t


def background(rng, pal, seed):
    p = np.stack([U * 1.3, V * 1.3, np.full_like(U, seed * 0.11)], -1)
    neb = fbm(p, 5, seed + 300)
    img = np.zeros((NH, NW, 3)) + col('#03070d')
    img += col(pal['gas']) * smooth(0.5, 0.85, neb)[..., None] * 0.55
    k = 1400
    stars = np.zeros((NH, NW, 3))
    sx, sy = rng.uniform(-2, 2, k), rng.uniform(-1, 1, k)
    splat(stars, sx, sy, np.tile([[0.85, 0.92, 1.0]], (k, 1)), rng.random(k) ** 4 * 3)
    return img + blur(stars, SS * 0.5)


def arms_galaxy(rng, pal, n_arms, bar, tilt, ang, pitch, size):
    n = 260000
    arm = rng.integers(0, n_arms, n)
    r = rng.gamma(2.0, 0.22, n) * size
    r = r[r < 1.35 * size] if False else r
    theta0 = arm * 2 * np.pi / n_arms
    th = theta0 + np.log(r / (0.08 * size) + 1) / np.tan(pitch)
    if bar:
        # inner region follows a straight bar
        inner = r < 0.28 * size
        th = np.where(inner, theta0, th + 0.0)
    spread = 0.06 + 0.16 * r / size
    th = th + rng.normal(0, 1, n) * spread * (1.4 - 0.6 * (r / size))
    # disk scatter (inter-arm stars)
    disk = rng.random(n) < 0.32
    th = np.where(disk, rng.uniform(0, 2 * np.pi, n), th)
    x, y = r * np.cos(th), r * np.sin(th)
    if bar:
        inner = (r < 0.28 * size) & ~disk
        x = np.where(inner, (rng.random(n) * 2 - 1) * 0.3 * size, x)
        y = np.where(inner, rng.normal(0, 0.075 * size, n), y)
        ca, sa = np.cos(theta0), np.sin(theta0)
        x, y = np.where(inner, x * ca - y * sa, x), np.where(inner, x * sa + y * ca, y)
        bar_mask = inner
    z = rng.normal(0, 0.03 * size, n)
    rn = np.clip(r / size, 0, 1)
    c = mix(col(pal['core'])[None].repeat(n, 0), col(pal['arm'])[None].repeat(n, 0), smooth(0.05, 0.5, rn))
    w = rng.random(n) ** 3 * 0.35 + 0.05
    knots = (~disk) & (rng.random(n) < 0.02) & (rn > 0.2)
    c[knots] = col(pal['knot'])
    w[knots] *= 9
    if bar:
        w = np.where(bar_mask, w * 0.8, w)
    px, py = project(x, y, z, tilt, ang)
    return px, py, c, w, (x, y)


def elliptical(rng, pal, tilt, ang, size):
    n = 220000
    rr = rng.gamma(1.6, 0.13, n) * size
    th = rng.uniform(0, 2 * np.pi, n)
    x = rr * np.cos(th)
    y = rr * np.sin(th) * 0.68
    rn = np.sqrt(x * x + y * y) / size
    c = mix(col('#fff2d6')[None].repeat(n, 0), col(pal['core'])[None].repeat(n, 0), smooth(0, 0.6, rn))
    w = rng.random(n) ** 3 * 0.3 + 0.06
    px, py = project(x, y, np.zeros(n), 1.0, ang)
    # globular clusters
    g = 40
    gx, gy = rng.normal(0, 0.5 * size, g), rng.normal(0, 0.4 * size, g)
    gpx, gpy = project(gx, gy, np.zeros(g), 1.0, ang)
    px, py = np.r_[px, gpx], np.r_[py, gpy]
    c = np.r_[c, np.tile(col('#ffe9c0'), (g, 1))]
    w = np.r_[w, np.full(g, 2.0)]
    return px, py, c, w, None


def ring_galaxy(rng, pal, tilt, ang, size):
    n = 200000
    core = rng.random(n) < 0.35
    r = np.where(core, np.abs(rng.normal(0, 0.12 * size, n)), rng.normal(0.85 * size, 0.07 * size, n))
    th = rng.uniform(0, 2 * np.pi, n)
    x, y = r * np.cos(th), r * np.sin(th)
    c = np.where(core[:, None], col(pal['core']), col(pal['arm']))
    w = rng.random(n) ** 3 * 0.35 + 0.05
    knots = (~core) & (rng.random(n) < 0.02)
    c[knots] = col(pal['knot'])
    w[knots] *= 8
    px, py = project(x, y, rng.normal(0, 0.02, n), tilt, ang)
    return px, py, c, w, None


def irregular(rng, pal, ang, size, seed):
    n = 240000
    x = rng.normal(0, 0.55 * size, n)
    y = rng.normal(0, 0.35 * size, n)
    p = np.stack([x * 2.5, y * 2.5, np.full(n, seed * 0.3)], -1)
    dens = fbm(p, 4, seed + 11)
    keep = rng.random(n) < smooth(0.42, 0.7, dens)
    # rift: dark lane along a wavy line
    rift = np.abs(y - 0.15 * np.sin(x * 3 / size)) < 0.05 * size
    keep &= ~(rift & (rng.random(n) < 0.85))
    x, y, dens = x[keep], y[keep], dens[keep]
    m = len(x)
    c = mix(col(pal['arm'])[None].repeat(m, 0), col(pal['knot'])[None].repeat(m, 0), smooth(0.6, 0.8, dens))
    w = rng.random(m) ** 3 * 1.0 + 0.12
    px, py = project(x, y, np.zeros(m), 1.0, ang)
    return px, py, c, w, None


def dwarf(rng, pal, ang, size, seed):
    n = 30000
    x = rng.normal(0, 0.22 * size, n)
    y = rng.normal(0, 0.16 * size, n)
    c = mix(col(pal['core'])[None].repeat(n, 0), col(pal['arm'])[None].repeat(n, 0), rng.random(n))
    w = rng.random(n) ** 3 * 0.5 + 0.05
    px, py = project(x, y, np.zeros(n), 1.0, ang)
    return px, py, c, w, None


def render(kind, vi, out_dir):
    seed = hash((kind, vi)) % 10000 if False else (sum(map(ord, kind)) * 7 + vi * 131)
    rng = np.random.default_rng(seed)
    pal = VARIANTS[vi]
    img = background(rng, pal, seed)
    ang = rng.uniform(-0.6, 0.6)
    size = 0.95
    gas_extra = 0.0
    if kind == 'spiral':
        px, py, c, w, plane = arms_galaxy(rng, pal, [2, 4, 3][vi], False, rng.uniform(0.42, 0.6), ang, [0.42, 0.3, 0.5][vi], size)
    elif kind == 'barred_spiral':
        px, py, c, w, plane = arms_galaxy(rng, pal, 2, True, rng.uniform(0.5, 0.65), ang, 0.5, size)
    elif kind == 'elliptical':
        px, py, c, w, plane = elliptical(rng, pal, 1, ang * 0.5, 0.9)
    elif kind == 'ring_cluster':
        px, py, c, w, plane = ring_galaxy(rng, pal, rng.uniform(0.5, 0.7), ang, 0.9)
    elif kind == 'irregular_rift':
        px, py, c, w, plane = irregular(rng, pal, ang * 0.5, 0.95, seed)
    else:  # dwarf_nebula
        px, py, c, w, plane = dwarf(rng, pal, ang, 0.8, seed)
        gas_extra = 1.0

    px, py = px * 1.25, py * 1.25
    buf = np.zeros((NH, NW, 3))
    splat(buf, px, py, c, w)
    glow = blur(buf, SS * 0.5) * 1.3 + blur(buf, SS * 2.5) * 0.7 + blur(buf, SS * 10) * 0.45 + blur(buf, SS * 36) * 0.35
    if kind in ('spiral', 'barred_spiral'):
        # dust lanes: darken along noise ridges in the disk
        p = np.stack([U * 3, V * 6, np.full_like(U, seed)], -1)
        dust = smooth(0.55, 0.75, fbm(p, 5, seed + 70))
        r2 = (U ** 2 + (V / 0.55) ** 2)
        glow *= (1 - dust * smooth(0.9, 0.05, r2) * smooth(0.0, 0.03, r2) * 0.55)[..., None]
    if gas_extra:
        p = np.stack([U * 1.6, V * 1.6, np.full_like(U, seed * 0.2)], -1)
        g1 = smooth(0.45, 0.8, fbm(p, 6, seed + 5))
        g2 = smooth(0.55, 0.85, fbm(p * 1.3 + 2, 6, seed + 6))
        fall = np.exp(-(U ** 2 + V ** 2) / 0.9)
        img += (col(pal['knot']) * g1[..., None] * 0.5 + col(pal['arm']) * g2[..., None] * 0.45) * fall[..., None]
    img = img + glow * 0.75
    vig = 1 - 0.3 * np.clip((U / 2) ** 2 + V ** 2 - 0.3, 0, 1)
    img *= vig[..., None]
    img = 1 - np.exp(-img * 1.25)
    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    path = os.path.join(out_dir, f'{kind}_{vi + 1}.webp')
    out.save(path, 'WEBP', quality=86, method=6)
    return path


KINDS = ['spiral', 'barred_spiral', 'elliptical', 'ring_cluster', 'irregular_rift', 'dwarf_nebula']

if __name__ == '__main__':
    out_dir = sys.argv[1]
    only = sys.argv[2:]
    os.makedirs(out_dir, exist_ok=True)
    for k in KINDS:
        if only and k not in only:
            continue
        for vi in range(3):
            print(render(k, vi, out_dir), flush=True)
