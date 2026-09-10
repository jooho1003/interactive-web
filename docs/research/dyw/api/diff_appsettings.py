# -*- coding: utf-8 -*-
import json

dyw = json.load(open('app-settings.json', encoding='utf-8'))
aim = json.load(open('aimovie-baseline/app-settings.raw.json', encoding='utf-8'))

# pretty-save aimovie baseline too
json.dump(aim, open('aimovie-baseline/app-settings.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
aim_vf = json.load(open('aimovie-baseline/video-flow.raw.json', encoding='utf-8'))
json.dump(aim_vf, open('aimovie-baseline/video-flow.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)

dyw_keys = set(dyw.keys())
aim_keys = set(aim.keys())

print("=== TOP-LEVEL KEY DIFF (app-settings) ===")
print("aimovie key count:", len(aim_keys))
print("dyw key count:", len(dyw_keys))
print()
print("keys ONLY in dyw (new features):")
for k in sorted(dyw_keys - aim_keys):
    print(" +", k)
print()
print("keys ONLY in aimovie (removed in dyw):")
for k in sorted(aim_keys - dyw_keys):
    print(" -", k)
print()
print("keys in BOTH:")
for k in sorted(dyw_keys & aim_keys):
    print(" =", k)

print()
print("=== design.desktop sub-key diff ===")
dd = set(dyw.get('design',{}).get('desktop',{}).keys())
ad = set(aim.get('design',{}).get('desktop',{}).keys())
print("dyw only:", sorted(dd-ad))
print("aim only:", sorted(ad-dd))

print()
print("=== aimovie video-flow node count ===")
print(len(aim_vf['videos']))
print("aimovie startVideo:", aim_vf['startVideo'], "buttonShowTiming:", aim_vf.get('buttonShowTiming'))
print("aimovie totalVideosCount:", aim_vf.get('totalVideosCount'), "availableFilesCount:", aim_vf.get('availableFilesCount'))
