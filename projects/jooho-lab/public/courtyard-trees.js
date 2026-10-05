import * as THREE from './assets/three.module.min.js';
import manifest from './layers.manifest.js';

export async function createCourtyardTrees(world,container,renderer,eye,wake,isDestroyed){
  const loader=new THREE.TextureLoader(),trees=[];
  // layer-fixed: every card/planter stays beyond the widest roof/bridge x=9.8m
  // with 0.4m clearance, even when images, root anchors or rotations change.
  const safeX=10.2;
  for(const id of ['courtyard-trees','courtyard-tree-back']){
    const layer=manifest.layers.find(l=>l.id===id);
    const value=key=>{const p=layer.params[key],v=container.getAttribute(p.attr[1])??p.default;return p.type==='number'?Number(v):p.type==='boolean'?v===true||v==='true':v;};
    let url=value('image'),requested=url,version=0;
    const texture=await loader.loadAsync(url).catch(()=>{url=layer.params.image.default;return loader.loadAsync(url);}).catch(()=>{
      url=null;const t=new THREE.DataTexture(new Uint8Array([0,0,0,0]),1,1);t.needsUpdate=true;return t;
    });
    const configure=t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());};configure(texture);
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.45,side:THREE.DoubleSide});
    const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:texture,alphaTest:.45,side:THREE.DoubleSide});
    const opacity={value:1};let compiled=false;
    depth.onBeforeCompile=shader=>{shader.uniforms.treeOpacity=opacity;shader.fragmentShader='uniform float treeOpacity;\n'+shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a *= treeOpacity;\n#include <alphatest_fragment>');compiled=true;};
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);mesh.customDepthMaterial=depth;world.add(mesh);
    // layer-fixed: original planter dimensions and top y=.255m ground the root.
    const planter=new THREE.Mesh(new THREE.BoxGeometry(1.9,.35,1.9),new THREE.MeshStandardMaterial({roughness:.82,transparent:true}));planter.receiveShadow=true;planter.castShadow=true;world.add(planter);
    const baseYaw=Math.atan2(eye[0]-layer.params.x.default,eye[2]-layer.params.z.default);
    let status=url===requested?'ready':'error';
    function update(){
      material.opacity=value('opacity');material.alphaTest=.45*material.opacity;material.color.set(value('tint')).multiplyScalar(value('brightness'));
      depth.map=material.map;depth.alphaTest=material.alphaTest;depth.opacity=material.opacity;opacity.value=material.opacity;
      const pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
      for(let i=0;i<pos.count;i++)pos.setXY(i,uv.getX(i)-value('baseX'),uv.getY(i)-value('baseY'));
      pos.needsUpdate=true;mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();
      const image=material.map.image;mesh.scale.set(value('height')*image.width/image.height*value('spread'),value('height'),1);
      mesh.rotation.y=baseYaw+THREE.MathUtils.degToRad(value('yaw'));
      mesh.position.set(value('x'),.255,value('z'));mesh.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(mesh,true);mesh.position.x+=Math.max(0,safeX-bounds.min.x,safeX+.95-mesh.position.x);mesh.updateMatrixWorld(true);
      mesh.visible=value('visible')&&material.opacity>0&&!material.map.isDataTexture;mesh.castShadow=mesh.visible;
      planter.position.set(mesh.position.x,.08,mesh.position.z);planter.visible=value('visible')&&material.opacity>0;planter.castShadow=planter.visible;planter.material.color.set(value('planterTint'));planter.material.opacity=material.opacity;
      renderer.shadowMap.needsUpdate=true;
      const next=value('image');if(next!==requested){requested=next;const token=++version;
        if(next===url){status='ready';return;}status='loading';
        loader.load(next,t=>{if(isDestroyed()||token!==version){t.dispose();return;}configure(t);const previous=material.map;material.map=t;material.needsUpdate=true;url=next;status='ready';previous.dispose();update();wake();},undefined,()=>{if(!isDestroyed()&&token===version)status='error';});
      }
    }
    const inspect=()=>{const bounds=new THREE.Box3().setFromObject(mesh,true);return{id,visible:mesh.visible,opacity:material.opacity,height:mesh.scale.y,spread:mesh.scale.x/(mesh.scale.y*material.map.image.width/material.map.image.height),baseX:-mesh.geometry.attributes.position.getX(0),baseY:1-mesh.geometry.attributes.position.getY(0),color:material.color.toArray(),yaw:THREE.MathUtils.radToDeg(mesh.rotation.y-baseYaw),x:mesh.position.x,z:mesh.position.z,requestedX:value('x'),minX:bounds.min.x,planterX:planter.position.x,planterZ:planter.position.z,planterTint:'#'+planter.material.color.getHexString(),image:url,imageStatus:status,shadowOpacity:depth.opacity,shadowAlphaTest:depth.alphaTest,shadowShader:compiled,shadowShaderOpacity:opacity.value};};
    mesh.userData.layerId=id;planter.userData.layerId=id;
    trees.push({update,inspect,depth,mesh,planter});
  }
  return{meshes:trees.flatMap(t=>[t.mesh,t.planter]),update(){trees.forEach(t=>t.update());},inspect(){const items=trees.map(t=>t.inspect());return{...items[0],count:items.length,items,separateShadows:trees[0].depth.id!==trees[1].depth.id,clearsBuilding:items.every(t=>t.minX>=safeX-1e-5)};},dispose(){trees.forEach(t=>t.depth.dispose());}};
}
