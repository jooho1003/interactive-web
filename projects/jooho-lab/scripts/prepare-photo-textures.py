"""Prepare oak photos and clean, seeded stone material maps for the pavilion."""
from pathlib import Path
import random, math
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
source=ROOT.parents[1]/'art'/'materials'
output=ROOT/'art'/'photo-web';output.mkdir(exist_ok=True)
for asset in ['white_plaster_02','stone_floor','white_oak_veneer']:
    for suffix in ['diff','rough','nor_gl']:
        name=f'{asset}_{suffix}_1k.jpg'
        Image.open(source/name).save(output/name,quality=88 if suffix=='nor_gl' else 82,optimize=True)
        print(name,(output/name).stat().st_size)

# Fine pores only: broad weathering and the photographed floor's cobble joints
# conflict with the clean, large architectural slabs. These are material data,
# not retouched reference images. Source CC0 photographs remain untouched.
for asset,color,roughness in [('clean_limestone',(246,244,238),218),('honed_stone',(244,241,233),184)]:
    rng=random.Random(42);size=512
    color_data=[];rough_data=[];normal_data=[];height_data=[]
    for _ in range(size*size):
        grain=rng.choice([-1,0,0,0,1])
        color_data.append(tuple(channel+grain for channel in color))
        rough_data.append(roughness+grain*2)
        normal_data.append((128+rng.choice([-1,0,1]),128+rng.choice([-1,0,1]),255))
        height_data.append(128+grain)
    for suffix,mode,pixels in [('diff','RGB',color_data),('rough','L',rough_data),('nor_gl','RGB',normal_data),('disp','L',height_data)]:
        img=Image.new(mode,(size,size));img.putdata(pixels)
        img.save(output/f'{asset}_{suffix}_1k.png')

# A quiet woven fabric: periodic threads, with no large weathering variation.
pixels={key:[] for key in ['diff','rough','nor_gl','disp']}
for y in range(512):
    for x in range(512):
        a=math.sin(x*math.pi/4);b=math.sin(y*math.pi/4);weave=round((a+b)*2)
        pixels['diff'].append((237+weave,230+weave,217+weave))
        pixels['rough'].append(238+weave)
        pixels['nor_gl'].append((round(128-a*9),round(128-b*9),254))
        pixels['disp'].append(128+weave*2)
for suffix,data in pixels.items():
    img=Image.new('RGB' if suffix in ['diff','nor_gl'] else 'L',(512,512));img.putdata(data)
    img.save(output/f'woven_linen_{suffix}_1k.png')
