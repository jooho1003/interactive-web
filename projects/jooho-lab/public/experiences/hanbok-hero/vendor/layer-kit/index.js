export const clone = value => JSON.parse(JSON.stringify(value));
const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
const plain = value => value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
export function emptyValues(manifest) {
  return { format: 'iw-layers/1', work: manifest.work, manifestVersion: manifest.version, base: {}, responsive: {}, scenes: {} };
}
export function variable(layer, key) { return `--L-${layer}-${key.replaceAll('.', '-')}`; }
export function validImage(value, allowData = false) {
  return typeof value === 'string' && (allowData && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 2800000 || /^\.\/assets\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp)$/i.test(value) && !value.includes('..'));
}
export function validateValue(param, value, allowData = false) {
  if (param.type === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= param.min && value <= param.max;
  if (param.type === 'boolean') return typeof value === 'boolean';
  if (param.type === 'color') return typeof value === 'string' && /^#[\da-f]{6}([\da-f]{2})?$/i.test(value);
  if (param.type === 'select') return param.options.some(option => option.value === value);
  if (param.type === 'image') return validImage(value, allowData);
  if (param.type === 'text') return typeof value === 'string' && value.length <= (param.maxLength || 3000);
  return false;
}
export function validateValues(manifest, input, { allowData = false } = {}) {
  const errors = [];
  const knownLayers = new Map(manifest.layers.map(layer => [layer.id, layer]));
  if (!plain(input) || input.format !== 'iw-layers/1' || input.work !== manifest.work || input.manifestVersion !== manifest.version) return { values: null, errors: ['작품·파일 형식·버전이 일치하지 않습니다.'] };
  const allowedTop = new Set(['format', 'work', 'manifestVersion', 'base', 'responsive', 'scenes']);
  for (const key of Object.keys(input)) if (!allowedTop.has(key)) errors.push(`알 수 없는 필드: ${key}`);
  function map(raw, scope) {
    if (!plain(raw)) { errors.push(`${scope}: 설정 객체가 필요합니다.`); return {}; }
    const result = {};
    for (const [id, params] of Object.entries(raw)) {
      const layer = knownLayers.get(id);
      if (!layer || !plain(params)) { errors.push(`${scope}/${id}: 알 수 없는 레이어`); continue; }
      result[id] = {};
      for (const [key, value] of Object.entries(params)) {
        const param = own(layer.params, key) && layer.params[key];
        if (!param || !validateValue(param, value, allowData)) errors.push(`${scope}/${id}/${key}: 유효하지 않은 값`);
        else result[id][key] = value;
      }
    }
    return result;
  }
  function responsive(raw, path) {
    if (!plain(raw)) { errors.push(`${path}: 화면 설정 객체가 필요합니다.`); return {}; }
    const out = {};
    for (const [id, value] of Object.entries(raw)) {
      if (!manifest.breakpoints.some(item => item.id === id)) errors.push(`${path}/${id}: 알 수 없는 화면`);
      else out[id] = map(value, `${path}/${id}`);
    }
    return out;
  }
  const values = emptyValues(manifest);
  values.base = map(input.base, '공통');
  values.responsive = responsive(input.responsive, '화면');
  if (!plain(input.scenes)) errors.push('장면 설정 객체가 필요합니다.');
  else for (const [id, scene] of Object.entries(input.scenes)) {
    if (!own(manifest.scenes, id) || !plain(scene) || Object.keys(scene).some(key => !['base', 'responsive'].includes(key))) { errors.push(`알 수 없는 장면: ${id}`); continue; }
    values.scenes[id] = { base: map(scene.base, id), responsive: responsive(scene.responsive, id) };
  }
  return { values: errors.length ? null : values, errors };
}
export function resolve(manifest, values, scene, screens = []) {
  const result = {};
  for (const layer of manifest.layers) {
    const out = result[layer.id] = {};
    for (const [key, param] of Object.entries(layer.params)) out[key] = param.default;
    Object.assign(out, values.base?.[layer.id]);
    for (const screen of screens) {
      for (const [key, param] of Object.entries(layer.params)) if (own(param.at, screen)) out[key] = param.at[screen];
      Object.assign(out, values.responsive?.[screen]?.[layer.id]);
    }
    Object.assign(out, manifest.scenes[scene]?.set?.[layer.id], values.scenes?.[scene]?.base?.[layer.id]);
    for (const screen of screens) Object.assign(out, values.scenes?.[scene]?.responsive?.[screen]?.[layer.id]);
  }
  return result;
}
export function scopeMap(values, scene = 'all', screen = 'base') {
  let target = values;
  if (scene !== 'all') target = values.scenes[scene] ||= { base: {}, responsive: {} };
  return screen === 'base' ? target.base : (target.responsive[screen] ||= {});
}
export function setValue(values, scene, screen, layer, key, value) {
  const next = clone(values), map = scopeMap(next, scene, screen);
  if (value === undefined) {
    if (map[layer]) { delete map[layer][key]; if (!Object.keys(map[layer]).length) delete map[layer]; }
  } else (map[layer] ||= {})[key] = value;
  return next;
}
export function cssValue(param, value) {
  if (param.type === 'boolean') return value ? (param.on || '1') : (param.off || '0');
  return String(value) + (param.unit || '');
}
export function declarations(manifest, resolved) {
  const values = [];
  for (const layer of manifest.layers) for (const [key, param] of Object.entries(layer.params)) {
    if (!param.text && !param.attr) values.push(`${param.css || variable(layer.id, key)}:${cssValue(param, resolved[layer.id][key])}`);
  }
  return values.join(';');
}
export function compileCSS(manifest, values) {
  let css = ':root{' + declarations(manifest, resolve(manifest, values, manifest.initialScene)) + '}\n';
  for (const scene of Object.keys(manifest.scenes)) {
    const selector = `:root[data-layer-scene="${scene}"]`;
    css += `${selector}{${declarations(manifest, resolve(manifest, values, scene))}}\n`;
    const combinations = manifest.previewScreens;
    for (const screen of combinations) if (screen.media) css += `@media ${screen.media}{${selector}{${declarations(manifest, resolve(manifest, values, scene, screen.matches))}}}\n`;
  }
  return css;
}
// Multiple manifests can control the same DOM; each host owns its hiding state.
const hiddenOwners = new WeakMap();
export function createLayerHost({ manifest, published, root = document.documentElement }) {
  let values = published, scene = manifest.initialScene;
  const listeners = new Set();
  const queries = manifest.breakpoints.map(item => [item.id, matchMedia(item.media)]);
  let current, previousHidden = new Set();
  const owner = {};
  function apply() {
    root.dataset.layerScene = scene;
    current = resolve(manifest, values, scene, queries.filter(([,query]) => query.matches).map(([id]) => id));
    const hidden = new Set();
    for (const layer of manifest.layers) if (current[layer.id].visible === false) for (const element of document.querySelectorAll(layer.el)) hidden.add(element);
    for (const element of previousHidden) if (!hidden.has(element)) {
      const owners = hiddenOwners.get(element);
      owners?.delete(owner);
      if (!owners?.size) element.removeAttribute('data-layer-hidden');
    }
    for (const element of hidden) {
      let owners = hiddenOwners.get(element);
      if (!owners) hiddenOwners.set(element, owners = new Set());
      owners.add(owner);
      element.setAttribute('data-layer-hidden', '');
    }
    previousHidden = hidden;
    for (const layer of manifest.layers) for (const [key, param] of Object.entries(layer.params)) {
      const value = current[layer.id][key];
      if (param.text) for (const el of document.querySelectorAll(param.text)) { if (el.textContent !== value) el.textContent = value; }
      else if (param.attr) for (const el of document.querySelectorAll(param.attr[0])) { if (el.getAttribute(param.attr[1]) !== value) el.setAttribute(param.attr[1], value); }
      else root.style.setProperty(param.css || variable(layer.id, key), cssValue(param, value));
    }
    if(current.paper?.color)document.querySelector('meta[name="theme-color"]')?.setAttribute('content', current.paper.color);
    for (const callback of listeners) callback({ scene, current });
  }
  for (const [,query] of queries) query.addEventListener('change', apply);
  apply();
  return {
    manifest, get scene() { return scene; }, get values() { return clone(values); }, get current() { return current; },
    setScene(id) { if (!own(manifest.scenes, id)) return; scene = id; apply(); },
    setValues(input) { const checked = validateValues(manifest, input, { allowData: true }); if (checked.errors.length) throw new Error(checked.errors.join('\n')); values = checked.values; apply(); },
    get(layer, key) { return current[layer]?.[key]; },
    subscribe(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    refresh: apply
  };
}
