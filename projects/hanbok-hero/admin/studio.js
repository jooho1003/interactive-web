import manifest from '/layers.manifest.js';
import { setValue, resolve, scopeMap, validateValues } from '/vendor/layer-kit/index.js';
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
let state, values, bridge, scene = manifest.initialScene, selected = manifest.layers.find(layer => layer.id !== 'global').id;
const screen = () => manifest.previewScreens.find(item => item.id === $('screen').value) || manifest.previewScreens[0];
const scope = () => [$('scope').value === 'all' ? 'all' : scene, screen().id === 'base' ? 'base' : screen().id];
const resolved = () => resolve(manifest, values, scene, screen().matches);
function status(message, ok = false) { $('status').textContent = message; $('status').className = ok ? 'ok' : ''; }
async function api(path, options) {
  const response = await fetch('/api/studio/' + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${response.status} 요청 실패`);
  return data;
}
function push() { bridge?.setValues(values); }
function accept(next) { state = next; values = next.values; render(); push(); if (next.conflict) status('게시본이 바뀌었습니다. 내보내기로 초안을 보관한 뒤 다시 불러오세요.'); }
function update(layer, key, value) { const [s, v] = scope(); values = setValue(values, s, v, layer, key, value); push(); renderInspector(); }
function renderLayers() {
  $('layers').replaceChildren(...manifest.layers.map(layer => { const button = el('button', layer.label); button.setAttribute('aria-pressed', String(layer.id === selected)); button.onclick = () => { selected = layer.id; bridge?.select(layer.id); renderLayers(); renderInspector(); }; return button; }));
}
function control(layer, key, param, value) {
  const wrap = el('div', undefined, 'param');
  const [s, v] = scope(); const overridden = scopeMap(JSON.parse(JSON.stringify(values)), s, v)[layer.id]?.[key] !== undefined;
  wrap.append(el('span', param.label, 'label' + (overridden ? ' set' : '')));
  let input;
  if (param.type === 'number') {
    input = el('div', undefined, 'num'); const range = el('input'), number = el('input');
    for (const field of [range, number]) { field.min = param.min; field.max = param.max; field.step = param.step || 1; field.value = value; }
    range.type = 'range'; number.type = 'number';
    const commit = raw => { const n = Number(raw); if (!Number.isFinite(n) || n < param.min || n > param.max) return status(`${param.label}: ${param.min}~${param.max} 사이여야 합니다.`); range.value = number.value = n; update(layer.id, key, n); status(''); };
    range.oninput = () => commit(range.value); number.onchange = () => commit(number.value);
    input.append(range, number);
  } else if (param.type === 'boolean') { input = el('input'); input.type = 'checkbox'; input.checked = value; input.onchange = () => update(layer.id, key, input.checked); }
  else if (param.type === 'color') { input = el('input'); input.type = 'color'; input.value = value.slice(0, 7); input.oninput = () => update(layer.id, key, input.value); }
  else if (param.type === 'text') { input = el('textarea'); input.rows = 2; input.value = value; input.maxLength = param.maxLength || 3000; input.oninput = () => update(layer.id, key, input.value); }
  else if (param.type === 'select') { input = el('select'); for (const option of param.options) { const o = el('option', option.label); o.value = option.value; o.selected = option.value === value; input.append(o); } input.onchange = () => update(layer.id, key, input.value); }
  else if (param.type === 'image') {
    input = el('label', value.length > 60 ? '(업로드한 이미지)' : value); const file = el('input'); file.type = 'file'; file.accept = 'image/png,image/jpeg,image/webp'; file.style.display = 'block';
    file.onchange = () => { const picked = file.files[0]; if (!picked) return; if (picked.size > 2000000) return status('이미지는 2MB 이하만 올릴 수 있습니다.'); const reader = new FileReader(); reader.onload = () => update(layer.id, key, reader.result); reader.readAsDataURL(picked); };
    input.append(file);
  }
  const reset = el('button', '되돌리기'); reset.disabled = !overridden; reset.onclick = () => update(layer.id, key, undefined);
  wrap.append(input, reset);
  return wrap;
}
function renderInspector() {
  const layer = manifest.layers.find(item => item.id === selected), current = resolved()[layer.id];
  const [s, v] = scope();
  $('inspector').replaceChildren(el('h2', `${layer.label} · ${s === 'all' ? '공통' : manifest.scenes[s].label} · ${v === 'base' ? '기본 화면' : screen().label}`), ...Object.entries(layer.params).map(([key, param]) => control(layer, key, param, current[key])));
}
function renderVersions(list) { $('versions').replaceChildren(...list.map(name => { const o = el('option', name); o.value = name; return o; })); $('restore').disabled = !list.length; }
function render() { renderLayers(); renderInspector(); $('preview').style.width = screen().width + 'px'; }
function body(extra) { return { method: 'PUT', body: JSON.stringify({ values, revision: state.revision, draftRevision: state.draftRevision, ...extra }) }; }
$('save').onclick = async () => { try { accept(await api('draft', body())); status('초안을 저장했습니다.', true); } catch (error) { status(error.message); } };
$('publish').onclick = async () => { try { accept(await api('draft', body())); accept(await api('publish', { method: 'POST', body: JSON.stringify({ draftRevision: state.draftRevision }) })); renderVersions((await api('versions')).versions); status('게시했습니다. dist/layers.values.json과 layers.css가 갱신되었습니다.', true); } catch (error) { status(error.message); } };
$('restore').onclick = async () => { try { accept(await api('restore', { method: 'POST', body: JSON.stringify({ version: $('versions').value, draftRevision: state.draftRevision }) })); status('이전 게시본을 초안으로 불러왔습니다. 확인 후 게시하세요.', true); } catch (error) { status(error.message); } };
$('export').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' })); const a = el('a'); a.href = url; a.download = 'hanbok-hero-draft.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
$('import').onchange = async () => { const file = $('import').files[0]; if (!file) return; try { const checked = validateValues(manifest, JSON.parse(await file.text()), { allowData: true }); if (checked.errors.length) throw new Error(checked.errors.join('\n')); values = checked.values; push(); render(); status('불러왔습니다. 초안 저장을 눌러야 서버에 남습니다.', true); } catch (error) { status('불러오기 실패: ' + error.message); } };
$('scene').onchange = () => { scene = $('scene').value; bridge?.setScene(scene); render(); };
$('screen').onchange = render; $('scope').onchange = renderInspector;
$('scene').replaceChildren(...Object.entries(manifest.scenes).map(([id, def]) => { const o = el('option', def.label); o.value = id; return o; }));
$('screen').replaceChildren(...manifest.previewScreens.map(item => { const o = el('option', `${item.label} ${item.width}`); o.value = item.id; return o; }));
async function attach() {
  for (let i = 0; i < 100; i++) { const candidate = $('preview').contentWindow?.hanbokStudio; if (candidate) { bridge = candidate; break; } await new Promise(resolve => setTimeout(resolve, 50)); }
  if (!bridge) return status('미리보기와 연결하지 못했습니다. 새로 고침해 주세요.');
  bridge.callbacks(id => { selected = id; renderLayers(); renderInspector(); });
  bridge.setScene(scene); bridge.select(selected); push();
}
$('preview').addEventListener('load', attach);
try { accept(await api('state')); renderVersions((await api('versions')).versions); } catch (error) { status(error.message); }
