"""Blender 4.5: reproducible connected pavilion. Coordinates below use Three Y-up.
Run: blender --background --python scripts/build-spatial-lab.py
Physical geometry is fixed to keep the doorway and camera safety corridor aligned.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'assets'
SOURCE = ROOT / 'art'
OUT.mkdir(exist_ok=True)
SOURCE.mkdir(exist_ok=True)
random.seed(42)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=.7, metal=0, emission=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=roughness
    p.inputs['Metallic'].default_value=metal
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=emission
    return m

stone=material('Warm limestone',(.55,.49,.39))
plaster=material('Ivory plaster',(.77,.73,.64))
dark=material('Bronze frames',(.065,.072,.067),.38,.6)
wood=material('Smoked oak',(.22,.12,.055),.66)
floor=material('Travertine',(.47,.43,.35),.58)
floor2=material('Travertine light',(.52,.47,.39),.62)
water=material('Still reflecting pool',(.045,.105,.115),.18,.45)
light=material('Amber light', (1,.63,.25),.4,0,2.5)
fabric=material('Linen',(.66,.58,.44),.95)
green=material('Olive foliage',(.105,.16,.085),.9)
green2=material('Olive leaf silver',(.19,.23,.14),.9)
earth=material('Charcoal gravel',(.11,.12,.105),1)
brass=material('Brushed brass',(.46,.3,.13),.28,.75)

def pos(x,y,z):return (x,-z,y)
def box(name, xyz, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos(*xyz))
    o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    if bevel:
        b=o.modifiers.new('Soft edges','BEVEL');b.width=bevel;b.segments=2
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
    return o
def sphere(name, xyz, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,location=pos(*xyz))
    o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def pole(name,a,b,r,mat):
    a,b=Vector(pos(*a)),Vector(pos(*b));v=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=v.length,location=(a+b)/2)
    o=bpy.context.object;o.name=name;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();o.data.materials.append(mat)
    return o

# Real hollow building: front doorway x=-1.7..1.7, z=5.8. Clear central aisle.
box('Foundation',(0,-.28,0),(18,.5,16),stone,.08)
for x in range(-8,9,2):
    for z in range(-6,7,2):
        box('Floor slab',(x,.01,z),(1.97,.07,1.97),floor if (x+z)%4 else floor2)
box('Rear wall',(0,2.5,-7),(18,5,.35),plaster)
box('West wall',(-8.8,2.5,-.6),(.3,5,13.1),stone)
box('East wall',(8.8,2.5,-.6),(.3,5,13.1),stone)
box('Roof',(0,5.0,-.1),(19,.28,16.2),stone,.04)
box('Ceiling',(0,4.8,-.3),(17.6,.08,14),wood)
for x in range(37):
    box('Ceiling fin',(-8.6+x*.48,4.63,-.4),(.065,.24,14),wood)
for x in [-8.6,-5.7,-2.5,2.5,5.7,8.6]:
    box('Facade mullion',(x,2.4,5.8),(.09,4.8,.14),dark)
box('Facade lintel',(0,4.35,5.8),(17.4,.12,.18),dark)
box('Facade sill',(0,.12,5.8),(17.4,.12,.18),dark)
# Floating limestone screen creates depth outside without blocking the entrance.
box('West facade monolith',(-6.65,2.38,6.0),(4.0,4.76,.42),stone,.03)
for i in range(15):
    box('Facade groove',(-8.45+i*.25,2.38,6.24),(.025,4.68,.018),floor)
box('Entry bronze surround',(0,4.2,5.95),(3.6,.17,.3),brass)
for x in [-1.75,1.75]:box('Entry jamb',(x,2.1,5.95),(.13,4.2,.3),brass)
for x in [-7.8,7.8]:box('Ceiling ribbon',(x,4.56,-.3),(.065,.02,12),light)
box('Rear light shelf',(0,3.9,-6.65),(16,.08,.3),wood)
box('Rear cove',(0,3.98,-6.75),(16,.04,.08),light)

# Seven bays receive live project artwork in Three.js, never baked project text.
for i in range(7):
    x=(i-3)*2.15
    box('Exhibit backing',(x,2.22,-6.73),(1.75,2.65,.15),wood,.035)
    box('Exhibit bronze trim',(x,2.3,-6.62),(1.51,1.91,.04),brass)
    box('Exhibit shelf',(x,.77,-6.32),(1.8,.12,.72),stone,.035)
    pole('Gallery spotlight stem',(x,4.55,-5.7),(x,4.3,-5.7),.035,dark)
    pole('Gallery spotlight',(x,4.3,-5.7),(x,4.13,-5.95),.10,dark)

# Lounge, desk and sculptural objects stay outside the central camera corridor.
box('Lounge rug',(-4.9,.08,.6),(4.8,.025,4.1),fabric,.02)
box('Sofa base',(-5.8,.35,1.4),(3.5,.45,1.35),wood,.08)
box('Sofa back',(-5.8,.85,1.9),(3.5,.9,.35),fabric,.14)
for x in [-6.95,-5.8,-4.65]:box('Sofa cushion',(x,.69,1.28),(1.1,.24,1.08),fabric,.1)
box('Coffee table',(-4.9,.56,-.15),(2.3,.16,1.05),stone,.08)
for x in [-5.7,-4.1]:box('Coffee table foot',(x,.27,-.15),(.12,.52,.65),wood)
for i in range(3):box('Design books',(-5.15,.68+i*.045,-.2),(.55,.045,.4),plaster if i%2 else dark,.008)
pole('Vase',(-4.4,.65,-.1),(-4.4,.93,-.1),.13,brass)
box('Studio desk',(5.5,1.03,.4),(3.6,.15,1.5),wood,.06)
for x in [4.0,7.0]:box('Desk pedestal',(x,.5,.4),(.17,1.0,1.15),dark)
box('Monitor',(5.5,1.75,.07),(1.45,.86,.07),dark,.04)
box('Monitor screen',(5.5,1.75,.12),(1.32,.74,.025),water)
box('Monitor stand',(5.5,1.24,.07),(.08,.42,.08),dark)
box('Keyboard',(5.5,1.13,.77),(.8,.04,.28),dark,.02)
box('Chair seat',(5.5,.61,1.9),(.85,.16,.8),fabric,.1)
box('Chair back',(5.5,1.1,2.22),(.85,.9,.13),fabric,.09)
for x in [5.18,5.82]:
    for z in [1.62,2.15]:pole('Chair leg',(x,0,z),(x,.6,z),.025,dark)
box('Sculpture plinth',(7,.55,-2),(1.25,1.1,1.25),stone,.03)
bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=10,location=pos(7,1.9,-2),major_radius=.52,minor_radius=.10)
o=bpy.context.object;o.name='Loop sculpture';o.rotation_euler=(math.pi/2,.25,.3);o.data.materials.append(brass)

# Courtyard and reflecting pool. No screen-space background masquerading as structure.
box('Courtyard',(0,-.56,7),(70,.3,65),earth)
box('Reflecting pool',(0,-.22,10),(21,.05,5.5),water)
for z in [7.1,8.9,10.7,12.5]:box('Stepping stone',(0,-.07,z),(3.0,.25,1.55),stone,.035)
for side in [-1,1]:
    box('Pool border',(side*10.65,-.08,10),(.22,.28,5.8),stone)
    for z in [8,12]:
        box('Path lantern',(side*2.15,.22,z),(.2,.55,.2),dark,.02)
        box('Path glow',(side*2.15,.47,z),(.19,.04,.19),light)

def tree(x,z,h):
    box('Planter',(x,.08,z),(1.9,.35,1.9),stone,.06)
    pole('Olive trunk',(x,.2,z),(x+.15,h*.72,z),.1,wood)
    for j in range(7):
        a=j*2.4;bx=x+math.cos(a)*.8;bz=z+math.sin(a)*.7;y=h*(.6+random.random()*.25)
        pole('Branch',(x+.1,h*.45,z),(bx,y,bz),.035,wood)
        for leaf in range(34):
            lx=bx+random.uniform(-.68,.68);ly=y+random.uniform(-.5,.5);lz=bz+random.uniform(-.68,.68)
            o=sphere('Olive leaf cluster',(lx,ly,lz),(.16,.06,.08),green if leaf%3 else green2)
            o.rotation_euler=(random.random()*2,random.random()*3,random.random()*3)
for args in [(-10,4,4.8),(10,3,5.2),(-12,-5,6),(12,-5,5.6),(-7.8,-1.8,2.7)]:tree(*args)

# Join static meshes by material to reduce browser draw calls.
for mat in list(bpy.data.materials):
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
    if not objects:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=mat.name

# Source includes a matching exterior camera and lighting for art-direction review.
bpy.ops.object.camera_add(location=pos(12,5.4,24))
cam=bpy.context.object;cam.name='Exterior camera'
cam.rotation_euler=(Vector(pos(0,2,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=34
bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='SUN',location=pos(10,15,8))
sun=bpy.context.object;sun.rotation_euler=(.65,-.5,-.5);sun.data.energy=1.8;sun.data.angle=.08
world=bpy.context.scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.35,.43,.55,1);world.node_tree.nodes['Background'].inputs[1].default_value=.55
for x,z in [(-5,0),(5,0),(-4,-5),(4,-5)]:
    bpy.ops.object.light_add(type='AREA',location=pos(x,4.45,z))
    lamp=bpy.context.object;lamp.data.energy=180;lamp.data.color=(1,.75,.48);lamp.data.shape='DISK';lamp.data.size=3
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=16
bpy.context.scene.render.resolution_x=1440;bpy.context.scene.render.resolution_y=900;bpy.context.scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'lab-pavilion.blend'))
# Architectural surfaces receive one baked diffuse lightmap, preserving soft
# shadows/indirect lighting in the browser without per-frame GI. Plants, metal,
# water and luminous strips remain PBR for small files and crisp silhouettes.
architectural=[stone,plaster,wood,floor,floor2,fabric]
bake_image=bpy.data.images.new('Pavilion baked light',width=2048,height=2048,alpha=False)
objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials[0] in architectural]
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();building=bpy.context.object;building.name='Baked architecture'
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006);bpy.ops.object.mode_set(mode='OBJECT')
for mat in architectural:
    nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF')
    noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=85 if mat!=wood else 7;noise.inputs['Detail'].default_value=3
    bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.07;bump.inputs['Distance'].default_value=.008
    links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],p.inputs['Normal'])
    target=nodes.new('ShaderNodeTexImage');target.image=bake_image;nodes.active=target
bpy.context.scene.render.bake.use_pass_direct=True;bpy.context.scene.render.bake.use_pass_indirect=True;bpy.context.scene.render.bake.use_pass_color=True
bpy.context.scene.render.bake.margin=8
bpy.ops.object.bake(type='DIFFUSE')
bake_image.filepath_raw=str(SOURCE/'lab-lightmap.jpg');bake_image.file_format='JPEG';bake_image.save()
# Denoise the offline light bake before shipping it. No render-time denoiser.
main_scene=bpy.context.scene
denoise_scene=bpy.data.scenes.new('Lightmap denoise');denoise_scene.collection.objects.link(cam);denoise_scene.camera=cam
denoise_scene.render.engine='CYCLES';denoise_scene.cycles.samples=1
denoise_scene.render.resolution_x=2048;denoise_scene.render.resolution_y=2048;denoise_scene.render.resolution_percentage=100
denoise_scene.use_nodes=True;nodes=denoise_scene.node_tree.nodes;nodes.clear()
source=nodes.new('CompositorNodeImage');source.image=bake_image
denoiser=nodes.new('CompositorNodeDenoise');denoiser.prefilter='ACCURATE'
output=nodes.new('CompositorNodeComposite');denoise_scene.node_tree.links.new(source.outputs['Image'],denoiser.inputs['Image']);denoise_scene.node_tree.links.new(denoiser.outputs['Image'],output.inputs['Image'])
denoise_scene.render.image_settings.file_format='PNG';denoise_scene.view_settings.view_transform='Standard';denoise_scene.render.filepath=str(SOURCE/'lab-lightmap.png')
bpy.ops.render.render(write_still=True,scene=denoise_scene.name)
bake_image=bpy.data.images.load(str(SOURCE/'lab-lightmap.png'),check_existing=False)
baked=bpy.data.materials.new('Baked limestone and oak');baked.use_nodes=True
nodes=baked.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');emission=nodes.new('ShaderNodeEmission');tex=nodes.new('ShaderNodeTexImage');tex.image=bake_image
baked.node_tree.links.new(tex.outputs['Color'],emission.inputs['Color']);baked.node_tree.links.new(emission.outputs[0],output.inputs['Surface'])
building.data.materials.clear();building.data.materials.append(baked)
for p in building.data.polygons:p.material_index=0
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'lab-pavilion.glb'),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_image_format='JPEG',export_jpeg_quality=88)
print('EXPORTED',OUT/'lab-pavilion.glb')
