"""Keep photographic detail UVs separate from the architectural light/AO atlas.
Standalone refresh: blender -b art/lab-pavilion.blend --python scripts/export-photo-surfaces.py
Also called by build-spatial-lab.py with newly built geometry.
"""
import bpy, json, struct
from pathlib import Path

CONFIG={
    'Warm limestone':('clean_limestone',2,(.68,.61,.51)),
    'Ivory plaster':('clean_limestone',2,(.92,.89,.81)),
    'Smoked oak':('white_oak_veneer',2,(.36,.22,.12)),
    'Travertine':('honed_stone',2,(.82,.77,.68)),
    'Travertine light':('honed_stone',2,(.92,.87,.77)),
    'Linen':('woven_linen',.8,(.7,.64,.53)),
}

def denoise_map(source_image, root, filename, data=False):
    scene=bpy.data.scenes.new('Offline map denoise')
    scene.camera=bpy.context.scene.camera;scene.collection.objects.link(scene.camera)
    scene.render.engine='CYCLES';scene.cycles.samples=1
    scene.render.resolution_x=2048;scene.render.resolution_y=2048;scene.render.resolution_percentage=100
    scene.use_nodes=True;nodes=scene.node_tree.nodes;nodes.clear()
    source=nodes.new('CompositorNodeImage');source.image=source_image
    denoiser=nodes.new('CompositorNodeDenoise');denoiser.prefilter='ACCURATE'
    target=nodes.new('CompositorNodeComposite')
    scene.node_tree.links.new(source.outputs['Image'],denoiser.inputs['Image'])
    scene.node_tree.links.new(denoiser.outputs['Image'],target.inputs['Image'])
    scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Raw' if data else 'Standard'
    scene.render.filepath=str(root/'art'/filename)
    bpy.ops.render.render(write_still=True,scene=scene.name)
    image=bpy.data.images.load(scene.render.filepath,check_existing=False)
    image.colorspace_settings.name='Non-Color' if data else 'sRGB'
    bpy.data.scenes.remove(scene)
    return image

