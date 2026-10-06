// 페이지 안에서 실행하는 검수: import('/qa/browser-checks.js').then(m => m.run({ probe: true }))
// 실제 키 입력(Escape)·뒤로 가기·화면 크기는 scripts/qa.py가 브라우저 밖에서 확인한다.
import { layerHost } from '../app.js';
import pages from '../pages.js';
import { setValue } from '../vendor/layer-kit/index.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(test, timeout = 5000) {
  const start = performance.now();
  while (!test()) { if (performance.now() - start > timeout) return false; await wait(30); }
  return true;
}

export async function run({ probe: withProbe = false } = {}) {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail: typeof detail === 'string' ? detail : JSON.stringify(detail) });
  const $ = selector => document.querySelector(selector);
  const viewer = $('.viewer'), stage = $('.viewer-stage'), frame = stage.querySelector('iframe'), loading = $('.viewer-loading');
  const cards = [...document.querySelectorAll('.card')], shots = [...document.querySelectorAll('.card-shot')];

  check('카드 수 = 목록 수', cards.length === pages.length && pages.length > 0, `${cards.length}/${pages.length}`);
  check('목록이 있으면 빈 안내 숨김', $('.strip-empty').hidden);
  await Promise.all(shots.map(img => img.decode().catch(() => {})));
  check('미리보기 캡처를 모두 불러옴', shots.every(img => img.naturalWidth > 0), shots.map(img => img.naturalWidth));
  check('가로 넘침 없음(페이지)', document.documentElement.scrollWidth <= innerWidth, `${document.documentElement.scrollWidth} > ${innerWidth}`);
  const frameBox = $('.card-frame').getBoundingClientRect(), expected = innerHeight * layerHost.get('strip', 'cardHeight') / 100 + 2 * layerHost.get('card', 'mat');
  check('카드 그림 높이 = 파라미터', Math.abs(frameBox.height - expected) < 2, `${frameBox.height} vs ${expected}`);
  check('카드 그림 비율 = 캡처 비율', Math.abs(shots[0].clientWidth / shots[0].clientHeight - pages[0].width / pages[0].height) < 0.01);

  // 입력 → 상태 → 피드백 → 되돌리기
  cards[0].focus();
  cards[0].click();
  check('카드 클릭 → 덮개 열림·해시·장면', viewer.open && location.hash === '#' + pages[0].slug && layerHost.scene === 'viewer', location.hash);
  check('덮개 제목·순서 표시', $('#viewer-title').textContent === pages[0].name && $('.viewer-index').textContent === `1 / ${pages.length}`);
  check('첫 상세페이지에서 이전 버튼 비활성', $('.viewer-prev').disabled);
  check('실제 페이지를 불러옴', await until(() => loading.hidden && frame.contentDocument?.body?.childElementCount > 0), frame.src);
  check('새 창 링크가 같은 페이지', $('.viewer-open').getAttribute('href') === pages[0].href);
  check('데스크톱 폭 미리보기가 무대에 맞게 축소', Math.abs(frame.getBoundingClientRect().width - Math.min(stage.clientWidth, layerHost.get('viewer', 'desktopWidth'))) < 2, `${frame.getBoundingClientRect().width} / ${stage.clientWidth}`);

  if (pages.length > 1) {
    $('.viewer-next').click();
    check('다음 → 두 번째 상세페이지', location.hash === '#' + pages[1].slug && $('.viewer-index').textContent === `2 / ${pages.length}`);
    check('다음은 기록을 쌓지 않음(replace)', history.state?.viewer === true);
    viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    check('← 키 → 이전 상세페이지', location.hash === '#' + pages[0].slug);
  }
  stage.closest('.viewer').querySelector('[data-device="mobile"]').click();
  check('모바일 폭 전환', stage.dataset.device === 'mobile' && Math.abs(frame.getBoundingClientRect().width - Math.min(stage.clientWidth, layerHost.get('viewer', 'mobileWidth'))) < 2, frame.getBoundingClientRect().width);
  check('폭 버튼 상태(aria-pressed)', $('[data-device="mobile"]').getAttribute('aria-pressed') === 'true' && $('[data-device="desktop"]').getAttribute('aria-pressed') === 'false');
  $('[data-device="desktop"]').click();

  $('.viewer-close').click();
  await until(() => !location.hash);
  check('닫기 → 덮개 닫힘·해시 제거·장면 복귀', !viewer.open && !location.hash && layerHost.scene === 'browse', location.href);
  check('닫은 뒤 포커스가 연 카드로', document.activeElement === cards[0]);

  // 관리자 경로: 장면을 바꾸면 덮개가 같이 열리고 닫힌다.
  layerHost.setScene('viewer');
  check('setScene(viewer) → 덮개 열림', viewer.open);
  layerHost.setScene('browse');
  check('setScene(browse) → 덮개 닫힘', !viewer.open);

  // 덮개 레이어를 끄면 카드는 원래 링크로 이동한다(기본 동작을 막지 않음).
  const original = layerHost.values;
  layerHost.setValues(setValue(original, 'all', 'base', 'viewer', 'visible', false));
  const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
  cards[0].addEventListener('click', event => event.preventDefault(), { once: true }); // 실제 이동은 막고 앱의 판단만 본다
  cards[0].dispatchEvent(click);
  check('덮개를 끄면 덮개를 열지 않음', !viewer.open);
  layerHost.setValues(original);

  if (withProbe) {
    // 데스크톱·모바일 폭 규칙은 무대의 data-device 상태에 걸려 있어, 두 상태에서 각각 재고 합친다.
    const { probe } = await import('../vendor/layer-kit/probe.js');
    const passed = new Set(), all = new Set();
    for (const device of ['desktop', 'mobile']) {
      stage.dataset.device = device;
      const result = await probe(layerHost);
      for (const item of [...result.failed, ...Array(0)]) all.add(item.layer + '/' + item.key);
      for (const layer of layerHost.manifest.layers) for (const key of Object.keys(layer.params)) {
        const id = layer.id + '/' + key;
        all.add(id);
        if (!result.failed.some(item => item.layer + '/' + item.key === id)) passed.add(id);
      }
    }
    stage.dataset.device = 'desktop';
    const failed = [...all].filter(id => !passed.has(id));
    check(`layer-kit probe ${passed.size}/${all.size}`, failed.length === 0, failed);
  }
  return { passed: results.filter(item => item.ok).length, total: results.length, failed: results.filter(item => !item.ok), results };
}
