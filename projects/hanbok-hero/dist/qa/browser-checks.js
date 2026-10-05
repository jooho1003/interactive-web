// 페이지 안에서 실행하는 검수. Playwright MCP의 browser_evaluate나 Aside repl에서
// (await import('/qa/browser-checks.js')).runChecks() 로 부른다. 새로 고친 직후에 실행한다.
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const pointer = (type, x, y, pointerType = 'mouse') => document.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType, bubbles: true }));
function collector() { const passed = [], failed = []; return { passed, failed, check: (ok, name) => (ok ? passed : failed).push(name) }; }
const MOOD_KEY = 'hanbok-hero:mood:v1';
const moodButton = id => document.querySelector(`.mood[data-scene="${id}"]`);
const paperSrc = () => document.querySelector('.paper-image').getAttribute('src');
const coverShown = () => !document.querySelector('.paper-prev').hidden;
const fadeMs = () => Math.round((parseFloat(getComputedStyle(document.querySelector('.paper-prev')).transitionDuration) || 0) * 1000);
const settleMood = () => wait(fadeMs() + 400);
const screensNow = host => host.manifest.breakpoints.filter(item => matchMedia(item.media).matches).map(item => item.id);
const rgb = hex => { const n = parseInt(hex.slice(1, 7), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
const stored = () => { try { return localStorage.getItem(MOOD_KEY); } catch { return 'blocked'; } };
const restoreStored = value => { try { if (value === null) localStorage.removeItem(MOOD_KEY); else localStorage.setItem(MOOD_KEY, value); } catch {} };
const overlap = (a, b) => { const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); return Boolean(r.width && s.width) && !(r.right <= s.left || s.right <= r.left || r.bottom <= s.top || s.bottom <= r.top); };
// 사람이 실제로 움직이는 마우스(신뢰된 이벤트)가 검사 중간에 끼어들지 못하게 막는다. 합성 이벤트만 통과한다.
const blockTrusted = event => { if (event.isTrusted) event.stopImmediatePropagation(); };
function isolate() {
  document.addEventListener('pointermove', blockTrusted, true);
  document.addEventListener('pointerdown', blockTrusted, true);
  return () => { document.removeEventListener('pointermove', blockTrusted, true); document.removeEventListener('pointerdown', blockTrusted, true); };
}
const cell = () => { const h = document.querySelector('.character-head').style; return { col: Number(h.getPropertyValue('--in-cell-x')), row: Number(h.getPropertyValue('--in-cell-y')) }; };
const visible = selector => getComputedStyle(document.querySelector(selector)).visibility === 'visible';
function timing() { const s = getComputedStyle(document.querySelector('.gaze-range')); return { follow: (parseFloat(s.transitionDuration) || 0) * 1000, returnDelay: (parseFloat(s.transitionDelay) || 0) * 1000 }; }
// 따라가는 시간(follow)의 6배면 목표의 99.8%에 닿는다
const arrive = () => wait(timing().follow * 6 + 60);
async function settle(gaze) { gaze.reset(true); await wait(30); }
function anchor() { const r = document.querySelector('.gaze-range').getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 }; }
// 매 프레임 칸 번호를 기록해 "한 번에 몇 칸 건너뛰었나"를 잰다
function recordCells() {
  const log = []; let id = 0;
  const f = () => { log.push(cell()); id = requestAnimationFrame(f); }; f();
  return () => {
    cancelAnimationFrame(id); let skip = 0, back = 0, changes = 0;
    for (let i = 1; i < log.length; i++) { const d = log[i].col - log[i - 1].col; if (d) changes++; if (Math.abs(d) > 1) skip++; if (d < 0) back++; }
    return { changes, skip, back };
  };
}

