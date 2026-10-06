export default {
  "work": "detail-pages",
  "version": 1,
  "initialScene": "browse",
  "breakpoints": [
    { "id": "tablet", "label": "태블릿", "media": "(max-width:1000px)" },
    { "id": "mobile", "label": "모바일", "media": "(max-width:650px)" }
  ],
  "previewScreens": [
    { "id": "base", "label": "데스크톱", "width": 1440, "matches": [] },
    { "id": "tablet", "label": "태블릿", "width": 768, "media": "(max-width:1000px)", "matches": ["tablet"] },
    { "id": "mobile", "label": "모바일", "width": 390, "media": "(max-width:650px)", "matches": ["tablet", "mobile"] }
  ],
  "scenes": {
    "browse": { "label": "목록", "set": {} },
    "viewer": { "label": "크게 보기", "set": { "header": { "opacity": 0.35 }, "strip": { "opacity": 0.35 } } }
  },
  "fixed": [
    { "reason": "카드 그림은 동기화 캡처의 원본 비율(pages.js width/height)을 유지한다. 높이만 파라미터이고 폭은 비율에서 나온다. 목록(상세페이지 수·제목·캡처)은 레이어가 아니라 콘텐츠다(pages.config.json → pages.js)." },
    { "reason": "덮개는 전체 화면 <dialog> 구조(막대 + 무대 + iframe)다. 데스크톱 폭 미리보기는 무대 폭에 맞춰 축소 배율(--stage-scale)을 JS가 계산한다. 이전·다음 화살표와 닫기 기호는 아이콘이며 이름은 aria-label이다." },
    { "reason": "동작 줄이기에서는 카드 떠오름·덮개 전환을 0으로 한다. 포커스 링, 막대 높이 56px, 버튼 최소 44px은 접근성 구조값이다." }
  ],
  "layers": [
    {
      "id": "global", "label": "전역 색·글꼴", "group": "전역", "el": ":root",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "background": { "label": "배경색", "type": "color", "default": "#eee9df" },
        "ink": { "label": "글자 색", "type": "color", "default": "#1e2622" },
        "muted": { "label": "보조 글자 색", "type": "color", "default": "#696d63" },
        "accent": { "label": "강조색", "type": "color", "default": "#2f4b3d" },
        "font": { "label": "본문 글꼴", "type": "select", "default": "\"Pretendard\", \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif", "options": [
          { "value": "\"Pretendard\", \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif", "label": "고딕 (시스템)" },
          { "value": "\"Noto Serif KR\", Georgia, \"Batang\", serif", "label": "Noto Serif KR (명조)" }
        ] },
        "headingFont": { "label": "제목 글꼴", "type": "select", "default": "\"Noto Serif KR\", Georgia, \"Batang\", serif", "options": [
          { "value": "\"Noto Serif KR\", Georgia, \"Batang\", serif", "label": "Noto Serif KR (명조)" },
          { "value": "\"Pretendard\", \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif", "label": "고딕 (시스템)" }
        ] },
        "fontScale": { "label": "글꼴 크기 배율", "type": "number", "default": 1, "min": 0.8, "max": 1.4, "step": 0.01, "unit": "" }
      }
    },
    {
      "id": "header", "label": "머리글", "group": "목록", "el": ".intro",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "eyebrow": { "label": "작은 머리말", "type": "text", "default": "JOOHO LAB · DETAIL PAGES", "maxLength": 80, "text": "[data-layer-text=\"header/eyebrow\"]" },
        "title": { "label": "제목", "type": "text", "default": "상세페이지", "maxLength": 60, "text": "[data-layer-text=\"header/title\"]" },
        "lead": { "label": "소개 문구", "type": "text", "default": "가상 브랜드로 만든 쇼핑몰 상세페이지 시안입니다. 페이지 전체를 한눈에 훑고, 카드를 누르면 실제 페이지를 데스크톱·모바일 폭으로 크게 봅니다.", "maxLength": 300, "text": "[data-layer-text=\"header/lead\"]" },
        "titleSize": { "label": "제목 크기", "type": "number", "default": 3.6, "min": 1.6, "max": 7, "step": 0.1, "unit": "rem", "at": { "tablet": 3, "mobile": 2.4 } },
        "align": { "label": "정렬", "type": "select", "default": "start", "options": [ { "value": "start", "label": "왼쪽" }, { "value": "center", "label": "가운데" } ] },
        "paddingTop": { "label": "위 여백", "type": "number", "default": 72, "min": 0, "max": 200, "step": 1, "unit": "px", "at": { "mobile": 40 } },
        "maxWidth": { "label": "문구 최대 폭", "type": "number", "default": 640, "min": 280, "max": 1200, "step": 10, "unit": "px" }
      }
    },
    {
      "id": "strip", "label": "카드 줄", "group": "목록", "el": ".strip-wrap",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "cardHeight": { "label": "카드 그림 높이", "type": "number", "default": 64, "min": 30, "max": 95, "step": 1, "unit": "vh", "at": { "mobile": 62 } },
        "gap": { "label": "카드 간격", "type": "number", "default": 64, "min": 0, "max": 200, "step": 1, "unit": "px", "at": { "tablet": 40, "mobile": 20 } },
        "paddingX": { "label": "좌우 여백", "type": "number", "default": 64, "min": 0, "max": 200, "step": 1, "unit": "px", "at": { "tablet": 32, "mobile": 16 } },
        "align": { "label": "줄 정렬(넘치지 않을 때)", "type": "select", "default": "auto", "options": [ { "value": "auto", "label": "가운데" }, { "value": "0px", "label": "왼쪽" } ] },
        "snap": { "label": "카드 단위로 멈추기", "type": "boolean", "default": true, "on": "x mandatory", "off": "none" },
        "empty": { "label": "목록이 비었을 때 문구", "type": "text", "default": "아직 게시한 상세페이지가 없습니다.", "maxLength": 120, "text": "[data-layer-text=\"strip/empty\"]" }
      }
    },
    {
      "id": "card", "label": "카드 그림 틀", "group": "목록", "el": ".card-frame",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "mat": { "label": "여백 띠 두께", "type": "number", "default": 10, "min": 0, "max": 40, "step": 1, "unit": "px", "at": { "mobile": 6 } },
        "matColor": { "label": "여백 띠 색", "type": "color", "default": "#fbf9f4" },
        "radius": { "label": "모서리", "type": "number", "default": 4, "min": 0, "max": 32, "step": 1, "unit": "px" },
        "shadow": { "label": "그림자 진하기", "type": "number", "default": 0.16, "min": 0, "max": 0.6, "step": 0.01, "unit": "" },
        "lift": { "label": "올렸을 때 떠오름", "type": "number", "default": 8, "min": 0, "max": 40, "step": 1, "unit": "px" },
        "duration": { "label": "떠오름 시간", "type": "number", "default": 280, "min": 0, "max": 1200, "step": 10, "unit": "ms" }
      }
    },
    {
      "id": "caption", "label": "카드 설명", "group": "목록", "el": ".caption",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "placement": { "label": "설명 위치", "type": "select", "default": "row", "options": [ { "value": "row", "label": "그림 오른쪽" }, { "value": "column", "label": "그림 아래" } ], "at": { "mobile": "column" } },
        "width": { "label": "설명 폭", "type": "number", "default": 260, "min": 120, "max": 480, "step": 10, "unit": "px", "at": { "mobile": 180 } },
        "gap": { "label": "그림과 설명 간격", "type": "number", "default": 28, "min": 0, "max": 80, "step": 1, "unit": "px", "at": { "mobile": 14 } },
        "nameSize": { "label": "이름 크기", "type": "number", "default": 1.35, "min": 0.8, "max": 3, "step": 0.05, "unit": "rem", "at": { "mobile": 1.05 } },
        "metaSize": { "label": "정보 글자 크기", "type": "number", "default": 0.82, "min": 0.6, "max": 1.4, "step": 0.01, "unit": "rem" }
      }
    },
    {
      "id": "viewer", "label": "크게 보기 덮개", "group": "크게 보기", "el": ".viewer",
      "params": {
        "visible": { "label": "보이기(끄면 카드가 페이지로 바로 이동)", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "backdrop": { "label": "덮개 배경", "type": "color", "default": "#161a17eb" },
        "barColor": { "label": "막대 배경", "type": "color", "default": "#f4f0e7" },
        "barInk": { "label": "막대 글자 색", "type": "color", "default": "#1e2622" },
        "desktopWidth": { "label": "데스크톱 미리보기 폭", "type": "number", "default": 1440, "min": 1024, "max": 1920, "step": 8, "unit": "px" },
        "mobileWidth": { "label": "모바일 미리보기 폭", "type": "number", "default": 390, "min": 320, "max": 480, "step": 1, "unit": "px" },
        "device": { "label": "처음 여는 폭", "type": "select", "default": "desktop", "options": [ { "value": "desktop", "label": "데스크톱" }, { "value": "mobile", "label": "모바일" } ], "attr": [".viewer", "data-default-device"], "at": { "mobile": "mobile" } },
        "duration": { "label": "열림 전환 시간", "type": "number", "default": 220, "min": 0, "max": 1200, "step": 10, "unit": "ms" },
        "closeLabel": { "label": "닫기 문구", "type": "text", "default": "목록으로", "maxLength": 40, "text": "[data-layer-text=\"viewer/closeLabel\"]" },
        "desktopLabel": { "label": "데스크톱 버튼 문구", "type": "text", "default": "데스크톱", "maxLength": 40, "text": "[data-layer-text=\"viewer/desktopLabel\"]" },
        "mobileLabel": { "label": "모바일 버튼 문구", "type": "text", "default": "모바일", "maxLength": 40, "text": "[data-layer-text=\"viewer/mobileLabel\"]" },
        "openLabel": { "label": "새 창 문구", "type": "text", "default": "새 창으로 열기", "maxLength": 40, "text": "[data-layer-text=\"viewer/openLabel\"]" },
        "loadingLabel": { "label": "불러오는 중 문구", "type": "text", "default": "페이지를 불러오는 중입니다", "maxLength": 80, "text": "[data-layer-text=\"viewer/loadingLabel\"]" }
      }
    },
    {
      "id": "note", "label": "아래 안내", "group": "목록", "el": ".note",
      "params": {
        "visible": { "label": "보이기", "type": "boolean", "default": true, "on": "visible", "off": "hidden" },
        "opacity": { "label": "불투명도", "type": "number", "default": 1, "min": 0, "max": 1, "step": 0.01, "unit": "" },
        "text": { "label": "안내 문구", "type": "text", "default": "모든 브랜드·제품·문구는 가상의 디자인 시안입니다. 가격·성분·효능 같은 판매 정보는 넣지 않았습니다.", "maxLength": 300, "text": "[data-layer-text=\"note/text\"]" },
        "size": { "label": "글자 크기", "type": "number", "default": 0.8, "min": 0.6, "max": 1.4, "step": 0.01, "unit": "rem" }
      }
    }
  ]
};
