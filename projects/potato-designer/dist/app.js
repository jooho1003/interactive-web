import { works, findWork, filterWorks, validFavorites } from './work-data.js';
import manifest from './layers.manifest.js';
import published from './layers.values.js';
import { createLayerHost } from './vendor/layer-kit/index.js';

export const layerHost = createLayerHost({ manifest, published });

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const motion = document.querySelector('.character-motion');
const toggle = document.querySelector('#motion-toggle');
const replayButton = document.querySelector('#replay');
let userPaused = false;
let paused = reducedMotion.matches;
let frame = 0;
let pointer = { x: 0, y: 0 };

function updateMotion() {
  paused = userPaused || reducedMotion.matches;
  document.body.classList.toggle('paused', paused);
  document.body.classList.toggle('background-paused', document.hidden || Boolean(document.querySelector('dialog[open]')));
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  toggle.querySelector('.motion-label').textContent = reducedMotion.matches ? 'REDUCED MOTION' : paused ? 'PLAY MOTION' : 'PAUSE MOTION';
  toggle.disabled = reducedMotion.matches;
  toggle.title = reducedMotion.matches ? '기기의 동작 줄이기 설정이 적용되어 있습니다.' : '';
  replayButton.disabled = reducedMotion.matches;
  replayButton.title = toggle.title;
  replayButton.querySelector('span:last-child').textContent = reducedMotion.matches ? 'REDUCED MOTION' : 'CLICK TO PLAY';
}
updateMotion();
toggle.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
reducedMotion.addEventListener('change', updateMotion);

function renderPointer() {
  frame = 0;
  if (paused || document.hidden || document.querySelector('dialog[open]')) return;
  root.style.setProperty('--in-pointer-x', pointer.x);
  root.style.setProperty('--in-pointer-y', pointer.y);
}
hero.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch' || paused) return;
  const box = hero.getBoundingClientRect();
  pointer = { x: (event.clientX - box.left) / box.width * 2 - 1, y: (event.clientY - box.top) / box.height * 2 - 1 };
  if (!frame) frame = requestAnimationFrame(renderPointer);
});
hero.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; if (!frame) frame = requestAnimationFrame(renderPointer); });

function restartArrival() {
  if (paused) return;
  motion.style.animation = 'none';
  void motion.offsetWidth;
  motion.style.animation = '';
}
replayButton.addEventListener('click', () => {
  if (reducedMotion.matches) return;
  userPaused = false;
  updateMotion();
  restartArrival();
});

function setScene(name) {
  const scene = manifest.scenes[name];
  if (!scene) return;
  layerHost.setScene(name);
  document.querySelectorAll('button[data-scene]').forEach(button => {
    const active = button.dataset.scene === name;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('button[data-scene]').forEach(button => button.addEventListener('click', () => setScene(button.dataset.scene)));

const dialogOpeners = new WeakMap();
function openDialog(id, opener = document.activeElement) {
  const dialog = document.getElementById(id);
  dialogOpeners.set(dialog, opener);
  if (id === 'work-dialog') showWorkList(false);
  dialog.showModal();
  document.body.classList.add('modal-open');
  updateMotion();
}
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog, button)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
    updateMotion();
    const opener = dialogOpeners.get(dialog);
    if (!document.querySelector('dialog[open]') && opener?.isConnected && opener.getClientRects().length) opener.focus();
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
});
const workDialog = document.querySelector('#work-dialog');
const workGrid = document.querySelector('#work-grid');
const workSearch = document.querySelector('#work-search');
const workCategory = document.querySelector('#work-category');
const savedOnly = document.querySelector('#saved-only');
const favoritesStatus = document.querySelector('#favorites-status');
const favoritesKey = 'potato-designer:favorites:v1';
let favorites = [];
let detailId = null;
try { favorites = validFavorites(JSON.parse(localStorage.getItem(favoritesKey) || '[]')); }
catch { favoritesStatus.textContent = '관심 작업을 불러올 수 없습니다. 이번 방문 중에는 저장할 수 있습니다.'; }

