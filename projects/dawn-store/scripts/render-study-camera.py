"""Render one existing Blender study camera without rebuilding the scene.
blender -b art/blender-study/night-store.blend --python scripts/render-study-camera.py -- coffee 128
"""
import bpy, json, sys
from pathlib import Path

args=sys.argv[sys.argv.index('--')+1:]
name=args[0];samples=int(args[1]);out=Path(bpy.data.filepath).parent
scene=bpy.context.scene;scene.camera=bpy.data.objects[name]
scene.cycles.samples=samples;scene.cycles.adaptive_threshold=.02
scene.render.filepath=str(out/f'{name}.png')
bpy.ops.render.render(write_still=True)
metadata={'engine':'Cycles','resolution':[1920,1080],'seed':31,
          'cameras':[{'name':'counter','samples':256},{'name':name,'samples':samples}]}
(out/'render-settings.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf8')
print('RENDERED',name,samples)
