# -*- coding: utf-8 -*-
import csv
from collections import defaultdict

rows = list(csv.DictReader(open('asset-headers.csv', encoding='utf-8')))

def is_real(r):
    ct = (r['content_type'] or '')
    return r['status'] == '200' and not ct.startswith('text/html')

by_cat = defaultdict(list)
for r in rows:
    by_cat[r['category']].append(r)

grand_total = 0
grand_count = 0
print("category,real_count,total_of_category,total_bytes,total_MB,avg_bytes,max_bytes,min_bytes")
for cat, items in by_cat.items():
    real = [i for i in items if is_real(i)]
    sizes = [int(i['content_length']) for i in real if i['content_length']]
    total = sum(sizes)
    grand_total += total
    grand_count += len(real)
    avg = total/len(sizes) if sizes else 0
    mx = max(sizes) if sizes else 0
    mn = min(sizes) if sizes else 0
    print(f"{cat},{len(real)},{len(items)},{total},{total/1024/1024:.2f},{avg:.0f},{mx},{mn}")

print()
print(f"GRAND TOTAL real assets: {grand_count} files, {grand_total:,} bytes = {grand_total/1024/1024:.2f} MB = {grand_total/1024/1024/1024:.3f} GB")

# fallback (missing) list per category
print("\n--- fallback (SPA index.html, i.e. asset missing) items ---")
for cat, items in by_cat.items():
    fallback = [i for i in items if not is_real(i)]
    if fallback:
        print(f"{cat}: {len(fallback)} missing, e.g.:")
        for i in fallback[:8]:
            print("   ", i['url'])

# mp4 real list with sizes for per-node table
print("\n--- mp4 real files (name,size) ---")
mp4_real = [(i['url'].split('/')[-1], int(i['content_length'])) for i in by_cat['video_mp4'] if is_real(i)]
for name, size in sorted(mp4_real):
    print(f"{name}\t{size}")
