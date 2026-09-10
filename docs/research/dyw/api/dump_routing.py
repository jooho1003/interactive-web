# -*- coding: utf-8 -*-
import json
d = json.load(open('app-settings.json', encoding='utf-8'))
vr = d['videoRouting']
print("videoRouting node count:", len(vr))
for k,v in vr.items():
    print(k, '->', v)
print()
print("videoOrder:", d['videoOrder'])
print()
print("dynamicVideos:", d['dynamicVideos'])
print()
print("deletedVideos:", d['deletedVideos'])
print()
print("videoGroups:")
for k,v in d['videoGroups'].items():
    print(' ', k, '->', v)
print()
print("topJumpMenuNames:", d['topJumpMenuNames'])
print()
print("topJumpMenu:", json.dumps(d['topJumpMenu'], ensure_ascii=False, indent=2)[:2000])
