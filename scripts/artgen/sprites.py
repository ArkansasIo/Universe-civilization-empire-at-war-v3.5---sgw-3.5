"""Transparent sprites reused by the page banners (scenes.py).

planets/<biome>.png       RGBA, lit planet with atmosphere glow
galaxies/<kind>_<v>.png   RGB emissive on black (composite with screen blend)
stations/<form>_<theme>.png RGBA guardian/station machines

usage: python3 sprites.py OUT_DIR
"""
import sys, os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import planets as P
import galaxies as G
import bosses as B


def planet_sprite(name, fn, seed, rings, out):
    rng = np.random.default_rng(seed)
    cx, cy = 0.0, 0.0
    r = 0.56 if rings else 0.74
    img = np.zeros((P.N, P.N, 3))
    alpha = np.zeros((P.N, P.N))
    rot = (rng.uniform(0, 6.28), rng.uniform(-0.35, 0.35))
    mask, d2, n, obj = P.sphere(cx, cy, r, rot)
    if rings:
        rc, ra = P.ring_layer(cx, cy, r, front=False)
        img = rc * ra[..., None]; alpha = ra.copy()
    col, cl, atm = fn(n, obj, seed)
    if cl is not None:
        cl_col = P.shade(n, np.ones_like(col) * 0.97)
        col = col * (1 - cl[..., None] * 0.92) + cl_col * cl[..., None] * 0.92
    edge = P.smooth(1.0, 0.985, np.sqrt(d2))
    img = img * (1 - edge[..., None]) + col * edge[..., None]
    alpha = np.maximum(alpha, edge)
    # atmosphere glow as additive colour with its own alpha
    glow = P.atmosphere(np.zeros_like(img), cx, cy, r, atm, 1.0 if fn not in (P.b_metal, P.b_crystal) else 0.55)
    img = img + glow
    alpha = np.clip(np.maximum(alpha, glow.max(-1) * 1.2), 0, 1)
    if rings:
        rc, ra = P.ring_layer(cx, cy, r, front=True)
        img = img * (1 - ra[..., None]) + rc * ra[..., None]
        alpha = np.maximum(alpha, ra)
    img = 1 - np.exp(-img * 1.35)
    # un-premultiply-ish: colour where alpha is small stays glow colour
    rgba = np.dstack([np.clip(img, 0, 1), alpha])
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(out, 'planets', f'{name}.png'))


def galaxy_sprite(kind, vi, out):
    seed = sum(map(ord, kind)) * 7 + vi * 131
    rng = np.random.default_rng(seed)
    pal = G.VARIANTS[vi]
    ang = rng.uniform(-0.6, 0.6)
    if kind == 'spiral':
        px, py, c, w, _ = G.arms_galaxy(rng, pal, [2, 4, 3][vi], False, rng.uniform(0.42, 0.6), ang, [0.42, 0.3, 0.5][vi], 0.95)
    elif kind == 'barred_spiral':
        px, py, c, w, _ = G.arms_galaxy(rng, pal, 2, True, rng.uniform(0.5, 0.65), ang, 0.5, 0.95)
    elif kind == 'elliptical':
        px, py, c, w, _ = G.elliptical(rng, pal, 1, ang * 0.5, 0.9)
    else:
        px, py, c, w, _ = G.ring_galaxy(rng, pal, rng.uniform(0.5, 0.7), ang, 0.9)
    px, py = px * 1.25, py * 1.25
    buf = np.zeros((G.NH, G.NW, 3))
    G.splat(buf, px, py, c, w)
    glow = G.blur(buf, G.SS * 0.5) * 1.3 + G.blur(buf, G.SS * 2.5) * 0.7 + G.blur(buf, G.SS * 10) * 0.45 + G.blur(buf, G.SS * 36) * 0.35
    img = 1 - np.exp(-glow * 0.75 * 1.25)
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((G.W, G.H), Image.LANCZOS).save(
        os.path.join(out, 'galaxies', f'{kind}_{vi + 1}.png'))


