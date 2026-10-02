// 페이지 안에서 실행하는 검수. Playwright MCP의 browser_evaluate나 Aside repl에서
// (await import('/qa/browser-checks.js')).runChecks() 로 부른다. 새로 고친 직후에 실행한다.
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const pointer = (type, x, y, pointerType = 'mouse') => document.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType, bubbles: true }));
function collector() { const passed = [], failed = []; return { passed, failed, check: (ok, name) => (ok ? passed : failed).push(name) }; }
function anchor() { const r = document.querySelector('.gaze-range').getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 }; }

export async function runProbe() {
  const { layerHost } = await import('/app.js');
  const { probe } = await import('/vendor/layer-kit/probe.js');
  return probe(layerHost);
}

export async function runChecks() {
  const { layerHost, gaze } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  const still = document.querySelector('.character-still');
  check(still.complete && still.naturalWidth > 0, '정면 그림 로딩');
  check(gaze.state().ready && gaze.state().front === 'a', '시트 로딩 후 정면 칸이 앞 프레임');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx, cy); await wait(30);
  check(gaze.state().zone.col === 0 && gaze.state().zone.row === 0, '중앙에서는 정면');
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 1 && gaze.state().zone.row === 0, '오른쪽을 본다');
  check(document.querySelector('.hint').classList.contains('is-done'), '첫 반응 뒤 안내 숨김');
  const front = document.querySelector('.sheet-frame.is-front');
  check(front && front.style.getPropertyValue('--in-gaze-col') === '2', '앞 프레임이 오른쪽 칸(index 2)');
  pointer('pointermove', cx + r * 0.3, cy); await wait(30);
  check(gaze.state().zone.col === 1, '경계 안쪽(0.3)에서는 유지 — 히스테리시스');
  pointer('pointermove', cx + r * 0.2, cy); await wait(30);
  check(gaze.state().zone.col === 0, '0.2에서는 정면 복귀');
  pointer('pointermove', cx, cy - r * 3); await wait(30);
  check(gaze.state().zone.row === -1, '범위 밖 위쪽은 가장 바깥 칸');
  const delay = (parseFloat(getComputedStyle(document.querySelector('.gaze-range')).transitionDelay) || 0) * 1000;
  await wait(delay + 250);
  check(gaze.state().zone.col === 0 && gaze.state().zone.row === 0, '멈춘 뒤 returnDelay 지나면 정면');
  pointer('pointerdown', cx - r, cy, 'touch'); await wait(30);
  check(gaze.state().zone.col === -1, '터치 탭으로 한 번 본다');
  gaze.reset(); await wait(30);
  pointer('pointermove', cx + r, cy, 'touch'); await wait(30);
  check(gaze.state().zone.col === 0, '터치 이동은 무시');
  check([...document.querySelectorAll('.nav a')].length === 3 && [...document.querySelectorAll('.nav a')].every(a => a.tabIndex >= 0), '메뉴 3개 키보드 도달');
  const original = layerHost.values;
  layerHost.setValues(setValue(original, 'hero', 'base', 'character', 'react', false)); await wait(30);
  check(getComputedStyle(document.querySelector('.sheet-frame')).visibility === 'hidden', 'react 끄면 시트 숨김');
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, 'react 꺼진 동안 반응 없음');
  layerHost.setValues(setValue(original, 'hero', 'base', 'character', 'cols', 1)); await wait(30);
  pointer('pointermove', cx + r, cy); await wait(30);
  check(document.querySelector('.sheet-frame.is-front').style.getPropertyValue('--in-gaze-col') === '0', 'cols 1이면 index 0 고정');
  layerHost.setValues(original); gaze.reset();
  check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  return { passed, failed };
}

export async function runSheetFailure() {
  // 시트 경로를 깨뜨린 새 페이지에서 호출한다: 정면만 남아야 한다.
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  check(gaze.state().ready === false, '시트 실패를 인지');
  check(!document.querySelector('.sheet-frame.is-front'), '앞 프레임 없음 — 정면 그림만');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, '시트 없이는 반응하지 않음');
  return { passed, failed };
}

export async function runReducedMotionChecks() {
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  check(matchMedia('(prefers-reduced-motion: reduce)').matches, '동작 줄이기 에뮬레이션 켜짐');
  check(getComputedStyle(document.querySelector('.sheet-frame')).visibility === 'hidden', '시트 프레임 숨김');
  const { cx, cy, r } = anchor();
  pointer('pointermove', cx + r, cy); await wait(30);
  check(gaze.state().zone.col === 0, '반응 없음');
  return { passed, failed };
}

export function runNarrowChecks() {
  const { check, passed, failed } = collector();
  const inView = el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight; };
  check(window.innerWidth <= 650, '390px 뷰포트');
  check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  check(inView(document.querySelector('.title')), '이름이 화면 안');
  check(inView(document.querySelector('.nav')), '메뉴가 화면 안');
  check(inView(document.querySelector('.character')), '캐릭터가 화면 안');
  return { passed, failed };
}

export async function alphaReport(src) {
  const img = new Image(); img.src = src; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
  const at = (x, y) => [...ctx.getImageData(x, y, 1, 1).data];
  const corners = [at(2, 2), at(canvas.width - 3, 2), at(2, canvas.height - 3), at(canvas.width - 3, canvas.height - 3)];
  const gray = p => Math.abs(p[0] - p[1]) < 12 && Math.abs(p[1] - p[2]) < 12 && p[3] === 255 && p[0] > 150;
  const steps = [at(2, 2), at(18, 2), at(34, 2), at(50, 2)];
  return { size: [canvas.width, canvas.height], cornerAlpha: corners.map(p => p[3]), checkerboard: steps.every(gray) && new Set(steps.map(p => p[0] >> 4)).size > 1 };
}
