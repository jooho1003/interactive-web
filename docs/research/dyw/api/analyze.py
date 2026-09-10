import json
d = json.load(open('video-flow.json', encoding='utf-8'))
print("startVideo:", d['startVideo'])
print("buttonShowTiming:", d['buttonShowTiming'])
print("availableFilesCount:", d['availableFilesCount'])
print("totalVideosCount:", d['totalVideosCount'])
print("copyright:", d.get('copyright'))
videos = d['videos']
print("node count:", len(videos))
endings = [k for k,v in videos.items() if v.get('isEnding')]
print("endings:", endings, len(endings))
unavailable = [k for k,v in videos.items() if v.get('available') is False]
print("unavailable:", unavailable)
hidden = [k for k in videos if 'HIDDEN' in k.upper()]
print("hidden-named:", hidden)
