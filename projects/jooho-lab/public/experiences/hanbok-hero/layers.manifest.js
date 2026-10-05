export default {
  "work": "hanbok-hero",
  "version": 1,
  "initialScene": "si",
  "breakpoints": [
    {
      "id": "wide",
      "label": "와이드",
      "media": "(min-width:1600px)"
    },
    {
      "id": "tablet",
      "label": "태블릿",
      "media": "(max-width:1000px)"
    },
    {
      "id": "mobile",
      "label": "모바일",
      "media": "(max-width:650px)"
    }
  ],
  "previewScreens": [
    {
      "id": "base",
      "label": "데스크톱",
      "width": 1440,
      "matches": []
    },
    {
      "id": "wide",
      "label": "와이드",
      "width": 1920,
      "media": "(min-width:1600px)",
      "matches": [
        "wide"
      ]
    },
    {
      "id": "tablet",
      "label": "태블릿",
      "width": 768,
      "media": "(max-width:1000px)",
      "matches": [
        "tablet"
      ]
    },
    {
      "id": "mobile",
      "label": "모바일",
      "width": 390,
      "media": "(max-width:650px)",
      "matches": [
        "tablet",
        "mobile"
      ]
    }
  ],
  "scenes": {
    "si": {
      "label": "시 詩",
      "set": {
        "global": {
          "accent": "#b9c7d6"
        },
        "glyph": {
          "text": "詩"
        },
        "title": {
          "tagline": "달을 읊고 바람을 적는 선비"
        },
        "paper": {
          "image": "./assets/mood-si.webp"
        }
      }
    },
    "seo": {
      "label": "서 書",
      "set": {
        "global": {
          "accent": "#e8866b"
        },
        "glyph": {
          "text": "書"
        },
        "title": {
          "tagline": "먹을 갈아 마음을 쓰는 선비"
        },
        "paper": {
          "image": "./assets/mood-seo.webp"
        }
      }
    },
    "hwa": {
      "label": "화 畫",
      "set": {
        "global": {
          "accent": "#93c9b8"
        },
        "glyph": {
          "text": "畫"
        },
        "title": {
          "tagline": "산과 물을 화폭에 옮기는 선비"
        },
        "paper": {
          "image": "./assets/mood-hwa.webp"
        }
      }
    }
  },
  "layers": [
    {
      "id": "global",
      "label": "전역 색·글꼴",
      "group": "전역",
      "el": ":root",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "muted": {
          "label": "보조 글자 색",
          "type": "color",
          "default": "#efe4cf",
          "css": "--muted"
        },
        "fontScale": {
          "label": "글꼴 크기 배율",
          "type": "number",
          "default": 1,
          "min": 0.6,
          "max": 1.6,
          "step": 0.01,
          "unit": ""
        },
        "font": {
          "label": "본문 글꼴",
          "type": "select",
          "default": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
          "options": [
            {
              "value": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
              "label": "Noto Serif KR (명조)"
            },
            {
              "value": "\"Song Myung\", \"Noto Serif KR\", serif",
              "label": "Song Myung (송명)"
            },
            {
              "value": "\"Nanum Myeongjo\", \"Noto Serif KR\", serif",
              "label": "Nanum Myeongjo (나눔명조)"
            },
            {
              "value": "system-ui, sans-serif",
              "label": "시스템 고딕"
            }
          ]
        },
        "accent": {
          "label": "분야 강조색",
          "type": "color",
          "default": "#b9c7d6"
        },
        "moodFade": {
          "label": "분야 전환 시간",
          "type": "number",
          "default": 600,
          "min": 0,
          "max": 3000,
          "step": 50,
          "unit": "ms"
        }
      }
    },
    {
      "id": "paper",
      "label": "배경",
      "group": "배경",
      "el": ".paper",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "color": {
          "label": "배경색",
          "type": "color",
          "default": "#140f0c"
        },
        "image": {
          "label": "배경 이미지",
          "type": "image",
          "default": "./assets/mood-si.webp",
          "attr": [
            "img.paper-image",
            "src"
          ]
        },
        "vignette": {
          "label": "비네트 세기",
          "type": "number",
          "default": 0.5,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "vignetteInner": {
          "label": "비네트 시작 위치",
          "type": "number",
          "default": 30,
          "min": 0,
          "max": 100,
          "step": 1,
          "unit": "%"
        }
      }
    },
    {
      "id": "glyph",
      "label": "큰 한자",
      "group": "글",
      "el": ".glyph",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 0.08,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "text": {
          "label": "글자",
          "type": "text",
          "default": "詩",
          "maxLength": 20,
          "text": "[data-layer-text=\"glyph/text\"]"
        },
        "font": {
          "label": "글꼴",
          "type": "select",
          "default": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
          "options": [
            {
              "value": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
              "label": "Noto Serif KR (명조)"
            },
            {
              "value": "\"Song Myung\", \"Noto Serif KR\", serif",
              "label": "Song Myung (송명)"
            },
            {
              "value": "\"Nanum Myeongjo\", \"Noto Serif KR\", serif",
              "label": "Nanum Myeongjo (나눔명조)"
            },
            {
              "value": "system-ui, sans-serif",
              "label": "시스템 고딕"
            }
          ]
        },
        "size": {
          "label": "크기",
          "type": "number",
          "default": 70,
          "min": 10,
          "max": 150,
          "step": 1,
          "unit": "vh",
          "at": {
            "tablet": 52,
            "mobile": 34
          }
        },
        "x": {
          "label": "가로 위치(가운데)",
          "type": "number",
          "default": 28,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 50
          }
        },
        "y": {
          "label": "세로 위치(가운데)",
          "type": "number",
          "default": 42,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 30
          }
        },
        "color": {
          "label": "색",
          "type": "color",
          "default": "#f3e9d8"
        }
      }
    },
    {
      "id": "character",
      "label": "반응 캐릭터",
      "group": "무대",
      "el": ".character",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "still": {
          "label": "정면 그림",
          "type": "image",
          "default": "./assets/scholar-still.webp",
          "attr": [
            "img.character-still",
            "src"
          ]
        },
        "body": {
          "label": "몸 그림(얼굴 자리 비움)",
          "type": "image",
          "default": "./assets/scholar-body.webp",
          "attr": [
            "img.character-body",
            "src"
          ]
        },
        "sheet": {
          "label": "얼굴 방향 시트",
          "type": "image",
          "default": "./assets/scholar-heads.webp",
          "attr": [
            "img.character-sheet",
            "src"
          ]
        },
        "cols": {
          "label": "시트 가로 칸 수(좌→우 고개 방향)",
          "type": "number",
          "default": 13,
          "min": 1,
          "max": 25,
          "step": 1,
          "unit": ""
        },
        "rows": {
          "label": "시트 세로 칸 수(위 행 = 얼굴 높이, 아래 행 = 아래를 봄)",
          "type": "number",
          "default": 2,
          "min": 1,
          "max": 5,
          "step": 1,
          "unit": ""
        },
        "headX": {
          "label": "얼굴 칸 가로 위치",
          "type": "number",
          "default": 22.917,
          "min": -50,
          "max": 150,
          "step": 0.001,
          "unit": "%"
        },
        "headY": {
          "label": "얼굴 칸 세로 위치",
          "type": "number",
          "default": 0,
          "min": -50,
          "max": 150,
          "step": 0.001,
          "unit": "%"
        },
        "headW": {
          "label": "얼굴 칸 너비",
          "type": "number",
          "default": 58.333,
          "min": 1,
          "max": 100,
          "step": 0.001,
          "unit": "%"
        },
        "headH": {
          "label": "얼굴 칸 높이",
          "type": "number",
          "default": 47.222,
          "min": 1,
          "max": 100,
          "step": 0.001,
          "unit": "%"
        },
        "x": {
          "label": "가로 위치",
          "type": "number",
          "default": 64,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 50,
            "tablet": 58
          }
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 50,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "wide": 56,
            "tablet": 66,
            "mobile": 77
          }
        },
        "size": {
          "label": "크기",
          "type": "number",
          "default": 62,
          "min": 10,
          "max": 160,
          "step": 0.1,
          "unit": "vw",
          "at": {
            "wide": 50,
            "tablet": 90,
            "mobile": 98
          }
        },
        "anchorY": {
          "label": "시선 기준점 높이",
          "type": "number",
          "default": 22,
          "min": 0,
          "max": 100,
          "step": 0.1,
          "unit": "%"
        },
        "range": {
          "label": "반응 범위",
          "type": "number",
          "default": 420,
          "min": 40,
          "max": 1200,
          "step": 1,
          "unit": "px",
          "at": {
            "tablet": 300,
            "mobile": 200
          }
        },
        "follow": {
          "label": "따라가는 시간(작을수록 바로 따라감)",
          "type": "number",
          "default": 110,
          "min": 0,
          "max": 1000,
          "step": 10,
          "unit": "ms"
        },
        "returnDelay": {
          "label": "창을 떠난 뒤 정면으로 돌아오는 시간",
          "type": "number",
          "default": 900,
          "min": 0,
          "max": 10000,
          "step": 50,
          "unit": "ms"
        },
        "react": {
          "label": "포인터 반응",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        }
      }
    },
    {
      "id": "title",
      "label": "이름·소개",
      "group": "글",
      "el": ".title",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "name": {
          "label": "이름",
          "type": "text",
          "default": "소운 윤하담",
          "maxLength": 60,
          "text": "[data-layer-text=\"title/name\"]"
        },
        "tagline": {
          "label": "한 줄 소개",
          "type": "text",
          "default": "달을 읊고 바람을 적는 선비",
          "maxLength": 200,
          "text": "[data-layer-text=\"title/tagline\"]"
        },
        "color": {
          "label": "이름 색",
          "type": "color",
          "default": "#f3e9d8"
        },
        "size": {
          "label": "이름 크기",
          "type": "number",
          "default": 4.8,
          "min": 1,
          "max": 10,
          "step": 0.1,
          "unit": "rem",
          "at": {
            "mobile": 2.4,
            "tablet": 3.4
          }
        },
        "weight": {
          "label": "이름 굵기",
          "type": "number",
          "default": 400,
          "min": 100,
          "max": 900,
          "step": 100,
          "unit": ""
        },
        "lineHeight": {
          "label": "이름 줄 높이",
          "type": "number",
          "default": 1.1,
          "min": 0.8,
          "max": 2,
          "step": 0.01,
          "unit": ""
        },
        "letterSpacing": {
          "label": "이름 자간",
          "type": "number",
          "default": 0.02,
          "min": -0.1,
          "max": 0.2,
          "step": 0.005,
          "unit": "em"
        },
        "taglineScale": {
          "label": "소개 글자 비율",
          "type": "number",
          "default": 0.3,
          "min": 0.2,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "taglineGap": {
          "label": "이름과 소개 간격",
          "type": "number",
          "default": 0.9,
          "min": 0,
          "max": 3,
          "step": 0.05,
          "unit": "em"
        },
        "x": {
          "label": "가로 위치",
          "type": "number",
          "default": 6,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 60,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 13,
            "tablet": 10
          }
        },
        "font": {
          "label": "제목 글꼴",
          "type": "select",
          "default": "\"Song Myung\", \"Noto Serif KR\", serif",
          "options": [
            {
              "value": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
              "label": "Noto Serif KR (명조)"
            },
            {
              "value": "\"Song Myung\", \"Noto Serif KR\", serif",
              "label": "Song Myung (송명)"
            },
            {
              "value": "\"Nanum Myeongjo\", \"Noto Serif KR\", serif",
              "label": "Nanum Myeongjo (나눔명조)"
            },
            {
              "value": "system-ui, sans-serif",
              "label": "시스템 고딕"
            }
          ]
        }
      }
    },
    {
      "id": "moods",
      "label": "분야 버튼",
      "group": "메뉴",
      "el": ".moods",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "label": {
          "label": "묶음 이름(스크린리더)",
          "type": "text",
          "default": "분야",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/label\"]"
        },
        "ko1": {
          "label": "첫째 이름",
          "type": "text",
          "default": "시",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/ko1\"]"
        },
        "hanja1": {
          "label": "첫째 한자",
          "type": "text",
          "default": "詩",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/hanja1\"]"
        },
        "ko2": {
          "label": "둘째 이름",
          "type": "text",
          "default": "서",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/ko2\"]"
        },
        "hanja2": {
          "label": "둘째 한자",
          "type": "text",
          "default": "書",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/hanja2\"]"
        },
        "ko3": {
          "label": "셋째 이름",
          "type": "text",
          "default": "화",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/ko3\"]"
        },
        "hanja3": {
          "label": "셋째 한자",
          "type": "text",
          "default": "畫",
          "maxLength": 20,
          "text": "[data-layer-text=\"moods/hanja3\"]"
        },
        "font": {
          "label": "글꼴",
          "type": "select",
          "default": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
          "options": [
            {
              "value": "\"Noto Serif KR\", \"Nanum Myeongjo\", serif",
              "label": "Noto Serif KR (명조)"
            },
            {
              "value": "\"Song Myung\", \"Noto Serif KR\", serif",
              "label": "Song Myung (송명)"
            },
            {
              "value": "\"Nanum Myeongjo\", \"Noto Serif KR\", serif",
              "label": "Nanum Myeongjo (나눔명조)"
            },
            {
              "value": "system-ui, sans-serif",
              "label": "시스템 고딕"
            }
          ]
        },
        "size": {
          "label": "글자 크기",
          "type": "number",
          "default": 1.05,
          "min": 0.6,
          "max": 3,
          "step": 0.05,
          "unit": "rem",
          "at": {
            "mobile": 0.95
          }
        },
        "hanjaScale": {
          "label": "한자 크기 비율(한글 대비)",
          "type": "number",
          "default": 1.35,
          "min": 0.6,
          "max": 3,
          "step": 0.05,
          "unit": ""
        },
        "color": {
          "label": "글자 색",
          "type": "color",
          "default": "#e9dcc3"
        },
        "plate": {
          "label": "받침 색(투명도 포함)",
          "type": "color",
          "default": "#0b0806a6"
        },
        "gap": {
          "label": "버튼 간격",
          "type": "number",
          "default": 0.5,
          "min": 0,
          "max": 4,
          "step": 0.05,
          "unit": "rem"
        },
        "x": {
          "label": "가로 위치(가운데)",
          "type": "number",
          "default": 95,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "tablet": 92,
            "mobile": 50
          }
        },
        "y": {
          "label": "세로 위치(가운데)",
          "type": "number",
          "default": 50,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 6
          }
        },
        "direction": {
          "label": "방향",
          "type": "select",
          "default": "column",
          "options": [
            {
              "value": "column",
              "label": "세로"
            },
            {
              "value": "row",
              "label": "가로"
            }
          ],
          "at": {
            "mobile": "row"
          }
        }
      }
    },
    {
      "id": "nav",
      "label": "메뉴",
      "group": "글",
      "el": ".nav",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "item1": {
          "label": "메뉴 1",
          "type": "text",
          "default": "About",
          "maxLength": 30,
          "text": "[data-layer-text=\"nav/item1\"]"
        },
        "item2": {
          "label": "메뉴 2",
          "type": "text",
          "default": "Work",
          "maxLength": 30,
          "text": "[data-layer-text=\"nav/item2\"]"
        },
        "item3": {
          "label": "메뉴 3",
          "type": "text",
          "default": "Contact",
          "maxLength": 30,
          "text": "[data-layer-text=\"nav/item3\"]"
        },
        "color": {
          "label": "글자 색",
          "type": "color",
          "default": "#e9dcc3"
        },
        "size": {
          "label": "글자 크기",
          "type": "number",
          "default": 0.95,
          "min": 0.6,
          "max": 3,
          "step": 0.05,
          "unit": "rem"
        },
        "gap": {
          "label": "메뉴 간격",
          "type": "number",
          "default": 2.4,
          "min": 0,
          "max": 5,
          "step": 0.05,
          "unit": "em",
          "at": {
            "mobile": 1.4
          }
        },
        "x": {
          "label": "가운데 위치",
          "type": "number",
          "default": 50,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 4,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        }
      }
    },
    {
      "id": "hint",
      "label": "안내 문구",
      "group": "글",
      "el": ".hint",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "pointerText": {
          "label": "포인터 안내",
          "type": "text",
          "default": "마우스를 움직여 보세요",
          "maxLength": 80,
          "text": "[data-layer-text=\"hint/pointerText\"]"
        },
        "touchText": {
          "label": "터치 안내",
          "type": "text",
          "default": "화면을 눌러 보세요",
          "maxLength": 80,
          "text": "[data-layer-text=\"hint/touchText\"]"
        },
        "color": {
          "label": "글자 색",
          "type": "color",
          "default": "#bfae8e"
        },
        "size": {
          "label": "글자 크기",
          "type": "number",
          "default": 0.9,
          "min": 0.6,
          "max": 2,
          "step": 0.05,
          "unit": "rem"
        },
        "x": {
          "label": "오른쪽 끝 위치",
          "type": "number",
          "default": 94,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 94,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 50
          }
        },
        "hideAfter": {
          "label": "자동으로 사라지는 시간",
          "type": "number",
          "default": 6000,
          "min": 0,
          "max": 30000,
          "step": 100,
          "unit": "ms"
        },
        "fade": {
          "label": "사라지는 시간",
          "type": "number",
          "default": 400,
          "min": 0,
          "max": 2000,
          "step": 10,
          "unit": "ms"
        }
      }
    },
    {
      "id": "cta",
      "label": "버튼",
      "group": "글",
      "el": ".cta",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 1,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "label": {
          "label": "문구",
          "type": "text",
          "default": "작품 보기",
          "maxLength": 40,
          "text": "[data-layer-text=\"cta/label\"]"
        },
        "color": {
          "label": "글자 색",
          "type": "color",
          "default": "#1a1310"
        },
        "background": {
          "label": "배경색",
          "type": "color",
          "default": "#d9b25a"
        },
        "size": {
          "label": "글자 크기",
          "type": "number",
          "default": 0.95,
          "min": 0.6,
          "max": 2,
          "step": 0.05,
          "unit": "rem"
        },
        "padX": {
          "label": "좌우 안쪽 여백",
          "type": "number",
          "default": 1.6,
          "min": 0,
          "max": 4,
          "step": 0.1,
          "unit": "em"
        },
        "padY": {
          "label": "상하 안쪽 여백",
          "type": "number",
          "default": 0.8,
          "min": 0,
          "max": 3,
          "step": 0.1,
          "unit": "em"
        },
        "x": {
          "label": "가로 위치",
          "type": "number",
          "default": 6,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 84,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%",
          "at": {
            "mobile": 30,
            "tablet": 24
          }
        }
      }
    },
    {
      "id": "credit",
      "label": "제작 표시",
      "group": "글",
      "el": ".credit",
      "params": {
        "visible": {
          "label": "보이기",
          "type": "boolean",
          "default": true,
          "on": "visible",
          "off": "hidden"
        },
        "opacity": {
          "label": "불투명도",
          "type": "number",
          "default": 0.85,
          "min": 0,
          "max": 1,
          "step": 0.01,
          "unit": ""
        },
        "text": {
          "label": "문구",
          "type": "text",
          "default": "제작 이주호",
          "maxLength": 60,
          "text": "[data-layer-text=\"credit/text\"]"
        },
        "color": {
          "label": "색",
          "type": "color",
          "default": "#bfae8e"
        },
        "size": {
          "label": "크기",
          "type": "number",
          "default": 0.8,
          "min": 0.5,
          "max": 2,
          "step": 0.05,
          "unit": "rem"
        },
        "x": {
          "label": "가로 위치",
          "type": "number",
          "default": 6,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        },
        "y": {
          "label": "세로 위치",
          "type": "number",
          "default": 95,
          "min": -50,
          "max": 150,
          "step": 0.1,
          "unit": "%"
        }
      }
    }
  ],
  "fixed": [
    {
      "reason": "레이아웃(absolute 무대, 정사각 캐릭터 상자, 얼굴 칸 창 overflow, 글자 크기 기준 100%·기본 여백 0)과 시트 칸 계산식(cols·rows에서 유도)은 구조다."
    },
    {
      "reason": "얼굴 칸은 창 하나에서 칸 번호만 바꾼다(크로스페이드 없음 — 두 얼굴이 겹치면 잔상이 된다). 반응 중(use-sheet)에는 정면 그림 대신 몸 그림 + 얼굴 칸을 보이고, 정면 칸 + 몸 그림은 정면 그림과 픽셀이 같아 바뀌는 순간이 보이지 않는다. 얼굴 칸 창 위치·크기(headX·headY·headW·headH)는 시트를 만든 영역과 같아야 한다(scripts/assets/build-heads.py RECT)."
    },
    {
      "reason": "안내 페이드의 이징(ease)은 디자인 고정이다. 길이와 지연은 hint.fade·hint.hideAfter가 맡는다. 고개가 따라가는 곡선은 지수 감쇠로 고정하고 시간 상수만 character.follow로 연다."
    },
    {
      "reason": "비네트 모양(중앙 타원)과 끝 색(검정)은 고정하고 세기(vignette)와 시작 위치(vignetteInner)만 파라미터로 둔다. 보조 글(소개)은 기본 굵기 400이다."
    },
    {
      "reason": "gaze.js의 칸 경계 히스테리시스(HYSTERESIS 0.15칸)는 입력 안정성 상수다. 파라미터로 열면 경계에서 떨림 방지 보증이 깨진다."
    },
    {
      "reason": "문서 메타(title·description·alt)는 build-layers가 src만 다시 쓰므로 바인딩하지 않는다; 정면 그림을 바꾸면 alt를 손으로 고친다."
    },
    {
      "reason": "보이기 끔은 호스트가 data-layer-hidden 속성으로 표시하고 CSS가 display:none으로 받는다. 포커스 링 색·터치 타깃 크기는 접근성 대비를 위해 고정한다."
    },
    {
      "reason": "입력 방식(hover) 미디어 규칙으로 포인터/터치 안내를 고르고, prefers-reduced-motion에서 몸 그림·얼굴 칸을 숨기고 정면 그림을 보이는 것은 기능 구조다."
    },
    {
      "reason": "메뉴는 가운데 정렬(translate -50%)이라 nav.x는 가운데 기준이다. 글꼴 후보 목록(Noto Serif KR·Song Myung·Nanum Myeongjo·시스템)은 index.html의 Google Fonts 링크와 짝이며, 목록 밖 글꼴은 불러오지 않는다."
    },
    {
      "reason": "어두운 배경 위 글자의 얇은 그림자(text-shadow)와 버튼의 둥근 모서리·호버 밝기는 대비·상태 표시용 구조다."
    },
    {
      "reason": "분야 버튼 3개는 장면 3개(si·seo·hwa)와 data-scene으로 짝을 이룬다. 장면 id가 곧 분야이므로 버튼 수와 순서는 구조다. 고른 버튼 강조는 global.accent 한 곳에서 바뀌게 따로 색 파라미터를 두지 않는다. 장면 set의 글자·색은 공통 값보다 우선하므로 분야별 값은 관리자에서 \"이 장면\" 범위로 바꾼다."
    },
    {
      "reason": "배경 전환은 이전 그림(.paper-prev, 바인딩 없음)을 위에 덮고 새 그림이 디코딩되면 moodFade 동안 걷어 낸다. 두 배경이 잠깐 겹치는 것은 의도다(얼굴 칸은 겹치지 않는다는 고정값과 다르다). 새 그림을 불러오지 못하면 덮개를 그대로 둔다. 전환 이징(ease)과 글자 등장(투명에서 시작)은 디자인 고정이다."
    },
    {
      "reason": "동작 줄이기에서는 배경 덮개 전환·글자 등장·버튼 색 전환을 끄고 즉시 바꾼다. 버튼 터치 영역 최소 44px, 그룹 이름은 스크린리더 전용(.moods-label), 큰 한자와 버튼 속 한자는 aria-hidden이다. 큰 한자·분야 버튼은 가운데 기준(translate -50%)으로 놓는다."
    }
  ]
};
