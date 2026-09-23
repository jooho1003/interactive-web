// prompts/*.md → gallery.html + catalog.json
// 원본은 마크다운이다. 이 스크립트가 만든 두 파일은 직접 고치지 않는다.
//   node prompts/build.mjs            생성
//   node prompts/build.mjs --check    생성물이 최신인지 확인 (다르면 exit 1)
//   node prompts/build.mjs --site DIR 웹 게시용(아티팩트) 페이지와 media/ 복사본을 DIR에 만든다
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const APPS = ['dawn-store', 'day-walk', 'potato-designer', 'juho-lab'];
const KEYS = { README: 'readme', templates: 'templates' };
const MEDIA_EXT = /\.(webp|png|jpe?g|gif|webm|mp4|mp3|wav)$/i;
const VIDEO_EXT = /\.(webm|mp4)$/i;
const STATUS = {
  ok: '프롬프트 있음',
  missing: '기록 없음',
  pending: '아직 안 만듦',
  none: '생성 에셋 아님',
};

const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
const siteAt = argv.indexOf('--site');
const siteDir = siteAt >= 0 ? path.resolve(argv[siteAt + 1] ?? '') : null;

const read = (name) => fs.readFileSync(path.join(HERE, `${name}.md`), 'utf8').replace(/\r\n/g, '\n');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M} _-]/gu, '').replace(/ /g, '-');
const plain = (s) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]+>/g, '').trim();
const keyOf = (base) => KEYS[base] ?? base;
const anchor = (key, frag) => `${key}--${frag}`;
const posix = (p) => p.split(path.sep).join('/');

// ── 마크다운 블록 ─────────────────────────────────────────────
const BLOCK_START = /^(`{3,}|#{1,6} |---+\s*$|\||>|([-*]|\d+\.) )/;
function parseBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (!line.trim()) { i++; continue; }
    if ((m = line.match(/^(`{3,})(.*)$/))) {
      const fence = m[1];
      const [lang = '', ...rest] = m[2].trim().split(/\s+/);
      const body = [];
      i++;
      while (i < lines.length && !(lines[i].startsWith(fence) && !lines[i].slice(fence.length).trim())) body.push(lines[i++]);
      i++;
      const attrs = Object.fromEntries(rest.map((p) => p.split('=')).filter((p) => p.length === 2));
      blocks.push({ type: 'code', lang, attrs, text: body.join('\n') });
    } else if ((m = line.match(/^(#{1,6}) (.+)$/))) {
      blocks.push({ type: 'heading', level: m[1].length, text: m[2].trim() });
      i++;
    } else if (/^---+\s*$/.test(line)) {
      i++;
    } else if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = rows.filter((_, k) => k !== 1).map((r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      blocks.push({ type: 'table', head: cells[0], rows: cells.slice(1) });
    } else if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: body.join(' ') });
    } else if ((m = line.match(/^([-*]|\d+\.) /))) {
      const ordered = /\d/.test(m[1]);
      const items = [];
      while (i < lines.length && /^([-*]|\d+\.) /.test(lines[i])) items.push(lines[i++].replace(/^([-*]|\d+\.) /, ''));
      blocks.push({ type: 'list', ordered, items });
    } else {
      const body = [lines[i++]];
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) body.push(lines[i++]);
      blocks.push({ type: 'para', text: body.join('\n') });
    }
  }
  return blocks;
}

// 문서 = 제목 + 머리말 + (## 절 | ### 카드) 목록
function splitDoc(md) {
  const doc = { title: '', intro: [], parts: [] };
  let cur = null;
  for (const b of parseBlocks(md)) {
    if (b.type === 'heading' && b.level === 1) doc.title = b.text;
    else if (b.type === 'heading' && (b.level === 2 || b.level === 3)) {
      cur = { kind: b.level === 3 ? 'card' : 'section', title: b.text, blocks: [] };
      doc.parts.push(cur);
    } else (cur ? cur.blocks : doc.intro).push(b);
  }
  return doc;
}