// 쉬는 칸 + 몸 그림이 정면 그림과 같은지(바뀌는 순간이 보이지 않는지) 캔버스로 비교한다. 평균·최대 차이(0~255)를 돌려준다.
export async function restMatchesStill(scale = 0.5) {
  const { layerHost } = await import('/app.js');
  const get = key => layerHost.get('character', key);
  const load = async src => { const img = new Image(); img.src = src; await img.decode(); return img; };
  const [still, body, sheet] = await Promise.all(['.character-still', '.character-body', '.character-sheet'].map(sel => load(document.querySelector(sel).src)));
  const size = Math.round(still.naturalWidth * scale), cols = get('cols'), rows = get('rows');
  const draw = paint => { const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d'); paint(ctx); return ctx.getImageData(0, 0, size, size).data; };
  const a = draw(ctx => ctx.drawImage(still, 0, 0, size, size));
  const col = Math.round((cols - 1) / 2), row = Math.ceil((rows - 1) / 2), tw = sheet.naturalWidth / cols, th = sheet.naturalHeight / rows;
  const b = draw(ctx => { ctx.drawImage(body, 0, 0, size, size); ctx.drawImage(sheet, col * tw, row * th, tw, th, get('headX') / 100 * size, get('headY') / 100 * size, get('headW') / 100 * size, get('headH') / 100 * size); });
  let sum = 0, worst = 0;
  for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); sum += d; if (d > worst) worst = d; }
  return { mean: sum / a.length, worst };
}

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
  const release = isolate();
  try {
    await settle(gaze);
    const cols = layerHost.get('character', 'cols'), rows = layerHost.get('character', 'rows');
    const rest = { col: Math.round((cols - 1) / 2), row: Math.ceil((rows - 1) / 2) };
    check(document.querySelector('.character-still').naturalWidth > 0, '정면 그림 로딩');
    check(gaze.state().ready && cell().col === rest.col && cell().row === rest.row, '시트 준비 후 쉬는 칸(정면)');
    check(!visible('.character-still') && visible('.character-body') && visible('.character-head'), '반응 중에는 정면 그림 대신 몸 + 얼굴 칸');
    check(document.querySelectorAll('.character-head').length === 1 && !document.querySelector('.sheet-frame'), '얼굴 창은 하나 — 두 얼굴이 겹치는 프레임이 없다(잔상 없음)');
    const match = await restMatchesStill();
    check(match.mean < 1.5, `쉬는 칸 + 몸 = 정면 그림(평균 차이 ${match.mean.toFixed(2)})`);
    const { cx, cy, r } = anchor();
    let stop = recordCells();
    for (let i = 0; i <= 20; i++) { pointer('pointermove', cx + r * i / 20, cy + r * 0.3); await wait(16); }
    await arrive();
    const sweep = stop();
    check(cell().col === cols - 1, '오른쪽 끝을 본다');
    check(sweep.skip === 0 && sweep.back === 0 && sweep.changes === cols - 1 - rest.col, `천천히 움직이면 한 칸씩 차례로 돈다(${sweep.changes}번, 건너뜀 ${sweep.skip}, 역행 ${sweep.back})`);
    check(document.querySelector('.hint').classList.contains('is-done'), '첫 반응 뒤 안내 숨김');
    stop = recordCells();
    pointer('pointermove', cx - r, cy + r * 0.3); await arrive();
    const jump = stop();
    check(cell().col === 0 && jump.changes >= cols - 2, `반대쪽으로 한 번에 옮겨도 중간 칸을 거쳐 돈다(${jump.changes}번 바뀜)`);
    await wait(timing().returnDelay + 250);
    check(cell().col === 0, '포인터가 멈춰도 계속 바라본다');
    const atCell = x => cx + r * (x / ((cols - 1) / 2) - 1); // 칸 좌표 x가 되는 포인터 위치
    gaze.reset(true); await wait(30);
    pointer('pointermove', atCell(rest.col + 0.55), cy); await arrive();
    check(cell().col === rest.col, '칸 경계를 살짝 넘어서는 그대로 — 히스테리시스');
    pointer('pointermove', atCell(rest.col + 0.8), cy); await arrive();
    check(cell().col === rest.col + 1, '경계를 충분히 넘으면 옆 칸');
    pointer('pointermove', cx, cy - r * 3); await arrive();
    check(cell().row === 0, '얼굴보다 한참 위면 위 행');
    pointer('pointermove', cx, cy + r * 3); await arrive();
    check(cell().row === rows - 1, '얼굴 아래면 아래 행');
    document.documentElement.dispatchEvent(new MouseEvent('mouseleave'));
    pointer('pointermove', cx + r, cy); await arrive();
    check(cell().col === cols - 1, '창을 떠났다가 돌아오면 다시 따라간다');
    document.documentElement.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(timing().returnDelay + timing().follow * 6 + 120);
    check(cell().col === rest.col && cell().row === rest.row, '창을 떠나면 returnDelay 뒤 정면으로 돌아온다');
    pointer('pointerdown', cx - r, cy, 'touch'); await arrive();
    check(cell().col === 0, '터치 탭으로 그쪽을 본다');
    await wait(timing().returnDelay + timing().follow * 6 + 120);
    check(cell().col === rest.col, '터치 뒤 returnDelay 지나면 정면');
    pointer('pointermove', cx + r, cy, 'touch'); await arrive();
    check(cell().col === rest.col, '터치 이동은 무시');
    const original = layerHost.values;
    try {
      layerHost.setValues(setValue(original, layerHost.scene, 'base', 'character', 'react', false)); await wait(30);
      check(!visible('.character-head') && visible('.character-still'), 'react 끄면 얼굴 칸 숨김, 정면 그림 보임');
      pointer('pointermove', cx + r, cy); await arrive();
      check(cell().col === rest.col, 'react 꺼진 동안 반응 없음');
      layerHost.setValues(setValue(original, layerHost.scene, 'base', 'character', 'cols', 1)); await wait(30);
      pointer('pointermove', cx + r, cy); await arrive();
      check(cell().col === 0, 'cols 1이면 index 0 고정');
    } finally {
      layerHost.setValues(original); gaze.reset(true);
    }
    check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
    return { passed, failed };
  } finally {
    release();
  }
}

