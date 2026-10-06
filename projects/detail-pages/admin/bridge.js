import { layerHost } from '/app.js';
let selected = null, onSelect = () => {};
const style = document.createElement('style');
style.textContent = '.studio-selected{outline:2px dashed #dc593c!important;outline-offset:3px!important}';
document.head.append(style);
const elements = id => { const layer = layerHost.manifest.layers.find(item => item.id === id); return layer ? [...document.querySelectorAll(layer.el)] : []; };
function highlight() { document.querySelectorAll('.studio-selected').forEach(el => el.classList.remove('studio-selected')); if (selected) elements(selected).forEach(el => el.classList.add('studio-selected')); }
function pick(x, y) {
  const hits = [];
  for (const layer of layerHost.manifest.layers) {
    if (layer.id === 'global') continue;
    for (const el of elements(layer.id)) {
      const rect = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' || !rect.width || !rect.height) continue;
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) hits.push({ id: layer.id, area: rect.width * rect.height });
    }
  }
  return hits.sort((a, b) => a.area - b.area)[0]?.id;
}
document.addEventListener('pointerdown', event => { if (event.button !== 0) return; const id = pick(event.clientX, event.clientY); if (!id) return; event.preventDefault(); event.stopImmediatePropagation(); selected = id; highlight(); onSelect(id); }, true);
document.addEventListener('click', event => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
window.detailPagesStudio = {
  host: layerHost,
  setValues(values) { layerHost.setValues(JSON.parse(JSON.stringify(values))); highlight(); },
  setScene(id) { layerHost.setScene(id); highlight(); },
  select(id) { selected = id; highlight(); },
  callbacks(select) { onSelect = select; }
};
document.documentElement.classList.add('studio-inspect');
