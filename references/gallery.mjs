// 레퍼런스 보관함 페이지. build.mjs가 넘긴 모델로 본문 HTML을 만든다.
// local: references/gallery.html(미디어는 상대 경로) · site: claude.ai 게시본(미디어를 files에 모은다)
import path from 'node:path';
import { esc, slug, makeInline, table as renderTable, metaList as renderMetaList } from '../tools/md-blocks.mjs';
import { STATUS, MARK, summary } from './model.mjs';

const MEDIA_EXT = /\.(webp|png|jpe?g|gif|webm|mp4)$/i;
const isMeta = (b) => b.type === 'table' && b.head[0] === '항목' && b.head[1] === '내용';
const isImage = (b) => b.type === 'para' && /^<img\s/.test(b.text.trim());

export function renderPage(model, { mode, root }) {
  const ctx = { mode };
  const files = new Map();
  const media = (rel) => {
    if (mode === 'site') files.set(rel, path.join(root, ...rel.split('/')));
    return rel;
  };
  const link = (url) => {
    if (/^https?:/.test(url)) return { href: url, external: true };
    const [p, frag = ''] = url.split('#');
    if (!p) return { href: `#${frag}` };
    if (p === 'patterns.md') return { href: frag ? `#pattern-${frag}` : '#patterns' };
    if (MEDIA_EXT.test(p)) return { href: media(p), external: true };
    return mode === 'site' ? { text: p } : { href: url, external: true };
  };
  const inline = makeInline({ link, media });

  const blocks = (list) => list.map((b) => {
    if (b.type === 'para') {
      const t = b.text.trim();
      const k = t.match(/^\*\*([^*]+)\*\*\s*—\s*([\s\S]+)$/);
      return k
        ? `<p class="keyed" data-key="${esc(k[1])}"><span class="k">${esc(k[1])}</span>${inline(k[2], ctx)}</p>`
        : `<p>${inline(t, ctx)}</p>`;
    }
    if (b.type === 'table') return isMeta(b) ? renderMetaList(b.rows, inline, ctx) : renderTable(b, inline, ctx);
    if (b.type === 'list') {
      const tag = b.ordered ? 'ol' : 'ul';
      return `<${tag}>${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</${tag}>`;
    }
    if (b.type === 'quote') return `<blockquote>${inline(b.text, ctx)}</blockquote>`;
    if (b.type === 'code') return `<pre class="code"><code>${esc(b.text)}</code></pre>`;
    if (b.type === 'heading') return `<h4>${inline(b.text, ctx)}</h4>`;
    return '';
  }).join('');

  const siteCard = (s) => {
    const meta = s.part.blocks.find(isMeta);
    const body = s.part.blocks.filter((b) => !isMeta(b) && !isImage(b));
    const date = s.check.date ? ` ${esc(s.check.date)}` : '';
    const extra = (s.images ?? []).slice(1);
    const more = extra.length
      ? `<div class="shot-more">${extra.map((src, k) => `<button type="button" class="zoom" data-src="${esc(media(src))}" aria-label="${esc(s.name)} 캡처 ${k + 2} 크게 보기"><img src="${esc(media(src))}" alt="${esc(s.name)} 화면 ${k + 2}" loading="lazy"></button>`).join('')}</div>`
      : '';
    const shot = s.image
      ? `<button type="button" class="zoom" data-src="${esc(media(s.image))}"${s.video ? ` data-video="${esc(media(s.video))}"` : ''} aria-label="${esc(s.name)} ${s.video ? '녹화' : '캡처'} 크게 보기"><img src="${esc(media(s.image))}" alt="${esc(s.name)} 화면" loading="lazy"></button><figcaption>${s.video ? '▶ 녹화 보기' : '크게 보기'}</figcaption>${more}`
      : `<div class="empty-shot">${s.check.status === 'pending' ? '아직 직접 확인 전' : '캡처 없음'}</div>`;
    return `<article class="card" id="${esc(s.anchor)}" data-status="${s.check.status}" data-patterns="${esc(s.patterns.join(' '))}" data-families="${esc(s.families.join('|'))}">
<figure class="shot">${shot}</figure><div class="card-body"><header><span class="num">${esc(s.id)}</span><h3>${esc(s.name)}</h3><span class="status" data-status="${s.check.status}">${MARK[s.check.status]} ${STATUS[s.check.status]}${date}</span></header>
<p class="tagline">${esc(s.tagline)} <a href="${esc(s.url)}" target="_blank" rel="noopener">사이트 열기 ↗</a></p>
<p class="tags">${s.patterns.map((p) => `<a href="#pattern-${esc(p)}"><code>${esc(p)}</code></a>`).join(' ')}</p>
${meta ? renderMetaList(meta.rows, inline, ctx) : ''}${blocks(body)}
<div class="plan"><button type="button" class="copy">플랜용 요약 복사</button><details><summary>요약 보기</summary><pre>${esc(summary(s))}</pre></details></div>
</div></article>`;
  };

  const patternCard = (p) => {
    const users = model.sites.filter((s) => s.patterns.includes(p.id));
    return `<article class="pattern" id="${esc(p.anchor)}"><header><code>${esc(p.id)}</code><h3>${esc(p.name)}</h3></header>${blocks(p.part.blocks)}<p class="users"><span class="k">사례</span>${users.map((s) => `<a href="#${esc(s.anchor)}">${esc(s.name)}</a>`).join(' · ')}</p></article>`;
  };

  const chips = (key, items) => [['all', '전체'], ...items]
    .map(([v, t], k) => `<button type="button" data-f-${key}="${esc(v)}" aria-pressed="${k === 0}">${esc(t)}</button>`).join('');
  const fams = [...new Set(model.sites.flatMap((s) => s.families))].sort();
  const count = (st) => model.sites.filter((s) => s.check.status === st).length;
  const sources = model.docs.map((d) => `<section class="source" id="source-${esc(slug(d.file.replace(/\.md$/, '')))}"><header class="source-head"><p class="eyebrow">${esc(d.file)}</p><h2>${inline(d.doc.title, ctx)}</h2>${blocks(d.doc.intro)}</header><div class="cards">${d.sites.map(siteCard).join('\n')}</div></section>`).join('\n');
  const guide = `${blocks(model.readme.intro)}${model.readme.parts.map((p) => `<section class="doc-section" id="guide-${esc(slug(p.title))}"><h2>${inline(p.title, ctx)}</h2>${blocks(p.blocks)}</section>`).join('')}`;

  const body = `<div class="page" lang="ko">
<header class="masthead">
  <p class="eyebrow">interactive-web · references</p>
  <h1>인터랙티브 레퍼런스 보관함</h1>
  <p class="lead">인터랙티브를 만들 때 참고할 외부 사이트를 직접 열어 보고 정리했습니다. 따라 만들 대상이 아니라 참고용입니다. 카드마다 가져올 것과 안 가져올 것이 있고, 플랜에 붙일 요약을 복사할 수 있습니다.</p>
  <p class="tally"><span><b>${model.sites.length}</b> 사이트</span><span><b>${model.patterns.length}</b> 패턴</span><span data-status="ok"><b>${count('ok')}</b> ${STATUS.ok}</span><span data-status="pending"><b>${count('pending')}</b> ${STATUS.pending}</span><span data-status="down"><b>${count('down')}</b> ${STATUS.down}</span></p>
</header>
<div class="bar">
  <nav class="tabs" role="tablist" aria-label="보기">
    <button type="button" role="tab" id="tab-sites" aria-controls="sites" aria-selected="true">사이트</button>
    <button type="button" role="tab" id="tab-patterns" aria-controls="patterns" aria-selected="false">패턴</button>
    <button type="button" role="tab" id="tab-guide" aria-controls="guide" aria-selected="false">쓰는 법</button>
  </nav>
  <div class="filters" id="filters">
    <div class="chips" role="group" aria-label="패턴">${chips('pattern', model.patterns.map((p) => [p.id, p.name]))}</div>
    <div class="chips" role="group" aria-label="패밀리">${chips('family', fams.map((f) => [f, f]))}</div>
    <div class="chips" role="group" aria-label="확인 상태">${chips('status', ['ok', 'pending', 'down'].map((st) => [st, `${MARK[st]} ${STATUS[st]}`]))}</div>
    <label class="search" for="q"><span class="sr">검색</span><input id="q" type="search" placeholder="사이트·패턴·설명 검색" autocomplete="off"></label>
  </div>
</div>
<main>
<section id="sites" role="tabpanel" aria-labelledby="tab-sites">
${sources}
<p class="empty" id="empty" hidden>조건에 맞는 사이트가 없습니다. <button type="button" id="reset">필터를 전체로 되돌리기</button></p>
</section>
<section id="patterns" role="tabpanel" aria-labelledby="tab-patterns" hidden><div class="doc">${blocks(model.patternDoc.intro)}</div><div class="cards">${model.patterns.map(patternCard).join('\n')}</div></section>
<section id="guide" role="tabpanel" aria-labelledby="tab-guide" hidden><div class="doc">${guide}</div></section>
</main>
<footer class="foot">원본은 <code>references/*.md</code>입니다. 이 페이지는 <code>pnpm references:build</code>로 생성합니다.</footer>
<dialog id="viewer" aria-label="크게 보기"><button type="button" class="close" id="viewer-close" aria-label="닫기">×</button><img id="viewer-img" alt=""><video id="viewer-video" controls playsinline hidden></video></dialog>
<p class="sr" id="live" aria-live="polite"></p>
</div>
<script>${SCRIPT}</script>`;
  return { body, files };
}

