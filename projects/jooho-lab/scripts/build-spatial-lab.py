"""Blender 4.5: reproducible connected pavilion. Coordinates below use Three Y-up.
Run: blender --background --python scripts/build-spatial-lab.py
Physical geometry is fixed to keep the doorway and camera safety corridor aligned.
"""
import bpy, math, random, importlib.util
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
glass=material('Architectural glass',(.52,.66,.69),.08,.15)
glass.diffuse_color=(*glass.diffuse_color[:3],.16)
glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.16
glass.surface_render_method='DITHERED'
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
        b=o.modifiers.new('Soft edges','BEVEL');b.width=bevel;b.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
        for p in o.data.polygons:p.use_smooth=True
        n=o.modifiers.new('Architectural normals','WEIGHTED_NORMAL');n.keep_sharp=True
        bpy.ops.object.modifier_apply(modifier=n.name)
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
        box('Floor slab',(x,.01,z),(1.991,.07,1.991),floor if (x+z)%4 else floor2,.006)
box('Rear wall',(0,2.5,-7),(18,5,.35),plaster)
box('West wall',(-8.8,2.5,-.6),(.3,5,13.1),stone)
box('East wall',(8.8,2.5,-.6),(.3,5,13.1),stone)
box('Roof',(0,5.0,-.1),(19,.28,16.2),stone,.04)
box('Roof shadow reveal',(0,4.82,-.1),(18.8,.055,16),dark,.008)
box('Roof metal coping',(0,5.16,-.1),(19.04,.045,16.24),dark,.012)
# Thin cladding stays outside the existing structural walls and camera corridor.
for side in [-1,1]:
    for row in range(5):
        for bay in range(7):
            box('Limestone rainscreen',(side*8.974,.52+row*.96,-6.18+bay*1.84),(.058,.952,1.832),stone,.008)
box('Ceiling',(0,4.8,-.3),(17.6,.08,14),wood)
for x in range(37):
    box('Ceiling fin',(-8.6+x*.48,4.63,-.4),(.065,.24,14),wood)
for x in [-8.6,-5.7,-2.5,2.5,5.7,8.6]:
    box('Facade mullion',(x,2.4,5.8),(.09,4.8,.22),dark,.008)
    box('Mullion bronze cap',(x,2.4,5.932),(.045,4.76,.025),brass,.004)
box('Facade lintel',(0,4.35,5.8),(17.4,.12,.18),dark)
box('Facade sill',(0,.12,5.8),(17.4,.12,.18),dark)
# Floating limestone screen creates depth outside without blocking the entrance.
box('West facade monolith',(-6.65,2.38,6.0),(4.0,4.76,.42),stone,.03)
for column in range(4):
    for row in range(4):
        box('Facade cut limestone',(-8.15+column, .61+row*1.18,6.235),(.992,1.172,.055),stone,.008)
# Glazing only in side bays: no pane intersects the open central entrance.
for left,right in [(-4.6,-2.56),(2.56,5.64),(5.76,8.54)]:
    box('Facade glazing',((left+right)/2,2.22,5.8),(right-left,4.12,.016),glass)
    for x in [left,right]:box('Glazing gasket',(x,2.22,5.81),(.018,4.12,.04),dark)
box('Entry bronze surround',(0,4.2,5.95),(3.6,.17,.3),brass)
for x in [-1.75,1.75]:box('Entry jamb',(x,2.1,5.95),(.13,4.2,.3),brass)
for x in [-7.8,7.8]:box('Ceiling ribbon',(x,4.56,-.3),(.065,.02,12),light)
box('Rear light shelf',(0,3.9,-6.65),(16,.08,.3),wood)
box('Rear cove',(0,3.98,-6.75),(16,.04,.08),light)

# Seven bays receive live project artwork in Three.js, never baked project text.
for i in range(7):
    x=(i-3)*2.15
    box('Exhibit backing',(x,2.22,-6.73),(1.75,2.65,.15),wood,.035)
    box('Exhibit paper mount',(x,2.3,-6.62),(1.51,1.91,.04),plaster,.006)
    for side in [-1,1]:
        box('Fine exhibit frame',(x+side*.766,2.3,-6.625),(.014,1.94,.045),brass,.003)
        box('Fine exhibit frame',(x,2.3+side*.962,-6.625),(1.546,.014,.045),brass,.003)
    box('Exhibit shelf',(x,.77,-6.32),(1.8,.12,.72),stone,.035)
    pole('Gallery spotlight stem',(x,4.55,-5.7),(x,4.3,-5.7),.035,dark)
    pole('Gallery spotlight',(x,4.3,-5.7),(x,4.13,-5.95),.10,dark)

