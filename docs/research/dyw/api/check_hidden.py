# -*- coding: utf-8 -*-
import json
d = json.load(open('app-settings.json', encoding='utf-8'))
print(json.dumps(d['hiddenLinks'], ensure_ascii=False, indent=2)[:3000])
print()
print("intro block:")
print(json.dumps(d['intro'], ensure_ascii=False, indent=2)[:2000])
print()
print("mobileIntro:")
print(json.dumps({k:v for k,v in d['mobileIntro'].items() if k!='button'}, ensure_ascii=False, indent=2))