export const HEAD = `<title>인터랙티브 레퍼런스 보관함</title>
<!-- 생성물: references/build.mjs가 references/*.md에서 만든다. 직접 고치지 말고 마크다운을 고친 뒤 pnpm references:build -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap">`;

const DARK = `--ground:#0F1211;--surface:#161A18;--sunk:#1C211F;--ink:#E5E9E6;--muted:#9AA39E;--line:#29302C;--line-strong:#3D4641;
  --accent:#93A6FF;--accent-soft:#1E264A;
  --ok:#63C891;--ok-soft:#15301F;--down:#FF8B7E;--down-soft:#3A1B18;--wait:#E2B458;--wait-soft:#33290F;
  --code:#121513;--shadow:0 1px 2px rgba(0,0,0,.4)`;
export const STYLE = `<style>
:root{
  --ground:#EDEFEC;--surface:#FAFBF9;--sunk:#E4E8E4;--ink:#161A18;--muted:#56605B;--line:#D1D7D2;--line-strong:#A9B3AD;
  --accent:#2B4ED0;--accent-soft:#DFE5FA;
  --ok:#1B7043;--ok-soft:#DAEEE1;--down:#AE2A1F;--down-soft:#F7E0DC;--wait:#855700;--wait-soft:#F4E7C6;
  --code:#F3F5F2;--shadow:0 1px 2px rgba(22,26,24,.06),0 8px 24px rgba(22,26,24,.06);
  --sans:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Consolas,'Malgun Gothic',monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${DARK}}}
:root[data-theme="dark"]{color-scheme:dark;${DARK}}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.7 var(--sans);-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:anywhere}
.page{max-width:1240px;margin:0 auto;padding:32px 16px 72px}
a{color:var(--accent);text-underline-offset:3px}
code{font:.88em var(--mono);background:var(--sunk);padding:1px 5px;border-radius:4px}
button{font:inherit;color:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.eyebrow{margin:0;font:500 11px/1.4 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1,h2,h3{text-wrap:balance;letter-spacing:-.02em;line-height:1.25}
.masthead{display:grid;gap:10px;padding-bottom:22px}
.masthead h1{margin:0;font-size:clamp(30px,4.2vw,46px);font-weight:700}
.lead{margin:0;max-width:62ch;color:var(--muted);font-size:16px}
.tally{display:flex;flex-wrap:wrap;gap:6px 18px;margin:6px 0 0;font:13px var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.tally b{font-weight:500;color:var(--ink);margin-right:4px}
.tally [data-status="ok"]{color:var(--ok)}.tally [data-status="pending"]{color:var(--wait)}.tally [data-status="down"]{color:var(--down)}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--ground);border-bottom:1px solid var(--line);padding-block:8px 10px;display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.tabs{display:flex;gap:4px;overflow-x:auto}
.tabs button{border:0;background:none;padding:8px 12px;border-radius:6px;font-weight:500;color:var(--muted);white-space:nowrap}
.tabs button[aria-selected="true"]{background:var(--ink);color:var(--ground)}
.filters{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.chips{display:flex;gap:4px;overflow-x:auto;max-width:100%}
.chips button{border:1px solid var(--line);background:var(--surface);padding:3px 10px;border-radius:999px;font-size:13px;white-space:nowrap}
.chips button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
.search{display:flex;min-width:0}
.search input{width:100%;min-width:0;font:14px var(--sans);color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:6px 10px}
main{padding-top:22px}
.source{display:grid;gap:14px;margin-bottom:48px;grid-template-columns:minmax(0,1fr)}
.source-head{display:grid;gap:6px;max-width:880px}
.source-head>*{margin:0}
.source-head h2{font-size:clamp(22px,3vw,30px)}
.source-head p{color:var(--muted)}
.cards{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
.card,.pattern{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;box-shadow:var(--shadow);scroll-margin-top:calc(var(--bar-h,170px) + 12px)}
.card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px}
.shot{margin:0;align-self:start;position:sticky;top:calc(var(--bar-h,170px) + 12px);display:grid;gap:6px}
.zoom{display:block;width:100%;padding:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--sunk)}
.zoom img{display:block;width:100%;height:auto}
.zoom:hover{border-color:var(--accent)}
.shot-more{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;margin-top:6px}
.shot figcaption{font:12px var(--mono);color:var(--muted)}
.empty-shot{display:grid;place-items:center;min-height:160px;border:1px dashed var(--line-strong);border-radius:8px;color:var(--muted);font:13px var(--mono)}
.card-body,.pattern{display:grid;gap:12px;align-content:start;min-width:0;grid-template-columns:minmax(0,1fr)}
.card-body>*,.pattern>*{margin:0}
.card-body header,.pattern header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.num{font:500 13px var(--mono);color:var(--muted)}
.card-body h3,.pattern h3{margin:0;font-size:20px;flex:1 1 auto}
.status{font:500 12px var(--mono);padding:2px 9px;border-radius:999px;white-space:nowrap}
.status[data-status="ok"]{background:var(--ok-soft);color:var(--ok)}
.status[data-status="pending"]{background:var(--wait-soft);color:var(--wait)}
.status[data-status="down"]{background:var(--down-soft);color:var(--down)}
.tagline{color:var(--muted)}
.tags{display:flex;flex-wrap:wrap;gap:6px}.tags a{text-decoration:none}
.meta{display:grid;gap:4px;margin:0;font-size:14px;border-block:1px solid var(--line);padding-block:10px}
.meta div{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:12px}
.meta dt{color:var(--muted)}.meta dd{margin:0}
.k{display:block;font:500 11px var(--mono);letter-spacing:.1em;color:var(--muted);margin-bottom:2px}
.keyed[data-key="가져올 것"]{padding-left:10px;border-left:3px solid var(--ok)}
.keyed[data-key="안 가져올 것"]{padding-left:10px;border-left:3px solid var(--down)}
.plan{display:flex;flex-wrap:wrap;gap:8px;align-items:start;padding-top:4px}
.plan details{flex:1 1 240px;min-width:0}
.plan summary{cursor:pointer;color:var(--muted);font-size:14px;padding-block:3px}
.plan pre,.code{margin:6px 0 0;padding:12px 14px;background:var(--code);border:1px solid var(--line);border-radius:8px;font:13px/1.65 var(--mono)}
.plan pre{white-space:pre-wrap;overflow-wrap:anywhere}
.code{white-space:pre;overflow-x:auto}
.code code{background:none;padding:0;font:inherit}
.copy{border:1px solid var(--line-strong);background:var(--surface);border-radius:6px;padding:3px 10px;font-size:13px}
.copy:hover{border-color:var(--accent);color:var(--accent)}
.copy[data-done]{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;vertical-align:top;padding:7px 10px;border-bottom:1px solid var(--line)}
th{font-weight:500;color:var(--muted);white-space:nowrap}
.path{font:.88em var(--mono);color:var(--muted)}
ul,ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
blockquote{margin:0;padding:2px 0 2px 14px;border-left:3px solid var(--line-strong);color:var(--muted)}
.empty{padding:28px;text-align:center;color:var(--muted)}
.empty button{border:0;background:none;color:var(--accent);text-decoration:underline;padding:0}
.doc{display:grid;gap:14px;max-width:860px;min-width:0;grid-template-columns:minmax(0,1fr);margin-bottom:18px}
.doc>*,.doc-section>*{margin:0}
.doc-section{display:grid;gap:12px;padding-top:26px;border-top:1px solid var(--line);grid-template-columns:minmax(0,1fr)}
.doc-section h2{font-size:22px}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
dialog{border:0;padding:0;background:transparent;max-width:min(96vw,1600px);max-height:94vh}
dialog::backdrop{background:rgba(8,10,9,.86)}
dialog img,dialog video{display:block;max-width:min(96vw,1600px);max-height:90vh;margin:auto;border-radius:6px}
dialog .close{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);right:16px;width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:#111;font-size:26px;line-height:1}
@media (max-width:860px){
  .card{grid-template-columns:minmax(0,1fr);gap:16px;padding:14px}
  .pattern{padding:14px}
  .shot{position:static}
  .meta div{grid-template-columns:minmax(0,1fr);gap:0}
  .bar{position:static}
  .card,.pattern{scroll-margin-top:12px}
}
@media (prefers-reduced-motion:no-preference){.copy,.chips button,.zoom{transition:background-color .15s,color .15s,border-color .15s}}
</style>`;