# Lounge, desk and sculptural objects stay outside the central camera corridor.
box('Lounge rug',(-4.9,.08,.6),(4.8,.025,4.1),fabric,.02)
box('Sofa base',(-5.8,.35,1.4),(3.5,.45,1.35),wood,.08)
box('Sofa back',(-5.8,.85,1.9),(3.5,.9,.35),fabric,.14)
for x in [-6.95,-5.8,-4.65]:box('Sofa cushion',(x,.69,1.28),(1.1,.24,1.08),fabric,.1)
for x,angle in [(-6.8,-.12),(-4.8,.16)]:
    cushion=box('Loose linen cushion',(x,1.06,1.67),(.66,.58,.2),fabric,.09)
    cushion.rotation_euler=(.14,angle,angle)
for x in [-7.57,-4.03]:box('Sofa arm',(x,.69,1.42),(.16,.42,1.15),wood,.06)
box('Coffee table',(-4.9,.56,-.15),(2.3,.16,1.05),stone,.08)
for x in [-5.7,-4.1]:box('Coffee table foot',(x,.27,-.15),(.12,.52,.65),wood)
for i in range(3):box('Design books',(-5.15,.68+i*.045,-.2),(.55,.045,.4),plaster if i%2 else dark,.008)
for i in range(3):box('Book page edge',(-5.15,.68+i*.045,.001),(.5,.028,.004),plaster)
pole('Vase',(-4.4,.65,-.1),(-4.4,.93,-.1),.13,brass)
box('Studio desk',(5.5,1.03,.4),(3.6,.15,1.5),wood,.06)
for x in [4.0,7.0]:box('Desk pedestal',(x,.5,.4),(.17,1.0,1.15),dark)
box('Monitor',(5.5,1.75,.07),(1.45,.86,.07),dark,.04)
box('Monitor screen',(5.5,1.75,.12),(1.32,.74,.025),water)
box('Monitor stand',(5.5,1.24,.07),(.08,.42,.08),dark)
box('Keyboard',(5.5,1.13,.77),(.8,.04,.28),dark,.02)
for row in range(4):
    for key in range(12):box('Keyboard key',(5.155+key*.062,1.156,.68+row*.058),(.05,.012,.042),plaster,.003)
mouse=box('Mouse',(6.16,1.145,.76),(.14,.08,.23),plaster,.035)
box('Desk notebook',(4.35,1.125,.59),(.5,.035,.68),fabric,.008)
pole('Desk pen',(4.54,1.156,.39),(4.51,1.156,.86),.012,brass)
box('Desk drawer',(6.7,.83,.35),(.64,.25,1.13),wood,.018)
box('Drawer shadow reveal',(6.7,.86,.922),(.57,.012,.008),dark)
pole('Drawer pull',(6.52,.8,.943),(6.86,.8,.943),.014,brass)
# Small ceramic cup with a real open rim, coffee surface and rounded handle.
bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.085,depth=.15,end_fill_type='NOTHING',location=pos(6.65,1.2,.38))
o=bpy.context.object;o.name='Ceramic cup';o.data.materials.append(plaster)
solid=o.modifiers.new('Ceramic wall','SOLIDIFY');solid.thickness=.012;bpy.ops.object.modifier_apply(modifier=solid.name)
for face in o.data.polygons:face.use_smooth=True
bpy.ops.mesh.primitive_torus_add(major_segments=40,minor_segments=10,major_radius=.08,minor_radius=.007,location=pos(6.65,1.275,.38))
bpy.context.object.data.materials.append(plaster)
for face in bpy.context.object.data.polygons:face.use_smooth=True
bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.073,depth=.003,location=pos(6.65,1.25,.38));bpy.context.object.data.materials.append(wood)
bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,major_radius=.048,minor_radius=.009,location=pos(6.755,1.21,.38))
o=bpy.context.object;o.rotation_euler.x=math.pi/2;o.data.materials.append(plaster)
for face in o.data.polygons:face.use_smooth=True
box('Chair seat',(5.5,.61,1.9),(.85,.16,.8),fabric,.1)
box('Chair back',(5.5,1.1,2.22),(.85,.9,.13),fabric,.09)
for x in [5.18,5.82]:
    for z in [1.62,2.15]:pole('Chair leg',(x,0,z),(x,.6,z),.025,dark)
box('Sculpture plinth',(7,.55,-2),(1.25,1.1,1.25),stone,.03)
bpy.ops.mesh.primitive_torus_add(major_segments=96,minor_segments=24,location=pos(7,1.9,-2),major_radius=.52,minor_radius=.10)
o=bpy.context.object;o.name='Loop sculpture';o.rotation_euler=(math.pi/2,.25,.3);o.data.materials.append(brass)
for face in o.data.polygons:face.use_smooth=True
bpy.context.view_layer.update()
lowest=min((o.matrix_world@v.co for v in o.data.vertices),key=lambda v:v.z)
pole('Sculpture mounting pin',(lowest.x,1.1,-lowest.y),(lowest.x,lowest.z+.025,-lowest.y),.018,brass)

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
        for leaf in range(65):
            lx=bx+random.uniform(-.68,.68);ly=y+random.uniform(-.5,.5);lz=bz+random.uniform(-.68,.68)
            mesh=bpy.data.meshes.new('Lance leaf')
            mesh.from_pydata([(-.13,0,0),(-.045,.035,.008),(0,0,.018),(.045,.035,.008),(.13,0,0),(.045,-.035,.008),(-.045,-.035,.008)],[],[(0,1,2),(1,3,2),(3,4,2),(4,5,2),(5,6,2),(6,0,2)])
            mesh.update();o=bpy.data.objects.new('Olive leaf',mesh);bpy.context.collection.objects.link(o);o.location=pos(lx,ly,lz)
            o.data.materials.append(green if leaf%3 else green2)
            o.rotation_euler=(random.random()*2,random.random()*3,random.random()*3)
