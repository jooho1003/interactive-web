# 얼굴 타일 시트 만들기 (2026-10-03).
# 몸은 기준 프레임(BASE) 하나로 고정하고, 머리 영역(RECT)만 프레임마다 바꾼다. 영상 속 몸 흔들림(최대 ±20px)은
# 깃·가슴 영역의 위상 상관으로 기준 프레임에 맞춘다. 고개를 돌리면 깃도 조금 끌려가므로, 목 아래 띠(SEAM)에서는
# 광학 흐름으로 프레임의 깃을 기준 깃 자리로 서서히 옮기며(모핑) 섞는다 — 깃 선이 두 겹으로 비치지 않는다.
# 사용: python build-heads.py <프레임 폴더(fNNN.png)> <알파 폴더(rembg 결과 fNNN.png)> <출력 폴더> [--preview]
# 프레임은 ffmpeg -i scholar-seq10.mp4 -start_number 0 fNNN.png, 알파는 rembg-local.py와 같은 설정(isnet-general-use).
import sys, numpy as np
from PIL import Image
from scipy.ndimage import shift as nshift
from scipy.ndimage import map_coordinates, zoom, gaussian_filter
from skimage.registration import phase_cross_correlation, optical_flow_tvl1

BASE = 110                              # 몸·정면 그림 기준 프레임(정면, 살짝 내려다봄) = 아래 행 가운데 칸
GRID = [                                # 보는 사람 기준 왼쪽 → 오른쪽
    # 위 행: 포인터가 얼굴보다 위. 고개를 들며 크게 도는 구간(24→64, 134→176), 가운데는 원본 정면(2)
    [56, 50, 44, 38, 32, 26, 2, 136, 142, 148, 156, 164, 170],
    # 아래 행(쉬는 행): 얼굴 높이·아래. 정면-아래(110)로 돌아오는 두 구간(78→118, 196→212)을 이어 끊김이 없다
    [80, 84, 88, 92, 96, 102, 110, 212, 208, 204, 200, 198, 196],
]
SIZE = 1440                             # 영상 프레임 크기
RECT = (330, 0, 1170, 680)              # 타일 영역 x0, y0, x1, y1 (프레임 픽셀)
FEATHER = 30                            # 타일 좌·우·아래 가장자리 페더 폭. 몸 그림은 이만큼 안쪽까지만 비운다
SEAM = (455, 620)                       # 이 띠에서 프레임 머리 → 기준 몸으로 색을 섞는다
MORPH = (450, 530)                      # 이 띠에서 프레임 깃을 기준 깃 자리로 옮긴다(색 섞기보다 먼저 끝나야 겹선이 없다)
FLOW = (380, 720)                       # 깃 흐름을 재는 세로 범위
ALIGN = (slice(520, 900), slice(300, 1140))  # 몸 정렬에 쓰는 깃·가슴 영역
SCALE = 0.7                             # 타일 축소 비율(840×680 → 588×476, 정수로 떨어지게)

frames, alphas, out = sys.argv[1:4]
preview = '--preview' in sys.argv

def rgba(i):  # 프리멀티플라이 RGBA float
    a = np.asarray(Image.open(f"{alphas}/f{i:03d}.png").convert('RGBA'), dtype=np.float32) / 255
    a[..., :3] *= a[..., 3:4]
    return a

def gray(i):
    return np.asarray(Image.open(f"{frames}/f{i:03d}.png").convert('L'), dtype=np.float32)

base_full = gray(BASE); base_gray = base_full[ALIGN]
def aligned(i):
    if i == BASE: return rgba(i), (0.0, 0.0), None
    s, _, _ = phase_cross_correlation(base_gray, gray(i)[ALIGN], upsample_factor=10)
    p = np.stack([nshift(c, s, order=1, mode='constant', cval=0) for c in np.moveaxis(rgba(i), -1, 0)], -1)
    # 깃 흐름: 기준 좌표 x에서 프레임의 같은 점은 x + flow. 절반 크기에서 재고 키운다(매끈하고 빠르다)
    g = nshift(gray(i), s, order=1, mode='nearest')
    a, b = FLOW
    v, u = optical_flow_tvl1(base_full[a:b:2, ::2] / 255, g[a:b:2, ::2] / 255, attachment=4, tightness=0.5, num_warp=10, num_iter=30)
    v, u = gaussian_filter(v, 8), gaussian_filter(u, 8)  # 그림 결의 잡음 흐름을 지우고 큰 움직임만 남긴다
    cap = np.minimum(1, 12 / np.maximum(np.hypot(v, u), 1e-6)); v, u = v * cap, u * cap
    flow = np.zeros((2, SIZE, SIZE), np.float32)
    flow[0, a:b], flow[1, a:b] = zoom(v, 2, order=1) * 2, zoom(u, 2, order=1) * 2
    return p, tuple(float(v) for v in s), flow

