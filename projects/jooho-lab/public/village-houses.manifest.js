import {projects} from './projects.js';
const number = (label,value,min,max,step=.1,extra={}) => ({type:'number',label,default:value,min,max,step,...extra});
const visible = {type:'boolean',label:'보이기',default:true,on:'block',off:'none'};
const opacity = number('불투명도',1,0,1,.05);
// The original six buildings keep the authored panorama's world coordinates.
const positions = {
  chemiforge:[-14.4,.22],sasu:[-8.64,.34],blog:[-2.88,.26],
  'dawn-store':[2.88,.32],instatoon:[8.82,.27],spire:[15.12,.06],
  'hanbok-hero':[15.12,.81],'day-walk':[21,.18],'potato-designer':[26.3,.22],
};
const color = (label,value) => ({type:'color',label,default:value});
export default {
  work:'jooho-lab',version:1,initialScene:'dawn-store',
  stylesheets:['/style.css','/village-style.css'],
  breakpoints:[{id:'mobile',label:'모바일',media:'(max-width:620px)'}],
  previewScreens:[{id:'base',label:'데스크톱',width:1440,matches:[]},{id:'mobile',label:'모바일',width:390,media:'(max-width:620px)',matches:['mobile']}],
  scenes:Object.fromEntries(projects.map(p=>[p.id,{label:p.title,set:{}}])),
  fixed:[
    {reason:'원본 파노라마 좌표계: 폭 36, 비율 2164/727, 중심 0. 원본 건물 크기와 위치를 유지한다.'},
    {reason:'카메라 좌표→DOM 사각형 투영 공식과 브라우저 이벤트 연결은 구조값이다.'},
    {reason:'원본 캔버스·카메라·산책자·UI는 village.layers.manifest.js의 공용 연출 계약을 따른다. 건물 라벨/불빛과 새 그림은 이 매니페스트에서 작품 장면별로 조정한다.'},
  ],
  layers:[
    ...projects.filter(p=>positions[p.id]).map(p=>{
      const selector=`[data-world-project="${p.id}"]`;
      return {id:'house-'+p.id,label:p.number+' '+p.title,group:'마을 건물',el:selector+`,[data-world-light="${p.id}"]`,params:{
        visible,opacity,
        x:number('건물 위치',positions[p.id][0],-40,50,.1,{attr:[selector,'data-house-x']}),
        top:number('지붕 높이',positions[p.id][1],0,.9,.01,{attr:[selector,'data-house-top']}),
        bottom:number('입구 높이',p.id==='hanbok-hero'?.9:.76,.71,1,.01,{attr:[selector,'data-house-bottom']}),
        width:number('클릭 영역 폭',p.id==='hanbok-hero'?3:4.2,1,8,.1,{attr:[selector,'data-house-width']}),
        labelSize:number('라벨 글자 크기',.85,.5,1.5,.05,{unit:'rem',at:{mobile:.9}}),
        labelColor:color('라벨 글자 색','#304a40'),labelBackground:color('라벨 배경','#fffdf1dc'),
        lightColor:color('불빛 색',p.color),
      }};
    }),
    {id:'village-extension',label:'7·8번 마을 그림',group:'배경',el:'.village-extension',params:{
      visible,opacity,
      src:{type:'image',label:'그림 파일',default:'./assets/village-extension-v1.png',attr:['.village-extension','src']},
      x:number('가로 위치',23.348,18,50,.1,{attr:['.village-extension','data-world-x']}),
      y:number('세로 위치',0,-10,10,.1,{attr:['.village-extension','data-world-y']}),
      width:number('그림 폭',12.096,5,30,.1,{attr:['.village-extension','data-world-width']}),
      height:number('그림 높이',12.096,5,30,.1,{attr:['.village-extension','data-world-height']}),
      brightness:number('밝기',1,.4,1.8,.05),
      leftBlend:number('왼쪽 연결부 블렌드',6,0,20,1,{unit:'%'}),
    }},
  ],
};