// ── 경로·링크 ────────────────────────────────────────────────
function media(rel, ctx) {
  if (ctx.mode !== 'site') return rel;
  const abs = path.resolve(HERE, rel);
  const published = `media/${posix(path.relative(path.join(REPO, 'projects'), abs)).replace(/(^|\/)\./g, '$1')}`; // 점 폴더(.claude)는 게시 경로에서 뺀다
  ctx.files.set(published, abs);
  return published;
}
function link(url, ctx) {
  if (/^https?:/.test(url)) return { href: url, external: true };
  const [p, frag = ''] = url.split('#');
  if (!p) return { href: `#${anchor(ctx.key, frag)}` };
  const base = path.basename(p, '.md');
  if (p.endsWith('.md') && !p.includes('/') && (APPS.includes(base) || base in KEYS)) {
    if (frag) return { href: `#${anchor(keyOf(base), frag)}` };
    return { href: `#${base === 'templates' ? 'templates' : base === 'README' ? 'record' : base}` };
  }
  if (MEDIA_EXT.test(p)) return { href: media(p, ctx), external: true };
  if (ctx.mode === 'site') return { text: posix(path.relative(REPO, path.resolve(HERE, p))) };
  return { href: url, external: true };
}

const INLINE = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|<img\s+src="([^"]+)"(?:\s+width="\d+")?\s*\/?>|~~(.+?)~~/g;
function inline(s, ctx) {
  let out = '';
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    out += esc(s.slice(last, m.index));
    if (m[1] !== undefined) out += `<code>${esc(m[1])}</code>`;
    else if (m[2] !== undefined) out += `<strong>${inline(m[2], ctx)}</strong>`;
    else if (m[3] !== undefined) {
      const l = link(m[4], ctx);
      out += l.text
        ? `<span class="path" title="저장소 경로">${inline(m[3], ctx)}</span>`
        : `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${inline(m[3], ctx)}</a>`;
    } else if (m[5] !== undefined) out += `<img src="${esc(media(m[5], ctx))}" alt="" loading="lazy">`;
    else out += `<s>${inline(m[6], ctx)}</s>`;
    last = m.index + m[0].length;
  }
  return (out + esc(s.slice(last))).replace(/\n/g, ' ');
}

