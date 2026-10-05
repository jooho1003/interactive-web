import { readMood, writeMood, openStorage, moodImages } from './moods.js';

// 분야 버튼 ↔ 장면(si·seo·hwa). 버튼 클릭도, 관리자의 setScene도 같은 길(layerHost.subscribe)로 화면을 맞춘다.
export function setupMoods(layerHost, { storage = openStorage() } = {}) {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('.mood[data-scene]')];
  const image = document.querySelector('.paper-image');
  const cover = document.querySelector('.paper-prev');
  const ids = Object.keys(layerHost.manifest.scenes);
  let scene = layerHost.scene, shown = image.getAttribute('src'), saved = null, started = false, token = null, timer = 0;
  // 덮개는 이전 그림이 실제로 그려진 적이 있을 때만 쓴다 — 아직 못 받은 첫 장면 그림을 덮개로 올리면 틀린 분위기가 먼저 보인다
  let shownReady = image.complete && image.naturalWidth > 0;
  if (!shownReady) image.addEventListener('load', () => { if (image.getAttribute('src') === shown) shownReady = true; }, { once: true });

  const sync = () => { for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.scene === scene)); };
  // 덮개 전환 시간의 정본은 .paper-prev의 계산된 transition-duration(= global.moodFade, 동작 줄이기면 0)
  const fadeMs = () => (parseFloat(getComputedStyle(cover).transitionDuration) || 0) * 1000;
  function lift(current) {
    if (token !== current) return;
    cover.hidden = true; cover.classList.remove('is-fading');
  }
  // 이전 배경을 덮개로 덮어 두고 새 배경이 디코딩되면 걷어 낸다. 새 배경을 못 불러오면 덮개를 그대로 둬 빈 배경이 보이지 않게 한다.
  function crossfade(animate) {
    const next = image.getAttribute('src');
    clearTimeout(timer);
    if (next === shown) { token = null; cover.hidden = true; cover.classList.remove('is-fading'); return; }
    const current = token = {};
    cover.classList.remove('is-fading');
    if (shownReady) { cover.src = shown; cover.hidden = false; } else cover.hidden = true;
    image.decode().then(() => {
      if (token !== current) return;
      shown = next; shownReady = true;
      const ms = animate && !cover.hidden ? fadeMs() : 0;
      if (!ms) return lift(current);
      void cover.offsetWidth; // 덮개를 보인 직후 같은 프레임에 걷으면 전환이 일어나지 않는다
      cover.classList.add('is-fading');
      timer = setTimeout(() => lift(current), ms + 50);
    }, () => {
      if (token === current) console.warn('배경 그림을 불러오지 못해 이전 그림을 그대로 둡니다.', next);
    });
  }
  function reveal() { root.classList.remove('mood-enter'); void root.offsetWidth; root.classList.add('mood-enter'); }

  layerHost.subscribe(({ scene: next }) => {
    const changed = next !== scene;
    scene = next;
    sync();
    crossfade(started && changed);
    if (started && changed && fadeMs()) reveal();
  });
  for (const button of buttons) button.addEventListener('click', () => {
    const id = button.dataset.scene;
    if (id !== layerHost.scene) layerHost.setScene(id);
    saved = writeMood(storage, id);
  });

  const restored = readMood(storage, ids);
  if (restored && restored !== layerHost.scene) layerHost.setScene(restored);
  sync();
  started = true;

  // 다른 분야 배경은 첫 화면을 그린 뒤 한가할 때 미리 불러 둔다
  const keep = [];
  function preload() {
    const screens = layerHost.manifest.breakpoints.filter(item => matchMedia(item.media).matches).map(item => item.id);
    for (const src of moodImages(layerHost.manifest, layerHost.values, screens)) {
      if (src === image.getAttribute('src')) continue;
      const img = new Image(); img.src = src; img.decode().catch(() => {}); keep.push(img);
    }
  }
  const idle = callback => (window.requestIdleCallback ? requestIdleCallback(callback, { timeout: 2000 }) : setTimeout(callback, 200));
  if (document.readyState === 'complete') idle(preload); else addEventListener('load', () => idle(preload), { once: true });

  return { get scene() { return scene; }, get saved() { return saved; }, get preloaded() { return keep.map(img => img.getAttribute('src')); } };
}
