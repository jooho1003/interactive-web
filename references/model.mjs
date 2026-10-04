// references/*.md → 사이트·패턴 모델, 규칙 검사, catalog.json
// 파일을 읽고 쓰는 일은 build.mjs가 한다. 여기는 테스트할 수 있는 순수 함수만 둔다.
import { splitDoc, plain } from '../tools/md-blocks.mjs';

export const STATUS = { ok: '직접 확인', pending: '미확인', down: '접속 불가' };
export const MARK = { ok: '✅', pending: '⏸', down: '⚠️' };

const ID = /^[a-z0-9-]+$/;
const DATE = /\d{4}-\d{2}-\d{2}/;
const URL_RE = /https?:\/\/[^\s)|<>`*]+/;
const NOTION_ID = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/gi;
const FAMILY = /(?<![A-Za-z0-9])(A['’]|[ABDE])(?![A-Za-z0-9'’])|새 패턴/g;
const EMPTY = /^(—|-|없음)?$/;

const lf = (md) => md.replace(/\r\n/g, '\n');
const unique = (xs) => [...new Set(xs)];
// 백틱 구간은 내용(태그 포함)을 그대로 두고, 나머지만 서식·태그를 지운다
const flat = (s) => s.split(/(`[^`]+`)/).map((p) => (/^`[^`]+`$/.test(p) ? p.slice(1, -1) : p.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/<[^>]+>/g, ''))).join('').replace(/\s*\n\s*/g, ' ').trim();
const list = (s) => (EMPTY.test(s.trim()) ? [] : s.split(/\s*,\s*/).filter(Boolean));
const dashed = (hex) => {
  const h = hex.replace(/-/g, '').toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const families = (raw) => unique([...raw.matchAll(FAMILY)].map((m) => (m[1] ?? m[0]).replace(/’/g, "'")));
export const urlKey = (url) => {
  const u = new URL(url);
  return `${u.host.replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`.toLowerCase();
};

function metaTable(part) {
  const t = part.blocks.find((b) => b.type === 'table' && b.head[0] === '항목' && b.head[1] === '내용');
  return Object.fromEntries((t?.rows ?? []).map(([k, v = '']) => [plain(k), v]));
}
function keyedParas(part) {
  const out = {};
  for (const b of part.blocks) {
    const m = b.type === 'para' && b.text.trim().match(/^\*\*([^*]+)\*\*\s*—\s*([\s\S]*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

export function parseSiteDoc(file, md) {
  const doc = splitDoc(lf(md));
  const errors = [];
  const sites = doc.parts.filter((p) => p.kind === 'card').map((part) => {
    const fail = (msg) => errors.push(`${file} "${part.title}": ${msg}`);
    const head = part.title.match(/^(\S+) · (.+?)(?: — (.+))?$/);
    const id = head?.[1] ?? '';
    if (!head || !ID.test(id)) fail('제목은 "id · 이름 — 한 줄 성격", id는 영문 소문자·숫자·하이픈');
    const meta = metaTable(part);
    const text = (k) => plain(meta[k] ?? '');
    const body = keyedParas(part);

    const url = (meta['주소'] ?? '').match(URL_RE)?.[0] ?? '';
    if (!url) fail('주소가 없거나 http(s) 주소가 아님');
    const source = text('출처');
    if (!source) fail('출처가 비어 있음');
    const checkRaw = text('확인');
    const status = /^✅/.test(checkRaw) ? 'ok' : /^⏸/.test(checkRaw) ? 'pending' : /^⚠/.test(checkRaw) ? 'down' : null;
    const date = checkRaw.match(DATE)?.[0] ?? null;
    if (!status) fail('확인은 "✅ 날짜", "⏸", "⚠️ 날짜" 중 하나로 시작');
    else if (status !== 'pending' && !date) fail(`확인 ${MARK[status]}에는 날짜가 필요함`);
    const patterns = unique([...(meta['패턴'] ?? '').matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]));
    if (!patterns.length) fail('패턴이 없음 (`id` 형식)');
    const fams = families(meta['패밀리'] ?? '');
    if (!fams.length) fail("패밀리는 A / A' / B / D / E / 새 패턴 중 하나 이상");
    const take = body['가져올 것'] ?? '';
    const avoid = body['안 가져올 것'] ?? '';
    if (!take) fail('"**가져올 것** — …" 문단이 비어 있음');
    if (!avoid) fail('"**안 가져올 것** — …" 문단이 비어 있음');

    const imageParas = part.blocks.filter((b) => b.type === 'para' && /^<img\s/.test(b.text.trim()));
    const images = imageParas.flatMap((b) => [...b.text.matchAll(/<img\s[^>]*?src="([^"]+)"/g)].map((m) => m[1]));
    const image = images[0] ?? null;
    const video = JSON.stringify(part.blocks).match(/\]\((media\/[^)\s]+\.(?:webm|mp4))\)/)?.[1] ?? null;
    if (status === 'ok' && !image) fail('✅ 카드에는 캡처(<img src="media/…">)가 있어야 함');

    return {
      id, name: head?.[2] ?? part.title, tagline: head?.[3] ?? '', file, anchor: `site-${id}`,
      url, via: source.split(' · ')[0], importedAt: source.match(DATE)?.[0] ?? null,
      notion: unique([...(meta['노션'] ?? '').matchAll(NOTION_ID)].map((m) => dashed(m[0]))),
      check: { status: status ?? 'pending', date },
      patterns, families: fams, tech: EMPTY.test(text('기술 흔적').trim()) ? [] : [flat(meta['기술 흔적'])], usedIn: list(text('쓰인 작품')),
      image, images, video, take, avoid, part,
    };
  });
  return { doc, sites, errors };
}

export function parsePatterns(file, md) {
  const doc = splitDoc(lf(md));
  const errors = [];
  const patterns = doc.parts.filter((p) => p.kind === 'card').map((part) => {
    const m = part.title.match(/^`([a-z0-9-]+)`\s*—\s*(.+)$/);
    if (!m) errors.push(`${file} "${part.title}": 제목은 "\`id\` — 이름" 형식`);
    const id = m?.[1] ?? '';
    return { id, name: m?.[2] ?? part.title, anchor: `pattern-${id}`, families: families(metaTable(part)['패밀리'] ?? ''), part };
  });
  return { doc, patterns, errors };
}

export function validate(sites, patterns, exists) {
  const errors = [];
  const seen = (map, key, label, who) => {
    if (map.has(key)) errors.push(`${who}: ${label} 중복 — ${map.get(key)}와 같음`);
    else map.set(key, who);
  };
  const pids = new Map(), ids = new Map(), urls = new Map();
  for (const p of patterns) seen(pids, p.id, '패턴 id', `patterns.md \`${p.id}\``);
  for (const s of sites) {
    const who = `${s.file} ${s.id}`;
    seen(ids, s.id, '사이트 id', who);
    if (s.url) {
      try { seen(urls, urlKey(s.url), '주소', who); } catch { errors.push(`${who}: 주소를 해석할 수 없음 ${s.url}`); }
    }
    for (const p of s.patterns) if (!pids.has(p)) errors.push(`${who}: patterns.md에 없는 패턴 \`${p}\``);
    for (const m of [...(s.images ?? (s.image ? [s.image] : [])), s.video]) if (m && !exists(m)) errors.push(`${who}: 미디어 파일 없음 ${m}`);
  }
  for (const p of patterns) if (!sites.some((s) => s.patterns.includes(p.id))) errors.push(`patterns.md \`${p.id}\`: 이 패턴을 쓰는 사이트 카드가 없음`);
  return errors;
}

export function summary(s) {
  const when = s.check.date ? ` ${s.check.date}` : '';
  return `[레퍼런스] ${s.id} — ${s.name} (${s.url}) · 패턴 ${s.patterns.join(', ')} · ${MARK[s.check.status]}${when}\n가져올 것: ${flat(s.take)}\n안 가져올 것: ${flat(s.avoid)}`;
}

export function toCatalog(sites, patterns, files) {
  return {
    note: '생성물 — references/build.mjs가 references/*.md에서 만든다. 직접 고치지 않는다.',
    generatedFrom: files,
    patterns: patterns.map((p) => ({ id: p.id, name: p.name, families: p.families, sites: sites.filter((s) => s.patterns.includes(p.id)).map((s) => s.id) })),
    sites: sites.map((s) => ({
      id: s.id, name: s.name, url: s.url, file: s.file, anchor: s.anchor,
      notion: s.notion, via: s.via, importedAt: s.importedAt, check: s.check,
      patterns: s.patterns, families: s.families, tech: s.tech, usedIn: s.usedIn,
      summary: summary(s),
    })),
  };
}
