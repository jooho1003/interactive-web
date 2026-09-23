import {validateValue,variable} from './index.js';
export function lint(manifest,css){
  const errors=[],ids=new Set(),variables=new Set();let parameters=0;
  for(const layer of manifest.layers){
    if(!/^[a-z][a-z0-9-]*$/.test(layer.id)||ids.has(layer.id))errors.push('Duplicate/invalid layer '+layer.id);ids.add(layer.id);
    for(const key of ['visible','opacity'])if(!layer.params[key])errors.push(layer.id+' missing '+key);
    for(const[key,p]of Object.entries(layer.params)){
      parameters++;if(!validateValue(p,p.default))errors.push(layer.id+'/'+key+' invalid default');
      if(p.text||p.attr)continue;
      const name=p.css||variable(layer.id,key);if(variables.has(name))errors.push('Duplicate variable '+name);variables.add(name);
      if(!css.includes('var('+name+')')&&!(key==='visible'&&layer.id==='global'))errors.push('Unbound '+name);
    }
  }
  for(const match of css.matchAll(/var\((--L-[a-zA-Z0-9-]+)/g))if(!variables.has(match[1]))errors.push('Unknown CSS variable '+match[1]);
  if(!manifest.fixed?.length)errors.push('Missing fixed-value reasons');
  return {errors,layers:ids.size,parameters};
}
