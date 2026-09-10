# -*- coding: utf-8 -*-
import json
d = json.load(open('video-flow.json', encoding='utf-8'))
v = d['videos']
for k in ['video18','video28','video43-1','video45','video2-G','video6']:
    print(k, '=>', v.get(k))
print()
print('Nodes with non-empty navigation in video-flow:')
for k,val in v.items():
    if val.get('navigation'):
        print(' ', k, val['navigation'])
