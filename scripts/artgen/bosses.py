"""Procedural portraits for the generated galaxy bosses ("automated sector guardians").

Each boss name is "<Element> <Form>", e.g. "Cryo Sentinel". The element word picks
the colour theme, the form word picks one of four machine silhouettes, and the
galaxy number seeds the details. Machines are built as a height field, lit as
bas-relief metal, then given glowing seams and a core over a galaxy backdrop.

usage: python3 bosses.py BOSSES_JSON OUT_DIR [ids...]
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from planets import fbm, smooth, hexc, cells  # noqa: E402

SIZE, SS = 512, 2
N = SIZE * SS
yy, xx = np.mgrid[0:N, 0:N]
X = (xx + 0.5) / N * 2 - 1
Y = 1 - (yy + 0.5) / N * 2


def c(h):
    return np.array(hexc(h), dtype=float) / 255


THEMES = {
    'fire':   dict(metal=('#2a1a16', '#6e4a3a', '#b08060'), glow='#ff6a1a', hot='#ffd27a', gas='#5a1e0c', arm='#ff9a5a'),
    'ice':    dict(metal=('#1a2630', '#4f6b7d', '#a8c4d4'), glow='#5fe0ff', hot='#e6fbff', gas='#0d3a52', arm='#8fd8ff'),
    'void':   dict(metal=('#16121f', '#3d3352', '#7d6e99'), glow='#b45cff', hot='#f0d0ff', gas='#2e1250', arm='#a98cff'),
    'chrono': dict(metal=('#10201f', '#35514d', '#86a8a0'), glow='#3ee0c8', hot='#d8fff6', gas='#0f4a52', arm='#7fe8d8'),
    'storm':  dict(metal=('#141a26', '#3a4a66', '#8ea4c8'), glow='#5aa8ff', hot='#e0f0ff', gas='#16305a', arm='#9fc4ff'),
    'iron':   dict(metal=('#1c1c1e', '#55565a', '#a6a39c'), glow='#ffa13a', hot='#ffe2a8', gas='#3a2410', arm='#ffc07a'),
    'gold':   dict(metal=('#211a10', '#6b5530', '#c9a86a'), glow='#ffd04a', hot='#fff2c0', gas='#3a2a0c', arm='#ffe08a'),
    'beast':  dict(metal=('#141c14', '#3f5a36', '#8fae6e'), glow='#9cff4a', hot='#eaffc8', gas='#1e3a10', arm='#c4ff8a'),
}
ELEMENT = {
    'Infernal': 'fire', 'Ember': 'fire', 'Vulcan': 'fire', 'Solar': 'fire', 'Solaris': 'fire',
    'Cryo': 'ice', 'Frost': 'ice',
    'Void': 'void', 'Nyx': 'void', 'Nether': 'void', 'Spectral': 'void',
    'Chrono': 'chrono', 'Quantum': 'chrono', 'Helix': 'chrono',
    'Storm': 'storm', 'Zephyr': 'storm',
    'Iron': 'iron', 'Obsidian': 'iron', 'Titan': 'iron', 'Gravity': 'iron', 'Aegis': 'iron',
    'Runic': 'gold', 'Orion': 'gold', 'Lyra': 'gold', 'Corvus': 'gold',
    'Draken': 'beast', 'Fenrir': 'beast', 'Basilisk': 'beast', 'Manticore': 'beast', 'Serpent': 'beast',
}
FORM = {
    'Sentinel': 'ring', 'Warden': 'ring', 'Monolith': 'ring', 'Archon': 'ring', 'Prelate': 'ring', 'Herald': 'ring',
    'Tyrant': 'star', 'Reaper': 'star', 'Executioner': 'star', 'Warlord': 'star', 'Wraith': 'star',
    'Maw': 'maw', 'Devourer': 'maw', 'Leviathan': 'maw', 'Behemoth': 'maw', 'Weaver': 'maw',
    'Colossus': 'spire', 'Dreadnought': 'spire', 'Sovereign': 'spire', 'Ascendant': 'spire',
}


# ------------------------------------------------------------ geometry helpers
def polar(sq=1.0, cy=0.0):
    yy_ = (Y - cy) / sq
    return np.sqrt(X * X + yy_ * yy_), np.arctan2(yy_, X)


def band(r, r0, r1, soft=0.006):
    return smooth(r0 - soft, r0 + soft, r) * smooth(r1 + soft, r1 - soft, r)


def segs(th, n, gap, phase=0.0):
    """1 on plate, 0 in the gaps between n angular segments."""
    f = ((th + phase) / (2 * np.pi) * n) % 1.0
    return smooth(gap * 0.5, gap * 0.5 + 0.02, f) * smooth(1 - gap * 0.5, 1 - gap * 0.5 - 0.02, f)


def star_poly(r, th, n, r_in, r_out, phase=0.0):
    """Distance-like field: 1 inside an n-pointed star."""
    a = ((th + phase) % (2 * np.pi / n)) / (2 * np.pi / n)
    tri = np.abs(a - 0.5) * 2          # 0 at tip, 1 at valley
    edge = r_out - (r_out - r_in) * tri
    return smooth(edge + 0.008, edge - 0.008, r)


# ------------------------------------------------------------ forms
def form_ring(rng):
    sq = rng.uniform(0.55, 0.75)
    r, th = polar(sq)
    H = np.zeros((N, N)); G = np.zeros((N, N))
    n_rings = rng.integers(3, 5)
    radii = np.sort(rng.uniform(0.25, 0.78, n_rings))
    for i, rr in enumerate(radii):
        w = rng.uniform(0.035, 0.07)
        plates = segs(th, int(rng.integers(8, 24)), rng.uniform(0.04, 0.12), rng.uniform(0, 1))
        H = np.maximum(H, band(r, rr - w, rr + w) * (0.55 + 0.25 * plates))
        G += band(r, rr - 0.004, rr + 0.004) * (1 - plates) * 0.9
    # spokes
    k = int(rng.integers(4, 9))
    sp = smooth(0.06, 0.03, np.abs(np.sin(th * k / 2))) * smooth(radii[-1] + 0.04, radii[-1], r) * smooth(0.12, 0.16, r)
    H = np.maximum(H, sp * 0.45)
    # hub
    H = np.maximum(H, smooth(0.2, 0.17, r) * (0.8 - r))
    # turrets on outer ring
    tk = int(rng.integers(6, 14))
    tur = smooth(0.25, 0.1, np.abs(((th / (2 * np.pi) * tk) % 1) - 0.5) * 2) * band(r, radii[-1] + 0.05, radii[-1] + 0.1)
    H = np.maximum(H, tur * 0.7)
    core = smooth(0.11, 0.0, r)
    return H, G, core, sq


def form_star(rng):
    sq = rng.uniform(0.85, 1.0)
    r, th = polar(sq)
    n = int(rng.integers(4, 9))
    ph = rng.uniform(0, 1)
    body = star_poly(r, th, n, 0.28, 0.86, ph)
    inner = star_poly(r, th, n, 0.18, 0.5, ph + np.pi / n)
    H = body * (0.45 + 0.2 * (1 - r)) + inner * 0.25
    # blade fullers: grooves along each point
    a = ((th + ph) % (2 * np.pi / n)) / (2 * np.pi / n)
    groove = smooth(0.03, 0.0, np.abs(a - 0.5)) * body * smooth(0.2, 0.3, r)
    H = H - groove * 0.15
    G = groove * 1.0 + band(r, 0.2, 0.215) * 0.8
    H = np.maximum(H, smooth(0.16, 0.13, r) * 0.9)
    core = smooth(0.1, 0.0, r)
    return H, G, core, sq


def form_maw(rng):
    sq = rng.uniform(0.75, 0.95)
    r, th = polar(sq)
    outer = rng.uniform(0.62, 0.72)
    ring = band(r, 0.3, outer)
    k = int(rng.integers(14, 26))
    # inward teeth
    a = ((th / (2 * np.pi)) * k) % 1
    tooth_len = 0.3 - 0.14 * np.abs(a - 0.5) * 2
    teeth = smooth(tooth_len - 0.01, tooth_len + 0.01, r) * smooth(0.31, 0.29, r) * 0 + \
        smooth(0.31 - (0.31 - 0.13) * (1 - np.abs(a - 0.5) * 2) - 0.008, 0.31 - (0.31 - 0.13) * (1 - np.abs(a - 0.5) * 2) + 0.008, r) * smooth(0.32, 0.3, r)
    H = ring * (0.5 + 0.2 * segs(th, k, 0.08)) + teeth * 0.75
    # outer tendrils
    nt = int(rng.integers(5, 9))
    ph = rng.uniform(0, 2 * np.pi)
    tw = th + np.sin(r * 9 + ph) * 0.18
    tend = smooth(0.26, 0.0, np.abs(np.sin(tw * nt / 2))) * smooth(outer - 0.02, outer + 0.02, r) * smooth(0.98, 0.8, r)
    tend *= (1 - (r - outer) / (1 - outer)) * 1.1
    H = np.maximum(H, tend * 0.55)
    G = band(r, 0.3, 0.315) * 1.2 + band(r, outer - 0.012, outer) * 0.6
    core = smooth(0.15, 0.0, r) * 0.75   # throat glow
    return H, G, core, sq


def form_spire(rng):
    ax = np.abs(X)
    yv = Y + 0.05
    H = np.zeros((N, N)); G = np.zeros((N, N))
    base_w = rng.uniform(0.05, 0.13)
    taper = rng.uniform(0.0, 0.09)
    top = rng.uniform(0.7, 0.9)
    twin = rng.random() < 0.35            # two towers instead of one
    cx = rng.uniform(0.12, 0.22) if twin else 0.0
    axc = np.abs(ax - cx)
    colw = base_w + (top - yv) * taper * 0.5
    col = smooth(colw + 0.006, colw - 0.006, axc) * smooth(-0.86, -0.82, yv) * smooth(top + 0.04, top, yv)
    H = np.maximum(H, col * (0.6 + 0.3 * (1 - axc / 0.2)))
    if twin:  # bridge between towers
        H = np.maximum(H, band(yv, -0.1, 0.0) * smooth(cx + 0.02, cx, ax) * 0.5)
    for i in range(int(rng.integers(2, 6))):
        y0 = rng.uniform(-0.7, top - 0.15)
        w = rng.uniform(0.15, 0.6) * (1 - (y0 + 0.7) * 0.3)
        h = rng.uniform(0.03, 0.09)
        slope = rng.uniform(-0.8, 0.8)
        tier = smooth(w + 0.006, w - 0.006, ax + (yv - y0) * slope) * band(yv, y0 - h, y0 + h)
        H = np.maximum(H, tier * 0.55)
        G += band(yv, y0 - 0.003, y0 + 0.003) * smooth(w, w - 0.02, ax) * 0.7
    for k in range(int(rng.integers(1, 3))):
        wy = rng.uniform(-0.45, 0.25)
        sweep = rng.uniform(-0.7, 0.7)
        span = rng.uniform(0.5, 0.9)
        thick = rng.uniform(0.07, 0.16)
        rel = (yv - wy) - (ax - 0.1) * sweep
        wing = smooth(0.0, 0.02, ax - 0.1) * smooth(span + 0.02, span - 0.02, ax) * smooth(-0.01, 0.0, rel) * smooth(thick, thick - 0.01, rel + (ax - 0.1) * 0.15)
        H = np.maximum(H, wing * 0.42)
        G += smooth(0.012, 0.0, np.abs(ax - span * 0.6)) * wing * 0.6
    if rng.random() < 0.5:   # forked crown
        fork = smooth(0.03, 0.0, np.abs(ax - (yv - top + 0.2) * 0.4 - cx)) * band(yv, top - 0.2, top + 0.12)
        H = np.maximum(H, fork * 0.5)
    else:
        H = np.maximum(H, smooth(0.04, 0.0, axc - (top + 0.1 - yv) * 0.1) * band(yv, top - 0.05, top + 0.12) * 0.5)
    G += smooth(0.008, 0.0, axc) * col * 0.8
    ey = rng.uniform(-0.1, 0.4)
    r = np.sqrt(X ** 2 + (yv - ey) ** 2)
    core = smooth(0.09, 0.0, r)
    return H, G, core, 1.0


FORMS = {'ring': form_ring, 'star': form_star, 'maw': form_maw, 'spire': form_spire}


# ------------------------------------------------------------ render
LIGHT = np.array([-0.55, 0.6, 0.58]); LIGHT /= np.linalg.norm(LIGHT)


def backdrop(rng, th, seed):
    p = np.stack([X * 1.8, Y * 1.8, np.full_like(X, seed * 0.13)], -1)
    neb = fbm(p, 5, seed + 900)
    img = np.zeros((N, N, 3)) + c('#03070d')
    img += c(th['gas']) * smooth(0.45, 0.85, neb)[..., None] * 0.8
    # faint spiral galaxy behind the guardian
    r = np.sqrt(X ** 2 + (Y / 0.6) ** 2)
    a = np.arctan2(Y / 0.6, X)
    spiral = (np.cos(2 * a - np.log(r + 0.05) * 4.5) * 0.5 + 0.5) ** 3 * np.exp(-r * 2.2)
    img += c(th['arm']) * spiral[..., None] * 0.35 + c('#fff0d0') * np.exp(-r * 9)[..., None] * 0.5
    k = 1100
    st = np.zeros((N, N))
    st[rng.integers(0, N, k), rng.integers(0, N, k)] = rng.random(k) ** 3 * 2
    img += gaussian_filter(st, SS * 0.5)[..., None] * 1.8
    return img


def render(boss, out_dir):
    first, second = boss['name'].split()[:2]
    theme = dict(THEMES[ELEMENT.get(first, 'iron')])
    form = FORM.get(second, 'ring')
    seed = int(boss['galaxyId']) * 7919 + 13
    rng = np.random.default_rng(seed)
    img = backdrop(rng, theme, seed)

    H, G, core, sq = FORMS[form](rng)
    H = gaussian_filter(H, SS * 1.2)
    body = smooth(0.05, 0.12, H)
    f1, f2, cid = cells(np.stack([X * 9, Y * 9, np.full_like(X, seed * 0.01)], -1), seed)
    panel = smooth(0.05, 0.0, f2 - f1) * body              # recessed seams between hull plates
    H = H - panel * 0.035
    lights = smooth(0.06, 0.0, f1) * (cid > 0.82) * body    # small window lights in some plates
    G = G + lights * 1.2 + panel * (cid > 0.93) * 0.6
    # surface greebles
    det = fbm(np.stack([X * 14, Y * 14, np.full_like(X, seed * 0.07)], -1), 3, seed) - 0.5
    Hs = H + det * 0.03 * (H > 0.05)
    gy, gx = np.gradient(Hs * N * 0.05)
    nrm = np.stack([-gx, gy, np.ones_like(gx)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    ndl = np.clip(nrm @ LIGHT, 0, 1)
    spec = np.clip(nrm @ ((LIGHT + [0, 0, 1]) / np.linalg.norm(LIGHT + [0, 0, 1])), 0, 1) ** 28
    m0, m1, m2 = (c(h) for h in theme['metal'])
    t = np.clip(H * 0.85 + det * 0.8 - panel * 0.35, 0, 1)
    alb = np.where(t[..., None] < 0.5, m0 + (m1 - m0) * (t[..., None] / 0.5), m1 + (m2 - m1) * ((t[..., None] - 0.5) / 0.5))
    lit = alb * (0.06 + 1.25 * ndl[..., None] ** 1.3) + spec[..., None] * 0.7
    mask = smooth(0.02, 0.06, H)[..., None]
    # drop shadow onto backdrop
    sh = gaussian_filter(smooth(0.02, 0.06, H), SS * 10)
    sh = np.roll(np.roll(sh, int(N * 0.02), 0), int(N * 0.02), 1)
    img *= (1 - sh * 0.6)[..., None]
    img = img * (1 - mask) + lit * mask

    glow = c(theme['glow']); hot = c(theme['hot'])
    G = np.clip(G, 0, 1) * smooth(0.0, 0.05, H + 0.05)
    em = G[..., None] * glow * 1.4
    em += core[..., None] * (glow * 1.5 + hot * core[..., None] * 1.6)
    bloom = gaussian_filter(em, (SS * 6, SS * 6, 0)) * 1.2 + gaussian_filter(em, (SS * 22, SS * 22, 0)) * 0.9
    img = img + em + bloom
    vig = 1 - 0.4 * np.clip(X * X + Y * Y - 0.45, 0, 1)
    img *= vig[..., None]
    img = 1 - np.exp(-img * 1.3)
    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(out_dir, f"{boss['id']}.webp")
    out.save(path, 'WEBP', quality=86, method=6)
    return path


if __name__ == '__main__':
    bosses = json.load(open(sys.argv[1]))
    out_dir = sys.argv[2]
    ids = set(sys.argv[3:])
    os.makedirs(out_dir, exist_ok=True)
    for b in bosses:
        if ids and b['id'] not in ids:
            continue
        print(render(b, out_dir), b['name'], flush=True)