function renderWorks() {
  const filtered = filterWorks({ query: workSearch.value, category: workCategory.value, savedOnly: savedOnly.getAttribute('aria-pressed') === 'true', favorites });
  // All HTML fragments below come from our static catalog, never search or stored input.
  workGrid.innerHTML = filtered.map(work => `<article class="work-entry">
    <button class="work-card" data-detail="${work.id}" aria-label="${work.title} 상세 보기"><span class="poster poster-${work.id}">${work.poster}</span><span class="card-caption"><b>${work.title}</b><span>${work.discipline} · 상세 보기 ↗</span></span></button>
    <div class="card-actions"><button data-save="${work.id}" aria-pressed="${favorites.includes(work.id)}" aria-label="${work.title} 관심 저장">${favorites.includes(work.id) ? '♥ 저장됨' : '♡ 관심 저장'}</button><button data-work="${work.id}">분위기 적용 ↗</button></div>
  </article>`).join('');
  document.querySelector('#work-results').textContent = `${filtered.length}개 작업 / 전체 ${works.length}개`;
  document.querySelector('#saved-count').textContent = favorites.length;
  document.querySelector('#work-empty').hidden = filtered.length > 0;
  if (detailId) {
    const saved = favorites.includes(detailId);
    document.querySelector('#detail-save').setAttribute('aria-pressed', String(saved));
    document.querySelector('#detail-save').textContent = saved ? '♥ 저장됨' : '♡ 관심 저장';
  }
}
function toggleFavorite(id) {
  if (!findWork(id)) return;
  favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
  try {
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    favoritesStatus.textContent = favorites.includes(id) ? '관심 작업을 이 브라우저에 저장했습니다.' : '관심 작업에서 해제했습니다.';
  } catch { favoritesStatus.textContent = '이번 방문에만 반영했습니다. 브라우저에 저장할 수 없습니다.'; }
  renderWorks();
}
function showWorkList(restoreFocus = true) {
  document.querySelector('#work-list').hidden = false;
  document.querySelector('#work-detail').hidden = true;
  workDialog.setAttribute('aria-labelledby', 'work-title');
  renderWorks();
  if (restoreFocus) (workGrid.querySelector(`[data-detail="${detailId}"]`) || workSearch).focus();
}
function showWorkDetail(id) {
  const work = findWork(id);
  if (!work) return;
  detailId = id;
  for (const key of ['title', 'category', 'summary', 'challenge', 'approach']) document.querySelector(`#detail-${key}`).textContent = work[key];
  const list = document.querySelector('#detail-deliverables');
  list.replaceChildren(...work.deliverables.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
  document.querySelector('#work-list').hidden = true;
  document.querySelector('#work-detail').hidden = false;
  workDialog.setAttribute('aria-labelledby', 'detail-title');
  renderWorks();
  workDialog.scrollTop = 0;
  document.querySelector('#detail-title').focus();
}
function previewWork(id) {
  setScene(id);
  workDialog.close();
  restartArrival();
}
workGrid.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.detail) showWorkDetail(button.dataset.detail);
  if (button.dataset.work) previewWork(button.dataset.work);
  if (button.dataset.save) {
    const id = button.dataset.save;
    toggleFavorite(id);
    (workGrid.querySelector(`[data-save="${id}"]`) || savedOnly).focus();
  }
});
workSearch.addEventListener('input', renderWorks);
workCategory.addEventListener('change', renderWorks);
savedOnly.addEventListener('click', () => { savedOnly.setAttribute('aria-pressed', String(savedOnly.getAttribute('aria-pressed') !== 'true')); renderWorks(); });
document.querySelector('#reset-filters').addEventListener('click', () => {
  workSearch.value = '';
  workCategory.value = 'all';
  savedOnly.setAttribute('aria-pressed', 'false');
  renderWorks();
  workSearch.focus();
});
document.querySelector('#back-to-works').addEventListener('click', () => showWorkList());
document.querySelector('#detail-save').addEventListener('click', () => toggleFavorite(detailId));
document.querySelector('#detail-preview').addEventListener('click', () => previewWork(detailId));
renderWorks();

