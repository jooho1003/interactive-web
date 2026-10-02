"""Blender 4.5 / Cycles: physical night-store render study, not AI image generation.
Run from repository: blender --background --python projects/dawn-store/scripts/render-store.py
Candidates stay outside app/public until visual review. Shared CC0 sources: art/materials.
"""
import bpy, math, random, json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'art'/'blender-study'
LIB = ROOT.parents[1]/'art'/'materials'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(31)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=.5, metal=0, transmission=0, emission=0):
    mat=bpy.data.materials.new(name); mat.use_nodes=True
    p=mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=roughness
    p.inputs['Metallic'].default_value=metal
    p.inputs['Transmission Weight'].default_value=transmission
    p.inputs['IOR'].default_value=1.46
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=emission
    return mat

def photo(name, asset, tint, meters=1, roughness=.5):
    mat=material(name,tint,roughness); nodes=mat.node_tree.nodes; links=mat.node_tree.links
    p=nodes.get('Principled BSDF'); coords=nodes.new('ShaderNodeTexCoord')
    mapping=nodes.new('ShaderNodeVectorMath'); mapping.operation='SCALE'; mapping.inputs['Scale'].default_value=1/meters
    links.new(coords.outputs['Object'],mapping.inputs[0])
    tex=nodes.new('ShaderNodeTexImage'); tex.image=bpy.data.images.load(str(LIB/f'{asset}_diff_1k.jpg'),check_existing=True)
    tex.projection='BOX'; tex.projection_blend=.1; links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
    mix=nodes.new('ShaderNodeMixRGB'); mix.blend_type='MULTIPLY'; mix.inputs[0].default_value=1; mix.inputs[2].default_value=(*tint,1)
    links.new(tex.outputs['Color'],mix.inputs[1]); links.new(mix.outputs[0],p.inputs['Base Color'])
    pores=nodes.new('ShaderNodeTexNoise'); pores.inputs['Scale'].default_value=190
    links.new(coords.outputs['Object'],pores.inputs['Vector'])
    bump=nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.16; bump.inputs['Distance'].default_value=.001
    links.new(pores.outputs['Fac'],bump.inputs['Height']); links.new(bump.outputs['Normal'],p.inputs['Normal'])
    rough=nodes.new('ShaderNodeMapRange'); rough.inputs['To Min'].default_value=roughness-.05; rough.inputs['To Max'].default_value=roughness+.12
    links.new(pores.outputs['Fac'],rough.inputs['Value']); links.new(rough.outputs['Result'],p.inputs['Roughness'])
    return mat

ivory=photo('Painted walls','white_plaster_02',(.74,.78,.77),2,.8)
stone=photo('Polished counter','stone_floor',(.26,.29,.27),2,.15)
floor=photo('Worn store floor','stone_floor',(.65,.66,.59),2,.28)
oak=photo('Warm oak panel','white_oak_veneer',(.42,.31,.21),1,.42)
paper=material('Cup paper',(.86,.81,.67),.72)
kraft=photo('Corrugated sleeve','white_plaster_02',(.44,.24,.09),.08,.86)
dark=material('Lid and frames',(.013,.019,.018),.3)
metal=material('Stainless steel',(.47,.52,.5),.24,.85)
glass=material('Window glass',(.97,.99,1),.015,0,1)
water=material('Rain drops',(.98,.99,1),.02,0,1)
warm=material('Warm practical', (1,.61,.26),.3,0,0,6)
cool=material('Fluorescent diffuser',(.69,.85,1),.3,0,0,5)
white=material('Receipt paper',(.79,.79,.71),.86)

def box(name, loc, dimensions, mat, bevel=.008):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    obj=bpy.context.object; obj.name=name; obj.dimensions=dimensions
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod=obj.modifiers.new('Manufactured edge','BEVEL'); mod.width=bevel; mod.segments=3
        obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj

def cylinder(name, loc, radius, depth, mat, top=None):
    bpy.ops.mesh.primitive_cone_add(vertices=96,radius1=radius,radius2=radius if top is None else top,depth=depth,location=loc)
    obj=bpy.context.object; obj.name=name; obj.data.materials.append(mat)
    for f in obj.data.polygons: f.use_smooth=True
    mod=obj.modifiers.new('Rolled edge','BEVEL'); mod.width=.001; mod.segments=3
    obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj

def area(name, loc, target, energy, color, size, size_y=None):
    bpy.ops.object.light_add(type='AREA',location=loc); obj=bpy.context.object; obj.name=name
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    obj.data.energy=energy; obj.data.color=color; obj.data.shape='RECTANGLE'
    obj.data.size=size; obj.data.size_y=size_y or size
    return obj