def morph(p, flow):  # MORPH 띠를 지나며 기준 깃 자리로 옮긴 프레임
    if flow is None: return p
    rows, cols = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    tm = np.clip((rows - MORPH[0]) / (MORPH[1] - MORPH[0]), 0, 1); k = tm * tm * (3 - 2 * tm)
    coords = [rows + flow[0] * k, cols + flow[1] * k]
    return np.stack([map_coordinates(p[..., c], coords, order=1, mode='constant', cval=0) for c in range(4)], -1)

def to_image(p):
    p = p.copy(); a = p[..., 3:4]
    p[..., :3] = np.where(a > 1e-4, p[..., :3] / np.maximum(a, 1e-4), 0)
    return Image.fromarray(np.clip(p * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')

def resized(p, w, h):  # 프리멀티플라이 상태로 줄여 가장자리 검은 띠를 막는다
    chans = [Image.fromarray(p[..., c]).resize((w, h), Image.LANCZOS) for c in range(4)]
    return np.clip(np.stack([np.asarray(c) for c in chans], -1), 0, 1)

x0, y0, x1, y1 = RECT
ys = np.arange(SIZE, dtype=np.float32)[:, None, None]
t = np.clip((ys - SEAM[0]) / (SEAM[1] - SEAM[0]), 0, 1); w = t * t * (3 - 2 * t)  # 0 = 프레임 머리, 1 = 기준 몸
xs = np.arange(x1 - x0, dtype=np.float32); yy = np.arange(y1 - y0, dtype=np.float32)
fx = np.clip(np.minimum(xs, (x1 - x0 - 1) - xs) / FEATHER, 0, 1)
fy = np.clip(((y1 - y0 - 1) - yy) / FEATHER, 0, 1)
feather = np.minimum(fx[None, :], fy[:, None])[..., None]

base, _, _ = aligned(BASE)
# 시트 배치 = 시선 칸 배치(매니페스트 character.cols × rows)
cols, rows = len(GRID[0]), len(GRID)
tw, th = round((x1 - x0) * SCALE), round((y1 - y0) * SCALE)
sheet = np.zeros((rows * th, cols * tw, 4), np.float32)
tiles = {}
for r, row in enumerate(GRID):
    for c, i in enumerate(row):
        if i not in tiles:
            p, s, flow = aligned(i)
            comp = morph(p, flow) * (1 - w) + base * w
            tiles[i] = comp[y0:y1, x0:x1] * feather
            print(f"f{i:03d} shift dy={s[0]:+.1f} dx={s[1]:+.1f}", flush=True)
        sheet[r * th:(r + 1) * th, c * tw:(c + 1) * tw] = resized(tiles[i], tw, th)

body = base.copy(); body[0:y1 - FEATHER, x0 + FEATHER:x1 - FEATHER] = 0
if preview:  # 합성 결과를 프레임 크기로 되살려 확인용 줄을 만든다
    strip = []
    for row in GRID:
        for i in row:
            full = body.copy(); tile = tiles[i]; a = tile[..., 3:4]
            full[y0:y1, x0:x1] = tile + full[y0:y1, x0:x1] * (1 - a)
            strip.append(to_image(full).crop((300, 0, 1200, 760)).resize((300, 253)))
    im = Image.new('RGBA', (cols * 300, len(GRID) * 253), (40, 52, 90, 255))
    for n, s in enumerate(strip): im.alpha_composite(s, ((n % cols) * 300, (n // cols) * 253))
    im.convert('RGB').save(f"{out}/preview.jpg", quality=85)
to_image(base).save(f"{out}/scholar-still.png")
to_image(body).save(f"{out}/scholar-body.png")
to_image(sheet).save(f"{out}/scholar-heads.png")
print(f"cells {cols}x{rows} ({len(tiles)} unique) · tile {tw}x{th} · sheet {cols * tw}x{rows * th}")
print(f"rect % left {x0 / SIZE * 100:.3f} top {y0 / SIZE * 100:.3f} width {(x1 - x0) / SIZE * 100:.3f} height {(y1 - y0) / SIZE * 100:.3f}")