const briefForm = document.querySelector('#brief-form');
const typeInput = document.querySelector('#project-type');
const briefInput = document.querySelector('#project-brief');
const formStatus = document.querySelector('#form-status');
const draftStatus = document.querySelector('#draft-status');
const draftKey = 'potato-designer:project-draft:v1';
let referenceId = null;
function renderReference() {
  document.querySelector('#brief-reference').hidden = !referenceId;
  document.querySelector('#brief-reference-title').textContent = findWork(referenceId)?.title || '';
}

try {
  const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
  if (draft && typeof draft.brief === 'string' && draft.brief.length <= briefInput.maxLength &&
      [...typeInput.options].some(option => option.value === draft.type)) {
    typeInput.value = draft.type;
    briefInput.value = draft.brief;
    referenceId = findWork(draft.referenceId)?.id || null;
    draftStatus.textContent = '이 브라우저에 저장된 초안을 불러왔습니다.';
  }
} catch {
  draftStatus.textContent = '이 브라우저에서는 초안을 불러올 수 없습니다. 메모 파일로 저장할 수 있습니다.';
}
renderReference();

function saveDraft() {
  formStatus.textContent = '';
  try {
    localStorage.setItem(draftKey, JSON.stringify({ type: typeInput.value, brief: briefInput.value, referenceId }));
    draftStatus.textContent = '초안을 이 브라우저에 저장했습니다.';
  } catch {
    draftStatus.textContent = '초안을 자동 저장할 수 없습니다. 메모 파일로 저장해주세요.';
  }
}
briefForm.addEventListener('input', saveDraft);
document.querySelector('#remove-reference').addEventListener('click', () => {
  referenceId = null;
  renderReference();
  saveDraft();
  briefInput.focus();
});
document.querySelector('#detail-brief').addEventListener('click', () => {
  const work = findWork(detailId);
  if (!work) return;
  referenceId = work.id;
  typeInput.value = work.category;
  renderReference();
  saveDraft();
  const opener = dialogOpeners.get(workDialog) || document.querySelector('.header [data-dialog="work-dialog"]');
  workDialog.close();
  openDialog('contact-dialog', opener);
  briefInput.focus();
});

document.querySelector('#clear-draft').addEventListener('click', () => {
  briefForm.reset();
  referenceId = null;
  renderReference();
  formStatus.textContent = '';
  try {
    localStorage.removeItem(draftKey);
    draftStatus.textContent = '초안을 지웠습니다.';
  } catch {
    draftStatus.textContent = '입력 내용을 비웠습니다. 브라우저에 저장된 초안은 지우지 못했습니다.';
  }
  briefInput.focus();
});

briefForm.addEventListener('submit', event => {
  event.preventDefault();
  const type = typeInput.value;
  const brief = briefInput.value.trim();
  if (!brief) { formStatus.textContent = '프로젝트 아이디어를 입력해주세요.'; briefInput.focus(); return; }
  const reference = findWork(referenceId);
  const text = `PROJECT NOTE\n\n분야: ${type}\n${reference ? `참고 작업: ${reference.title} (${reference.category})\n` : ''}\n${brief}\n`;
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'potato-project-note.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  formStatus.textContent = '프로젝트 메모 다운로드를 요청했습니다.';
});

document.addEventListener('visibilitychange', updateMotion);

export const studioAdapter = {
  setScene,
  showPage(page) {
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    if (page === 'detail') { openDialog('work-dialog'); showWorkDetail('digital'); }
    else if (['work', 'about', 'contact'].includes(page)) openDialog(`${page}-dialog`);
    else window.scrollTo(0, 0);
  },
  replay: restartArrival,
  pause(value) { userPaused = value; updateMotion(); }
};
if (new URLSearchParams(location.search).get('studio') === '1') {
  import('/admin/bridge.js').catch(() => {});
}
