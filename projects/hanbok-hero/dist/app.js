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
const CENTER = { col: 0, row: 0 };

let zone = { ...CENTER }, front = null, ready = false, timer = 0, dropTimer = 0, sheetResult = null, firstSheet;

function reactive() { return ready && layerHost.get('character', 'react') !== false && !reducedMotion.matches; }
// 시트가 반응 중일 때만 정면 그림을 숨긴다(이중 외곽선 방지). 그 밖에는 정면 그림이 보인다.
function syncUseSheet() { character.classList.toggle('use-sheet', reactive()); }
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
  const back = front === frameA ? frameB : frameA, old = front;
  paint(back, zone);
  clearTimeout(dropTimer);
  frameA.classList.remove('was-front'); frameB.classList.remove('was-front');
  if (!old) {
    // 첫 프레임: 정면 그림과 같은 칸이므로 페이드 없이 바로 앞에 둔다.
    back.classList.add('is-front', 'is-instant');
    getComputedStyle(back).opacity;
    back.classList.remove('is-instant');
  } else {
    // 들어오는 프레임만 위에서 페이드한다. 나가는 프레임은 끝날 때까지 불투명하게 아래에 있다가 내려간다.
    old.classList.replace('is-front', 'was-front');
    back.classList.add('is-front');
    const style = getComputedStyle(back);
    const ms = ((parseFloat(style.transitionDelay) || 0) + (parseFloat(style.transitionDuration) || 0)) * 1000;
    dropTimer = setTimeout(() => old.classList.remove('was-front'), ms);
  }
  front = back;
}
function clearFrames() {
  clearTimeout(dropTimer);
  for (const frame of [frameA, frameB]) frame.classList.remove('is-front', 'was-front');
  front = null; zone = { ...CENTER };
}
function reset() { clearTimeout(timer); timer = 0; show(CENTER); syncUseSheet(); }
function schedule() { clearTimeout(timer); timer = setTimeout(reset, readMs('transitionDelay')); }
function look(x, y) {
  syncUseSheet();
  if (!reactive()) return;
  const { x: ax, y: ay, range } = anchor();
  const next = gazeZone({ dx: x - ax, dy: y - ay, range, prev: zone });
  if (next.col !== zone.col || next.row !== zone.row) { show(next); hint.classList.add('is-done'); }
  schedule();
}

// 시트 로딩 결과. src가 바뀔 때마다(관리자에서 시트 교체) load/error가 다시 오므로 실패에서 회복할 수 있다.
function onSheet(ok) {
  const src = sheetImg.getAttribute('src');
  if (sheetResult && sheetResult.src === src && sheetResult.ok === ok) return;
  sheetResult = { src, ok };
  ready = ok;
  if (ok) { clearTimeout(timer); show(CENTER, !front); }
  else { console.warn('방향 시트를 불러오지 못해 정면 그림만 보여 줍니다.', src); clearFrames(); }
  syncUseSheet();
  firstSheet(ok);
}
const sheetReady = new Promise(resolve => { firstSheet = resolve; });
sheetImg.addEventListener('load', () => onSheet(true));
sheetImg.addEventListener('error', () => onSheet(false));
if (sheetImg.complete) onSheet(sheetImg.naturalWidth > 0);

document.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') look(event.clientX, event.clientY); });
document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') look(event.clientX, event.clientY); });
document.documentElement.addEventListener('mouseleave', schedule);
window.addEventListener('blur', schedule);
document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
reducedMotion.addEventListener('change', reset);

// 값이 바뀌면 프레임을 뒤집지 않고 앞 프레임을 제자리에서 다시 그린다(cols·rows·sheet 변경 반영, 깜빡임 없음).
layerHost.subscribe(() => {
  if (front) paint(front, zone);
  syncUseSheet();
  if (!reactive()) reset();
});

export const gaze = { ready: sheetReady, show, reset, state: () => ({ zone: { ...zone }, ready, front: front?.classList.contains('sheet-a') ? 'a' : front ? 'b' : null }) };

if (new URLSearchParams(location.search).get('studio') === '1') import('/admin/bridge.js').catch(() => {});
