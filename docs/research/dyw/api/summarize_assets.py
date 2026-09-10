# -*- coding: utf-8 -*-
import csv
from collections import defaultdict

rows = list(csv.DictReader(open('asset-headers.csv', encoding='utf-8')))
print("total rows:", len(rows))

by_cat = defaultdict(list)
for r in rows:
    by_cat[r['category']].append(r)

grand_total = 0
grand_count_200 = 0
for cat, items in by_cat.items():
    ok = [i for i in items if i['status'] == '200']
    not_ok = [i for i in items if i['status'] != '200']
    sizes = [int(i['content_length']) for i in ok if i['content_length']]
    total = sum(sizes)
    grand_total += total
    grand_count_200 += len(ok)
    avg = total / len(sizes) if sizes else 0
    mx = max(sizes) if sizes else 0
    print(f"\n=== {cat} ===")
    print(f"  200 OK: {len(ok)}/{len(items)}  total={total:,} bytes ({total/1024/1024:.2f} MB)  avg={avg:,.0f}  max={mx:,}")
    statuses = defaultdict(int)
    for i in items:
        statuses[i['status']] += 1
    print("  status breakdown:", dict(statuses))
    ct = defaultdict(int)
    for i in ok:
        ct[i['content_type']] += 1
    print("  content-types:", dict(ct))
    # cache-control / accept-ranges sample
    if ok:
        print("  sample cache-control:", ok[0]['cache_control'], "| accept-ranges:", ok[0]['accept_ranges'])

print(f"\n\nGRAND TOTAL (200 OK only): {grand_total:,} bytes = {grand_total/1024/1024:.2f} MB = {grand_total/1024/1024/1024:.3f} GB")
print(f"GRAND TOTAL 200 count: {grand_count_200} / {len(rows)}")

# per-video mp4 stats
mp4s = [i for i in by_cat['video_mp4'] if i['status']=='200' and i['content_length']]
sizes = sorted((int(i['content_length']), i['url']) for i in mp4s)
if sizes:
    print("\n--- mp4 size extremes ---")
    print("smallest:", sizes[0])
    print("largest:", sizes[-1])
    print("avg:", sum(s for s,_ in sizes)/len(sizes))
