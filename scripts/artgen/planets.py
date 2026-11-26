"""Procedural planet card art for the 10 galaxy-view biomes.

Renders each planet as a lit 3D sphere with fractal noise surfaces, an
atmosphere rim and a teal/orange nebula backdrop that matches the game's
existing card art. Output: 512x512 .webp files.

usage: python3 planets.py OUT_DIR
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

SS = 2                      # supersampling factor
SIZE = 512
N = SIZE * SS


# ---------------------------------------------------------------- noise
def _hash(ix, iy, iz, seed):
    h = (ix * 374761393 + iy * 668265263 + iz * 2147483647 + seed * 144665) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = h ^ (h >> 16)
    return (h & 0xFFFF) / 65535.0


def vnoise(p, seed=0):
    """3D value noise, p shape (..., 3). Returns [0,1]."""
    pi = np.floor(p).astype(np.int64)
    pf = p - pi
    u = pf * pf * (3 - 2 * pf)
    res = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (u[..., 0] if dx else 1 - u[..., 0]) * \
                    (u[..., 1] if dy else 1 - u[..., 1]) * \
                    (u[..., 2] if dz else 1 - u[..., 2])
                res = res + w * _hash(pi[..., 0] + dx, pi[..., 1] + dy, pi[..., 2] + dz, seed)
    return res


def fbm(p, octaves=6, seed=0, lac=2.0, gain=0.5):
    amp, tot, norm = 1.0, 0.0, 0.0
    for o in range(octaves):
        tot = tot + amp * vnoise(p, seed + o * 17)
        norm += amp
        amp *= gain
        p = p * lac + 3.17
    return tot / norm


def ridged(p, octaves=5, seed=0):
    amp, tot, norm = 1.0, 0.0, 0.0
    for o in range(octaves):
        n = 1 - np.abs(vnoise(p, seed + o * 31) * 2 - 1)
        tot = tot + amp * n * n
        norm += amp
        amp *= 0.5
        p = p * 2.1 + 1.7
    return tot / norm


def cells(p, seed=0):
    """Cheap Worley-style distance to nearest jittered cell point (F1, F2) and cell id."""
    pi = np.floor(p).astype(np.int64)
    f1 = np.full(p.shape[:-1], 9.0)
    f2 = np.full(p.shape[:-1], 9.0)
    cid = np.zeros(p.shape[:-1])
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for dz in (-1, 0, 1):
                c = pi + np.array([dx, dy, dz])
                jit = np.stack([_hash(c[..., 0], c[..., 1], c[..., 2], seed + k) for k in range(3)], -1)
                d = np.linalg.norm(c + jit - p, axis=-1)
                idv = _hash(c[..., 0], c[..., 1], c[..., 2], seed + 99)
                closer = d < f1
                f2 = np.where(closer, f1, np.minimum(f2, d))
                cid = np.where(closer, idv, cid)
                f1 = np.where(closer, d, f1)
    return f1, f2, cid


def ramp(t, stops):
    """stops: list of (pos, (r,g,b) 0-255). t array -> (...,3) float 0-1."""
    t = np.clip(t, 0, 1)
    xs = np.array([s[0] for s in stops])
    cs = np.array([s[1] for s in stops], dtype=float) / 255
    return np.stack([np.interp(t, xs, cs[:, k]) for k in range(3)], -1)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- scene
yy, xx = np.mgrid[0:N, 0:N]
X = (xx + 0.5) / N * 2 - 1
Y = 1 - (yy + 0.5) / N * 2


def backdrop(seed):
    p = np.stack([X * 2.2, Y * 2.2, np.full_like(X, seed * 0.37)], -1)
    neb = fbm(p, 5, seed + 500)
    neb2 = fbm(p * 1.7 + 4, 4, seed + 600)
    base = np.array(hexc('#050b13')) / 255
    teal = np.array(hexc('#0f4a52')) / 255
    amber = np.array(hexc('#7a3a12')) / 255
    img = base + teal[None, None] * smooth(0.45, 0.8, neb)[..., None] * 0.9
    img = img + amber[None, None] * smooth(0.6, 0.85, neb2)[..., None] * 0.55
    rng = np.random.default_rng(seed)
    stars = np.zeros((N, N))
    k = 900
    sx, sy = rng.integers(0, N, k), rng.integers(0, N, k)
    stars[sy, sx] = rng.random(k) ** 3 * 1.6
    star_img = Image.fromarray((np.clip(stars, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SS * 0.6))
    st = np.asarray(star_img, dtype=float) / 255 * 2.2
    img = img + st[..., None] * np.array([0.85, 0.95, 1.0])
    return img


def sphere(cx, cy, r, rot):
    dx, dy = (X - cx) / r, (Y - cy) / r
    d2 = dx * dx + dy * dy
    mask = d2 <= 1
    dz = np.sqrt(np.clip(1 - d2, 0, 1))
    n = np.stack([dx, dy, dz], -1)
    # rotate object-space sampling coords (yaw then tilt)
    a, b = rot
    ca, sa, cb, sb = np.cos(a), np.sin(a), np.cos(b), np.sin(b)
    Ry = np.array([[ca, 0, sa], [0, 1, 0], [-sa, 0, ca]])
    Rx = np.array([[1, 0, 0], [0, cb, -sb], [0, sb, cb]])
    obj = n @ (Rx @ Ry).T
    return mask, d2, n, obj


LIGHT = np.array([-0.80, 0.42, 0.42])
LIGHT = LIGHT / np.linalg.norm(LIGHT)
VIEW = np.array([0, 0, 1.0])


def shade(n, albedo, spec=0.0, rough=24, emissive=None, night=None):
    ndl = n @ LIGHT
    diff = smooth(-0.12, 0.45, ndl)[..., None] * np.clip(ndl * 0.75 + 0.45, 0, 1)[..., None]
    col = albedo * (0.04 + 1.05 * diff)
    if np.ndim(spec) or spec > 0:
        h = LIGHT + VIEW
        h = h / np.linalg.norm(h)
        s = np.clip(n @ h, 0, 1) ** rough
        sp = s * (spec if np.ndim(spec) == 0 else spec)
        col = col + (sp * (ndl > 0))[..., None] * np.array([1.0, 0.92, 0.8])
    if emissive is not None:
        dark = 1 - smooth(-0.15, 0.35, ndl)
        col = col + emissive * (0.35 + 0.9 * dark)[..., None]
    return col


def atmosphere(img, cx, cy, r, color, strength=1.0, width=0.09):
    dx, dy = (X - cx) / r, (Y - cy) / r
    d = np.sqrt(dx * dx + dy * dy)
    c = np.array(hexc(color)) / 255
    # light-facing factor for the rim
    lf = np.clip((dx * LIGHT[0] + dy * LIGHT[1]) / np.maximum(d, 1e-6) * 0.7 + 0.45, 0.05, 1)
    outer = np.exp(-np.clip(d - 1, 0, None) / width) * (d >= 1)
    inner = smooth(0.78, 1.0, d) * (d < 1)
    g = (outer * 0.9 + inner * 0.55) * lf * strength
    return img + g[..., None] * c


# ---------------------------------------------------------------- biomes
def b_terrestrial(n, obj, s):
    h = fbm(obj * 1.6 + s, 7, s)
    land = smooth(0.50, 0.53, h)
    lat = np.abs(obj[..., 1])
    ocean = ramp(h / 0.52, [(0, hexc('#06204a')), (0.85, hexc('#0d4f8a')), (1, hexc('#2a86b8'))])
    landc = ramp((h - 0.52) / 0.3, [(0, hexc('#c9b27a')), (0.08, hexc('#4f7a2c')), (0.45, hexc('#365a22')),
                                    (0.75, hexc('#7a6845')), (1, hexc('#d8d0c0'))])
    alb = ocean * (1 - land[..., None]) + landc * land[..., None]
    ice = smooth(0.78, 0.86, lat + (fbm(obj * 3, 3, s + 7) - 0.5) * 0.15)
    alb = alb * (1 - ice[..., None]) + np.array([0.93, 0.96, 1.0]) * ice[..., None]
    col = shade(n, alb, spec=(1 - land) * (1 - ice) * 0.6, rough=40)
    return col, clouds(obj, s, 0.55), '#6fb6ff'


def clouds(obj, s, cover, swirl=1.0):
    w = obj + (np.stack([fbm(obj * 2 + 9, 3, s + 40), fbm(obj * 2 + 3, 3, s + 41), fbm(obj * 2 + 5, 3, s + 42)], -1) - 0.5) * swirl
    c = fbm(w * 2.4, 6, s + 50)
    return smooth(cover, cover + 0.14, c)


def b_desert(n, obj, s):
    warp = fbm(obj * 2 + s, 4, s) * 2
    dunes = np.sin((obj[..., 1] * 18 + warp * 6)) * 0.5 + 0.5
    h = fbm(obj * 2.2 + s, 6, s + 3)
    rock = smooth(0.62, 0.7, h)
    alb = ramp(h * 0.7 + dunes * 0.3, [(0, hexc('#8a4a1e')), (0.4, hexc('#c27a3a')), (0.7, hexc('#e0a865')), (1, hexc('#f3d39a'))])
    alb = alb * (1 - rock[..., None] * 0.55) + np.array(hexc('#5a3018')) / 255 * rock[..., None] * 0.55
    canyon = smooth(0.82, 0.9, ridged(obj * 2.5, 4, s + 8))
    alb = alb * (1 - canyon[..., None] * 0.6)
    col = shade(n, alb)
    return col, clouds(obj, s, 0.78, 0.6) * 0.5, '#f0a35a'


def b_ice(n, obj, s):
    h = fbm(obj * 2 + s, 6, s)
    cracks = smooth(0.72, 0.9, ridged(obj * 3.2, 5, s + 2))
    alb = ramp(h, [(0, hexc('#5f9ec0')), (0.45, hexc('#a9d4e8')), (0.75, hexc('#e3f3fa')), (1, hexc('#ffffff'))])
    alb = alb * (1 - cracks[..., None]) + np.array(hexc('#2b6f95')) / 255 * cracks[..., None]
    col = shade(n, alb, spec=0.45, rough=30)
    return col, clouds(obj, s, 0.72) * 0.45, '#9fe6ff'


def b_volcanic(n, obj, s):
    h = fbm(obj * 2 + s, 6, s)
    r = ridged(obj * 2.6, 5, s + 4)
    lava = smooth(0.62, 0.86, r) * smooth(0.25, 0.5, h)
    alb = ramp(h, [(0, hexc('#1a1414')), (0.5, hexc('#3d2e29')), (1, hexc('#6a554a'))])
    em = ramp(lava, [(0, (0, 0, 0)), (0.3, hexc('#a3260a')), (0.7, hexc('#ff6a12')), (1, hexc('#ffe08a'))]) * lava[..., None] * 2.2
    col = shade(n, alb * (1 - lava[..., None]), emissive=em)
    return col, clouds(obj, s, 0.70, 0.8) * 0.35, '#ff6a2a'


def b_ocean(n, obj, s):
    h = fbm(obj * 1.8 + s, 7, s)
    land = smooth(0.66, 0.68, h)
    ocean = ramp(h / 0.66, [(0, hexc('#041a3d')), (0.7, hexc('#0a3f7a')), (1, hexc('#1f9ac0'))])
    landc = ramp((h - 0.66) / 0.15, [(0, hexc('#e8d9a6')), (0.3, hexc('#3f7f3a')), (1, hexc('#2c5e2a'))])
    alb = ocean * (1 - land[..., None]) + landc * land[..., None]
    col = shade(n, alb, spec=(1 - land) * 0.9, rough=55)
    return col, clouds(obj, s, 0.56, 1.3), '#4fa8ff'


def b_gas(n, obj, s):
    lat = obj[..., 1]
    turb = fbm(obj * np.array([1.0, 3.0, 1.0]) * 2.5 + s, 6, s)
    band = lat * 7 + (turb - 0.5) * 2.2
    t = np.sin(band * 2.3) * 0.25 + np.sin(band * 5.1 + 1) * 0.15 + 0.5 + (turb - 0.5) * 0.4
    alb = ramp(t, [(0, hexc('#3a1f5c')), (0.3, hexc('#7d4a8e')), (0.55, hexc('#d29b7a')), (0.75, hexc('#f0d4b0')), (1, hexc('#b56a4f'))])
    # storm
    sp = np.array([0.45, -0.28, 0.85]); sp /= np.linalg.norm(sp)
    d = np.linalg.norm(obj - sp, axis=-1)
    storm = smooth(0.24, 0.12, d)
    alb = alb * (1 - storm[..., None] * 0.7) + np.array(hexc('#c2462a')) / 255 * storm[..., None] * 0.7
    col = shade(n, alb)
    return col, None, '#c9a2ff'


def b_jungle(n, obj, s):
    h = fbm(obj * 3 + s, 7, s)
    river = smooth(0.93, 0.98, ridged(obj * 2.2, 4, s + 6)) * smooth(0.4, 0.5, h)
    water = smooth(0.40, 0.38, h)
    alb = ramp(h, [(0, hexc('#0b3a1c')), (0.45, hexc('#1f6b26')), (0.65, hexc('#3f8d2a')), (0.85, hexc('#7aa23a')), (1, hexc('#a89a5a'))])
    wcol = np.array(hexc('#0d3d52')) / 255
    wm = np.clip(river + water, 0, 1)[..., None]
    alb = alb * (1 - wm) + wcol * wm
    col = shade(n, alb, spec=wm[..., 0] * 0.5, rough=40)
    return col, clouds(obj, s, 0.60, 1.0) * 0.75, '#7fe0a0'


def b_tomb(n, obj, s):
    h = fbm(obj * 2.2 + s, 6, s)
    f1, f2, _ = cells(obj * 3.5, s + 3)
    crater = smooth(0.32, 0.18, f1) * 0.5
    rim = smooth(0.30, 0.36, f1) * smooth(0.42, 0.36, f1)
    alb = ramp(h, [(0, hexc('#2c2a2a')), (0.5, hexc('#5c5852')), (1, hexc('#8d877c'))])
    alb = alb * (1 - crater[..., None]) + rim[..., None] * 0.12
    # dormant precursor grid: faint glowing lines along lat/long
    lon = np.arctan2(obj[..., 0], obj[..., 2])
    lat = np.arcsin(np.clip(obj[..., 1], -1, 1))
    g = np.maximum(smooth(0.035, 0.0, np.abs(np.sin(lon * 6))), smooth(0.035, 0.0, np.abs(np.sin(lat * 6))))
    zone = smooth(0.45, 0.62, fbm(obj * 1.5, 3, s + 9))
    em = np.array(hexc('#3ee0c8')) / 255 * (g * zone)[..., None] * 1.6
    col = shade(n, alb, emissive=em)
    return col, clouds(obj, s, 0.80, 0.5) * 0.3, '#a8b3a0'


def b_metal(n, obj, s):
    f1, f2, cid = cells(obj * 6, s)
    edge = smooth(0.045, 0.0, f2 - f1)
    h = fbm(obj * 4 + s, 5, s + 2)
    rust = smooth(0.62, 0.75, fbm(obj * 2.5, 4, s + 5))
    plate = ramp(cid * 0.5 + h * 0.5, [(0, hexc('#25272b')), (0.5, hexc('#5a5e66')), (1, hexc('#9aa0a8'))])
    rustc = ramp(h, [(0, hexc('#5c2510')), (1, hexc('#b0521f'))])
    alb = plate * (1 - rust[..., None]) + rustc * rust[..., None]
    alb = alb * (1 - edge[..., None] * 0.7)
    em = np.array(hexc('#ff8a2a')) / 255 * (edge * smooth(0.45, 0.75, cid))[..., None] * 1.6
    col = shade(n, alb, spec=(1 - rust) * 0.7, rough=18, emissive=em)
    return col, None, '#ffb070'


def b_crystal(n, obj, s):
    f1, f2, cid = cells(obj * 5, s)
    edge = smooth(0.05, 0.0, f2 - f1)
    h = fbm(obj * 2 + s, 5, s + 1)
    alb = ramp(cid * 0.6 + h * 0.4, [(0, hexc('#1c1650')), (0.35, hexc('#3b3aa8')), (0.7, hexc('#7a6be0')), (1, hexc('#c8b8ff'))])
    # faceted normals: perturb per cell
    jit = np.stack([_hash((cid * 1e4).astype(np.int64), 1, 2, s + k) - 0.5 for k in range(3)], -1) * 0.6
    nf = n + jit
    nf = nf / np.linalg.norm(nf, axis=-1, keepdims=True)
    em = np.array(hexc('#9be7ff')) / 255 * edge[..., None] * 1.3
    col = shade(nf, alb, spec=1.1, rough=60, emissive=em)
    return col, None, '#a99bff'


BIOMES = [
    ('terrestrial', b_terrestrial, 11, False),
    ('desert', b_desert, 23, False),
    ('ice', b_ice, 37, False),
    ('volcanic', b_volcanic, 41, False),
    ('ocean', b_ocean, 53, False),
    ('gas_giant', b_gas, 67, True),
    ('jungle', b_jungle, 71, False),
    ('tomb_world', b_tomb, 83, False),
    ('metallic', b_metal, 97, False),
    ('crystalline', b_crystal, 101, False),
]


def ring_layer(cx, cy, r, front):
    """Planetary ring as an ellipse band; front=True returns the half in front of the planet."""
    tilt = 0.28
    ang = -0.32
    ca, sa = np.cos(ang), np.sin(ang)
    u = ((X - cx) * ca - (Y - cy) * sa) / r
    v = ((X - cx) * sa + (Y - cy) * ca) / r
    e = np.sqrt(u * u + (v / tilt) ** 2)
    band = smooth(1.30, 1.36, e) * smooth(2.05, 1.95, e)
    gaps = 0.65 + 0.35 * np.sin(e * 55) * np.sin(e * 13 + 1)
    gaps = gaps * (1 - smooth(1.62, 1.6, e) * smooth(1.66, 1.64, e) * 0.9)
    infront = v < 0
    sel = infront if front else ~infront
    a = band * gaps * sel * 0.85
    col = ramp((e - 1.3) / 0.75, [(0, hexc('#e8c9a0')), (0.5, hexc('#b08a6a')), (1, hexc('#6c5a6e'))])
    lit = np.clip(0.4 + 0.6 * smooth(-1, 1, -u * 0.8 + 0.2), 0, 1)
    return col * lit[..., None], a


def render(name, fn, seed, rings, out_dir):
    rng = np.random.default_rng(seed)
    cx, cy = 0.04, -0.02
    r = 0.56 if rings else 0.66
    img = backdrop(seed)
    rot = (rng.uniform(0, 6.28), rng.uniform(-0.35, 0.35))
    mask, d2, n, obj = sphere(cx, cy, r, rot)
    if rings:
        rc, ra = ring_layer(cx, cy, r, front=False)
        img = img * (1 - ra[..., None]) + rc * ra[..., None]
    col, cl, atm = fn(n, obj, seed)
    if cl is not None:
        cl_col = shade(n, np.ones_like(col) * 0.97)
        col = col * (1 - cl[..., None] * 0.92) + cl_col * cl[..., None] * 0.92
    # soft edge anti-alias
    edge = smooth(1.0, 0.985, np.sqrt(d2))[..., None]
    img = img * (1 - edge) + col * edge
    img = atmosphere(img, cx, cy, r, atm, 1.0 if fn not in (b_metal, b_crystal) else 0.55)
    if rings:
        # planet shadow on the front ring is skipped; front ring drawn over the planet
        rc, ra = ring_layer(cx, cy, r, front=True)
        img = img * (1 - ra[..., None]) + rc * ra[..., None]
    # gentle vignette + tone map
    vig = 1 - 0.35 * np.clip(X * X + Y * Y - 0.4, 0, 1)
    img = img * vig[..., None]
    img = 1 - np.exp(-img * 1.35)
    img = np.clip(img ** (1 / 1.05), 0, 1)
    out = Image.fromarray((img * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(out_dir, f'{name}.webp')
    out.save(path, 'WEBP', quality=88, method=6)
    return path


if __name__ == '__main__':
    out_dir = sys.argv[1]
    only = sys.argv[2:]
    os.makedirs(out_dir, exist_ok=True)
    for name, fn, seed, rings in BIOMES:
        if only and name not in only:
            continue
        print(render(name, fn, seed, rings, out_dir), flush=True)
