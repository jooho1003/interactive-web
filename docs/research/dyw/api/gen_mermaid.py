# -*- coding: utf-8 -*-
import json

vf = json.load(open('video-flow.json', encoding='utf-8'))
videos = vf['videos']

merged = {}
with open('merged_edges.tsv', encoding='utf-8') as f:
    next(f)
    for line in f:
        parts = line.rstrip('\n').split('\t')
        f_, t_, l_, s_ = parts
        merged[(f_, t_)] = (l_, s_)

_id_map = {}
_used = set()
def nid(n):
    if n in _id_map:
        return _id_map[n]
    base = n.replace('-', 'D').replace('_', 'U')
    cand = base
    i = 0
    while cand in _used:
        i += 1
        cand = f'{base}X{i}'
    _used.add(cand)
    _id_map[n] = cand
    return cand

hub = {'video_intro_loop','video1','video2','video2-G','video2-R','video2_R','video3','video3-L','video3-R','video3-IN','video3_IN',
       'video4','video4-L','video4-R','video4-IN','video5','video5-L','video5-R','video5-IN','video6-HIDDEN'}
act1 = {'video6','video6_NO','video7','video7_NO','video8','video9','video10','video11','video12','video13','video14','video15',
        'video16','video17','video18','video19','video20','video20_IN','video21','video22','video22_IN','video22_IN_END',
        'video23','video24','video25','video26','video27'}
act2 = set(videos.keys()) - hub - act1

lines = []
lines.append('flowchart TD')
lines.append('  classDef ending fill:#7f1d1d,stroke:#ef4444,color:#fff,stroke-width:2px;')
lines.append('  classDef hidden fill:#111827,stroke:#a855f7,color:#fff,stroke-dasharray:4 2;')
lines.append('  classDef unavailable fill:#1f2937,stroke:#6b7280,color:#9ca3af,stroke-dasharray:2 2;')
lines.append('  classDef startNode fill:#065f46,stroke:#10b981,color:#fff,stroke-width:2px;')
lines.append('  classDef orphan fill:#78350f,stroke:#f59e0b,color:#fff;')

def emit_group(name, nodeset, indent='  '):
    lines.append(f'{indent}subgraph {name}')
    for n in sorted(nodeset):
        v = videos.get(n, {})
        label = n
        lines.append(f'{indent}  {nid(n)}["{label}"]')
    lines.append(f'{indent}end')

emit_group('HUB_레거시_화살표_리비지트_허브', hub)
emit_group('ACT1_video6_to_27', act1)
emit_group('ACT2_video28_to_45_루프백', act2)

lines.append('  START(("start: video_intro_loop"))')
lines.append('  START --> ' + nid('video1'))

for (f_, t_), (l_, s_) in sorted(merged.items()):
    style = '-.->|' if s_ == 'videoRouting' else '-->|'
    close = '|'
    lbl = (l_ or '').replace('"','').replace('|','/')
    lines.append(f'  {nid(f_)} {style}{lbl}{close} {nid(t_)}')

endings = [k for k,v in videos.items() if v.get('isEnding')]
for e in endings:
    lines.append(f'  class {nid(e)} ending')
lines.append(f'  class {nid("video6-HIDDEN")} hidden')
unavailable = [k for k,v in videos.items() if v.get('available') is False]
for u in unavailable:
    lines.append(f'  class {nid(u)} unavailable')
lines.append(f'  class {nid("video1")} startNode')
# orphan: video23 unreachable from start
lines.append(f'  class {nid("video23")} orphan')

out = '\n'.join(lines)
open('flowchart.mmd', 'w', encoding='utf-8').write(out)
print("wrote flowchart.mmd, lines:", len(lines))
print("edge count:", len(merged))