const SCRIPT = String.raw`
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const TABS = ['sites', 'patterns', 'guide'];
const live = $('#live');
function showTab(name) {
  for (const t of TABS) {
    $('#' + t).hidden = t !== name;
    $('#tab-' + t).setAttribute('aria-selected', String(t === name));
  }
  $('#filters').hidden = name !== 'sites';
  setBarHeight();
}
function setBarHeight() { document.documentElement.style.setProperty('--bar-h', $('.bar').offsetHeight + 'px'); }
addEventListener('resize', setBarHeight);
$$('[role="tab"]').forEach((b) => b.addEventListener('click', () => { showTab(b.getAttribute('aria-controls')); scrollTo({ top: 0 }); }));

const f = { pattern: 'all', family: 'all', status: 'all' };
const q = $('#q');
function apply() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  $$('#sites .card').forEach((c) => {
    const text = c.textContent.toLowerCase();
    const ok = (f.pattern === 'all' || c.dataset.patterns.split(' ').includes(f.pattern))
      && (f.family === 'all' || c.dataset.families.split('|').includes(f.family))
      && (f.status === 'all' || c.dataset.status === f.status)
      && words.every((w) => text.includes(w));
    c.hidden = !ok;
    if (ok) shown++;
  });
  $$('#sites .source').forEach((s) => { s.hidden = !s.querySelector('.card:not([hidden])'); });
  $('#empty').hidden = shown > 0;
  live.textContent = shown ? shown + '곳 표시' : '조건에 맞는 사이트 없음';
}
function press(key, value) {
  f[key] = value;
  $$('[data-f-' + key + ']').forEach((x) => x.setAttribute('aria-pressed', String(x.getAttribute('data-f-' + key) === value)));
}
for (const key of Object.keys(f)) {
  $$('[data-f-' + key + ']').forEach((b) => b.addEventListener('click', () => { press(key, b.getAttribute('data-f-' + key)); apply(); }));
}
q.addEventListener('input', apply);
function resetFilters() { for (const key of Object.keys(f)) press(key, 'all'); q.value = ''; apply(); }
$('#reset').addEventListener('click', () => { resetFilters(); q.focus(); });

function go(hash, smooth) {
  let id; try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  if (!id) return;
  if (TABS.includes(id)) { showTab(id); scrollTo({ top: 0 }); return; }
  const el = document.getElementById(id);
  if (!el) return;
  const panel = el.closest('[role="tabpanel"]');
  if (panel) showTab(panel.id);
  if (el.closest('[hidden]')) resetFilters();
  el.scrollIntoView({ behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  go(a.getAttribute('href'), true);
  try { history.replaceState(null, '', a.getAttribute('href')); } catch {}
});
window.addEventListener('hashchange', () => go(location.hash, true));

async function copySummary(btn) {
  const box = btn.closest('.plan');
  const pre = $('pre', box);
  const label = btn.dataset.label ?? (btn.dataset.label = btn.textContent);
  const done = (msg) => { btn.textContent = msg; btn.setAttribute('data-done', ''); live.textContent = msg; setTimeout(() => { btn.textContent = label; btn.removeAttribute('data-done'); }, 1600); };
  try { await navigator.clipboard.writeText(pre.textContent); done('복사됨'); return; } catch {}
  $('details', box).open = true;
  const r = document.createRange(); r.selectNodeContents(pre);
  getSelection().removeAllRanges(); getSelection().addRange(r);
  done('선택됨 · Ctrl+C');
}
document.addEventListener('click', (e) => { const b = e.target.closest('button.copy'); if (b) copySummary(b); });

const viewer = $('#viewer'), vImg = $('#viewer-img'), vVideo = $('#viewer-video');
document.addEventListener('click', (e) => {
  const z = e.target.closest('button.zoom');
  if (!z) return;
  const video = z.dataset.video;
  vVideo.hidden = !video; vImg.hidden = Boolean(video);
  if (video) { vVideo.poster = z.dataset.src; vVideo.src = video; } else { vImg.src = z.dataset.src; vImg.alt = z.getAttribute('aria-label'); }
  viewer.showModal();
});
$('#viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => { vVideo.pause(); vVideo.removeAttribute('src'); vVideo.load(); });

showTab('sites');
if (location.hash) go(location.hash, false);
`;
