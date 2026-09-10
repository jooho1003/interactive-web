// 그래프 린트 — 참조 구현
//
// SPEC.md §3의 린트 규칙 9개를 실행 가능한 형태로 옮긴 것이다.
// 규칙을 글로만 주면 해석이 갈리므로 기준을 여기에 못박는다.
//
// Codex는 이것을 TypeScript로 다시 쓰고 zod 스키마를 함께 쓴다 (app/scripts/lint-graph.ts).
// 동작이 달라지면 이 파일이 기준이다.
//
// 실행: node projects/dawn-store/seed/lint-reference.mjs   (어느 경로에서든 동작한다)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const s = JSON.parse(fs.readFileSync(path.join(here, 'story.json'), 'utf8'));
const t = JSON.parse(fs.readFileSync(path.join(here, 'theme.json'), 'utf8'));
const sec = tc => { const [m,x]=tc.split(':'); return +m*60 + parseFloat(x); };
const N = Object.fromEntries(s.nodes.map(n=>[n.id,n]));
const err=[], warn=[];

// 3. 엣지 타깃 실존
for (const n of s.nodes) for (const e of n.edges||[]) {
  if (!N[e.to]) err.push(`${n.id}/${e.id}: 없는 노드 -> ${e.to}`);
  else if (!N[e.to].available) warn.push(`${n.id}/${e.id}: 미완성 노드 -> ${e.to} (의도됨)`);
}
// 1·2. 도달성
const seen=new Set(), q=[s.start];
while(q.length){const id=q.pop(); if(seen.has(id))continue; seen.add(id);
  for(const e of N[id]?.edges||[]) if(N[e.to]) q.push(e.to);}
for (const n of s.nodes) if (n.available && !seen.has(n.id)) err.push(`도달 불가: ${n.id}`);
const targets=new Set(s.nodes.flatMap(n=>(n.edges||[]).map(e=>e.to)));
for (const n of s.nodes) if (n.id!==s.start && !targets.has(n.id)) err.push(`들어오는 엣지 없음: ${n.id}`);
// 5. 자막
for (const n of s.nodes) for (const [lang,cues] of Object.entries(n.subtitles||{}))
  for (const c of cues) {
    if (sec(c.end) > n.media.duration) err.push(`${n.id}.${lang} 자막 ${c.start}-${c.end} > duration ${n.media.duration}`);
    if (sec(c.start) >= sec(c.end)) err.push(`${n.id}.${lang} 자막 시작>=끝 ${c.start}`);
  }
// 자막 겹침
for (const n of s.nodes) for (const [lang,cues] of Object.entries(n.subtitles||{}))
  cues.forEach((c,i)=>{ if(i&&sec(c.start)<sec(cues[i-1].end)) warn.push(`${n.id}.${lang} 자막 겹침 ${c.start}`); });
// KO/EN 개수 일치
for (const n of s.nodes) { const su=n.subtitles; if(su && su.ko.length!==su.en.length) err.push(`${n.id} KO ${su.ko.length} != EN ${su.en.length}`); }
// 6. 히든
for (const n of s.nodes) for (const e of n.edges||[]) if (e.kind==='hidden') {
  if (sec(e.until) > n.media.duration) err.push(`${n.id}/${e.id} 히든 until ${e.until} > ${n.media.duration}`);
  if (sec(e.from) >= sec(e.until)) err.push(`${n.id}/${e.id} 히든 from>=until`);
}
// 7. 타임라인
for (const n of s.nodes) for (const c of n.timeline?.chapters||[])
  if (sec(c.at) > n.media.duration) err.push(`${n.id} 챕터 ${c.at} > ${n.media.duration}`);
// glow 참조
for (const n of s.nodes) { const g=n.glow; if(!g) continue;
  const ids=new Set((n.edges||[]).map(e=>e.id));
  for (const k of ['primary','secondary']) if (g[k] && !ids.has(g[k])) err.push(`${n.id}.glow.${k}: 없는 엣지 ${g[k]}`);
  for (const f of g.switchWhen||[]) if(!s.nodes.some(x=>x.setsFlag===f)) err.push(`${n.id}.switchWhen: 아무도 안 세우는 플래그 ${f}`);
}
// 9. 엔딩에 일반 엣지 없음
for (const n of s.nodes) if (n.type==='ending')
  for (const e of n.edges||[]) if (e.kind!=='hidden') err.push(`${n.id}: 엔딩에 일반 엣지 ${e.id}`);
// 8. 같은 타깃 중복
for (const n of s.nodes) { const c={}; for(const e of n.edges||[]) c[e.to]=(c[e.to]||0)+1;
  for (const [to,k] of Object.entries(c)) if(k>1) warn.push(`${n.id}: ${to}로 가는 엣지 ${k}개`); }
// 핫스팟 겹침
const hs = (N.hub.edges||[]).filter(e=>e.hotspot).map(e=>({id:e.id,...e.hotspot}));
for (let i=0;i<hs.length;i++) for (let j=i+1;j<hs.length;j++){const a=hs[i],b=hs[j];
  if(a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h) warn.push(`hub 핫스팟 겹침: ${a.id} x ${b.id}`);}
// UI 등장 시각
for (const n of s.nodes) if (n.buttonShowBeforeEnd > n.media.duration) err.push(`${n.id}: buttonShowBeforeEnd > duration`);
// 테마 desktop/mobile 쌍
for (const [k,v] of Object.entries(t)) if (v && typeof v==='object' && !Array.isArray(v) && (v.desktop||v.mobile))
  if (!(v.desktop&&v.mobile)) err.push(`theme.${k}: desktop/mobile 두 벌 아님`);

const dur = s.nodes.filter(n=>n.available).reduce((a,n)=>a+n.media.duration,0);
console.log(`노드 ${s.nodes.length} (제작 ${s.nodes.filter(n=>n.available).length}) · 총 ${dur}초 · 엣지 ${s.nodes.flatMap(n=>n.edges||[]).length}`);
console.log(`자막 큐 KO ${s.nodes.reduce((a,n)=>a+(n.subtitles?.ko.length||0),0)} / EN ${s.nodes.reduce((a,n)=>a+(n.subtitles?.en.length||0),0)}`);
console.log(err.length?`\n❌ 오류 ${err.length}\n`+err.map(e=>'  '+e).join('\n'):'\n✅ 오류 없음');
console.log(warn.length?`\n⚠️  경고 ${warn.length}\n`+warn.map(e=>'  '+e).join('\n'):'경고 없음');
