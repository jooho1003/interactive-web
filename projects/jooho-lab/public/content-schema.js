import {projects} from './projects.js';
export const projectIds=projects.map(p=>p.id);
export const contentDefaults={brand:'JOOHO LAB',eyebrow:'이주호의 인터랙티브 포트폴리오',title:'아이디어를 실제로.',description:'관심 있는 작업을 골라 그 안으로 들어가 보세요.',introduction:'이주호의 바이브 코딩 작업을 모은 포트폴리오입니다.',footer:'JOOHO LAB — 계속 만들어가는 중.',accent:'#365b4d',room:'#9bc6e6',character:'/assets/village-walker.png',characterSize:1,characterSpeed:1,characterVisible:true,cameraSpeed:1,lighting:1,projects:{}};
const text=(v,f,max)=>typeof v==='string'?v.slice(0,max):f;
const number=(v,f,min,max)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):f;
const color=(v,f)=>/^#[0-9a-f]{6}$/i.test(v)?v:f;
const localImage=(value,fallback='')=>typeof value==='string'&&value.length<=2000000&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)?value:imagePath(value,fallback);
export function imagePath(value,fallback='') {if(typeof value!=='string')return fallback;if(value==='')return '';if(/^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(value)||/^\/?(?:\.\/)?assets\/[\w.-]+$/.test(value))return value;throw Error('업로드한 이미지 또는 기본 이미지 경로만 사용할 수 있습니다.');}
export function cleanContent(value={}) {
  const d=contentDefaults,p={};if(!value||typeof value!=='object')throw Error('설정 파일 형식을 확인해 주세요.');
  for(const id of projectIds){const v=value.projects?.[id];if(!v)continue;let link=text(v.link,'',2000).trim();if(link){const u=new URL(link);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('작품 주소는 http 또는 https 주소여야 합니다.');link=u.href}p[id]={title:text(v.title,'',80),subtitle:text(v.subtitle,'',180),description:text(v.description,'',1500),image:localImage(v.image),link};}
  return {brand:text(value.brand,d.brand,40),eyebrow:text(value.eyebrow,d.eyebrow,80),title:text(value.title,d.title,100),description:text(value.description,d.description,250),introduction:text(value.introduction,d.introduction,2000),footer:text(value.footer,d.footer,120),accent:color(value.accent,d.accent),room:color(value.room,d.room),character:localImage(value.character,d.character),characterSize:number(value.characterSize,1,.4,2.5),characterSpeed:number(value.characterSpeed,1,0,2),characterVisible:value.characterVisible!==false,cameraSpeed:number(value.cameraSpeed,1,.5,2),lighting:number(value.lighting,1,.4,1.8),projects:p};
}
