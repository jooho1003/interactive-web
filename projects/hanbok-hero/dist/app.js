import manifest from './layers.manifest.js';
import published from './layers.values.js';
import { createLayerHost } from './vendor/layer-kit/index.js';
import { targetCell, centerCell, approach, snap } from './gaze.js';

export const layerHost = createLayerHost({ manifest, published });

const character = document.querySelector('.character');
const rangeEl = character.querySelector('.gaze-range');
const bodyImg = character.querySelector('.character-body');
const head = character.querySelector('.character-head');
const sheetImg = head.querySelector('.character-sheet');
const hint = document.querySelector('.hint');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// pos = 지금 보여 주는 연속 칸 좌표, aim = 따라가는 목표, shown = 실제로 그린 칸
let ready = false, pos = null, aim = null, shown = null, frame = 0, last = 0, timer = 0, geometry = null, loaded = null, firstSheet;

const param = key => layerHost.get('character', key);
const grid = () => ({ cols: param('cols'), rows: param('rows') });
function reactive() { return ready && param('react') !== false && !reducedMotion.matches; }
// 얼굴 시트가 반응 중일 때만 정면 그림 대신 몸 + 얼굴 칸을 보여 준다. 정면 칸 + 몸 = 정면 그림이라 바뀌는 순간이 보이지 않는다.
function syncUseSheet() { character.classList.toggle('use-sheet', reactive()); }
// JS가 쓰는 수치의 정본은 .gaze-range의 계산된 스타일(크기 = range, top = anchorY, transition = follow·returnDelay)
function measure() {
  if (geometry) return geometry;
  const rect = rangeEl.getBoundingClientRect(), style = getComputedStyle(rangeEl);
  const ms = value => (parseFloat(value) || 0) * 1000;
  return geometry = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, range: rect.width / 2, follow: ms(style.transitionDuration), returnDelay: ms(style.transitionDelay) };
}

function paint() {
  const { cols, rows } = grid();
  const col = snap(pos.x, shown ? shown.col : -1, cols), row = snap(pos.y, shown ? shown.row : -1, rows);
  if (shown && shown.col === col && shown.row === row) return;
  shown = { col, row };
  head.style.setProperty('--in-cell-x', col);
  head.style.setProperty('--in-cell-y', row);
  const center = centerCell(cols, rows);
  if (col !== Math.round(center.x) || row !== center.y) hint.classList.add('is-done');
}
function tick(now) {
  // rAF 시각은 프레임 시작 시각이라 follow()에서 잰 performance.now()보다 이를 수 있다 — 음수면 거꾸로 돈다
  const dt = Math.max(0, Math.min(64, now - last)), tau = measure().follow;
  last = now;
  pos = { x: approach(pos.x, aim.x, dt, tau), y: approach(pos.y, aim.y, dt, tau) };
  if (Math.abs(pos.x - aim.x) < 0.01 && Math.abs(pos.y - aim.y) < 0.01) { pos = { ...aim }; frame = 0; }
  else frame = requestAnimationFrame(tick);
  paint();
}
// 목표를 바꾸면 그 사이 칸을 차례로 지나며 따라간다(한 번에 건너뛰지 않음). instant면 바로 그 칸.
function follow(next, instant = false) {
  aim = next;
  if (instant || !pos) { cancelAnimationFrame(frame); frame = 0; pos = { ...next }; paint(); return; }
  if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
}
function reset(instant = false) {
  clearTimeout(timer); timer = 0;
  if (ready) { const { cols, rows } = grid(); follow(centerCell(cols, rows), instant); }
  syncUseSheet();
}
function schedule() { clearTimeout(timer); timer = setTimeout(() => reset(), measure().returnDelay); }
function look(x, y) {
  syncUseSheet();
  if (!reactive()) return;
  clearTimeout(timer); timer = 0;
  const g = measure(), { cols, rows } = grid();
  follow(targetCell({ dx: x - g.x, dy: y - g.y, range: g.range, cols, rows }));
}

// 몸 그림과 얼굴 시트가 둘 다 디코딩돼야 반응한다. src가 바뀌면(관리자에서 교체) 다시 확인해 실패에서도 회복한다.
async function checkAssets() {
  const key = bodyImg.getAttribute('src') + '|' + sheetImg.getAttribute('src');
  const done = [bodyImg, sheetImg].every(img => img.complete);
  if (!done) return;
  let ok = [bodyImg, sheetImg].every(img => img.naturalWidth > 0);
  if (ok) ok = await Promise.all([bodyImg.decode(), sheetImg.decode()]).then(() => true, () => false);
  if (key !== bodyImg.getAttribute('src') + '|' + sheetImg.getAttribute('src')) return;
  if (loaded && loaded.key === key && loaded.ok === ok) return;
  loaded = { key, ok };
  ready = ok;
  if (ok) { shown = null; reset(true); }
  else { console.warn('몸 그림이나 얼굴 시트를 불러오지 못해 정면 그림만 보여 줍니다.', key); clearTimeout(timer); cancelAnimationFrame(frame); frame = 0; pos = aim = shown = null; }
  syncUseSheet();
  firstSheet(ok);
}
const sheetReady = new Promise(resolve => { firstSheet = resolve; });
for (const img of [bodyImg, sheetImg]) { img.addEventListener('load', checkAssets); img.addEventListener('error', checkAssets); }
checkAssets();

document.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') look(event.clientX, event.clientY); });
document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') { look(event.clientX, event.clientY); schedule(); } });
// 마우스는 멈춰도 계속 바라본다. 창을 떠나거나 창이 포커스를 잃으면 returnDelay 뒤 정면으로 돌아온다.
document.documentElement.addEventListener('mouseleave', schedule);
window.addEventListener('blur', schedule);
window.addEventListener('resize', () => { geometry = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden) reset(true); });
reducedMotion.addEventListener('change', () => reset(true));

// 값이 바뀌면(관리자 미리보기) 기준점·칸 수를 다시 읽고 같은 연속 좌표를 새 칸 배치로 다시 그린다.
layerHost.subscribe(() => {
  geometry = null;
  syncUseSheet();
  if (!reactive()) { reset(true); return; }
  if (pos) { shown = null; paint(); }
});

export const gaze = {
  ready: sheetReady, look, reset,
  state: () => ({ ready, cell: shown && { ...shown }, aim: aim && { ...aim }, pos: pos && { ...pos }, moving: frame !== 0 }),
};

if (new URLSearchParams(location.search).get('studio') === '1') import('/admin/bridge.js').catch(() => {});
