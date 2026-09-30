// 마크다운 해석 — prompts/build.mjs와 references/build.mjs가 함께 쓴다.
// 블록·절·카드 구조와 인라인 변환만 맡는다. 링크·미디어 경로를 어디로 보낼지는 호출하는 쪽이 정한다.
import path from 'node:path';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M} _-]/gu, '').replace(/ /g, '-');
export const plain = (s) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]+>/g, '').trim();
export const posix = (p) => p.split(path.sep).join('/');

// ── 블록 ─────────────────────────────────────────────────────
const BLOCK_START = /^(`{3,}|#{1,6} |---+\s*$|\||>|([-*]|\d+\.) )/;
export function parseBlocks(md) {
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
export function splitDoc(md) {
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

// ── 인라인 ───────────────────────────────────────────────────
// link(url, ctx) → { href, external } 또는 { text }(링크 대신 경로 글자로 표시)
// media(rel, ctx) → 페이지에서 쓸 미디어 경로
const INLINE = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|<img\s+src="([^"]+)"(?:\s+width="\d+")?\s*\/?>|~~(.+?)~~/g;
export function makeInline({ link, media }) {
  return function inline(s, ctx) {
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
  };
}

// ── 표 ───────────────────────────────────────────────────────
export function table(b, inline, ctx) {
  const cells = (row, tag) => row.map((c) => `<${tag}>${inline(c, ctx)}</${tag}>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${cells(b.head, 'th')}</tr></thead><tbody>${b.rows.map((r) => `<tr>${cells(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
}
export function metaList(rows, inline, ctx) {
  return `<dl class="meta">${rows.map(([k, v]) => `<div><dt>${inline(k, ctx)}</dt><dd>${inline(v, ctx)}</dd></div>`).join('')}</dl>`;
}
