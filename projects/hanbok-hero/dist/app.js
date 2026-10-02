import manifest from './layers.manifest.js';
import published from './layers.values.js';
import { createLayerHost } from './vendor/layer-kit/index.js';
import { gazeZone, cellIndex } from './gaze.js';

export const layerHost = createLayerHost({ manifest, published });

const character = document.querySelector('.character');
const rangeEl = character.querySelector('.gaze-range');
const sheetImg = character.querySelector('.character-sheet');
const hint = document.querySelector('.hint');
const frameA = character.querySelector('.sheet-a');
const frameB = frameA.cloneNode(true);
frameB.classList.replace('sheet-a', 'sheet-b');
frameB.querySelector('img').removeAttribute('data-layer-image');
frameA.after(frameB);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let zone = { col: 0, row: 0 }, front = null, ready = false, timer = 0;

const sheetReady = new Promise(resolve => {
  const done = ok => { ready = ok; if (!ok) console.warn('방향 시트를 불러오지 못해 정면 그림만 보여 줍니다.'); resolve(ok); };
  if (sheetImg.complete) done(sheetImg.naturalWidth > 0);
  else { sheetImg.addEventListener('load', () => done(true), { once: true }); sheetImg.addEventListener('error', () => done(false), { once: true }); }
});

function reactive() { return ready && layerHost.get('character', 'react') !== false && !reducedMotion.matches; }
function readMs(property) { return (parseFloat(getComputedStyle(rangeEl)[property]) || 0) * 1000; }
function anchor() { const rect = rangeEl.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, range: rect.width / 2 }; }

function paint(frame, nextZone) {
  const cell = cellIndex(nextZone, layerHost.get('character', 'cols'), layerHost.get('character', 'rows'));
  frame.style.setProperty('--in-gaze-col', cell.col);
  frame.style.setProperty('--in-gaze-row', cell.row);
}
function show(nextZone, force = false) {
  if (!ready) return;
  if (!force && nextZone.col === zone.col && nextZone.row === zone.row) return;
  zone = { ...nextZone };
  const back = front === frameA ? frameB : frameA;
  paint(back, zone);
  front?.classList.remove('is-front');
  back.classList.add('is-front');
  front = back;
}
function reset() { clearTimeout(timer); timer = 0; show({ col: 0, row: 0 }); }
function schedule() { clearTimeout(timer); timer = setTimeout(reset, readMs('transitionDelay')); }
function look(x, y) {
  if (!reactive()) return;
  const { x: ax, y: ay, range } = anchor();
  const next = gazeZone({ dx: x - ax, dy: y - ay, range, prev: zone });
  if (next.col !== zone.col || next.row !== zone.row) { show(next); hint.classList.add('is-done'); }
  schedule();
}

document.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') look(event.clientX, event.clientY); });
document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') look(event.clientX, event.clientY); });
document.documentElement.addEventListener('mouseleave', schedule);
window.addEventListener('blur', schedule);
document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
reducedMotion.addEventListener('change', reset);

sheetReady.then(ok => { if (ok) show({ col: 0, row: 0 }, true); });
layerHost.subscribe(() => { if (!reactive()) reset(); else show(zone, true); });

export const gaze = { ready: sheetReady, show, reset, state: () => ({ zone: { ...zone }, ready, front: front?.classList.contains('sheet-a') ? 'a' : front ? 'b' : null }) };

if (new URLSearchParams(location.search).get('studio') === '1') import('/admin/bridge.js').catch(() => {});
