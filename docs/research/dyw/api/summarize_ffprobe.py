# -*- coding: utf-8 -*-
import json
from collections import Counter

results = json.load(open('ffprobe-results.json', encoding='utf-8'))

resolutions = Counter()
codecs = Counter()
framerates = Counter()
durations = []
bitrates = []

rows = []
for r in results:
    if 'data' not in r:
        continue
    d = r['data']
    fmt = d.get('format', {})
    streams = d.get('streams', [])
    vstream = next((s for s in streams if 'width' in s), {})
    dur = float(fmt.get('duration', 0)) if fmt.get('duration') else None
    br = int(fmt.get('bit_rate', 0)) if fmt.get('bit_rate') else None
    w, h = vstream.get('width'), vstream.get('height')
    codec = vstream.get('codec_name')
    fr = vstream.get('r_frame_rate')
    name = r['url'].split('/')[-1]
    rows.append((name, w, h, codec, fr, dur, br))
    if w and h:
        resolutions[f'{w}x{h}'] += 1
    if codec:
        codecs[codec] += 1
    if fr:
        framerates[fr] += 1
    if dur:
        durations.append(dur)
    if br:
        bitrates.append(br)

print("resolutions:", resolutions.most_common())
print("codecs:", codecs.most_common())
print("framerates:", framerates.most_common())
print(f"duration: min={min(durations):.1f}s max={max(durations):.1f}s avg={sum(durations)/len(durations):.1f}s total={sum(durations):.1f}s ({sum(durations)/60:.1f}min)")
print(f"bitrate: min={min(bitrates):,} max={max(bitrates):,} avg={sum(bitrates)/len(bitrates):,.0f}")

with open('mp4-metadata-table.tsv', 'w', encoding='utf-8') as f:
    f.write('file\twidth\theight\tcodec\tframerate\tduration_s\tbitrate_bps\n')
    for row in sorted(rows):
        f.write('\t'.join(str(x) for x in row) + '\n')
print("wrote mp4-metadata-table.tsv")