// ── 블록 렌더링 ──────────────────────────────────────────────
function code(b, ctx) {
  const index = ctx.prompts.length;
  const prepend = b.attrs.with ? `${ctx.key}:${b.attrs.with}` : null;
  ctx.prompts.push({ text: b.text, with: prepend });
  if (b.attrs.id) ctx.shared[`${ctx.key}:${b.attrs.id}`] = b.text;
  const kind = b.lang === 'bash' ? '명령' : b.lang === 'markdown' ? '기록 양식' : b.attrs.id ? '공통 블록' : '프롬프트';
  const note = prepend ? '<span class="hint">실제로는 공통 블록 뒤에 붙여 보냄</span>' : '';
  const full = prepend ? `<button type="button" class="copy" data-copy="${index}" data-full>공통 블록 포함 복사</button>` : '';
  return `<figure class="code" data-lang="${esc(b.lang)}"><figcaption><span class="kind">${kind}</span>${note}<span class="actions">${full}<button type="button" class="copy" data-copy="${index}">복사</button></span></figcaption><pre><code>${esc(b.text)}</code></pre></figure>`;
}
function para(b, next, ctx) {
  const t = b.text.trim();
  const keyed = t.match(/^\*\*([^*]+)\*\*\s*—\s*([\s\S]+)$/);
  if (keyed) return `<p class="keyed"><span class="k">${esc(keyed[1])}</span>${inline(keyed[2], ctx)}</p>`;
  if (/^\*\*[^*]+\*\*$/.test(t) && next?.type === 'code') return `<p class="label">${inline(t.slice(2, -2), ctx)}</p>`;
  const cls = t.startsWith('❌') ? 'note missing' : t.startsWith('⚠️') ? 'note warn' : t.startsWith('⏸') ? 'note wait' : '';
  return `<p${cls ? ` class="${cls}"` : ''}>${inline(t.replace(/^(❌|⚠️|⏸)\s*/, ''), ctx)}</p>`;
}
function table(b, ctx) {
  const cells = (row, tag) => row.map((c) => `<${tag}>${inline(c, ctx)}</${tag}>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${cells(b.head, 'th')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${cells(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
}
function metaList(rows, ctx) {
  return `<dl class="meta">${rows.map(([k, v]) => `<div><dt>${inline(k, ctx)}</dt><dd>${inline(v, ctx)}</dd></div>`).join('')}</dl>`;
}
function blocks(list, ctx) {
  return list.map((b, k) => {
    if (b.type === 'para') return /^\[← /.test(b.text) ? '' : para(b, list[k + 1], ctx);
    if (b.type === 'code') return code(b, ctx);
    if (b.type === 'table') return b.head[0] === '항목' && b.head[1] === '내용' ? metaList(b.rows, ctx) : table(b, ctx);
    if (b.type === 'quote') return `<blockquote>${inline(b.text, ctx)}</blockquote>`;
    if (b.type === 'list') {
      const tag = b.ordered ? 'ol' : 'ul';
      return `<${tag}>${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</${tag}>`;
    }
    if (b.type === 'heading') return `<h4>${inline(b.text, ctx)}</h4>`;
    return '';
  }).join('');
}

// ── 카드 ────────────────────────────────────────────────────
function card(part, ctx, appTitle) {
  const body = [...part.blocks];
  const imgAt = body.findIndex((b) => b.type === 'para' && /^<img\s/.test(b.text.trim()));
  const image = imgAt >= 0 ? body.splice(imgAt, 1)[0].text.match(/src="([^"]+)"/)[1] : null;
  const metaAt = body.findIndex((b) => b.type === 'table' && b.head[0] === '항목');
  const meta = metaAt >= 0 ? body.splice(metaAt, 1)[0].rows : [];
  const text = JSON.stringify(part.blocks);
  const status = /❌/.test(text) ? 'missing' : /⏸/.test(text) ? 'pending' : part.blocks.some((b) => b.type === 'code') ? 'ok' : 'none';
  const video = text.match(/\((\.\.\/[^)\s]+\.(?:webm|mp4))\)/)?.[1] ?? null;
  const id = anchor(ctx.key, slug(part.title));
  const [, num, name] = part.title.match(/^(\d+) · (.+)$/) ?? [null, '', part.title];
  const first = ctx.prompts.length;
  const html = blocks(body, ctx);
  const prompts = ctx.prompts.slice(first).map((p, k) => {
    const src = body.filter((b) => b.type === 'code')[k];
    const at = body.indexOf(src);
    const prev = body[at - 1];
    return {
      label: prev?.type === 'para' && /^\*\*[^*]+\*\*$/.test(prev.text.trim()) ? plain(prev.text) : null,
      lang: src.lang,
      prepend: p.with,
      text: p.text,
    };
  });
  const repoPath = (rel) => (rel ? posix(path.relative(REPO, path.resolve(HERE, rel))) : null);
  ctx.catalog.push({
    app: ctx.key, appTitle, id, title: part.title, status,
    image: repoPath(image), video: repoPath(video),
    meta: Object.fromEntries(meta.map(([k, v]) => [plain(k), plain(v)])),
    prompts,
  });

  const file = image ? path.basename(image) : '';
  const shot = image
    ? `<button type="button" class="zoom" data-src="${esc(media(image, ctx))}"${video ? ` data-video="${esc(media(video, ctx))}"` : ''} aria-label="${esc(name)} 크게 보기"><img src="${esc(media(image, ctx))}" alt="${esc(name)}" loading="lazy"></button><figcaption><span>${esc(file)}</span><span>${video ? '▶ 영상 보기' : '크게 보기'}</span></figcaption>`
    : `<div class="empty-shot">${status === 'pending' ? '아직 만들지 않음' : '이미지 없음'}</div>`;
  const dl = meta.length ? metaList(meta, ctx) : '';
  const hasShot = image || status !== 'none';
  return `<article class="card${hasShot ? '' : ' wide'}" id="${esc(id)}" data-app="${ctx.key}" data-status="${status}">
${hasShot ? `<figure class="shot">${shot}</figure>` : ''}<div class="card-body"><header><span class="num">${esc(num)}</span><h3>${inline(name, ctx)}</h3><span class="status" data-status="${status}">${STATUS[status]}</span></header>${dl}${html}</div>
</article>`;
}

// ── 페이지 ──────────────────────────────────────────────────
function build(mode) {
  const ctx = { mode, files: new Map(), prompts: [], shared: {}, catalog: [], key: '' };
  const apps = APPS.map((key) => {
    ctx.key = key;
    const doc = splitDoc(read(key));
    const title = doc.title.replace(/\s*—\s*에셋 프롬프트$/, '');
    const firstCard = doc.parts.findIndex((p) => p.kind === 'card');
    const section = (p, open) => `<details class="panel" id="${esc(anchor(key, slug(p.title)))}"${open ? ' open' : ''}><summary>${inline(p.title, ctx)}</summary><div class="panel-body">${blocks(p.blocks, ctx)}</div></details>`;
    const head = `<header class="app-head"><p class="eyebrow">${esc(key)}</p><h2>${esc(title)}</h2>${blocks(doc.intro, ctx)}</header>`;
    const before = doc.parts.slice(0, firstCard).map((p) => section(p, true)).join('');
    const cards = doc.parts.filter((p) => p.kind === 'card').map((p) => card(p, ctx, title)).join('\n');
    const after = doc.parts.slice(firstCard).filter((p) => p.kind === 'section').map((p) => section(p, false)).join('');
    return { key, title, html: `<section class="app" id="${key}" data-app="${key}">${head}${before}<div class="cards">${cards}</div>${after}</section>` };
  });

  ctx.key = 'readme';
  const readme = splitDoc(read('README'));
  const readmePart = (t) => readme.parts.find((p) => p.title.startsWith(t));
  const doc = (p) => `<section class="doc-section" id="${esc(anchor(ctx.key, slug(p.title)))}"><h2>${inline(p.title, ctx)}</h2>${blocks(p.blocks, ctx)}</section>`;
  const lessons = doc(readmePart('만들면서 확인된 것'));
  const record = [readmePart('빠진 기록'), readmePart('새 에셋을 만들면')].map(doc).join('');

  ctx.key = 'templates';
  const tpl = splitDoc(read('templates'));
  const tplToc = tpl.parts.map((p) => `<li><a href="#${esc(anchor('templates', slug(p.title)))}">${esc(p.title.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)$/, ''))}</a></li>`).join('');
  const tplBody = `${blocks(tpl.intro, ctx)}${lessons}${tpl.parts.map(doc).join('')}`;

  const count = (s) => ctx.catalog.filter((c) => c.status === s).length;
  const missing = ctx.catalog.filter((c) => c.status === 'missing');
  const chips = [['all', '전체'], ...apps.map((a) => [a.key, a.title.split(/ [·—] /)[0]])]
    .map(([v, t], k) => `<button type="button" data-app-filter="${v}" aria-pressed="${k === 0}">${esc(t)}</button>`).join('');
  const statusChips = [['all', '전체'], ['ok', STATUS.ok], ['missing', STATUS.missing], ['pending', STATUS.pending]]
    .map(([v, t], k) => `<button type="button" data-status-filter="${v}" aria-pressed="${k === 0}">${esc(t)}</button>`).join('');

  const body = `<div class="page" lang="ko">
<header class="masthead">
  <p class="eyebrow">interactive-web · prompts</p>
  <h1>에셋 프롬프트 보관함</h1>
  <p class="lead">인터랙티브 작품의 그림·영상·소리를 무엇으로, 어떤 문장으로 만들었는지 모았습니다. 썸네일을 누르면 크게 보이고, 프롬프트는 버튼 하나로 복사됩니다.</p>
  <p class="tally"><span><b>${ctx.catalog.length}</b> 항목</span><span data-status="ok"><b>${count('ok')}</b> 프롬프트 있음</span><span data-status="missing"><b>${count('missing')}</b> 기록 없음</span><span data-status="pending"><b>${count('pending')}</b> 아직 안 만듦</span></p>
</header>
<div class="bar">
  <nav class="tabs" role="tablist" aria-label="보기">
    <button type="button" role="tab" id="tab-assets" aria-controls="assets" aria-selected="true">에셋</button>
    <button type="button" role="tab" id="tab-templates" aria-controls="templates" aria-selected="false">프롬프트 틀</button>
    <button type="button" role="tab" id="tab-record" aria-controls="record" aria-selected="false">기록 방법</button>
  </nav>
  <div class="filters" id="filters">
    <div class="chips" role="group" aria-label="작품">${chips}</div>
    <div class="chips" role="group" aria-label="상태">${statusChips}</div>
    <label class="search" for="q"><span class="sr">프롬프트 검색</span><input id="q" type="search" placeholder="프롬프트·파일 이름 검색" autocomplete="off"></label>
  </div>
</div>
<main>
<section id="assets" role="tabpanel" aria-labelledby="tab-assets" data-tab="assets">
  <p class="gap-note"><b>기록이 없어 다시 만들 수 없는 것 ${missing.length}개</b> ${missing.map((c) => `<a href="#${esc(c.id)}">${esc(plain(c.title.replace(/^\d+ · /, '')))}</a>`).join('')}</p>
  ${apps.map((a) => a.html).join('\n')}
  <p class="empty" id="empty" hidden>조건에 맞는 항목이 없습니다. 검색어를 지우거나 필터를 <button type="button" id="reset">전체로 되돌리기</button></p>
</section>
<section id="templates" role="tabpanel" aria-labelledby="tab-templates" data-tab="templates" hidden>
  <div class="doc-layout"><nav class="toc" aria-label="틀 목록"><p class="eyebrow">틀</p><ol>${tplToc}</ol></nav><div class="doc">${tplBody}</div></div>
</section>
<section id="record" role="tabpanel" aria-labelledby="tab-record" data-tab="record" hidden>
  <div class="doc narrow">${record}</div>
</section>
</main>
<footer class="foot">원본은 <code>prompts/*.md</code>입니다. 이 페이지는 <code>pnpm prompts:build</code>로 생성합니다.</footer>
<dialog id="viewer" aria-label="크게 보기"><button type="button" class="close" id="viewer-close" aria-label="닫기">×</button><img id="viewer-img" alt=""><video id="viewer-video" controls playsinline hidden></video></dialog>
<p class="sr" id="live" aria-live="polite"></p>
</div>
<script>
const PROMPTS=${JSON.stringify(ctx.prompts).replace(/</g, '\\u003c')};
const SHARED=${JSON.stringify(ctx.shared).replace(/</g, '\\u003c')};
${SCRIPT}
</script>`;

  const catalog = {
    note: '생성물 — prompts/build.mjs가 prompts/*.md에서 만든다. 직접 고치지 않는다.',
    apps: apps.map(({ key, title }) => ({ key, title })),
    shared: ctx.shared,
    assets: ctx.catalog,
  };
  return { body, catalog, files: ctx.files };
}

const HEAD = `<title>에셋 프롬프트 보관함</title>
<!-- 생성물: prompts/build.mjs가 prompts/*.md에서 만든다. 직접 고치지 말고 마크다운을 고친 뒤 pnpm prompts:build -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap">`;

const STYLE = `<style>
:root{
  --ground:#EDEFEC;--surface:#FAFBF9;--sunk:#E4E8E4;--ink:#161A18;--muted:#56605B;--line:#D1D7D2;--line-strong:#A9B3AD;
  --accent:#2B4ED0;--accent-ink:#FFFFFF;--accent-soft:#DFE5FA;
  --ok:#1B7043;--ok-soft:#DAEEE1;--miss:#AE2A1F;--miss-soft:#F7E0DC;--wait:#855700;--wait-soft:#F4E7C6;
  --check-a:#E2E6E2;--check-b:#F5F7F4;--code:#F3F5F2;--shadow:0 1px 2px rgba(22,26,24,.06),0 8px 24px rgba(22,26,24,.06);
  --sans:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Consolas,'Malgun Gothic',monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;
  --ground:#0F1211;--surface:#161A18;--sunk:#1C211F;--ink:#E5E9E6;--muted:#9AA39E;--line:#29302C;--line-strong:#3D4641;
  --accent:#93A6FF;--accent-ink:#0D1233;--accent-soft:#1E264A;
  --ok:#63C891;--ok-soft:#15301F;--miss:#FF8B7E;--miss-soft:#3A1B18;--wait:#E2B458;--wait-soft:#33290F;
  --check-a:#1A1E1C;--check-b:#232826;--code:#121513;--shadow:0 1px 2px rgba(0,0,0,.4)}}
:root[data-theme="dark"]{color-scheme:dark;
  --ground:#0F1211;--surface:#161A18;--sunk:#1C211F;--ink:#E5E9E6;--muted:#9AA39E;--line:#29302C;--line-strong:#3D4641;
  --accent:#93A6FF;--accent-ink:#0D1233;--accent-soft:#1E264A;
  --ok:#63C891;--ok-soft:#15301F;--miss:#FF8B7E;--miss-soft:#3A1B18;--wait:#E2B458;--wait-soft:#33290F;
  --check-a:#1A1E1C;--check-b:#232826;--code:#121513;--shadow:0 1px 2px rgba(0,0,0,.4)}
*{box-sizing:border-box}
[hidden]{display:none!important}
.bar,.app,.app-head,.cards,.panel-body,.card-body,.doc,.doc-section{grid-template-columns:minmax(0,1fr)}
.search input{min-width:0;width:100%}
body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.7 var(--sans);-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:anywhere}
.page{max-width:1240px;margin:0 auto;padding-inline:20px;padding-block:32px 72px}
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
.tally [data-status]::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;background:currentColor;vertical-align:1px}
.tally [data-status="ok"]{color:var(--ok)}.tally [data-status="missing"]{color:var(--miss)}.tally [data-status="pending"]{color:var(--wait)}
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--ground);border-bottom:1px solid var(--line);padding-block:8px 10px;display:grid;gap:8px}
.tabs{display:flex;gap:4px;overflow-x:auto}
.tabs button{border:0;background:none;padding:8px 12px;border-radius:6px;font-weight:500;color:var(--muted);white-space:nowrap}
.tabs button[aria-selected="true"]{background:var(--ink);color:var(--ground)}
.filters{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
.chips{display:flex;gap:4px;overflow-x:auto;max-width:100%}
.chips button{border:1px solid var(--line);background:var(--surface);padding:3px 10px;border-radius:999px;font-size:13px;white-space:nowrap}
.chips button[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}
.search{flex:1 1 220px;display:flex;min-width:0}
.search input{width:100%;min-width:0;font:14px var(--sans);color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:6px 10px}
main{padding-top:22px}
.gap-note{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:baseline;margin:0 0 28px;padding:12px 14px;border:1px dashed var(--miss);border-radius:8px;background:var(--miss-soft);font-size:14px}
.gap-note b{color:var(--miss);font-weight:500;margin-right:4px}
.gap-note a{color:var(--ink)}
.app{display:grid;gap:14px;margin-bottom:56px}
.app-head{display:grid;gap:6px;max-width:880px}
.app-head h2{margin:0;font-size:clamp(24px,3vw,32px)}
.app-head p{margin:0;color:var(--muted)}
.app-head .meta{margin-top:6px;max-width:760px}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px}
.panel summary{cursor:pointer;padding:12px 16px;font-weight:500}
.panel-body{padding:0 16px 16px;display:grid;gap:10px}
.panel-body>*{margin:0}
.cards{display:grid;gap:18px}
.card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:24px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px;box-shadow:var(--shadow)}
.card.wide{grid-template-columns:minmax(0,1fr)}
.card[hidden]{display:none}
.shot{margin:0;align-self:start;position:sticky;top:132px;display:grid;gap:6px}
.zoom{display:grid;place-items:center;width:100%;padding:10px;border:1px solid var(--line);border-radius:8px;min-height:180px;background:repeating-conic-gradient(var(--check-a) 0 25%,var(--check-b) 0 50%) 0 0/18px 18px}
.zoom img{display:block;max-width:100%;max-height:440px;width:auto;height:auto;border-radius:3px}
.zoom:hover img{outline:2px solid var(--accent);outline-offset:3px}
.shot figcaption{display:flex;justify-content:space-between;gap:8px;font:12px var(--mono);color:var(--muted)}
.empty-shot{display:grid;place-items:center;min-height:180px;border:1px dashed var(--line-strong);border-radius:8px;color:var(--muted);font:13px var(--mono)}
.card-body{display:grid;gap:12px;align-content:start;min-width:0}
.card-body>*{margin:0}
.card-body header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px}
.num{font:500 13px var(--mono);color:var(--muted);font-variant-numeric:tabular-nums}
.card-body h3{margin:0;font-size:20px;flex:1 1 auto}
.status{font:500 12px var(--mono);padding:2px 9px;border-radius:999px;white-space:nowrap}
.status[data-status="ok"]{background:var(--ok-soft);color:var(--ok)}
.status[data-status="missing"]{background:var(--miss-soft);color:var(--miss)}
.status[data-status="pending"]{background:var(--wait-soft);color:var(--wait)}
.status[data-status="none"]{background:var(--sunk);color:var(--muted)}
.meta{display:grid;gap:4px;margin:0;font-size:14px;border-block:1px solid var(--line);padding-block:10px}
.meta div{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:12px}
.meta dt{color:var(--muted)}.meta dd{margin:0}
.keyed .k{display:block;font:500 11px var(--mono);letter-spacing:.1em;color:var(--muted);margin-bottom:2px}
.label{font:500 13px var(--sans);color:var(--muted)}
.label+.code{margin-top:-6px}
.note{padding:10px 12px;border-radius:8px;font-size:14px}
.note.missing{border:1px dashed var(--miss);background:var(--miss-soft)}
.note.warn,.note.wait{border:1px dashed var(--wait);background:var(--wait-soft)}
blockquote{margin:0;padding:2px 0 2px 14px;border-left:3px solid var(--line-strong);color:var(--muted)}
.code{margin:0;display:grid;gap:6px;min-width:0}
.code figcaption{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}
.code .kind{font:500 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.code .hint{font-size:12px;color:var(--muted)}
.code .actions{margin-left:auto;display:flex;gap:6px}
.copy{border:1px solid var(--line-strong);background:var(--surface);border-radius:6px;padding:3px 10px;font-size:13px}
.copy:hover{border-color:var(--accent);color:var(--accent)}
.copy[data-done]{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.code pre{margin:0;padding:14px 16px;background:var(--code);border:1px solid var(--line);border-radius:8px;font:13px/1.65 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;max-height:none}
.code pre code{background:none;padding:0;font:inherit}
.code[data-lang="markdown"] pre,.code[data-lang="bash"] pre{white-space:pre;overflow-x:auto;overflow-wrap:normal}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;vertical-align:top;padding:7px 10px;border-bottom:1px solid var(--line)}
th{font-weight:500;color:var(--muted);white-space:nowrap}
td img{max-width:120px}
.path{font:.88em var(--mono);color:var(--muted)}
ul,ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
.empty{padding:28px;text-align:center;color:var(--muted)}
.empty button{border:0;background:none;color:var(--accent);text-decoration:underline;padding:0}
.doc-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:40px;align-items:start}
.toc{position:sticky;top:132px;display:grid;gap:8px}
.toc ol{padding-left:1.4em;font-size:14px;gap:6px}
.toc a{color:var(--ink);text-decoration:none}.toc a:hover{color:var(--accent)}
.doc{display:grid;gap:14px;max-width:860px;min-width:0}
.doc>*{margin:0}
.doc.narrow{margin:0 auto}
.doc-section{display:grid;gap:12px;padding-top:26px;border-top:1px solid var(--line);scroll-margin-top:130px}
.doc-section>*{margin:0}
.doc-section h2{font-size:22px}
.card,.panel,.app{scroll-margin-top:130px}
.foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
dialog{border:0;padding:0;background:transparent;max-width:min(96vw,1600px);max-height:94vh}
dialog::backdrop{background:rgba(8,10,9,.86)}
dialog img,dialog video{display:block;max-width:min(96vw,1600px);max-height:90vh;margin:auto;border-radius:6px;background:repeating-conic-gradient(#2a2f2c 0 25%,#353b37 0 50%) 0 0/18px 18px}
dialog .close{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);right:16px;width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:#111;font-size:26px;line-height:1}
@media (max-width:860px){
  .card{grid-template-columns:minmax(0,1fr);gap:16px;padding:14px}
  .shot{position:static}
  .doc-layout{grid-template-columns:minmax(0,1fr);gap:20px}
  .toc{position:static}
  .meta div{grid-template-columns:minmax(0,1fr);gap:0}
  .bar{position:static}
  .card,.panel,.app,.doc-section{scroll-margin-top:12px}
}
@media (prefers-reduced-motion:no-preference){.copy,.chips button,.zoom img{transition:background-color .15s,color .15s,border-color .15s,outline-color .15s}}
</style>`;

const SCRIPT = String.raw`
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const TABS = ['assets', 'templates', 'record'];
const live = $('#live');
function showTab(name) {
  for (const t of TABS) {
    $('#' + t).hidden = t !== name;
    $('#tab-' + t).setAttribute('aria-selected', String(t === name));
  }
  $('#filters').hidden = name !== 'assets';
}
$$('[role="tab"]').forEach((b) => b.addEventListener('click', () => { showTab(b.getAttribute('aria-controls')); scrollTo({ top: 0 }); }));

let app = 'all', status = 'all';
const q = $('#q');
function apply() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  $$('.card').forEach((c) => {
    const text = c.textContent.toLowerCase();
    const ok = (app === 'all' || c.dataset.app === app) && (status === 'all' || c.dataset.status === status) && words.every((w) => text.includes(w));
    c.hidden = !ok;
    if (ok) shown++;
  });
  $$('.app').forEach((s) => { s.hidden = !s.querySelector('.card:not([hidden])'); });
  $('#empty').hidden = shown > 0;
}
function press(attr, value) {
  $$('[' + attr + ']').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value)));
}
$$('[data-app-filter]').forEach((b) => b.addEventListener('click', () => { app = b.dataset.appFilter; press('data-app-filter', app); apply(); }));
$$('[data-status-filter]').forEach((b) => b.addEventListener('click', () => { status = b.dataset.statusFilter; press('data-status-filter', status); apply(); }));
q.addEventListener('input', apply);
function resetFilters() { app = status = 'all'; q.value = ''; press('data-app-filter', 'all'); press('data-status-filter', 'all'); apply(); }
$('#reset').addEventListener('click', resetFilters);

function go(hash, smooth) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return;
  if (TABS.includes(id)) { showTab(id); scrollTo({ top: 0 }); return; }
  const el = document.getElementById(id);
  if (!el) return;
  const panel = el.closest('[role="tabpanel"]');
  if (panel) showTab(panel.id);
  if (el.closest('[hidden]')) resetFilters();
  if (el.tagName === 'DETAILS') el.open = true;
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

async function copyText(text, btn) {
  const label = btn.textContent;
  const done = (msg) => { btn.textContent = msg; btn.setAttribute('data-done', ''); live.textContent = msg; setTimeout(() => { btn.textContent = label; btn.removeAttribute('data-done'); }, 1600); };
  try { await navigator.clipboard.writeText(text); done('복사됨'); return; } catch {}
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.append(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  ta.remove();
  if (ok) { done('복사됨'); return; }
  const pre = btn.closest('figure').querySelector('pre');
  const r = document.createRange(); r.selectNodeContents(pre);
  getSelection().removeAllRanges(); getSelection().addRange(r);
  done('선택됨 · Ctrl+C');
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.copy');
  if (!btn) return;
  const p = PROMPTS[Number(btn.dataset.copy)];
  const text = btn.hasAttribute('data-full') && p.with ? SHARED[p.with] + '\n' + p.text : p.text;
  copyText(text, btn);
});

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

showTab('assets');
if (location.hash) go(location.hash, false);
`;

// ── 출력 ────────────────────────────────────────────────────
const local = build('local');
const html = `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${HEAD}\n${STYLE}\n</head>\n<body>\n${local.body}\n</body>\n</html>\n`;
const json = `${JSON.stringify(local.catalog, null, 2)}\n`;
const outputs = [[path.join(HERE, 'gallery.html'), html], [path.join(HERE, 'catalog.json'), json]];

if (checkOnly) {
  const stale = outputs.filter(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text);
  if (stale.length) {
    console.error(`prompts: 생성물이 오래됐습니다 — ${stale.map(([f]) => path.relative(REPO, f)).join(', ')}\n  pnpm prompts:build 로 다시 만드세요.`);
    process.exit(1);
  }
  console.log('prompts: 생성물 최신');
} else {
  for (const [file, text] of outputs) fs.writeFileSync(file, text);
  console.log(`prompts: ${local.catalog.assets.length}개 항목 → gallery.html, catalog.json`);
}

if (siteDir) {
  const site = build('site');
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), `${HEAD}\n${STYLE}\n${site.body}\n`);
  for (const [published, abs] of site.files) {
    const dest = path.join(siteDir, ...published.split('/'));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(abs, dest);
  }
  fs.writeFileSync(path.join(siteDir, 'files.json'), JSON.stringify([...site.files.keys()], null, 2));
  console.log(`site: ${siteDir} (${site.files.size}개 미디어)`);
}
