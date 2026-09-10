# -*- coding: utf-8 -*-
import json

vf = json.load(open('video-flow.json', encoding='utf-8'))
aps = json.load(open('app-settings.json', encoding='utf-8'))

videos = vf['videos']
routing = aps['videoRouting']

# ---- Build TSV table from video-flow fields (literal, as requested) ----
rows = []
for name, v in videos.items():
    rows.append(v | {'node': name})

with open('video-flow-table.tsv', 'w', encoding='utf-8') as f:
    f.write('node\tfile\tsrc\tbuttons\tnavigation\tdefaultGlow\tglowCondition\tsetsFlag\tisEnding\tavailable\n')
    for name in sorted(videos.keys()):
        v = videos[name]
        src = (v.get('src') or '').split('?')[0]
        f.write('\t'.join([
            name,
            str(v.get('file')),
            src,
            json.dumps(v.get('buttons'), ensure_ascii=False),
            json.dumps(v.get('navigation'), ensure_ascii=False),
            str(v.get('defaultGlow')),
            json.dumps(v.get('glowCondition'), ensure_ascii=False) if v.get('glowCondition') else '',
            str(v.get('setsFlag')) if v.get('setsFlag') else '',
            str(v.get('isEnding', False)),
            str(v.get('available')),
        ]) + '\n')

# ---- Build merged edge set: video-flow.navigation (layer 1) + videoRouting menus (layer 2) ----
edges_vf = []   # (from, label, to, source)
for name, v in videos.items():
    nav = v.get('navigation') or {}
    for label, target in nav.items():
        edges_vf.append((name, label, target, 'video-flow'))

edges_vr = []
for name, r in routing.items():
    if name == 'intro':
        continue  # stray/unused key, not a real node id in video-flow
    menus = r.get('menus') or []
    for m in menus:
        target = m.get('targetVideoId')
        if target:
            edges_vr.append((name, m.get('textEN') or m.get('id'), target, 'videoRouting'))

vf_pairs = set((f, t) for f, l, t, s in edges_vf)
vr_only = [(f, l, t, s) for f, l, t, s in edges_vr if (f, t) not in vf_pairs]

print("video-flow edges:", len(edges_vf))
print("videoRouting edges (non-null target):", len(edges_vr))
print("videoRouting edges NOT present in video-flow.navigation:", len(vr_only))
for e in vr_only:
    print(' ', e)

# merged edge list, dedup by (from,to), prefer video-flow label if both exist
merged = {}
for f, l, t, s in edges_vf:
    merged[(f, t)] = (l, s)
for f, l, t, s in edges_vr:
    if (f, t) not in merged:
        merged[(f, t)] = (l, s)

with open('merged_edges.tsv', 'w', encoding='utf-8') as fh:
    fh.write('from\tto\tlabel\tsource\n')
    for (f, t), (l, s) in sorted(merged.items()):
        fh.write(f'{f}\t{t}\t{l}\t{s}\n')

print("merged unique edges:", len(merged))

# ---- graph stats on merged graph ----
from collections import defaultdict
adj = defaultdict(list)
for (f, t), (l, s) in merged.items():
    adj[f].append((t, l, s))

start = 'video1'  # effective narrative start (video_intro_loop -> video1 via routing, intro screen not a "video node")
endings = [k for k, v in videos.items() if v.get('isEnding')]
print("declared endings (isEnding=true):", endings)

# also treat "menu with targetVideoId: null" as a terminal marker
terminal_null = [name for name, r in routing.items() if name != 'intro' and any(m.get('targetVideoId') is None for m in (r.get('menus') or []))]
print("videoRouting nodes with a null-target 'Next' menu (soft terminal):", terminal_null)

# reachable set from start
seen = set()
stack = [start]
while stack:
    n = stack.pop()
    if n in seen:
        continue
    seen.add(n)
    for t, l, s in adj.get(n, []):
        if t not in seen:
            stack.append(t)
print("reachable node count from", start, ":", len(seen))
all_node_names = set(videos.keys())
unreachable = all_node_names - seen - {'video_intro_loop'}
print("unreachable from start (excluding intro):", sorted(unreachable))

# simple path count + max depth to each ending, DFS with visited set (paths capped)
import sys
sys.setrecursionlimit(10000)

def simple_paths_count(src, dst, adj, limit=200000):
    count = [0]
    max_depth = [0]
    def dfs(node, visited, depth):
        if count[0] > limit:
            return
        if node == dst:
            count[0] += 1
            max_depth[0] = max(max_depth[0], depth)
            return
        for t, l, s in adj.get(node, []):
            if t not in visited:
                dfs(t, visited | {t}, depth + 1)
    dfs(src, {src}, 0)
    return count[0], max_depth[0]

for e in endings:
    c, d = simple_paths_count(start, e, adj)
    print(f"paths {start} -> {e}: {c}  (max depth among them: {d} edges)")

# overall max simple-path depth from start (longest chain, regardless of ending)
best = [0]
def dfs_max(node, visited, depth):
    best[0] = max(best[0], depth)
    for t, l, s in adj.get(node, []):
        if t not in visited:
            dfs_max(t, visited | {t}, depth + 1)
dfs_max(start, {start}, 0)
print("overall max simple-path depth from", start, ":", best[0], "edges")

# cycle detection (report a few back-edges)
back_edges = []
def dfs_cycle(node, stack_path, visited):
    visited.add(node)
    for t, l, s in adj.get(node, []):
        if t in stack_path:
            back_edges.append((node, t))
        elif t not in visited:
            dfs_cycle(t, stack_path | {t}, visited)
dfs_cycle(start, {start}, set())
print("back-edges (cycles) found:", back_edges)