# One physical interior shared by the counter and coffee cameras.
box('Floor',(0,3,-.08),(8,13,.16),floor)
box('Ceiling',(0,3,3.3),(8,13,.14),ivory)
box('Back wall',(0,9,1.6),(8,.15,3.2),ivory)
box('Side wall',(3.8,3,1.6),(.15,12,3.2),ivory)
box('Window',(-1.75,2,1.6),(.015,10,3.0),glass,0)
for y in [-2,.1,2.2,4.3,6.4]:
    box('Window mullion',(-1.72,y,1.6),(.045,.065,3.1),dark)
box('Window sill',(-1.72,2,.52),(.14,10,.04),metal)
box('Window transom',(-1.72,2,2.8),(.045,10,.055),dark)
box('Counter top',(0,.0,1.0),(3.3,1.25,.055),stone)
box('Counter front',(0,.25,.49),(3.1,.85,.94),oak)
box('Counter metal edge',(0,-.64,.99),(3.33,.025,.045),metal)
box('Checkout counter',(2.3,3,.97),(1.7,2,.08),stone)
box('Checkout cabinet',(2.3,3,.45),(1.6,1.9,.9),oak)
box('Register stand',(2.25,2.9,1.17),(.25,.22,.32),dark)
screen=box('Dark POS terminal',(2.25,2.8,1.38),(.52,.10,.37),dark); screen.rotation_euler.x=.2
box('Magazine stand',(.5,3.4,.7),(.8,.3,1.4),metal)
for i in range(5):
    book=box('Unbranded magazine',(.19+i*.14,3.22,1.09),(.12,.027,.28),paper); book.rotation_euler.x=-.15
for y in [1.8,4.2,6.8]:
    box('Fluorescent tube',(1,y,3.12),(.075,1.2,.045),cool)
    area('Cool ceiling light',(1,y,3.02),(1,y,0),38,(.66,.83,1),.09,1.2)
box('Warm lamp shade',(.3,1.35,2.3),(.28,.28,.36),warm,.035)
area('Counter practical',(.3,1.3,2.1),(-.3,0,1),20,(1,.61,.3),.25)
area('Blue window fill',(-2.5,-.6,2.2),(0,1,1),70,(.3,.48,.77),4,2)
area('Glass strip reflection',(-1.3,4.5,2.9),(-1.75,1,1.5),15,(1,.68,.37),.08,1)

# Refrigerated shelves: individual labels, caps, imperfect stock placement.
palette=[(.35,.07,.035),(.06,.19,.17),(.61,.44,.13),(.2,.25,.34),(.73,.65,.5),(.30,.06,.11)]
stock=[material('Package '+str(i),c,.36) for i,c in enumerate(palette)]
label=[material('Label '+str(i),tuple(min(1,c*.55+.37) for c in rgb),.54) for i,rgb in enumerate(palette)]
for bay in range(3):
    x=-.85+bay*1.36
    box('Cooler backing',(x,7.8,1.5),(1.30,.3,2.5),dark)
    box('Cooler header',(x,7.5,2.7),(1.27,.18,.17),cool)
    for z in [.5,.93,1.36,1.79,2.22]:
        box('Shelf',(x,7.3,z),(1.25,.7,.025),metal)
        box('Price rail',(x,6.96,z-.025),(1.25,.022,.06),paper)
        for col in range(8):
            px=x-.52+col*.148+random.uniform(-.01,.01); py=7.15+random.uniform(-.03,.03)
            idx=random.randrange(6); h=random.uniform(.20,.30)
            if col%3:
                cylinder('Bottle',(px,py,z+h/2+.016),.045,h,stock[idx],.032)
                cylinder('Bottle cap',(px,py,z+h+.016),.033,.025,dark)
                cylinder('Paper wrap',(px,py,z+h*.52+.016),.046,h*.48,label[idx],.040)
            else:
                box('Paper carton',(px,py,z+h/2+.016),(.105,.10,h),stock[idx],.003)
                box('Carton label',(px,py-.052,z+h*.5),(.075,.003,h*.55),label[idx],0)
    for sx in [-.655,.655]: box('Cooler vertical frame',(x+sx,6.9,1.48),(.035,.04,2.48),metal)
    box('Cooler glass',(x,6.89,1.47),(1.23,.008,2.4),glass,0)

