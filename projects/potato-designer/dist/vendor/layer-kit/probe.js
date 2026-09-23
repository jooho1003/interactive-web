import {setValue,variable,cssValue} from './index.js';

// Browser-only probe. Activates each declaration's original media/hover condition,
// then measures computed styles on the real DOM, or resolved animation keyframes.
// Restores values and CSSOM even on failure. Run in a dedicated QA page.
export async function probe(host){
  const original=host.values,manifest=host.manifest,root=document.documentElement;
  const sheets=[...document.styleSheets].filter(sheet=>sheet.href?.endsWith('/style.css'));
  const references=new Map(),keyframes=[];
  function scan(rules,media=[],animation=null){for(const rule of rules){
    if(rule.type===CSSRule.MEDIA_RULE){scan(rule.cssRules,[...media,rule],animation);continue;}
    if(rule.type===CSSRule.KEYFRAMES_RULE){keyframes.push(rule);scan(rule.cssRules,media,rule.name);continue;}
    if(rule.style)for(const declaration of rule.style.cssText.split(';')){const colon=declaration.indexOf(':');if(colon<0)continue;const property=declaration.slice(0,colon).trim(),source=declaration.slice(colon+1);for(const match of source.matchAll(/var\((--[\w-]+)/g)){const list=references.get(match[1])||[];list.push({rule,property,media,animation});references.set(match[1],list);}}
    else if(rule.cssRules)scan(rule.cssRules,media,animation);
  }}
  for(const sheet of sheets)scan(sheet.cssRules);
  const gather=(name,seen=new Set())=>{if(seen.has(name))return[];seen.add(name);return(references.get(name)||[]).flatMap(ref=>ref.property.startsWith('--')?gather(ref.property,seen):[ref]);};
  const opened=[...document.querySelectorAll('dialog')].map(element=>[element,element.hasAttribute('open')]);for(const[element]of opened)element.setAttribute('open','');
  const hold=document.createElement('style');hold.textContent='.sheet{animation-fill-mode:both!important}';document.head.append(hold);
  root.style.setProperty('--in-pointer-x','.5');root.style.setProperty('--in-pointer-y','.5');
  const frame=()=>new Promise(resolve=>setTimeout(()=>{for(const animation of document.getAnimations()){animation.pause();animation.currentTime=2000;}resolve();}));
  const results=[];
  try{for(const layer of manifest.layers)for(const[key,param]of Object.entries(layer.params)){
    const refs=gather(param.css||variable(layer.id,key)),restore=[];
    for(const ref of refs){for(const media of ref.media){if(!matchMedia(media.conditionText).matches){const old=media.media.mediaText;media.media.mediaText='all';restore.push(()=>media.media.mediaText=old);}}
      if(ref.rule.selectorText&&/:(hover|disabled)/.test(ref.rule.selectorText)){const old=ref.rule.selectorText;ref.rule.selectorText=old.replace(/:(hover|disabled)/g,':not(.layer-probe-never)');restore.push(()=>ref.rule.selectorText=old);}
    }
    const snapshot=()=>{
      const out=[];
      if(param.text)for(const element of document.querySelectorAll(param.text))out.push(element.textContent);
      else if(param.attr)for(const element of document.querySelectorAll(param.attr[0]))out.push(element.getAttribute(param.attr[1]));
      else if(key==='visible')for(const element of document.querySelectorAll(layer.el))out.push(getComputedStyle(element).display);
      else for(const ref of refs){
        if(ref.animation){for(const animation of document.getAnimations())if(animation.animationName===ref.animation){const frames=animation.effect.getKeyframes();out.push(JSON.stringify(frames));}continue;}
        let selector=ref.rule.selectorText;if(!selector)continue;
        for(const part of selector.split(/,(?![^()]*\))/)){const pseudo=part.match(/::[\w-]+/)?.[0];const target=part.replace(/::[\w-]+/g,'').trim()||'*';try{for(const element of document.querySelectorAll(target)){const style=getComputedStyle(element,pseudo);out.push(style.getPropertyValue(ref.property));}}catch{}}
      }
      return JSON.stringify(out);
    };
    try{
      host.setValues(original);await frame();const before=snapshot(),value=host.get(layer.id,key);
      const options=param.type==='number'?[Math.min(param.max,Math.max(param.min,value+(param.step||.1)*3)),Math.max(param.min,Math.min(param.max,value===0?1:value*.6))]:param.type==='boolean'?[!value]:param.type==='color'?['#1357ad','#fa7240']:param.type==='text'?['레이어 검수 <safe>']:param.type==='image'?['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1kAAAAASUVORK5CYII=']:param.options.map(option=>option.value);
      let passed=false;
      for(let candidate of options){if(param.type==='number'&&param.property==='z-index')candidate=Math.round(candidate);if(candidate===value)continue;if(param.property&&!CSS.supports(param.property,cssValue(param,candidate)))continue;
        host.setValues(setValue(original,host.scene,'base',layer.id,key,candidate));await frame();if(snapshot()!==before){passed=true;break;}
      }
      results.push({layer:layer.id,key,passed,conditional:refs.some(ref=>ref.animation||ref.media.length||/:(hover|disabled|:)/.test(ref.rule.selectorText||''))});
    }finally{for(const undo of restore.reverse())undo();}
  }}finally{hold.remove();host.setValues(original);for(const[element,wasOpen]of opened)if(!wasOpen)element.removeAttribute('open');root.style.setProperty('--in-pointer-x','0');root.style.setProperty('--in-pointer-y','0');}
  return{total:results.length,passed:results.filter(result=>result.passed).length,failed:results.filter(result=>!result.passed),conditional:results.filter(result=>result.conditional).length};
}
