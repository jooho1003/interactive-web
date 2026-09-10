# -*- coding: utf-8 -*-
import json, csv
import concurrent.futures as cf
import requests

BASE = "https://design-your-world.replit.app"

vf = json.load(open('video-flow.json', encoding='utf-8'))
aps = json.load(open('app-settings.json', encoding='utf-8'))
thumbs = json.load(open('thumbnails.json', encoding='utf-8'))
videos = vf['videos']

targets = []  # (category, url)

# 1. mp4 files (unique file names)
mp4_files = sorted(set(v['file'] for v in videos.values() if v.get('file')))
for f in mp4_files:
    targets.append(('video_mp4', f'{BASE}/videos/{f}'))
targets.append(('video_mp4_intro', f'{BASE}/videos/video-INTRO.mp4'))

# 2. mp3 dubbing per node (KO root, EN subfolder) - only for nodes with a file
for name, v in videos.items():
    f = v.get('file')
    if not f:
        continue
    mp3 = f.replace('.mp4', '.mp3')
    targets.append(('audio_mp3_ko', f'{BASE}/videos/{mp3}'))
    targets.append(('audio_mp3_en', f'{BASE}/videos/EN/{mp3}'))

# 3. _q.png end-overlay poster per node
for name in videos:
    targets.append(('poster_q', f'{BASE}/videos/{name}_q.png'))

# 4. _m1.png mobile per-menu poster (q=1 sample) per node that has routing menus
routing = aps.get('videoRouting', {})
for name, r in routing.items():
    if name == 'intro':
        continue
    n_menus = len(r.get('menus') or [])
    if n_menus > 0:
        targets.append(('poster_m1', f'{BASE}/videos/{name}_m1.png'))

# 5. thumbnails
for name, path in thumbs.items():
    targets.append(('thumbnail', f'{BASE}{path}'))

# 6. BGM + audio effects
targets.append(('bgm', f'{BASE}/BGM/bgm.mp3'))
targets.append(('sfx', f'{BASE}/audio/on.wav'))
targets.append(('sfx', f'{BASE}/audio/click.wav'))

print("total HEAD targets:", len(targets))

def do_head(item):
    cat, url = item
    try:
        r = requests.head(url, timeout=15, allow_redirects=True)
        return {
            'category': cat, 'url': url, 'status': r.status_code,
            'content_length': r.headers.get('Content-Length'),
            'content_type': r.headers.get('Content-Type'),
            'cache_control': r.headers.get('Cache-Control'),
            'accept_ranges': r.headers.get('Accept-Ranges'),
        }
    except Exception as e:
        return {'category': cat, 'url': url, 'status': 'ERR', 'content_length': None,
                'content_type': None, 'cache_control': None, 'accept_ranges': None, 'error': str(e)}

results = []
with cf.ThreadPoolExecutor(max_workers=16) as ex:
    for res in ex.map(do_head, targets):
        results.append(res)

with open('asset-headers.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['category','url','status','content_length','content_type','cache_control','accept_ranges'])
    w.writeheader()
    for r in results:
        w.writerow({k: r.get(k) for k in w.fieldnames})

print("done, wrote asset-headers.csv")