def station_sprite(form, theme_name, seed, out):
    rng = np.random.default_rng(seed)
    theme = B.THEMES[theme_name]
    H, Gm, core, sq = B.FORMS[form](rng)
    H = gaussian_filter(H, B.SS * 1.2)
    X, Y, N = B.X, B.Y, B.N
    body = B.smooth(0.05, 0.12, H)
    f1, f2, cid = B.cells(np.stack([X * 9, Y * 9, np.full_like(X, seed * 0.01)], -1), seed)
    panel = B.smooth(0.05, 0.0, f2 - f1) * body
    H = H - panel * 0.035
    lights = B.smooth(0.06, 0.0, f1) * (cid > 0.82) * body
    Gm = Gm + lights * 1.2 + panel * (cid > 0.93) * 0.6
    det = B.fbm(np.stack([X * 14, Y * 14, np.full_like(X, seed * 0.07)], -1), 3, seed) - 0.5
    Hs = H + det * 0.03 * (H > 0.05)
    gy, gx = np.gradient(Hs * N * 0.05)
    nrm = np.stack([-gx, gy, np.ones_like(gx)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    ndl = np.clip(nrm @ B.LIGHT, 0, 1)
    hv = (B.LIGHT + [0, 0, 1]); hv = hv / np.linalg.norm(hv)
    spec = np.clip(nrm @ hv, 0, 1) ** 28
    m0, m1, m2 = (B.c(h) for h in theme['metal'])
    t = np.clip(H * 0.85 + det * 0.8 - panel * 0.35, 0, 1)
    alb = np.where(t[..., None] < 0.5, m0 + (m1 - m0) * (t[..., None] / 0.5), m1 + (m2 - m1) * ((t[..., None] - 0.5) / 0.5))
    lit = alb * (0.06 + 1.25 * ndl[..., None] ** 1.3) + spec[..., None] * 0.7
    mask = B.smooth(0.02, 0.06, H)
    glow_c, hot = B.c(theme['glow']), B.c(theme['hot'])
    Gm = np.clip(Gm, 0, 1) * B.smooth(0.0, 0.05, H + 0.05)
    em = Gm[..., None] * glow_c * 1.4 + core[..., None] * (glow_c * 1.5 + hot * core[..., None] * 1.6)
    bloom = gaussian_filter(em, (B.SS * 6, B.SS * 6, 0)) * 1.2 + gaussian_filter(em, (B.SS * 18, B.SS * 18, 0)) * 0.7
    col = lit * mask[..., None] + em + bloom
    alpha = np.clip(np.maximum(mask, (em + bloom).max(-1)), 0, 1)
    col = 1 - np.exp(-col * 1.3)
    rgba = np.dstack([np.clip(col, 0, 1), alpha])
    Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').resize((512, 512), Image.LANCZOS).save(
        os.path.join(out, 'stations', f'{form}_{theme_name}.png'))


if __name__ == '__main__':
    out = sys.argv[1]
    which = set(sys.argv[2:])
    for d in ('planets', 'galaxies', 'stations'):
        os.makedirs(os.path.join(out, d), exist_ok=True)
    if not which or 'planets' in which:
        for name, fn, seed, rings in P.BIOMES:
            planet_sprite(name, fn, seed, rings, out); print('planet', name, flush=True)
    if not which or 'galaxies' in which:
        for k in ('spiral', 'barred_spiral', 'elliptical', 'ring_cluster'):
            for vi in range(3):
                galaxy_sprite(k, vi, out); print('galaxy', k, vi, flush=True)
    if not which or 'stations' in which:
        combos = [('ring', 'iron'), ('ring', 'chrono'), ('ring', 'gold'), ('ring', 'storm'), ('star', 'chrono'),
                  ('star', 'fire'), ('star', 'void'), ('spire', 'iron'), ('spire', 'gold'), ('spire', 'chrono'),
                  ('maw', 'void'), ('maw', 'fire')]
        for i, (f, t) in enumerate(combos):
            station_sprite(f, t, 500 + i * 37, out); print('station', f, t, flush=True)
