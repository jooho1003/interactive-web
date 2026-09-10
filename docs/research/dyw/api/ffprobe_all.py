# -*- coding: utf-8 -*-
import csv, json, subprocess, concurrent.futures as cf

rows = list(csv.DictReader(open('asset-headers.csv', encoding='utf-8')))
mp4_urls = [r['url'] for r in rows if r['category']=='video_mp4' and r['status']=='200' and (r['content_type'] or '').startswith('video')]
print("mp4 to probe:", len(mp4_urls))

def probe(url):
    cmd = ['ffprobe','-v','error','-show_entries',
           'format=duration,bit_rate:stream=width,height,codec_name,r_frame_rate',
           '-of','json', url]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if p.returncode != 0:
            return {'url': url, 'error': p.stderr[:300]}
        data = json.loads(p.stdout)
        return {'url': url, 'data': data}
    except Exception as e:
        return {'url': url, 'error': str(e)}

results = []
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for res in ex.map(probe, mp4_urls):
        results.append(res)
        print(res.get('url'), '->', 'OK' if 'data' in res else res.get('error'))

json.dump(results, open('ffprobe-results.json','w',encoding='utf-8'), indent=2, ensure_ascii=False)
print("saved ffprobe-results.json")
