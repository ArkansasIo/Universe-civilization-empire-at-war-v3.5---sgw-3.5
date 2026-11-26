"""Per-screen header banners (1200x509) composed from a kit of procedural motifs.

Each feature screen id maps to a recipe in RECIPES. Banners show as a wide strip
(the middle ~35% band on desktop) with the screen title over the left third, so
recipes put their focal subject centre-right along the horizontal mid-line.

usage: python3 scenes.py SPRITES_DIR OUT_DIR [ids...]
"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from planets import fbm, smooth, hexc  # noqa: E402
import planets as P  # noqa: E402

W, H = 1200, 509
SS = 2
CW, CH = W * SS, H * SS
SPR = None


def col(h):
    return np.array(hexc(h), dtype=np.float32) / 255


PAL = {
    'teal':   dict(gas='#0f4a52', gas2='#7a3a12', accent='#3ee0c8', warm='#ff9a4a'),
    'blue':   dict(gas='#16305a', gas2='#0f4a52', accent='#5aa8ff', warm='#ffb36a'),
    'violet': dict(gas='#2e1250', gas2='#0f2a52', accent='#b45cff', warm='#ff7ad0'),
    'ember':  dict(gas='#5a1e0c', gas2='#2a0f24', accent='#ff6a1a', warm='#ffd27a'),
    'gold':   dict(gas='#3a2a0c', gas2='#0f3a42', accent='#ffd04a', warm='#ffefb0'),
    'green':  dict(gas='#123a1c', gas2='#0f3a42', accent='#7dff8a', warm='#e8ff9a'),
    'red':    dict(gas='#4a0c12', gas2='#2a0f30', accent='#ff3a4a', warm='#ffb07a'),
    'steel':  dict(gas='#1a2430', gas2='#2a1a10', accent='#9fd8ff', warm='#ffc07a'),
}


class Scene:
    def __init__(self, pal, seed):
        self.p = PAL[pal]
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.C = np.zeros((CH, CW, 3), np.float32)
        self.E = np.zeros((CH, CW, 3), np.float32)
        self.background()

    # ------------------------------------------------------------- basics
    def background(self):
        lw, lh = W // 4, H // 4
        yy, xx = np.mgrid[0:lh, 0:lw]
        p = np.stack([xx / lh * 2.2, yy / lh * 2.2, np.full(xx.shape, self.seed * 0.17)], -1)
        n1 = fbm(p, 5, self.seed + 1)
        n2 = fbm(p * 1.4 + 3, 5, self.seed + 2)
        low = (col('#04080f') + col(self.p['gas']) * smooth(0.45, 0.85, n1)[..., None] * 0.9
               + col(self.p['gas2']) * smooth(0.6, 0.88, n2)[..., None] * 0.6)
        self.C[:] = self._up(low)
        k = 2600
        st = np.zeros((CH, CW), np.float32)
        st[self.rng.integers(0, CH, k), self.rng.integers(0, CW, k)] = self.rng.random(k) ** 3 * 2.4
        self.E += gaussian_filter(st, SS * 0.55)[..., None] * np.array([0.85, 0.93, 1.0], np.float32) * 1.6

    def _up(self, a):
        out = np.zeros((CH, CW, a.shape[-1]), np.float32)
        for k in range(a.shape[-1]):
            out[..., k] = np.asarray(Image.fromarray(a[..., k].astype(np.float32), 'F').resize((CW, CH), Image.BICUBIC))
        return out

    def layer(self):
        im = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        return im, ImageDraw.Draw(im)

    def comp(self, im, emissive=False, gain=1.0):
        a = np.asarray(im, np.float32) / 255
        if emissive:
            self.E += a[..., :3] * a[..., 3:4] * gain
        else:
            self.C = self.C * (1 - a[..., 3:4]) + a[..., :3] * a[..., 3:4]

    def glow_mask(self, mask, color, gain=1.0, radii=(2, 8, 26)):
        c = col(color) if isinstance(color, str) else color
        m = mask.astype(np.float32)
        acc = m * 1.0
        for i, r in enumerate(radii):
            acc = acc + gaussian_filter(m, r * SS) * (1.2 - i * 0.3)
        self.E += acc[..., None] * c * gain

    def S(self, v):
        return int(v * SS)

    # ------------------------------------------------------------- sprites
    def sprite(self, path, cx, cy, size, rot=0.0, alpha=1.0, flip=False):
        im = Image.open(os.path.join(SPR, path)).convert('RGBA')
        if flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        if rot:
            im = im.rotate(rot, resample=Image.BICUBIC, expand=False)
        s = self.S(size)
        im = im.resize((s, int(s * im.height / im.width)), Image.LANCZOS)
        layer = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        layer.paste(im, (self.S(cx) - im.width // 2, self.S(cy) - im.height // 2), im)
        if alpha != 1.0:
            a = np.asarray(layer, np.float32).copy(); a[..., 3] *= alpha
            layer = Image.fromarray(a.astype(np.uint8), 'RGBA')
        self.comp(layer)

    def planet(self, biome, cx, cy, r, **kw):
        self.sprite(f'planets/{biome}.png', cx, cy, r * 2 / 0.74 if biome != 'gas_giant' else r * 2 / 0.56, **kw)

    def galaxy(self, name, cx, cy, w, gain=1.0, rot=0.0):
        im = Image.open(os.path.join(SPR, 'galaxies', name + '.png')).convert('RGB')
        if rot:
            im = im.rotate(rot, resample=Image.BICUBIC)
        s = self.S(w)
        im = im.resize((s, s // 2), Image.LANCZOS)
        a = np.zeros((CH, CW, 3), np.float32)
        x0, y0 = self.S(cx) - s // 2, self.S(cy) - s // 4
        arr = np.asarray(im, np.float32) / 255
        xs0, ys0 = max(0, x0), max(0, y0)
        xs1, ys1 = min(CW, x0 + arr.shape[1]), min(CH, y0 + arr.shape[0])
        a[ys0:ys1, xs0:xs1] = arr[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
        self.E += a * gain

    def station(self, name, cx, cy, size, **kw):
        self.sprite(f'stations/{name}.png', cx, cy, size, **kw)

    # ------------------------------------------------------------- light
    def sun(self, cx, cy, r, color='#fff2c8', gain=1.0):
        yy, xx = np.ogrid[0:CH, 0:CW]
        d = np.sqrt((xx - self.S(cx)) ** 2 + (yy - self.S(cy)) ** 2) / self.S(r)
        c = col(color)
        self.E += (np.exp(-d * d * 1.5)[..., None] * 3.0 + np.exp(-d * 0.9)[..., None] * 0.6) * c * gain

    def beam(self, x0, y0, x1, y1, color, width=2.0, gain=1.0):
        im = Image.new('L', (CW, CH), 0)
        ImageDraw.Draw(im).line([(self.S(x0), self.S(y0)), (self.S(x1), self.S(y1))], fill=255, width=max(1, self.S(width)))
        self.glow_mask(np.asarray(im, np.float32) / 255, color, gain, radii=(1.5, 5, 16))

    def explosion(self, cx, cy, r, color=None, gain=1.0):
        color = color or self.p['warm']
        self.sun(cx, cy, r * 0.45, '#ffffff', 0.8 * gain)
        self.sun(cx, cy, r, color, 0.6 * gain)
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        for _ in range(40):
            a = self.rng.uniform(0, 2 * np.pi); L = self.rng.uniform(0.6, 1.8) * r
            x1, y1 = cx + np.cos(a) * L, cy + np.sin(a) * L
            d.line([(self.S(cx + np.cos(a) * r * 0.4), self.S(cy + np.sin(a) * r * 0.4)), (self.S(x1), self.S(y1))], fill=180, width=SS)
        self.glow_mask(np.asarray(im, np.float32) / 255, color, 0.7 * gain, radii=(1, 4))

    # ------------------------------------------------------------- ships & fleets
    def ship(self, d, cx, cy, L, ang, hull=('#2a2f38', '#8a93a3'), engine=None, kind=0):
        engine = engine or self.p['accent']
        ca, sa = np.cos(ang), np.sin(ang)

        def T(pts):
            return [(self.S(cx + (x * ca - y * sa) * L), self.S(cy + (x * sa + y * ca) * L)) for x, y in pts]
        if kind == 0:   # wedge cruiser
            top = [(0.55, 0), (0.1, -0.13), (-0.45, -0.16), (-0.5, 0)]
            bot = [(0.55, 0), (-0.5, 0), (-0.45, 0.16), (0.1, 0.13)]
            fins = [(-0.2, -0.14), (-0.42, -0.3), (-0.48, -0.16)]
        elif kind == 1:  # long battleship
            top = [(0.6, 0), (0.35, -0.07), (-0.5, -0.09), (-0.55, 0)]
            bot = [(0.6, 0), (-0.55, 0), (-0.5, 0.09), (0.35, 0.07)]
            fins = [(0.0, -0.08), (-0.15, -0.2), (-0.3, -0.08)]
        else:            # fighter
            top = [(0.5, 0), (-0.1, -0.08), (-0.4, -0.35), (-0.3, 0)]
            bot = [(0.5, 0), (-0.3, 0), (-0.4, 0.35), (-0.1, 0.08)]
            fins = [(-0.1, -0.05), (-0.2, -0.1), (-0.25, -0.05)]
        d.polygon(T(top), fill=tuple(int(v) for v in np.array(hexc(hull[1]))) + (255,))
        d.polygon(T(bot), fill=tuple(int(v) for v in np.array(hexc(hull[0]))) + (255,))
        d.polygon(T(fins), fill=tuple(int(v) for v in (np.array(hexc(hull[0])) * 0.8 + np.array(hexc(hull[1])) * 0.2)) + (255,))
        ex, ey = cx + (-0.52 * ca) * L, cy + (-0.52 * sa) * L
        return (ex, ey, L)

    def fleet(self, n, x0, x1, y0, y1, ang=0.0, size=(18, 60), kinds=(0, 1, 2), trails=True):
        im, d = self.layer()
        engines = []
        pts = sorted([(self.rng.uniform(x0, x1), self.rng.uniform(y0, y1), self.rng.uniform(0, 1)) for _ in range(n)], key=lambda t: t[2])
        for x, y, z in pts:
            L = size[0] + (size[1] - size[0]) * z ** 2
            k = kinds[self.rng.integers(0, len(kinds))]
            engines.append(self.ship(d, x, y, L, ang + self.rng.normal(0, 0.03), kind=k))
        self.comp(im)
        em = Image.new('L', (CW, CH), 0); de = ImageDraw.Draw(em)
        for ex, ey, L in engines:
            r = max(1.5, L * 0.06)
            de.ellipse([self.S(ex - r), self.S(ey - r), self.S(ex + r), self.S(ey + r)], fill=255)
            if trails:
                tx, ty = ex - np.cos(ang) * L * 1.6, ey - np.sin(ang) * L * 1.6
                de.line([(self.S(ex), self.S(ey)), (self.S(tx), self.S(ty))], fill=70, width=max(1, int(r * SS * 0.8)))
        self.glow_mask(np.asarray(em, np.float32) / 255, self.p['accent'], 1.0, radii=(1.5, 5, 14))

    # ------------------------------------------------------------- structures
    def asteroids(self, n, x0, x1, y0, y1, size=(6, 40), tint='#5a5048'):
        im, d = self.layer()
        base = np.array(hexc(tint))
        for _ in range(n):
            x, y = self.rng.uniform(x0, x1), self.rng.uniform(y0, y1)
            r = self.rng.uniform(*size)
            k = 11
            angs = np.sort(self.rng.uniform(0, 2 * np.pi, k))
            rad = r * self.rng.uniform(0.65, 1.0, k)
            pts = [(self.S(x + np.cos(a) * q), self.S(y + np.sin(a) * q)) for a, q in zip(angs, rad)]
            d.polygon(pts, fill=tuple((base * 0.45).astype(int)) + (255,))
            pts2 = [(self.S(x - r * 0.12 + np.cos(a) * q * 0.82), self.S(y - r * 0.12 + np.sin(a) * q * 0.82)) for a, q in zip(angs, rad)]
            d.polygon(pts2, fill=tuple(base.astype(int)) + (255,))
        self.comp(im)

    def crystals(self, cx, cy, s, color=None, n=9):
        color = color or self.p['accent']
        c = np.array(hexc(color))
        im, d = self.layer()
        edge = Image.new('L', (CW, CH), 0); de = ImageDraw.Draw(edge)
        for i in range(n):
            a = -np.pi / 2 + self.rng.normal(0, 0.45)
            L = s * self.rng.uniform(0.45, 1.0)
            w = s * self.rng.uniform(0.08, 0.16)
            bx = cx + self.rng.normal(0, s * 0.18)
            tip = (bx + np.cos(a) * L, cy + np.sin(a) * L)
            nx, ny = -np.sin(a) * w, np.cos(a) * w
            left = [(bx - nx, cy - ny), (tip[0] - nx * 0.5 + np.cos(a) * -L * 0.15, tip[1] - ny * 0.5 + np.sin(a) * -L * 0.15), tip, (bx, cy)]
            right = [(bx + nx, cy + ny), (tip[0] + nx * 0.5 + np.cos(a) * -L * 0.15, tip[1] + ny * 0.5 + np.sin(a) * -L * 0.15), tip, (bx, cy)]
            d.polygon([(self.S(x), self.S(y)) for x, y in left], fill=tuple((c * 0.85).astype(int)) + (235,))
            d.polygon([(self.S(x), self.S(y)) for x, y in right], fill=tuple((c * 0.35).astype(int)) + (245,))
            de.line([(self.S(bx), self.S(cy)), (self.S(tip[0]), self.S(tip[1]))], fill=200, width=SS)
        self.comp(im)
        self.glow_mask(np.asarray(edge, np.float32) / 255, color, 0.8)
        self.sun(cx, cy - s * 0.2, s * 0.5, color, 0.25)

    def dome(self, cx, cy, r, color=None, gain=1.0):
        color = color or self.p['accent']
        yy, xx = np.ogrid[0:CH, 0:CW]
        u = (xx - self.S(cx)) / self.S(r)
        v = (yy - self.S(cy)) / self.S(r)
        d2 = u * u + v * v
        inside = (d2 < 1) & (v < 0)
        z = np.sqrt(np.clip(1 - d2, 0, 1))
        # hex grid on the sphere surface via projected coords
        q = u * 9 / (z + 0.35)
        rr = v * 9 / (z + 0.35)
        hx = np.abs(((q + (np.floor(rr) % 2) * 0.5) % 1) - 0.5)
        hy = np.abs((rr % 1) - 0.5)
        lines = (smooth(0.06, 0.0, np.minimum(hx, hy) * 1.0)) * inside
        rim = smooth(0.85, 1.0, np.sqrt(d2)) * smooth(1.02, 1.0, np.sqrt(d2)) * (v < 0.02)
        c = col(color)
        self.E += (lines[..., None] * 0.35 + rim[..., None] * 1.0 + inside[..., None] * 0.06) * c * gain
        self.E += gaussian_filter(rim.astype(np.float32), 6 * SS)[..., None] * c * 0.8 * gain

    def horizon(self, biome, cy_top, r=2400, cx=None, detail=None, **kw):
        """Large planet limb rendered at full canvas resolution with the biome shaders."""
        cx = W * 0.6 if cx is None else cx
        detail = detail or (1.6 if biome in ('terrestrial', 'ocean', 'ice') else 3.0)
        self.limb = (cx, cy_top + r, r)
        fn = {b[0]: b[1] for b in P.BIOMES}[biome]
        bseed = {b[0]: b[2] for b in P.BIOMES}[biome]
        cy = cy_top + r
        y0 = max(0, self.S(cy_top) - 2)
        yy, xx = np.mgrid[y0:CH, 0:CW]
        dx = (xx / SS - cx) / r
        dy = (yy / SS - cy) / r
        d2 = dx * dx + dy * dy
        inside = d2 <= 1
        dz = np.sqrt(np.clip(1 - d2, 0, 1))
        n = np.stack([dx, -dy, dz], -1)[inside]
        a, bb = 0.7, 1.35   # tilt so the visible limb sits near the equator, not the ice cap
        ca, sa, cb, sb = np.cos(a), np.sin(a), np.cos(bb), np.sin(bb)
        R = np.array([[1, 0, 0], [0, cb, -sb], [0, sb, cb]]) @ np.array([[ca, 0, sa], [0, 1, 0], [-sa, 0, ca]])
        obj = (n @ R.T) * detail
        colv, cl, atm = fn(n, obj, bseed)
        if cl is not None:
            cl_col = P.shade(n, np.ones_like(colv) * 0.97)
            colv = colv * (1 - cl[..., None] * 0.92) + cl_col * cl[..., None] * 0.92
        region = self.C[y0:]
        layer = np.zeros_like(region); layer[inside] = colv
        d = np.sqrt(d2)
        edge = smooth(1.0, 1.0 - 1.5 / r, d)[..., None]
        self.C[y0:] = region * (1 - edge) + layer * edge
        # atmosphere: glow just outside the limb plus a thin bright rim inside
        ac = col(atm)
        px = (d - 1) * r
        glow = np.exp(-np.clip(px, 0, None) / 18.0) * (px > 0) * 0.9 + smooth(-14, 0, px) * (px <= 0) * 0.6
        self.E[y0:] += glow[..., None] * ac

    def skyline(self, y, x0, x1, n=40, hmax=150, color='#12161e', lights=None, seed=0):
        lights = lights or self.p['warm']
        im, d = self.layer()
        win = Image.new('L', (CW, CH), 0); dw = ImageDraw.Draw(win)
        xs = np.sort(self.rng.uniform(x0, x1, n))
        limb = getattr(self, 'limb', None)
        for x in xs:
            w = self.rng.uniform(10, 34)
            h = self.rng.uniform(0.25, 1.0) ** 1.5 * hmax
            if limb:   # stand each tower on the curved planet surface
                lcx, lcy, lr = limb
                dxl = min(abs(x + w / 2 - lcx), lr - 1)
                y = lcy - math.sqrt(lr * lr - dxl * dxl) + 3
            d.rectangle([self.S(x), self.S(y - h), self.S(x + w), self.S(y + (8 if limb else 40))], fill=tuple(hexc(color)) + (255,))
            if self.rng.random() < 0.4:   # spire
                d.line([(self.S(x + w / 2), self.S(y - h)), (self.S(x + w / 2), self.S(y - h - h * 0.25))], fill=tuple(hexc(color)) + (255,), width=SS * 2)
                dw.ellipse([self.S(x + w / 2 - 1.5), self.S(y - h - h * 0.25 - 1.5), self.S(x + w / 2 + 1.5), self.S(y - h - h * 0.25 + 1.5)], fill=255)
            for wy in np.arange(y - h + 6, y, 7):
                for wx in np.arange(x + 3, x + w - 3, 6):
                    if self.rng.random() < 0.22:
                        dw.rectangle([self.S(wx), self.S(wy), self.S(wx + 2), self.S(wy + 2)], fill=int(self.rng.uniform(120, 255)))
        if not limb:
            d.rectangle([self.S(x0 - 40), self.S(y), self.S(x1 + 40), self.S(H)], fill=tuple(hexc(color)) + (255,))
        self.comp(im)
        self.glow_mask(np.asarray(win, np.float32) / 255, lights, 0.9, radii=(1, 4, 20))

    def lattice(self, x0, y0, x1, y1, color='#3a3f48', glow=None, step=34):
        glow = glow or self.p['warm']
        im, d = self.layer()
        li = Image.new('L', (CW, CH), 0); dl = ImageDraw.Draw(li)
        cc = tuple(hexc(color)) + (255,)
        for x in np.arange(x0, x1 + 1, step):
            d.line([(self.S(x), self.S(y0)), (self.S(x), self.S(y1))], fill=cc, width=SS * 3)
        for y in (y0, (y0 + y1) / 2, y1):
            d.line([(self.S(x0), self.S(y)), (self.S(x1), self.S(y))], fill=cc, width=SS * 4)
        for x in np.arange(x0, x1, step):
            d.line([(self.S(x), self.S(y0)), (self.S(x + step), self.S((y0 + y1) / 2))], fill=cc, width=SS * 2)
            d.line([(self.S(x), self.S(y1)), (self.S(x + step), self.S((y0 + y1) / 2))], fill=cc, width=SS * 2)
            dl.ellipse([self.S(x - 2), self.S(y0 - 2), self.S(x + 2), self.S(y0 + 2)], fill=255)
        self.comp(im)
        self.glow_mask(np.asarray(li, np.float32) / 255, glow, 0.9, radii=(1, 4))

    def portal(self, cx, cy, r, color=None):
        color = color or self.p['accent']
        yy, xx = np.ogrid[0:CH, 0:CW]
        u = (xx - self.S(cx)) / self.S(r); v = (yy - self.S(cy)) / self.S(r)
        d = np.sqrt(u * u + v * v)
        ring = smooth(0.84, 0.88, d) * smooth(1.0, 0.96, d)
        th = np.arctan2(v, u)
        seg = (np.abs(np.sin(th * 18)) > 0.15).astype(np.float32)
        metal = col('#8a92a6') * (0.45 + 0.55 * np.clip(-(u * 0.6 + v * 0.8) / np.maximum(d, 1e-3), -1, 1))[..., None] * 0.7 + col('#3a4050') * 0.4
        a = ring[..., None]
        self.C = self.C * (1 - a) + (metal * (0.7 + 0.3 * seg[..., None])) * a
        lw, lh = CW // 4, CH // 4
        p = np.stack([np.linspace(0, 6, lw)[None, :].repeat(lh, 0), np.linspace(0, 3, lh)[:, None].repeat(lw, 1), np.full((lh, lw), self.seed * 0.2)], -1)
        sw = self._up(fbm(p, 4, self.seed + 77)[..., None])[..., 0]
        ripple = 0.5 + 0.5 * np.sin(d * 34 - sw * 9 + th * 2)
        disc = smooth(0.86, 0.8, d) * (0.06 + 0.5 * ripple * sw + 0.5 * smooth(0.5, 0.0, d) * sw)
        c = col(color)
        self.E += disc[..., None] * c * 0.32 + (smooth(0.86, 0.83, d) * smooth(0.76, 0.84, d))[..., None] * col('#ffffff') * 0.35
        self.E += gaussian_filter((smooth(0.9, 0.84, d) * 1.0).astype(np.float32), 12 * SS)[..., None] * c * 0.3

    def network(self, nodes, edges, color=None, gain=1.0):
        color = color or self.p['accent']
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        for a, b in edges:
            d.line([(self.S(nodes[a][0]), self.S(nodes[a][1])), (self.S(nodes[b][0]), self.S(nodes[b][1]))], fill=140, width=SS)
        for x, y in nodes:
            d.ellipse([self.S(x - 4), self.S(y - 4), self.S(x + 4), self.S(y + 4)], fill=255)
        self.glow_mask(np.asarray(im, np.float32) / 255, color, gain, radii=(1.5, 5, 18))

    def rand_network(self, n, x0, x1, y0, y1, k=2, **kw):
        nodes = [(self.rng.uniform(x0, x1), self.rng.uniform(y0, y1)) for _ in range(n)]
        edges = set()
        for i, (x, y) in enumerate(nodes):
            ds = sorted(range(n), key=lambda j: (nodes[j][0] - x) ** 2 + (nodes[j][1] - y) ** 2)[1:k + 1]
            for j in ds:
                edges.add(tuple(sorted((i, j))))
        self.network(nodes, list(edges), **kw)
        return nodes

    def radar(self, cx, cy, r, color=None, blips=8):
        color = color or self.p['accent']
        yy, xx = np.ogrid[0:CH, 0:CW]
        u = (xx - self.S(cx)) / self.S(r); v = (yy - self.S(cy)) / self.S(r)
        d = np.sqrt(u * u + v * v); th = np.arctan2(v, u)
        rings = sum(smooth(0.012, 0.0, np.abs(d - k / 4)) for k in (1, 2, 3, 4)) * (d < 1.02)
        cross = (smooth(0.006, 0.0, np.abs(u)) + smooth(0.006, 0.0, np.abs(v))) * (d < 1)
        a0 = self.rng.uniform(-np.pi, np.pi)
        wedge = np.clip(1 - ((a0 - th) % (2 * np.pi)) / 1.2, 0, 1) ** 2 * (d < 1)
        c = col(color)
        self.E += (rings * 0.7 + cross * 0.35 + wedge * 0.35)[..., None] * c
        for _ in range(blips):
            bt, bd = self.rng.uniform(-np.pi, np.pi), self.rng.uniform(0.15, 0.95)
            self.sun(cx + np.cos(bt) * bd * r, cy + np.sin(bt) * bd * r, 3.5, self.p['warm'], 0.7)

    def holo(self, x0, y0, x1, y1, kind='bars', color=None, gain=1.0):
        color = color or self.p['accent']
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        fill = Image.new('L', (CW, CH), 0); ImageDraw.Draw(fill).rectangle([self.S(x0), self.S(y0), self.S(x1), self.S(y1)], fill=12)
        d.rectangle([self.S(x0), self.S(y0), self.S(x1), self.S(y1)], outline=200, width=SS)
        c = 10
        for (ax, ay, bx, by) in ((x0, y0, x0 + c, y0), (x0, y0, x0, y0 + c), (x1, y1, x1 - c, y1), (x1, y1, x1, y1 - c)):
            d.line([(self.S(ax), self.S(ay)), (self.S(bx), self.S(by))], fill=255, width=SS * 2)
        w, h = x1 - x0, y1 - y0
        if kind == 'bars':
            n = int(self.rng.integers(6, 14))
            for i in range(n):
                bh = self.rng.uniform(0.15, 0.9) * (h - 16)
                bx = x0 + 8 + i * (w - 16) / n
                d.rectangle([self.S(bx), self.S(y1 - 8 - bh), self.S(bx + (w - 16) / n * 0.6), self.S(y1 - 8)], fill=150)
        elif kind == 'line':
            pts, v = [], self.rng.uniform(0.3, 0.7)
            for i in range(24):
                v = np.clip(v + self.rng.normal(0.01, 0.08), 0.05, 0.95)
                pts.append((self.S(x0 + 8 + i * (w - 16) / 23), self.S(y1 - 8 - v * (h - 16))))
            d.line(pts, fill=255, width=SS * 2)
            for gy in np.linspace(y0 + 8, y1 - 8, 4):
                d.line([(self.S(x0 + 6), self.S(gy)), (self.S(x1 - 6), self.S(gy))], fill=50, width=1)
        elif kind == 'text':
            for ty in np.arange(y0 + 10, y1 - 8, 9):
                L = self.rng.uniform(0.3, 0.95) * (w - 20)
                d.line([(self.S(x0 + 10), self.S(ty)), (self.S(x0 + 10 + L), self.S(ty))], fill=int(self.rng.uniform(90, 200)), width=SS * 2)
        elif kind == 'ring':
            cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, min(w, h) * 0.36
            for k, a1 in enumerate(self.rng.uniform(60, 330, 3)):
                rr = r * (1 - k * 0.22)
                d.arc([self.S(cx - rr), self.S(cy - rr), self.S(cx + rr), self.S(cy + rr)], -90, -90 + a1, fill=230, width=SS * 3)
        elif kind == 'grid':
            for gx in np.linspace(x0 + 8, x1 - 8, 7):
                for gy in np.linspace(y0 + 8, y1 - 8, 4):
                    v = int(self.rng.uniform(40, 220))
                    d.rectangle([self.S(gx - 6), self.S(gy - 4), self.S(gx + 6), self.S(gy + 4)], fill=v)
        m = (np.asarray(im, np.float32) + np.asarray(fill, np.float32)) / 255
        self.glow_mask(m, color, 0.75 * gain, radii=(1, 4, 16))

    def floor_grid(self, horizon_y, color=None, gain=0.6):
        color = color or self.p['accent']
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        vx = W * 0.62
        for k in range(-24, 25):
            d.line([(self.S(vx), self.S(horizon_y)), (self.S(vx + k * 90), self.S(H))], fill=110, width=SS)
        for i in range(1, 12):
            y = horizon_y + (H - horizon_y) * (i / 12) ** 2
            d.line([(0, self.S(y)), (CW, self.S(y))], fill=110, width=SS)
        m = np.asarray(im, np.float32) / 255
        yy = np.arange(CH)[:, None] / SS
        m *= smooth(horizon_y, horizon_y + 60, yy)
        self.glow_mask(m, color, gain, radii=(1, 3))

    def tokens(self, cx, cy, n, s, color=None, hexa=True):
        color = color or self.p['accent']
        im, d = self.layer()
        rim = Image.new('L', (CW, CH), 0); dr = ImageDraw.Draw(rim)
        c = np.array(hexc(color))
        for i in range(n):
            x = cx + self.rng.normal(0, s * 1.6); y = cy + self.rng.normal(0, s * 0.6)
            r = s * self.rng.uniform(0.5, 1.0)
            k = 6 if hexa else 24
            ph = self.rng.uniform(0, 1)
            sq = self.rng.uniform(0.35, 1.0)    # tilt
            pts = [(self.S(x + np.cos(ph + j * 2 * np.pi / k) * r), self.S(y + np.sin(ph + j * 2 * np.pi / k) * r * sq)) for j in range(k)]
            d.polygon(pts, fill=tuple((c * 0.45).astype(int)) + (255,))
            inner = [(self.S(x + np.cos(ph + j * 2 * np.pi / k) * r * 0.7), self.S(y + np.sin(ph + j * 2 * np.pi / k) * r * 0.7 * sq)) for j in range(k)]
            d.polygon(inner, fill=tuple((c * 0.8).astype(int)) + (255,))
            dr.polygon(pts, outline=230, width=SS)
        self.comp(im)
        self.glow_mask(np.asarray(rim, np.float32) / 255, color, 0.8)

    def cards(self, cx, cy, n, w, h, color=None):
        color = color or self.p['accent']
        frame = Image.new('L', (CW, CH), 0)
        for i in range(n):
            a = (i - (n - 1) / 2) * 11
            card = Image.new('RGBA', (self.S(w), self.S(h)), (14, 18, 30, 255))
            dc = ImageDraw.Draw(card)
            c2 = tuple(int(v) for v in (np.array(hexc(self.p['gas'])) * 1.6).clip(0, 255))
            dc.rectangle([self.S(6), self.S(6), self.S(w - 6), self.S(h * 0.7)], fill=c2 + (255,))
            dc.ellipse([self.S(w * 0.3), self.S(h * 0.15), self.S(w * 0.7), self.S(h * 0.5)], fill=(40, 44, 60, 255))
            card = card.rotate(-a, expand=True, resample=Image.BICUBIC)
            fr = Image.new('L', (self.S(w), self.S(h)), 0)
            ImageDraw.Draw(fr).rectangle([0, 0, self.S(w) - 1, self.S(h) - 1], outline=255, width=SS * 2)
            fr = fr.rotate(-a, expand=True, resample=Image.BICUBIC)
            px = self.S(cx + (i - (n - 1) / 2) * w * 0.55) - card.width // 2
            py = self.S(cy + abs(i - (n - 1) / 2) * 8) - card.height // 2
            layer = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); layer.paste(card, (px, py), card)
            self.comp(layer)
            frame.paste(fr, (px, py), fr)
        self.glow_mask(np.asarray(frame, np.float32) / 255, color, 0.9)

    def meteors(self, n, color='#ff8a3a'):
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        for _ in range(n):
            x, y = self.rng.uniform(W * 0.3, W), self.rng.uniform(-50, H * 0.7)
            L = self.rng.uniform(60, 200)
            for k in range(10):
                d.line([(self.S(x - L * k / 10), self.S(y - L * 0.5 * k / 10)), (self.S(x - L * (k + 1) / 10), self.S(y - L * 0.5 * (k + 1) / 10))], fill=int(255 * (1 - k / 10)), width=SS * 2)
        self.glow_mask(np.asarray(im, np.float32) / 255, color, 1.0)

    def arcs(self, cx, cy, rx, ry, n, color=None, gain=0.7):
        """Orbital paths / trade routes as ellipses."""
        color = color or self.p['accent']
        im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
        for k in range(n):
            f = 1 - k * 0.22
            d.ellipse([self.S(cx - rx * f), self.S(cy - ry * f), self.S(cx + rx * f), self.S(cy + ry * f)], outline=120, width=SS)
        self.glow_mask(np.asarray(im, np.float32) / 255, color, gain, radii=(1, 4))

    # ------------------------------------------------------------- finish
    def finish(self, path):
        em = self.E
        bloom = gaussian_filter(em, (8 * SS, 8 * SS, 0)) * 0.5 + gaussian_filter(em, (30 * SS, 30 * SS, 0)) * 0.35
        img = self.C + em + bloom
        yy, xx = np.mgrid[0:CH, 0:CW]
        u, v = xx / CW * 2 - 1, yy / CH * 2 - 1
        vig = 1 - 0.35 * np.clip(u * u * 0.6 + v * v - 0.35, 0, 1)
        img = img * vig[..., None]
        img = 1 - np.exp(-img * 1.3)
        out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
        out.save(path, 'WEBP', quality=82, method=6)


# =====================================================================
# Recipes. Mid-line is y≈255; title sits over x<400.
# =====================================================================
M = 255


def R_dashboard(s):
    s.planet('terrestrial', 760, M, 130); s.station('ring_chrono', 1040, M - 10, 300)
    s.fleet(9, 520, 1150, 180, 340, ang=-0.1); s.sun(1150, 120, 40)

def R_civilization(s):
    s.horizon('terrestrial', 250, r=1700, cx=760); s.skyline(330, 430, 1200, n=70, hmax=110); s.sun(1050, 150, 40)

def R_government(s):
    s.station('spire_gold', 820, M - 10, 380); s.arcs(820, M, 330, 80, 3); s.sun(820, 160, 50, '#ffe9a8', 0.6)

def R_missions(s):
    s.planet('desert', 1020, M + 20, 120); s.fleet(5, 520, 820, 210, 300, ang=0.15, size=(26, 70))
    s.network([(500, 300), (640, 220), (780, 270), (900, 200), (1020, M + 20)], [(0, 1), (1, 2), (2, 3), (3, 4)], gain=0.8)

def R_codex(s):
    for i, k in enumerate(('text', 'ring', 'text', 'bars')):
        s.holo(470 + i * 175, 170 + (i % 2) * 30, 620 + i * 175, 330 + (i % 2) * 30, k)
    s.galaxy('spiral_1', 760, 120, 500, 0.5)

def R_resources(s):
    s.crystals(760, M + 80, 160); s.crystals(960, M + 90, 120, s.p['warm']); s.asteroids(18, 480, 1200, 120, 400, (8, 34))
    s.planet('metallic', 1110, 140, 70)

def R_stash(s):
    s.station('ring_iron', 830, M, 400); s.tokens(830, M, 9, 22); s.dome(830, M + 70, 150)

def R_income(s):
    s.horizon('desert', 300, r=1700, cx=800); s.lattice(560, 240, 1080, 300); s.crystals(700, 300, 90); s.crystals(980, 300, 80)
    s.fleet(4, 600, 1100, 150, 220, ang=0.05, kinds=(1,))

def R_storage(s):
    s.horizon('ice', 300, r=1800, cx=760)
    for i in range(6):
        x = 520 + i * 110
        im, d = s.layer(); d.rectangle([s.S(x), s.S(180 + (i % 2) * 20), s.S(x + 80), s.S(330)], fill=(38, 44, 54, 255))
        d.ellipse([s.S(x), s.S(165 + (i % 2) * 20), s.S(x + 80), s.S(195 + (i % 2) * 20)], fill=(70, 78, 92, 255)); s.comp(im)
        s.beam(x + 5, 320, x + 75, 320, s.p['accent'], 1.5, 0.6)

def R_power(s):
    s.sun(980, M, 70, '#ffd27a', 1.2)
    nodes = [(500, 300), (600, 220), (720, 300), (820, 200), (980, M), (900, 340), (1100, 330), (1120, 160)]
    s.network(nodes, [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 2), (4, 6), (4, 7)], color='#ffd04a', gain=1.1)
    s.lattice(520, 340, 1150, 380)

def R_aic(s):
    s.floor_grid(310); s.lattice(480, 200, 1150, 300, glow=s.p['accent'])
    for x in (560, 760, 960): s.holo(x, 120, x + 140, 190, 'bars')

def R_factories(s):
    s.horizon('volcanic', 290, r=1700, cx=780); s.skyline(320, 480, 1200, n=26, hmax=140, color='#1a1412', lights='#ff8a3a')
    for x in (600, 820, 1040): s.sun(x, 170, 30, '#ff6a2a', 0.4)

def R_master(s):
    s.station('ring_gold', 760, M, 330); s.station('spire_iron', 1020, M, 260); s.planet('ocean', 560, M + 60, 60)

def R_construction(s):
    s.lattice(460, 160, 1180, 350, step=42); s.station('ring_iron', 820, M, 260, alpha=0.6)
    for x in (560, 760, 980): s.beam(x, 160, x + 30, 260, s.p['warm'], 1.5, 0.9)

def R_forge(s):
    s.sun(820, M + 30, 80, '#ff6a1a', 1.2); s.explosion(820, M + 30, 60, '#ffb04a', 0.7)
    s.horizon('volcanic', 320, r=1500, cx=820); s.meteors(6, '#ffb04a')

def R_shipyard(s):
    s.horizon('terrestrial', 330, r=2000, cx=760); s.lattice(480, 180, 1150, 290, step=46)
    s.fleet(3, 600, 1050, 225, 245, ang=0.0, size=(110, 150), kinds=(1,), trails=False)

def R_techlib(s):
    s.station('ring_chrono', 780, M, 340)
    for x, k in ((470, 'ring'), (1000, 'line')): s.holo(x, 180, x + 160, 320, k)

def R_mega(s):
    s.sun(820, M, 60, '#fff2c8', 1.3)
    for k in range(5): s.arcs(820, M, 160 + k * 55, 60 + k * 22, 1, color='#ffb04a', gain=0.9)
    s.asteroids(40, 520, 1150, 150, 360, (3, 8), tint='#8a6a40')

def R_repair(s):
    s.station('ring_storm', 800, M, 330); s.fleet(6, 950, 1180, 200, 320, ang=np.pi, size=(30, 60))
    for x in (700, 760, 860): s.beam(x, 200, 800, M, '#9fe0ff', 1.2, 0.7)

def R_starbase(s):
    s.planet('gas_giant', 1040, M, 140); s.station('ring_chrono', 720, M, 300); s.fleet(5, 480, 650, 200, 320, ang=0.1)

def R_techtree(s):
    nodes = s.rand_network(22, 460, 1170, 140, 370, k=2, gain=1.2)
    for x, y in nodes[:5]: s.sun(x, y, 8, s.p['warm'], 0.8)

def R_archive(s):
    s.galaxy('barred_spiral_2', 830, M, 700, 0.9)
    for x in (480, 1030): s.holo(x, 190, x + 140, 320, 'text')

def R_blueprints(s):
    s.floor_grid(300, gain=0.4)
    im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
    for (x, y, L) in ((780, 230, 300),):
        pts = [(0.55, 0), (0.1, -0.13), (-0.45, -0.16), (-0.5, 0), (-0.45, 0.16), (0.1, 0.13), (0.55, 0)]
        d.line([(s.S(x + px * L), s.S(y + py * L)) for px, py in pts], fill=255, width=SS * 2)
        d.line([(s.S(x - 0.5 * L), s.S(y)), (s.S(x + 0.55 * L), s.S(y))], fill=120, width=SS)
        for t in np.linspace(-0.4, 0.4, 7):
            d.line([(s.S(x + t * L), s.S(y - 0.12 * L)), (s.S(x + t * L), s.S(y + 0.12 * L))], fill=90, width=SS)
    s.glow_mask(np.asarray(im, np.float32) / 255, s.p['accent'], 1.0)
    s.holo(1000, 150, 1160, 300, 'text')

def R_offense(s):
    s.fleet(5, 450, 650, 200, 320, ang=0.0, size=(40, 80))
    for y in (220, 250, 290): s.beam(620, y, 1000, M + s.rng.normal(0, 20), '#ff4a3a', 2.5, 1.2)
    s.station('star_fire', 1060, M, 260); s.explosion(1000, M, 40)

def R_defense_tech(s):
    s.planet('ocean', 900, M + 30, 130); s.dome(900, M + 30 + 20, 210)
    for y in (180, 260): s.beam(480, y, 720, y + 30, '#ff5a3a', 2.0, 0.9); s.explosion(720, y + 30, 22, '#9fe0ff', 0.7)

def R_covert(s):
    s.planet('tomb_world', 980, M, 140); s.radar(700, M, 150, color='#7dff8a')
    s.fleet(3, 520, 900, 180, 320, ang=0.2, size=(14, 22), kinds=(2,))

def R_anticovert(s):
    s.radar(820, M, 200, color='#ff5a5a', blips=12); s.station('ring_storm', 820, M, 160)

def R_roster(s):
    for i, k in enumerate((2, 2, 0, 0, 1, 1)):
        im, d = s.layer(); e = s.ship(d, 470 + i * 120, M + (i % 2) * 30 - 15, 40 + i * 14, 0.0, kind=k); s.comp(im); s.sun(e[0], e[1], 4, s.p['accent'], 0.9)
    s.floor_grid(330, gain=0.35)

def R_fitting(s):
    s.lattice(520, 170, 1120, 340, step=50, glow=s.p['accent'])
    im, d = s.layer(); s.ship(d, 820, M, 380, 0.0, kind=1); s.comp(im)
    for x in (700, 820, 940): s.beam(x, 170, x, M - 20, s.p['accent'], 1.0, 0.8)

def R_production(s):
    s.lattice(460, 200, 1180, 310, step=40)
    s.fleet(7, 480, 1150, 235, 275, ang=0.0, size=(36, 50), kinds=(0,), trails=False)
    s.holo(1000, 100, 1160, 180, 'bars')

def R_units(s):
    s.fleet(22, 420, 1180, 130, 380, ang=-0.12, size=(12, 70)); s.planet('ice', 1120, 120, 50)

def R_super(s):
    im, d = s.layer(); e = s.ship(d, 840, M, 560, -0.05, kind=1); s.comp(im); s.sun(e[0], e[1], 22, s.p['accent'], 1.0)
    s.fleet(8, 520, 1180, 140, 380, ang=-0.05, size=(10, 22), kinds=(2,))

def R_miners(s):
    s.asteroids(28, 520, 1200, 140, 380, (10, 46), tint='#6a5a48'); s.fleet(6, 520, 1100, 180, 330, ang=0.3, size=(26, 50), kinds=(0,))
    s.beam(700, 260, 760, 300, '#ffd04a', 1.5, 0.9)

def R_hyperspace(s):
    im = Image.new('L', (CW, CH), 0); d = ImageDraw.Draw(im)
    for _ in range(180):
        a = s.rng.uniform(0, 2 * np.pi); r0 = s.rng.uniform(30, 120); r1 = r0 + s.rng.uniform(80, 500)
        d.line([(s.S(820 + np.cos(a) * r0), s.S(M + np.sin(a) * r0 * 0.6)), (s.S(820 + np.cos(a) * r1), s.S(M + np.sin(a) * r1 * 0.6))], fill=int(s.rng.uniform(60, 220)), width=SS)
    s.glow_mask(np.asarray(im, np.float32) / 255, s.p['accent'], 1.0); s.sun(820, M, 40, '#ffffff', 0.8)
    im, d = s.layer(); s.ship(d, 820, M, 160, 0.0, kind=1); s.comp(im)

def R_mothership(s):
    s.station('maw_void', 820, M, 420); s.fleet(10, 480, 1180, 150, 360, ang=0.1, size=(10, 26), kinds=(2,))

def R_modules(s):
    s.station('star_chrono', 760, M, 300)
    for x, y, k in ((990, 150, 'grid'), (990, 270, 'bars'), (480, 200, 'ring')): s.holo(x, y, x + 170, y + 100, k)

def R_academy(s):
    s.horizon('jungle', 300, r=1800, cx=760); s.skyline(320, 520, 1100, n=22, hmax=90, color='#141a16')
    s.fleet(6, 560, 1100, 150, 220, ang=0.0, size=(12, 20), kinds=(2,))

def R_enlist(s):
    s.floor_grid(320); s.holo(640, 120, 1000, 300, 'text'); s.sun(820, 330, 30, s.p['accent'], 0.6)

def R_wroster(s):
    for r in range(3):
        for c in range(9):
            s.sun(480 + c * 80, 175 + r * 75, 7, s.p['accent'] if (r + c) % 3 else s.p['warm'], 0.7)
    s.holo(450, 140, 1180, 370, 'grid', gain=0.5)

def R_wings(s):
    for i in range(6):
        a = i * np.pi / 3
        x, y = 820 + np.cos(a) * 200, M + np.sin(a) * 110
        s.holo(x - 50, y - 32, x + 50, y + 32, ['bars', 'ring', 'line', 'text', 'grid', 'ring'][i], gain=0.8)
    s.station('ring_gold', 820, M, 160)

def R_drills(s):
    s.fleet(14, 500, 1150, 170, 340, ang=0.0, size=(14, 26), kinds=(2,))
    for x in np.linspace(520, 1120, 6): s.sun(x, 360, 6, s.p['warm'], 0.8)
    s.floor_grid(330, gain=0.4)

def R_defgrid(s):
    s.horizon('terrestrial', 300, r=1800, cx=800)
    for x in np.linspace(520, 1140, 7): s.beam(x, 300, x + s.rng.normal(0, 60), 60, '#ff6a3a', 1.6, 0.8)
    s.explosion(900, 120, 30); s.explosion(640, 90, 22)

def R_shields(s):
    s.horizon('ice', 310, r=1800, cx=820); s.dome(820, 320, 260, gain=1.2); s.meteors(5, '#ff8a4a')

def R_batteries(s):
    s.horizon('desert', 310, r=1800, cx=820)
    for x in (600, 800, 1000):
        im, d = s.layer(); d.rectangle([s.S(x - 24), s.S(280), s.S(x + 24), s.S(315)], fill=(40, 42, 48, 255))
        d.line([(s.S(x), s.S(285)), (s.S(x + 60), s.S(220))], fill=(70, 74, 82, 255), width=s.S(8)); s.comp(im)
        s.beam(x + 60, 220, x + 260, 60, '#ffb04a', 2.0, 1.0)

def R_fortify(s):
    s.horizon('metallic', 300, r=1800, cx=820); s.skyline(320, 520, 1150, n=14, hmax=70, color='#22252c', lights=s.p['accent'])
    s.dome(820, 330, 220, gain=0.6)

def R_dispatch(s):
    s.planet('terrestrial', 480, M + 30, 90); s.planet('volcanic', 1100, M - 20, 70)
    s.fleet(10, 600, 960, 200, 320, ang=-0.07, size=(16, 40)); s.beam(560, M + 30, 1040, M - 20, s.p['accent'], 1.0, 0.4)

def R_expeditions(s):
    s.galaxy('ring_cluster_1', 1000, M, 520, 0.9); s.fleet(4, 520, 760, 220, 300, ang=-0.05, size=(30, 60))
    s.asteroids(10, 600, 1200, 120, 400, (4, 12))

def R_nemesis(s):
    s.station('star_void', 900, M, 360); s.fleet(5, 450, 650, 200, 320, ang=0.0, size=(30, 60))
    s.beam(950, M, 640, 260, '#b45cff', 3.0, 1.2); s.explosion(640, 260, 30, '#d89cff')

def R_spy(s):
    s.planet('jungle', 980, M, 140); s.fleet(4, 560, 760, 200, 320, ang=0.25, size=(10, 16), kinds=(2,))
    s.radar(980, M, 220, color='#7dff8a', blips=0)

def R_sabotage(s):
    s.station('ring_iron', 880, M, 340); s.explosion(800, 210, 40); s.explosion(990, 300, 28)
    s.fleet(3, 500, 640, 230, 290, ang=0.1, size=(10, 16), kinds=(2,))

def R_attacklog(s):
    s.fleet(8, 450, 700, 160, 350, ang=0.05, size=(20, 50)); s.fleet(8, 900, 1180, 160, 350, ang=np.pi, size=(20, 50))
    for _ in range(6):
        s.beam(s.rng.uniform(600, 700), s.rng.uniform(180, 330), s.rng.uniform(900, 1000), s.rng.uniform(180, 330), '#ff5a3a', 1.6, 0.9)
    s.explosion(800, M, 35)

def R_milstats(s):
    s.holo(460, 160, 760, 340, 'bars'); s.holo(800, 160, 1150, 340, 'line'); s.fleet(5, 500, 1150, 90, 140, ang=0.0, size=(10, 18), kinds=(2,))

def R_universe(s):
    s.galaxy('spiral_2', 640, M, 420, 0.8); s.galaxy('elliptical_1', 900, 200, 260, 0.7); s.galaxy('barred_spiral_3', 1100, 300, 340, 0.8)

def R_bosses(s):
    s.station('maw_fire', 900, M, 420); s.fleet(6, 450, 640, 200, 320, ang=0.0, size=(26, 50))
    s.beam(640, 260, 860, M, '#ffd04a', 2.0, 1.0)

def R_explore(s):
    s.galaxy('spiral_3', 1000, M, 560, 0.7); s.radar(700, M, 130, blips=5); s.asteroids(8, 500, 1200, 100, 420, (4, 10))

def R_gates(s):
    s.portal(820, M, 150); s.fleet(4, 480, 700, 210, 300, ang=0.0, size=(24, 40)); s.portal(1110, M - 40, 60)

def R_gatetokens(s):
    s.portal(1060, M, 110); s.tokens(720, M, 9, 34); s.tokens(900, M + 40, 5, 26, s.p['warm'])

def R_relics(s):
    s.horizon('tomb_world', 320, r=1800, cx=820); s.crystals(820, 320, 170, '#3ee0c8', 7)
    s.sun(820, 220, 40, '#3ee0c8', 0.5)

def R_lords(s):
    s.station('spire_gold', 880, M, 400); s.fleet(9, 460, 700, 180, 340, ang=0.0, size=(18, 40))

def R_races(s):
    for i, b in enumerate(('jungle', 'ice', 'desert', 'ocean', 'volcanic', 'crystalline')):
        s.planet(b, 470 + i * 130, M + (30 if i % 2 else -30), 48)
    s.arcs(800, M, 380, 70, 1, gain=0.5)

def R_colonies(s):
    s.sun(1150, M, 50)
    for i, (b, r) in enumerate((('terrestrial', 70), ('desert', 50), ('ice', 44), ('ocean', 60), ('gas_giant', 70))):
        s.planet(b, 500 + i * 140, M, r)
    s.arcs(1150, M, 700, 140, 1, gain=0.4)

def R_compare(s):
    for i, b in enumerate(('terrestrial', 'desert', 'ice', 'volcanic', 'ocean')):
        x = 500 + i * 140; s.planet(b, x, 200, 46); s.holo(x - 55, 260, x + 55, 340, 'bars', gain=0.6)

def R_cpower(s):
    s.planet('gas_giant', 980, M, 150)
    nodes = [(500, 220), (620, 300), (740, 220), (860, 300), (980, M)]
    s.network(nodes, [(0, 1), (1, 2), (2, 3), (3, 4)], color='#ffd04a', gain=1.1)

def R_cdef(s):
    s.planet('metallic', 860, M, 130); s.dome(860, M + 20, 200, gain=0.8)
    s.fleet(6, 480, 640, 200, 320, ang=0.0, size=(20, 40)); s.station('ring_iron', 1110, 170, 120)

def R_moons(s):
    s.planet('terrestrial', 1050, M, 140); s.planet('tomb_world', 700, M - 10, 70); s.radar(700, M - 10, 140, blips=6)

def R_lifesupport(s):
    s.horizon('jungle', 290, r=1800, cx=800)
    for x in np.linspace(520, 1120, 5): s.dome(x, 300, 60, color='#7dff8a', gain=0.7)
    s.sun(1000, 140, 40)

def R_population(s):
    s.horizon('terrestrial', 270, r=1700, cx=800); s.skyline(310, 440, 1200, n=90, hmax=130)

def R_hazards(s):
    s.planet('volcanic', 880, M, 150); s.meteors(14, '#ff6a3a'); s.explosion(780, 200, 30)

def R_plunge(s):
    s.planet('desert', 900, M, 140, alpha=0.9); s.holo(480, 160, 720, 340, 'line', color='#ff4a5a')
    s.meteors(4, '#ff4a5a')

def R_encyclo(s):
    for i, b in enumerate(('terrestrial', 'desert', 'ice', 'volcanic', 'ocean', 'gas_giant', 'jungle', 'tomb_world', 'metallic', 'crystalline')):
        s.planet(b, 470 + (i % 5) * 150, 175 + (i // 5) * 150, 52)

def R_exchange(s):
    s.station('ring_gold', 820, M, 300); s.tokens(560, M, 6, 18, s.p['warm']); s.tokens(1080, M, 6, 18, s.p['accent'])
    s.arcs(820, M, 360, 90, 2)

def R_bank(s):
    s.station('spire_gold', 820, M, 360); s.tokens(820, M + 80, 10, 22, '#ffd04a')

def R_procure(s):
    s.lattice(460, 300, 1180, 340); s.fleet(6, 500, 1150, 200, 280, ang=0.0, size=(30, 60), trails=False)
    s.holo(500, 110, 700, 180, 'text'); s.holo(1000, 110, 1160, 180, 'bars')

def R_mercs(s):
    s.fleet(12, 460, 1180, 150, 360, ang=0.12, size=(16, 50), kinds=(0, 2)); s.planet('volcanic', 1120, 120, 50)

def R_alliance(s):
    s.station('ring_chrono', 820, M, 330); s.fleet(4, 480, 620, 200, 300, ang=0.0); s.fleet(4, 1020, 1180, 200, 300, ang=np.pi)

def R_guilds(s):
    s.station('maw_fire', 1000, M, 300); s.fleet(14, 460, 840, 150, 360, ang=0.05, size=(14, 40))

def R_diplomacy(s):
    s.planet('ocean', 560, M, 90); s.planet('crystalline', 1080, M, 90)
    s.network([(650, M), (820, M - 40), (820, M + 40), (990, M)], [(0, 1), (0, 2), (1, 3), (2, 3)], gain=1.0)
    s.sun(820, M, 18, s.p['warm'], 0.9)

def R_messages(s):
    s.rand_network(16, 460, 1180, 140, 370, k=2); s.station('ring_storm', 820, M, 140)

def R_news(s):
    for i in range(4): s.holo(460 + i * 180, 150 + (i % 2) * 40, 620 + i * 180, 300 + (i % 2) * 40, ['text', 'line', 'text', 'bars'][i])
    s.planet('terrestrial', 1120, 380, 60)

def R_rankings(s):
    for i, h in enumerate((120, 170, 90)):
        x = 700 + i * 140
        s.holo(x, 340 - h, x + 110, 340, 'grid', gain=0.6)
    s.sun(840, 150, 30, '#ffd04a', 0.9); s.floor_grid(340, gain=0.4)

def R_spylog(s):
    s.holo(460, 140, 760, 360, 'text', color='#7dff8a'); s.radar(980, M, 140, color='#7dff8a')

def R_enemy(s):
    s.station('star_fire', 950, M, 330); s.holo(460, 150, 720, 350, 'text', color='#ff5a5a'); s.radar(950, M, 190, color='#ff5a5a', blips=0)

def R_intelcodex(s):
    s.galaxy('barred_spiral_1', 900, M, 600, 0.6); s.holo(460, 140, 700, 360, 'text'); s.holo(1000, 150, 1160, 330, 'ring')

def R_commander(s):
    s.floor_grid(330); s.holo(540, 150, 1100, 320, 'grid', gain=0.6); s.station('ring_gold', 820, M - 20, 150)

def R_gacha(s):
    s.cards(840, M, 5, 120, 170); s.sun(840, M - 40, 60, s.p['warm'], 0.4)

def R_profile(s):
    s.station('spire_chrono', 900, M, 360); s.holo(480, 160, 720, 340, 'text')

def R_race(s):
    s.planet('jungle', 640, M, 80); s.planet('ice', 840, M, 80); s.planet('volcanic', 1040, M, 80); s.arcs(840, M, 320, 70, 1)

def R_vacation(s):
    s.planet('ocean', 860, M, 140); s.dome(860, M + 160, 290, color='#9fe0ff', gain=0.9)

def R_ascension(s):
    s.sun(840, M, 40, '#e8d0ff', 0.45)
    for k in range(4): s.arcs(840, M, 150 + k * 60, 90 + k * 36, 1, color=s.p['accent'], gain=0.8)
    s.station('star_void', 840, M, 260)
    for k in range(18): s.sun(840 + s.rng.normal(0, 200), M + s.rng.normal(0, 80), 3, s.p['warm'], 0.7)

def R_settings(s):
    s.holo(500, 150, 760, 350, 'grid'); s.holo(820, 150, 1160, 350, 'ring')

def R_profiles(s):
    for i in range(4): s.holo(470 + i * 175, 170, 610 + i * 175, 340, 'ring' if i % 2 else 'text', gain=0.8)

def R_store(s):
    s.crystals(620, M + 90, 150, '#b45cff'); s.tokens(800, M + 20, 7, 26, '#ffd04a'); s.cards(1030, M, 3, 120, 170)


def R_admin(kind):
    def f(s):
        s.floor_grid(330, gain=0.4)
        k1, k2, extra = kind
        s.holo(470, 140, 780, 340, k1); s.holo(820, 140, 1160, 340, k2)
        if extra == 'galaxy': s.galaxy('spiral_1', 980, 90, 320, 0.5)
        elif extra == 'planet': s.planet('terrestrial', 1110, 100, 50)
        elif extra == 'fleet': s.fleet(5, 830, 1150, 70, 120, ang=0.0, size=(12, 22), kinds=(2,))
        elif extra == 'debris': s.asteroids(20, 820, 1180, 60, 130, (3, 9), tint='#7a7068')
        elif extra == 'alarm': s.sun(1100, 100, 25, '#ff3a4a', 0.9)
        elif extra == 'clock':
            s.radar(980, 240, 80, blips=0)
        elif extra == 'crown': s.tokens(980, 100, 4, 14, '#ffd04a')
    return f


RECIPES = {
    'dashboard': ('teal', R_dashboard), 'civilization': ('gold', R_civilization), 'government-system': ('gold', R_government),
    'missions': ('ember', R_missions), 'codex-doc': ('blue', R_codex),
    'resources': ('teal', R_resources), 'stash-vaults': ('steel', R_stash), 'income': ('gold', R_income),
    'storage-upgrades': ('steel', R_storage), 'power-grid': ('gold', R_power), 'aic-system': ('teal', R_aic),
    'factories': ('ember', R_factories),
    'master-upgrades': ('gold', R_master), 'construction-yard': ('ember', R_construction), 'tempering-forge': ('ember', R_forge),
    'shipyard': ('blue', R_shipyard), 'tech-library': ('teal', R_techlib), 'megastructures': ('gold', R_mega),
    'repair': ('blue', R_repair), 'space-stations': ('violet', R_starbase),
    'tech-tree': ('teal', R_techtree), 'tech-archive': ('violet', R_archive), 'eve-blueprints': ('blue', R_blueprints),
    'tech-offense': ('red', R_offense), 'tech-defense': ('blue', R_defense_tech), 'tech-covert': ('green', R_covert),
    'tech-anti-covert': ('red', R_anticovert),
    'unit-roster-90': ('blue', R_roster), 'ship-fitting': ('teal', R_fitting), 'unit-production': ('ember', R_production),
    'units': ('blue', R_units), 'super-units': ('violet', R_super), 'miners': ('gold', R_miners),
    'hyperspace-systems': ('blue', R_hyperspace), 'ship': ('violet', R_mothership), 'modules': ('teal', R_modules),
    'workforce-academy': ('green', R_academy), 'academy-enlistment': ('teal', R_enlist), 'workforce-roster': ('blue', R_wroster),
    'academy-wings': ('gold', R_wings), 'academy-drills': ('ember', R_drills),
    'defenses': ('red', R_defgrid), 'shields': ('blue', R_shields), 'weapons': ('ember', R_batteries), 'armors': ('steel', R_fortify),
    'targets': ('teal', R_dispatch), 'expeditions': ('violet', R_expeditions), 'nemesis-system': ('violet', R_nemesis),
    'spy': ('green', R_spy), 'sabotage': ('ember', R_sabotage), 'attack-log': ('red', R_attacklog), 'military-stats': ('blue', R_milstats),
    'universe': ('violet', R_universe), 'add-worlds-bosses': ('ember', R_bosses), 'exploration': ('blue', R_explore),
    'stargate-network': ('teal', R_gates), 'gate-tokens': ('blue', R_gatetokens), 'stargate-relics': ('teal', R_relics),
    'stargate-system-lords': ('gold', R_lords), 'stargate-npc-races': ('violet', R_races),
    'planet-list': ('teal', R_colonies), 'planet-bonuses': ('blue', R_compare), 'planet-power': ('gold', R_cpower),
    'planet-defenses': ('steel', R_cdef), 'moon-bases': ('blue', R_moons), 'life-support': ('green', R_lifesupport),
    'population': ('gold', R_population), 'hazards': ('red', R_hazards), 'colonial-plunge': ('red', R_plunge),
    'stellar-encyclopedia': ('violet', R_encyclo),
    'resource-exchange': ('gold', R_exchange), 'bank-vault': ('gold', R_bank), 'weapon-market': ('steel', R_procure),
    'mercenary-market': ('ember', R_mercs),
    'alliances': ('teal', R_alliance), 'mmorpg-ogame': ('ember', R_guilds), 'diplomacy': ('gold', R_diplomacy),
    'messages': ('blue', R_messages), 'galactic-news': ('blue', R_news), 'rankings': ('gold', R_rankings),
    'spy-log': ('green', R_spylog), 'enemy-intelligence': ('red', R_enemy), 'intel-codex': ('violet', R_intelcodex),
    'commander-hq': ('gold', R_commander), 'commander-gacha': ('violet', R_gacha), 'player-profile': ('teal', R_profile),
    'race': ('green', R_race), 'vacation': ('blue', R_vacation), 'ascension': ('violet', R_ascension),
    'account-settings': ('steel', R_settings), 'account-profiles': ('steel', R_profiles),
    'store-battlepass': ('violet', R_store),
    'admin-dashboard': ('steel', R_admin(('bars', 'line', 'galaxy'))), 'turn-system': ('teal', R_admin(('ring', 'line', 'clock'))),
    'admin-empire-history': ('steel', R_admin(('text', 'line', None))), 'admin-universe': ('violet', R_admin(('grid', 'ring', 'galaxy'))),
    'admin-users': ('blue', R_admin(('text', 'grid', None))), 'admin-crown': ('gold', R_admin(('text', 'bars', 'crown'))),
    'admin-bans': ('red', R_admin(('text', 'grid', 'alarm'))), 'admin-planets': ('teal', R_admin(('grid', 'bars', 'planet'))),
    'admin-fleets': ('blue', R_admin(('bars', 'text', 'fleet'))), 'admin-debris': ('steel', R_admin(('grid', 'line', 'debris'))),
    'admin-tickets': ('blue', R_admin(('text', 'text', None))), 'admin-security': ('red', R_admin(('ring', 'text', 'alarm'))),
    'admin-events': ('violet', R_admin(('line', 'grid', 'galaxy'))), 'admin-cheats': ('red', R_admin(('grid', 'text', 'alarm'))),
    'admin-operations': ('teal', R_admin(('bars', 'ring', 'fleet'))), 'cron-jobs': ('teal', R_admin(('text', 'ring', 'clock'))),
    'cron-cli': ('green', R_admin(('text', 'text', 'clock'))), 'admin-maintenance': ('ember', R_admin(('grid', 'bars', None))),
}


def render(pid, out_dir):
    pal, fn = RECIPES[pid]
    seed = sum((i + 1) * ord(ch) for i, ch in enumerate(pid)) % 100000
    s = Scene(pal, seed)
    fn(s)
    s.finish(os.path.join(out_dir, f'{pid}.webp'))


if __name__ == '__main__':
    SPR = sys.argv[1]
    out_dir = sys.argv[2]
    ids = sys.argv[3:] or list(RECIPES)
    os.makedirs(out_dir, exist_ok=True)
    for pid in ids:
        render(pid, out_dir)
        print(pid, flush=True)
