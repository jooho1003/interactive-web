import test from 'node:test';
import assert from 'node:assert/strict';
import {createLayerHost,emptyValues,setValue} from '../src/index.js';

test('two hosts preserve each other’s hidden elements and independent scenes', () => {
  const attributes=new Set();
  const element={setAttribute:name=>attributes.add(name),removeAttribute:name=>attributes.delete(name)};
  const documentBefore=globalThis.document;
  globalThis.document={querySelectorAll:()=>[element]};
  const makeRoot=()=>({dataset:{},style:{setProperty(){}}});
  const manifest={work:'host',version:1,initialScene:'a',scenes:{a:{},b:{}},breakpoints:[],previewScreens:[],layers:[{id:'box',el:'.box',params:{visible:{type:'boolean',default:true,on:'block',off:'none'}}}]};
  try {
    const first=createLayerHost({manifest,published:emptyValues(manifest),root:makeRoot()});
    const secondRoot=makeRoot();
    const second=createLayerHost({manifest,published:emptyValues(manifest),root:secondRoot});
    const hide=host=>host.setValues(setValue(host.values,'all','base','box','visible',false));
    const show=host=>host.setValues(setValue(host.values,'all','base','box','visible',true));
    hide(first);second.refresh();assert.ok(attributes.has('data-layer-hidden'));
    hide(second);show(first);assert.ok(attributes.has('data-layer-hidden'));
    show(second);assert.equal(attributes.has('data-layer-hidden'),false);
    second.setScene('b');first.setScene('a');assert.equal(secondRoot.dataset.layerScene,'b');
  } finally {globalThis.document=documentBefore;}
});

test('renderer visibility does not hide a shared canvas; stage visibility still does', () => {
  const attributes=new Map();
  const element={setAttribute:(name,value)=>attributes.set(name,String(value)),removeAttribute:name=>attributes.delete(name),getAttribute:name=>attributes.get(name)??null};
  const before=globalThis.document;
  globalThis.document={querySelectorAll:()=>[element]};
  const manifest={work:'canvas',version:1,initialScene:'exterior',scenes:{exterior:{}},breakpoints:[],layers:[
    {id:'tree',el:'#scene',params:{visible:{type:'boolean',default:true,attr:['#scene','data-tree-visible']}}},
    {id:'stage',el:'#scene',params:{visible:{type:'boolean',default:true}}},
  ]};
  try{
    const host=createLayerHost({manifest,published:emptyValues(manifest),root:{dataset:{},style:{setProperty(){}}}});
    host.setValues(setValue(host.values,'all','base','tree','visible',false));
    assert.equal(attributes.get('data-tree-visible'),'false');
    assert.equal(attributes.has('data-layer-hidden'),false);
    host.setValues(setValue(host.values,'all','base','stage','visible',false));
    assert.equal(attributes.has('data-layer-hidden'),true);
    host.setValues(setValue(host.values,'all','base','stage','visible',true));
    assert.equal(attributes.has('data-layer-hidden'),false);
    assert.equal(attributes.get('data-tree-visible'),'false');
  }finally{globalThis.document=before;}
});