export async function runMoodChecks() {
  const { layerHost, moods } = await import('/app.js');
  const { resolve } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const ids = Object.keys(layerHost.manifest.scenes), before = stored();
  const buttons = [...document.querySelectorAll('.mood[data-scene]')];
  try {
    check(ids.join() === 'si,seo,hwa', '장면 3개(si·seo·hwa)');
    check(buttons.length === 3 && buttons.every(b => b.tagName === 'BUTTON' && b.tabIndex >= 0) && buttons.map(b => b.dataset.scene).join() === ids.join(), '분야 버튼 3개, 장면과 같은 순서, 키보드 도달');
    const group = document.querySelector('.moods');
    check(group.getAttribute('role') === 'group' && document.getElementById(group.getAttribute('aria-labelledby'))?.textContent.trim() !== '', '버튼 묶음에 이름');
    check([...document.querySelectorAll('.mood-hanja, .glyph')].every(el => el.getAttribute('aria-hidden') === 'true'), '한자(버튼 속·큰 글자)는 스크린리더가 읽지 않음');
    check(buttons.every(b => { const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }), '버튼 터치 영역 44px 이상');
    check(['.nav', '.cta'].every(sel => getComputedStyle(document.querySelector(sel)).display === 'none'), '빈 메뉴·작품 보기 숨김');
    check([...document.querySelectorAll('.nav a, .cta')].every(el => el.offsetParent === null), '숨긴 링크는 Tab으로 닿지 않음');
    for (const id of ids) {
      moodButton(id).click(); await settleMood();
      const want = resolve(layerHost.manifest, layerHost.values, id, screensNow(layerHost));
      check(document.documentElement.dataset.layerScene === id && layerHost.scene === id, `${id}: 장면`);
      check(buttons.every(b => b.getAttribute('aria-pressed') === String(b.dataset.scene === id)), `${id}: 고른 버튼만 aria-pressed`);
      check(paperSrc() === want.paper.image && !coverShown(), `${id}: 배경 ${want.paper.image}, 덮개 걷힘`);
      check(document.querySelector('.glyph').textContent === want.glyph.text, `${id}: 큰 한자 ${want.glyph.text}`);
      check(document.querySelector('.title-tagline').textContent === want.title.tagline, `${id}: 부제`);
      check(getComputedStyle(moodButton(id)).color === rgb(want.global.accent), `${id}: 고른 버튼 강조색 ${want.global.accent}`);
      check(stored() === id && moods.saved === true, `${id}: 브라우저에 저장`);
    }
    const kept = stored();
    layerHost.setScene('seo'); await settleMood();
    check(moodButton('seo').getAttribute('aria-pressed') === 'true' && stored() === kept, '직접 setScene(관리자 경로): 버튼 동기화, 저장 안 함');
    layerHost.refresh(); await wait(50);
    check(!coverShown(), '같은 값으로 다시 적용해도 덮개 없음');
    check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
  } finally {
    moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

// 배경이 다른 두 분야 사이의 덮개 전환. 배경이 같아도 검사할 수 있게 'seo' 배경을 잠깐 1px 그림으로 바꾼다.
export async function runCrossfade() {
  const { layerHost } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const original = layerHost.values, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, before = stored();
  const cover = document.querySelector('.paper-prev');
  try {
    moodButton('si').click(); await settleMood();
    const from = paperSrc();
    layerHost.setValues(setValue(original, 'seo', 'base', 'paper', 'image', './assets/blank.png'));
    moodButton('seo').click();
    check(coverShown() && cover.getAttribute('src') === from, '바꾸는 순간 이전 배경이 덮개로 보임');
    check(reduce ? fadeMs() === 0 : fadeMs() === layerHost.get('global', 'moodFade'), reduce ? '동작 줄이기: 전환 시간 0' : '전환 시간 = global.moodFade');
    if (!reduce) { await wait(fadeMs() / 2); check(coverShown() && Number(getComputedStyle(cover).opacity) < 1, '전환 중: 덮개가 걷히는 중'); }
    await settleMood();
    check(!coverShown() && paperSrc() === './assets/blank.png', '전환 뒤 덮개 걷힘');
    moodButton('si').click(); moodButton('seo').click(); moodButton('hwa').click();
    await settleMood(); await settleMood();
    check(layerHost.scene === 'hwa' && !coverShown() && paperSrc() === layerHost.get('paper', 'image'), '연달아 눌러도 마지막 분야, 덮개 없음');
  } finally {
    layerHost.setValues(original); moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

export async function runMoodImageFailure() {
  const { layerHost } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  const original = layerHost.values, before = stored(), cover = document.querySelector('.paper-prev');
  const warn = console.warn; let warned = 0;
  console.warn = (...args) => { warned++; warn(...args); };
  try {
    moodButton('si').click(); await settleMood();
    const good = paperSrc();
    layerHost.setValues(setValue(original, 'seo', 'base', 'paper', 'image', './assets/missing-mood.webp'));
    moodButton('seo').click(); await settleMood();
    check(paperSrc() === './assets/missing-mood.webp', '검사 조건: 없는 배경 주소');
    check(coverShown() && cover.getAttribute('src') === good && getComputedStyle(cover).opacity === '1', '불러오지 못하면 이전 배경이 그대로 보임');
    check(warned > 0, '콘솔 경고');
    check(layerHost.scene === 'seo' && document.querySelector('.glyph').textContent === layerHost.get('glyph', 'text'), '배경 실패에도 장면·글자는 바뀜');
    moodButton('hwa').click(); await settleMood();
    check(!coverShown() && paperSrc() === layerHost.get('paper', 'image'), '다른 분야로 가면 회복');
  } finally {
    console.warn = warn; layerHost.setValues(original); moodButton('si').click(); await settleMood(); restoreStored(before);
  }
  return { passed, failed };
}

export async function runMoodStorageBlocked() {
  const { layerHost, moods } = await import('/app.js');
  const { check, passed, failed } = collector();
  const { getItem, setItem } = Storage.prototype;
  const errors = [], onError = event => errors.push(event.message);
  addEventListener('error', onError);
  Storage.prototype.getItem = function () { throw new DOMException('blocked', 'SecurityError'); };
  Storage.prototype.setItem = function () { throw new DOMException('blocked', 'SecurityError'); };
  try {
    const target = layerHost.scene === 'hwa' ? 'seo' : 'hwa';
    moodButton(target).click(); await settleMood();
    check(layerHost.scene === target && moodButton(target).getAttribute('aria-pressed') === 'true', '저장소가 막혀도 분야는 바뀜');
    check(moods.saved === false, '저장 실패를 알고 이번 방문 동안만 기억');
    check(errors.length === 0, '페이지 오류 없음');
  } finally {
    Storage.prototype.getItem = getItem; Storage.prototype.setItem = setItem; removeEventListener('error', onError);
    moodButton('si').click(); await settleMood();
  }
  return { passed, failed };
}

// 새로고침 뒤 복구 확인용 — 상태만 돌려준다
export async function moodState() {
  const { layerHost } = await import('/app.js');
  return { scene: layerHost.scene, pressed: document.querySelector('.mood[aria-pressed="true"]')?.dataset.scene, stored: stored(), cover: coverShown() };
}

export async function runSheetFailure() {
  // 시트 경로를 깨뜨린 새 페이지에서 호출한다: 정면만 남아야 하고, 시트를 바꾸면 새로고침 없이 회복해야 한다.
  const { layerHost, gaze } = await import('/app.js');
  const { setValue } = await import('/vendor/layer-kit/index.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  const release = isolate();
  try {
    check(gaze.state().ready === false, '시트 실패를 인지');
    check(!visible('.character-head') && !visible('.character-body'), '얼굴 칸·몸 그림 숨김 — 정면 그림만');
    const { cx, cy, r } = anchor();
    pointer('pointermove', cx + r, cy); await wait(60);
    check(gaze.state().cell === null, '시트 없이는 반응하지 않음');
    check(visible('.character-still'), '정면 그림 보임');
    const original = layerHost.values;
    const sheetDefault = layerHost.manifest.layers.find(layer => layer.id === 'character').params.sheet.default;
    try {
      layerHost.setValues(setValue(original, layerHost.scene, 'base', 'character', 'sheet', sheetDefault));
      for (let i = 0; i < 60 && !gaze.state().ready; i++) await wait(50);
      check(gaze.state().ready && visible('.character-head'), '시트를 바꾸면 새로고침 없이 회복');
    } finally {
      layerHost.setValues(original);
    }
    return { passed, failed };
  } finally {
    release();
  }
}

export async function runReducedMotionChecks() {
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  const release = isolate();
  try {
    check(matchMedia('(prefers-reduced-motion: reduce)').matches, '동작 줄이기 에뮬레이션 켜짐');
    check(!visible('.character-head') && !visible('.character-body'), '얼굴 칸·몸 그림 숨김');
    check(visible('.character-still'), '정면 그림 보임');
    const { cx, cy, r } = anchor();
    const before = cell();
    pointer('pointermove', cx + r, cy); await arrive();
    check(cell().col === before.col, '반응 없음');
    moodButton('seo').click(); await wait(120);
    check(getComputedStyle(document.querySelector('.glyph')).animationName === 'none' && fadeMs() === 0 && !coverShown(), '분야 전환: 글자 등장·덮개 전환 없이 즉시');
    moodButton('si').click(); await wait(120);
    return { passed, failed };
  } finally {
    release();
  }
}

export async function runNarrowChecks() {
  const { gaze } = await import('/app.js');
  const { check, passed, failed } = collector();
  await gaze.ready;
  const release = isolate();
  try {
    const inView = el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight; };
    check(window.innerWidth <= 650, `${window.innerWidth}px 뷰포트(모바일 구간)`);
    check(document.documentElement.scrollWidth <= window.innerWidth, '가로 스크롤 없음');
    check(inView(document.querySelector('.title')), '이름이 화면 안');
    const moodsEl = document.querySelector('.moods'), creditEl = document.querySelector('.credit');
    check(inView(moodsEl), '분야 버튼이 화면 안');
    check(getComputedStyle(moodsEl).flexDirection === 'row', '좁은 화면에서 분야 버튼은 가로');
    check(inView(creditEl), '제작 표시가 화면 안');
    check(!['.title', '.credit', '.hint'].some(sel => overlap(moodsEl, document.querySelector(sel))), '분야 버튼이 이름·제작 표시·안내와 겹치지 않음');
    check(!overlap(creditEl, document.querySelector('.hint')), '제작 표시와 안내가 겹치지 않음');
    check(inView(document.querySelector('.character')), '캐릭터가 화면 안');
    await settle(gaze);
    const { cx, cy, r } = anchor();
    check(r === 200, `좁은 화면 반응 범위는 모바일 값(${r}px)`);
    pointer('pointerdown', Math.max(2, cx - r * 0.9), cy, 'touch'); await arrive();
    check(cell().col <= 1, '좁은 화면 안쪽 터치 탭으로 옆을 본다');
    gaze.reset(true);
    return { passed, failed };
  } finally {
    release();
  }
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
