# -*- coding: utf-8 -*-
import json
d = json.load(open('app-settings.json', encoding='utf-8'))
print("TOP-LEVEL KEYS:", list(d.keys()))
print()
for k in d:
    v = d[k]
    if isinstance(v, dict):
        print(f"{k}: dict with keys {list(v.keys())[:20]}")
    elif isinstance(v, list):
        print(f"{k}: list len {len(v)}")
    else:
        print(f"{k}: {v!r}")
