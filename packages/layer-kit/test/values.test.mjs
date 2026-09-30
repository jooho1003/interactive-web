import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyValues,setValue,resolve,validateValues,compileCSS,validImage} from '../src/index.js';
const manifest={work:'test',version:1,initialScene:'a',breakpoints:[{id:'mobile',media:'(max-width:650px)'}],previewScreens:[{id:'mobile',media:'(max-width:650px)',matches:['mobile']}],scenes:{a:{set:{box:{x:3}}},b:{set:{}}},layers:[{id:'box',params:{x:{type:'number',default:1,min:0,max:100,unit:'px',at:{mobile:2}},text:{type:'text',default:'hello'},color:{type:'color',default:'#ffffff'},preset:{type:'select',default:'none',options:[{value:'none'},{value:'blur(4px)'}]}}}]};
test('resolves defaults, responsive, scene and scene×screen in order',()=>{
  let v=emptyValues(manifest);assert.equal(resolve(manifest,v,'a',['mobile']).box.x,3);
  v=setValue(v,'all','base','box','x',10);assert.equal(resolve(manifest,v,'b').box.x,10);
  v=setValue(v,'all','mobile','box','x',20);assert.equal(resolve(manifest,v,'b',['mobile']).box.x,20);
  v=setValue(v,'a','base','box','x',30);v=setValue(v,'a','mobile','box','x',40);
  assert.equal(resolve(manifest,v,'a',['mobile']).box.x,40);assert.equal(resolve(manifest,v,'a').box.x,30);
});
test('reset reveals inherited value without mutating prior snapshots',()=>{const a=emptyValues(manifest),b=setValue(a,'a','mobile','box','x',42),c=setValue(b,'a','mobile','box','x',undefined);assert.equal(resolve(manifest,a,'a',['mobile']).box.x,3);assert.equal(resolve(manifest,b,'a',['mobile']).box.x,42);assert.equal(resolve(manifest,c,'a',['mobile']).box.x,3);});
test('rejects wrong versions, unknown layers, params and scope keys',()=>{for(const mutate of [v=>v.manifestVersion++,v=>v.base.unknown={},v=>v.base.box={unknown:2},v=>v.responsive.huge={},v=>v.scenes.unknown={base:{},responsive:{}}]){const v=emptyValues(manifest);mutate(v);assert.ok(validateValues(manifest,v).errors.length);}});
test('rejects non-finite/out-of-range numeric and unlisted CSS injection',()=>{for(const[key,value]of [['x',Infinity],['x',101],['x','4px'],['color','red; color:blue'],['preset','url(https://example.com)']])assert.ok(validateValues(manifest,setValue(emptyValues(manifest),'all','base','box',key,value)).errors.length);});
test('prototype keys cannot modify prototypes',()=>{const v=emptyValues(manifest);v.base=JSON.parse('{"__proto__":{"polluted":true}}');assert.ok(validateValues(manifest,v).errors.length);assert.equal({}.polluted,undefined);});
test('text remains data and image paths reject traversal/SVG/remote content',()=>{const v=setValue(emptyValues(manifest),'all','base','box','text','<img onerror=alert(1)>');assert.equal(validateValues(manifest,v).errors.length,0);for(const path of ['./assets/../secret.png','./assets/%2e%2e/a.png','data:image/svg+xml;base64,aaa','https://example.com/a.png'])assert.equal(validImage(path,true),false);assert.equal(validImage('./assets/a.png'),true);assert.equal(validImage('data:image/png;base64,aGVsbG8=',false),false);});
test('generated CSS contains scene and responsive resolved values, never text',()=>{const v=setValue(emptyValues(manifest),'a','mobile','box','x',40);const css=compileCSS(manifest,v);assert.match(css,/@media \(max-width:650px\)/);assert.match(css,/--L-box-x:40px/);});