def export_web(building, root):
    library=root/'art'/'photo-web'
    mesh=building.data;mesh.uv_layers[0].name='Lightmap'
    scene=bpy.context.scene;scene.render.bake.margin=8
    lights=[o for o in scene.objects if o.type=='LIGHT']
    hidden={o:o.hide_render for o in lights}
    background=scene.world.node_tree.nodes.get('Background').inputs['Strength']
    world_strength=background.default_value
    lightmap=bpy.data.images.new('Gallery fixture illumination',width=2048,height=2048,alpha=False)
    for mat in mesh.materials:
        target=mat.node_tree.nodes.new('ShaderNodeTexImage');target.image=lightmap;mat.node_tree.nodes.active=target
    try:
        for lamp in lights:lamp.hide_render=not lamp.name.startswith('Gallery wash')
        background.default_value=0;scene.cycles.samples=32
        scene.render.bake.use_pass_direct=True;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True
        bpy.ops.object.bake(type='DIFFUSE')
        lightmap=denoise_map(lightmap,root,'lab-gallery-light.png')
    finally:
        background.default_value=world_strength
        for lamp,value in hidden.items():lamp.hide_render=value
    ao=bpy.data.images.new('Pavilion corner occlusion',width=2048,height=2048,alpha=False)
    ao.colorspace_settings.name='Non-Color'
    for mat in mesh.materials:
        target=mat.node_tree.nodes.new('ShaderNodeTexImage');target.image=ao;mat.node_tree.nodes.active=target
    scene.cycles.samples=64;scene.world.light_settings.distance=.8
    bpy.ops.object.bake(type='AO')
    ao=denoise_map(ao,root,'lab-occlusion.png',data=True)
    detail=mesh.uv_layers.new(name='Detail')
    originals=list(mesh.materials)
    for face in mesh.polygons:
        meters=CONFIG[originals[face.material_index].name][1]
        normal=face.normal;axis=max(range(3),key=lambda i:abs(normal[i]))
        for index in face.loop_indices:
            point=building.matrix_world@mesh.vertices[mesh.loops[index].vertex_index].co
            pair=(point.y,point.z) if axis==0 else (point.x,point.z) if axis==1 else (point.x,point.y)
            detail.data[index].uv=(pair[0]/meters,pair[1]/meters)
    group=bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree')
    group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat')
    for index,original in enumerate(originals):
        asset,meters,tint=CONFIG[original.name]
        name='Pavilion PBR limestone and oak' if original.name=='Warm limestone' else 'Pavilion PBR '+original.name
        mat=bpy.data.materials.new(name);mat.use_nodes=True
        nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes.get('Principled BSDF')
        uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Detail'
        baked_uv=nodes.new('ShaderNodeUVMap');baked_uv.uv_map='Lightmap'
        for suffix,socket in [('diff','Base Color'),('rough','Roughness'),('nor_gl','Normal')]:
            extension='jpg' if asset=='white_oak_veneer' else 'png'
            tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(library/f'{asset}_{suffix}_1k.{extension}'),check_existing=True)
            if suffix!='diff':tex.image.colorspace_settings.name='Non-Color'
            links.new(uv.outputs['UV'],tex.inputs['Vector'])
            if suffix=='diff':
                multiply=nodes.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1;multiply.inputs[2].default_value=(*tint,1)
                links.new(tex.outputs['Color'],multiply.inputs[1]);links.new(multiply.outputs[0],p.inputs[socket])
            elif suffix=='nor_gl':
                normal=nodes.new('ShaderNodeNormalMap');normal.uv_map='Detail';normal.inputs['Strength'].default_value=.7
                links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs[socket])
            else:links.new(tex.outputs['Color'],p.inputs[socket])
        # Fresh static fixture illumination, controlled as a light layer at runtime.
        tex=nodes.new('ShaderNodeTexImage');tex.image=lightmap;links.new(baked_uv.outputs['UV'],tex.inputs['Vector'])
        links.new(tex.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.5
        tex=nodes.new('ShaderNodeTexImage');tex.image=ao;links.new(baked_uv.outputs['UV'],tex.inputs['Vector'])
        occlusion=nodes.new('ShaderNodeGroup');occlusion.node_tree=group;links.new(tex.outputs['Color'],occlusion.inputs['Occlusion'])
        mesh.materials[index]=mat
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH':obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(root/'public'/'assets'/'lab-pavilion.glb'),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_image_format='JPEG',export_jpeg_quality=85)
    # Blender's MixRGB constant tint is not exported reliably: encode the
    # equivalent standard glTF factor explicitly, without changing any buffers.
    output=root/'public'/'assets'/'lab-pavilion.glb';data=output.read_bytes()
    size=struct.unpack_from('<I',data,12)[0];gltf=json.loads(data[20:20+size])
    gltf['scenes'][0].setdefault('extras',{})['bakedGalleryLights']=sum(o.name.startswith('Gallery wash') for o in lights)
    for mat in gltf['materials']:
        if mat['name'].startswith('Pavilion PBR'):
            key='Warm limestone' if mat['name']=='Pavilion PBR limestone and oak' else mat['name'][len('Pavilion PBR '):]
            mat['pbrMetallicRoughness']['baseColorFactor']=[*CONFIG[key][2],1]
    payload=json.dumps(gltf,separators=(',',':')).encode();payload+=b' '*((-len(payload))%4)
    tail=data[20+size:];length=20+len(payload)+len(tail)
    output.write_bytes(struct.pack('<III',0x46546c67,2,length)+struct.pack('<II',len(payload),0x4e4f534a)+payload+tail)
    print('PHOTO UV / LIGHT UV EXPORTED',output,length)

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1]
    # Keep the editable packed Blender master consistent with the web materials.
    for name,(asset,meters,tint) in CONFIG.items():
        if asset=='white_oak_veneer':continue
        for node in bpy.data.materials[name].node_tree.nodes:
            if node.type!='TEX_IMAGE' or not node.image:continue
            suffix=next((s for s in ['diff','rough','disp'] if f'_{s}_' in node.image.name),None)
            if suffix:
                node.image=bpy.data.images.load(str(root/'art'/'photo-web'/f'{asset}_{suffix}_1k.png'),check_existing=True)
                if suffix!='diff':node.image.colorspace_settings.name='Non-Color'
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'art'/'lab-pavilion.blend'))
    objects=[obj for obj in bpy.context.scene.objects if obj.type=='MESH' and obj.data.materials and obj.data.materials[0].name in CONFIG]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();building=bpy.context.object
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.006);bpy.ops.object.mode_set(mode='OBJECT')
    export_web(building,root)