for args in [(-10,4,4.8),(10,3,5.2),(-12,-5,6),(12,-5,5.6),(-7.8,-1.8,2.7)]:tree(*args)

# Clean seeded stone maps and CC0 photographed oak; provenance is in prompts.
LIBRARY=ROOT.parents[1]/'art'/'materials'
architectural=[stone,plaster,wood,floor,floor2,fabric]
for mat,asset,meters,tint in [(stone,'clean_limestone',2,(.68,.61,.51,1)),(plaster,'clean_limestone',2,(.92,.89,.81,1)),(wood,'white_oak_veneer',2,(.36,.22,.12,1)),(floor,'honed_stone',2,(.82,.77,.68,1)),(floor2,'honed_stone',2,(.92,.87,.77,1)),(fabric,'woven_linen',.8,(.7,.64,.53,1))]:
    nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF')
    coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeVectorMath');mapping.operation='SCALE';mapping.inputs['Scale'].default_value=1/meters
    links.new(coord.outputs['Object'],mapping.inputs[0])
    for suffix,socket in [('diff','Base Color'),('rough','Roughness'),('disp','Normal')]:
        library=LIBRARY if asset=='white_oak_veneer' else SOURCE/'photo-web'
        extension='png' if suffix=='disp' or asset!='white_oak_veneer' else 'jpg'
        tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(library/f'{asset}_{suffix}_1k.{extension}'),check_existing=True);tex.projection='BOX';tex.projection_blend=.15
        if suffix!='diff':tex.image.colorspace_settings.name='Non-Color'
        links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
        if suffix=='diff':
            mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=tint;links.new(tex.outputs['Color'],mix.inputs[1]);links.new(mix.outputs[0],p.inputs[socket])
        elif suffix=='disp':
            normal=nodes.new('ShaderNodeBump');normal.inputs['Strength'].default_value=.18;normal.inputs['Distance'].default_value=.004
            links.new(tex.outputs['Color'],normal.inputs['Height']);links.new(normal.outputs['Normal'],p.inputs[socket])
        else:links.new(tex.outputs['Color'],p.inputs[socket])

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
world=bpy.context.scene.world;world.use_nodes=True;env=world.node_tree.nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(LIBRARY/'overcast_industrial_courtyard_1k.hdr'));world.node_tree.links.new(env.outputs['Color'],world.node_tree.nodes['Background'].inputs[0]);world.node_tree.nodes['Background'].inputs[1].default_value=.35
for x,z in [(-5,0),(5,0),(-4,-5),(4,-5)]:
    bpy.ops.object.light_add(type='AREA',location=pos(x,4.45,z))
    lamp=bpy.context.object;lamp.data.energy=180;lamp.data.color=(1,.75,.48);lamp.data.shape='DISK';lamp.data.size=3
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=64
bpy.context.scene.render.resolution_x=1440;bpy.context.scene.render.resolution_y=900;bpy.context.scene.render.resolution_percentage=100
for i in range(7):
    x=(i-3)*2.15
    bpy.ops.object.light_add(type='SPOT',location=pos(x,4.13,-5.95))
    lamp=bpy.context.object;lamp.name=f'Gallery wash {i+1}'
    direction=(Vector(pos(x,2.15,-6.7))-lamp.location).normalized()
    # Emit beyond the closed fixture cap, not from inside its metal housing.
    lamp.location+=direction*.12;lamp.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
    lamp.data.energy=12;lamp.data.color=(1,1,1);lamp.data.spot_size=.94;lamp.data.spot_blend=1;lamp.data.shadow_soft_size=.08
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'lab-pavilion.blend'))
# Both static gallery illumination and contact occlusion use a fresh UV0 atlas.
# Repeating surface maps stay on UV1. No obsolete whole-building color bake.
objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials[0] in architectural]
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();building=bpy.context.object;building.name='Baked architecture'
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006);bpy.ops.object.mode_set(mode='OBJECT')
spec=importlib.util.spec_from_file_location('photo_export',ROOT/'scripts'/'export-photo-surfaces.py')
photo_export=importlib.util.module_from_spec(spec);spec.loader.exec_module(photo_export)
photo_export.export_web(building,ROOT)
