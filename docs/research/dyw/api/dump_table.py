# -*- coding: utf-8 -*-
import json
d = json.load(open('video-flow.json', encoding='utf-8'))
videos = d['videos']

rows = []
for name, v in videos.items():
    rows.append({
        'node': name,
        'file': v.get('file'),
        'src': v.get('src'),
        'buttons': v.get('buttons'),
        'navigation': v.get('navigation'),
        'defaultGlow': v.get('defaultGlow'),
        'glowCondition': v.get('glowCondition'),
        'setsFlag': v.get('setsFlag'),
        'isEnding': v.get('isEnding', False),
        'available': v.get('available'),
    })

with open('video-flow-table.tsv', 'w', encoding='utf-8') as f:
    f.write('node\tfile\tsrc(base)\tbuttons\tnavigation\tdefaultGlow\tglowCondition\tsetsFlag\tisEnding\tavailable\n')
    for r in sorted(rows, key=lambda x: x['node']):
        src = r['src'] or ''
        # strip query string for readability
        if '?' in src:
            src = src.split('?')[0]
        f.write('\t'.join([
            r['node'],
            str(r['file']),
            src,
            json.dumps(r['buttons'], ensure_ascii=False),
            json.dumps(r['navigation'], ensure_ascii=False),
            str(r['defaultGlow']),
            json.dumps(r['glowCondition'], ensure_ascii=False) if r['glowCondition'] else '',
            str(r['setsFlag']) if r['setsFlag'] else '',
            str(r['isEnding']),
            str(r['available']),
        ]) + '\n')

print("wrote", len(rows), "rows")

# build edge list for mermaid + graph stats
edges = []  # (from, label, to)
for name, v in videos.items():
    nav = v.get('navigation') or {}
    for label, target in nav.items():
        edges.append((name, label, target))

print("total edges:", len(edges))

# adjacency
from collections import defaultdict
adj = defaultdict(list)
for f, label, t in edges:
    adj[f].append((label, t))

start = d['startVideo']
endings = [k for k,v in videos.items() if v.get('isEnding')]
print("start:", start, "endings:", endings)

# path count start->each ending (DAG assumed; check for cycles)
import sys
sys.setrecursionlimit(10000)

memo_paths = {}
visiting = set()
has_cycle = [False]

def count_paths(node, target_set, path_stack):
    if node in path_stack:
        has_cycle[0] = True
        return 0
    if node in target_set:
        return 1
    if node in memo_paths:
        return memo_paths[node]
    path_stack = path_stack | {node}
    total = 0
    for label, t in adj.get(node, []):
        total += count_paths(t, target_set, path_stack)
    memo_paths[node] = total
    return total

target_set = set(endings)
total_paths = count_paths(start, target_set, set())
print("cycle detected:", has_cycle[0])
print("total paths start->any ending:", total_paths)

# max depth (longest simple path length in edges) via DFS since could have cycles
max_depth = [0]
def dfs_depth(node, depth, visited):
    max_depth[0] = max(max_depth[0], depth)
    if depth > 200:
        return
    for label, t in adj.get(node, []):
        if t not in visited:
            dfs_depth(t, depth+1, visited | {t})

dfs_depth(start, 0, {start})
print("max depth (edges) from start:", max_depth[0])

# nodes with no outgoing edges but not marked isEnding
dead_ends = [n for n in videos if not adj.get(n) and not videos[n].get('isEnding')]
print("dead-end (no nav, not isEnding):", dead_ends)

# nodes never referenced as navigation target and not start
all_targets = set(t for _,_,t in edges)
unreferenced = [n for n in videos if n not in all_targets and n != start]
print("unreferenced nodes (not start, not any nav target):", unreferenced)