# Cup proportions and rolled lip/lid details read at photographic scale.
cx,cy=-.63,-.16
cylinder('Paper coffee cup',(cx,cy,1.159),.060,.255,paper,.080)
cylinder('Kraft insulating sleeve',(cx,cy,1.16),.068,.12,kraft,.078)
for i in range(100):
    a=i*math.tau/100; cylinder('Sleeve rib',(cx+math.cos(a)*.074,cy+math.sin(a)*.074,1.16),.0008,.115,kraft)
cylinder('Lid skirt',(cx,cy,1.294),.084,.017,dark)
cylinder('Lid ridge',(cx,cy,1.307),.077,.012,dark,.075)
cylinder('Lid center',(cx,cy,1.315),.064,.009,dark)
box('Drinking slot',(cx-.05,cy,1.321),(.009,.024,.002),metal,.003)
box('Napkin dispenser',(-1.27,.16,1.1),(.23,.16,.18),metal)
for i in range(15):
    stick=cylinder('Wooden stirrer',(-1.25+random.uniform(-.045,.045),.18+random.uniform(-.035,.035),1.3),.002,.32,oak)
    stick.rotation_euler.y=random.uniform(-.12,.12)
# Curled receipt, physical rather than flat white rectangle.
verts=[]; faces=[]
for row in range(21):
    y=-.20+row*.012
    for col in range(9):
        x=.01+col*.018; z=1.032+.012*math.sin(row*.3)+.003*math.sin(col*.7)
        verts.append((x,y,z))
for row in range(20):
    for col in range(8):
        a=row*9+col; faces.append((a,a+1,a+10,a+9))
mesh=bpy.data.meshes.new('Curled receipt');mesh.from_pydata(verts,[],faces);mesh.update()
receipt=bpy.data.objects.new('Receipt 23:00',mesh);bpy.context.collection.objects.link(receipt);mesh.materials.append(white)
ink=material('Faded receipt ink',(.14,.17,.15),.9)
for i in range(15):
    for j in range(random.randrange(4,12)):
        box('Thermal receipt marks',(.03+j*.008,-.17+i*.012,1.034+.012*math.sin((i+3)*.3)),(.005,.002,.0005),ink,0)

# Wet glass and distant building silhouettes remain outside the store.
for i in range(180):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(-1.769,random.uniform(-1.8,6.7),random.uniform(.65,2.75)))
    drop=bpy.context.object;drop.name='Window droplet';drop.scale=(.002,random.uniform(.003,.009),random.uniform(.007,.028));drop.data.materials.append(water)
night=material('Blue night buildings',(.019,.032,.057),.8)
for i in range(8):
    h=random.uniform(5,12);box('Distant city',(-8-random.random()*4,-8+i*3,h/2),(2.5,2,h),night,.02)
box('Outside wet paving',(-8,0,-.04),(14,25,.06),stone)

scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=256
scene.cycles.use_denoising=True;scene.cycles.adaptive_threshold=.015
scene.cycles.max_bounces=12;scene.cycles.transmission_bounces=8;scene.cycles.transparent_max_bounces=8
scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.6
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.09,.18,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.12
scene.use_nodes=True;nodes=scene.node_tree.nodes;nodes.clear()
rl=nodes.new('CompositorNodeRLayers');glare=nodes.new('CompositorNodeGlare');glare.glare_type='FOG_GLOW';glare.quality='HIGH';glare.threshold=2;glare.mix=-.96
comp=nodes.new('CompositorNodeComposite');scene.node_tree.links.new(rl.outputs['Image'],glare.inputs['Image']);scene.node_tree.links.new(glare.outputs['Image'],comp.inputs['Image'])
metadata={'engine':'Cycles','samples':256,'resolution':[1920,1080],'seed':31,'cameras':[]}
for name,eye,target,lens,fstop in [('counter',(.45,-2.6,1.53),(-.3,.9,1.36),38,2.8),('coffee',(.10,-.95,1.38),(-.56,-.12,1.17),58,2.8)]:
    bpy.ops.object.camera_add(location=eye);cam=bpy.context.object;cam.name=name;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens
    cam.data.dof.use_dof=True;cam.data.dof.focus_distance=(Vector((cx,cy,1.17))-cam.location).length;cam.data.dof.aperture_fstop=fstop;cam.data.dof.aperture_blades=7
    metadata['cameras'].append({'name':name,'eye':eye,'target':target,'lens':lens,'fstop':fstop})
scene.camera=bpy.data.objects['counter'];bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'night-store.blend'))
for name in ['counter','coffee']:
    scene.camera=bpy.data.objects[name];scene.render.filepath=str(OUT/f'{name}.png');bpy.ops.render.render(write_still=True)
(OUT/'render-settings.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf8')
print('RENDER STUDY COMPLETE',OUT)
