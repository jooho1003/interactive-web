# -*- coding: utf-8 -*-
import json
d = json.load(open('app-settings.json', encoding='utf-8'))

out = open('design_dump.txt', 'w', encoding='utf-8')
def w(*a):
    print(*a, file=out)

w("=== design.desktop ===")
w(json.dumps(d['design']['desktop'], ensure_ascii=False, indent=2))
w()
w("=== skip.desktop ===")
w(json.dumps(d['skip']['desktop'], ensure_ascii=False, indent=2))
w()
w("=== replay.desktop ===")
w(json.dumps(d['replay']['desktop'], ensure_ascii=False, indent=2))
w()
w("=== langToggle.desktop ===")
w(json.dumps(d['langToggle']['desktop'], ensure_ascii=False, indent=2))
w()
w("=== menuDesign.desktop ===")
w(json.dumps(d['menuDesign']['desktop'], ensure_ascii=False, indent=2))
w()
w("=== masterColor ===")
w(json.dumps(d['masterColor'], ensure_ascii=False, indent=2))
w()
w("=== savedColors ===")
w(json.dumps(d['savedColors'], ensure_ascii=False, indent=2))
w()
w("=== individualHighlights ===")
w(json.dumps(d['individualHighlights'], ensure_ascii=False, indent=2))
w()
w("=== individualHighlightOpacity ===")
w(json.dumps(d['individualHighlightOpacity'], ensure_ascii=False, indent=2))
w()
w("=== timeline (video3-IN sample) ===")
w(json.dumps(d['timeline']['desktop'].get('video3-IN'), ensure_ascii=False, indent=2))
w()
w("=== videoTiming sample (first 10) ===")
vt = d['videoTiming']
for i,(k,v) in enumerate(vt.items()):
    if i>=10: break
    w(k, '=', v)
w("videoTiming total keys:", len(vt))
w()
w("=== videoGlow sample ===")
vg = d['videoGlow']
for i,(k,v) in enumerate(vg.items()):
    if i>=5: break
    w(k, '=', json.dumps(v, ensure_ascii=False))
w("videoGlow total keys:", len(vg))
w()
w("=== subtitles.desktop.KO.style ===")
w(json.dumps(d['subtitles']['desktop']['KO']['style'], ensure_ascii=False, indent=2))
w()
w("=== subtitles.desktop.KO.videos - counts per node ===")
svk = d['subtitles']['desktop']['KO']['videos']
total_cues = 0
for k,v in svk.items():
    total_cues += len(v)
w("nodes with KO subtitles:", len(svk), "| total cue count:", total_cues)
w("sample node cues (video1):", json.dumps(svk.get('video1'), ensure_ascii=False, indent=2)[:1500])
w()
sve = d['subtitles']['desktop']['EN']['videos']
total_en = sum(len(v) for v in sve.values())
w("nodes with EN subtitles:", len(sve), "| total EN cue count:", total_en)
out.close()
print("done")
