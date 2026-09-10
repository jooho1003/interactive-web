# 2026년 9월 기준 AI 에셋 생성 파이프라인 — 툴 검증과 API 자동화 가능성

조사 기준일: 2026-09-11
조사 방법: 4개 병렬 리서치 에이전트가 WebSearch/WebFetch로 총 100회 이상 검색 수행, 공식 릴리스노트·가격 페이지·API 문서·라이선스 페이지를 우선 확인. 공식 소스 접근이 실패한 경우(403, SPA 렌더링, 리다이렉트 등) 3차 소스로 대체하고 해당 사실을 명시. 확인하지 못한 항목은 "(미확인)"으로 표기.

---

## ⚠️ 강연자(김그륜) 워크플로우 전제 중 정정/주의가 필요한 항목

1. **"GPT Image 2가 최신"은 이미 구버전 전제입니다.** 2026-09-08(조사 시점 3일 전)에 **GPT Image 2.5**(Flare/Sunburst 변형)가 출시되어 GPT Image 2는 이미 한 세대 전 모델입니다.
2. **Nano Banana 2는 실재하는 공식 명칭입니다.** Google Gemini 3.1 Flash Image의 별칭으로, 상위 티어 "Nano Banana Pro"(Gemini 3 Pro Image)도 별도 존재합니다.
3. **Sora API는 2026-09-24(조사 시점 13일 후)에 완전 종료됩니다.** OpenAI가 2026-03-24 공식 발표한 2단계 폐기 계획(앱은 2026-04-26 이미 종료)에 따른 것으로, 지금 시점에 Sora를 파이프라인에 신규 편입하는 것은 무의미합니다.
4. **Midjourney는 2026년 9월 현재도 공식 API가 없습니다.** ToS가 자동화 접근을 명시적으로 금지하므로, "룩 탐색용으로만 수동 사용"하는 현재 전략은 여전히 타당하고 사실상 유일한 안전한 사용법입니다.
5. **Tripo의 "16장 동시 업로드"는 공식 API 스펙(멀티뷰 최대 4장 고정 앵글)과 괴리가 있을 가능성이 있습니다.** 실제로 16장을 개별 업로드하는 것인지, 4×4 그리드 이미지 1장을 업로드하는 것인지 재확인이 필요합니다. 후자라면 스펙과 정합됩니다.
6. **"Seedance 2.0/2.5"라는 버전명이 다수 3차 소스에 등장하지만, BytePlus 공식 문서에서는 1.0/1.5 Pro까지만 확인됩니다.** 버전 넘버링에 혼선이 있어 재검증이 필요합니다.

---

## 1. 노드형 생성 플랫폼

| 툴 | 배치실행 | API 유무 | 가격 (2026-09) | 상업 라이선스 | 비고 |
|---|---|---|---|---|---|
| **Flora** (flora.ai) | 노드 캔버스 자체가 재실행 가능한 그래프, 배치 노드 기능 보유(블로그 공식 확인) | 있음. REST API + **MCP 서버** | Free $0 / Starter $18/seat/mo / Pro $50/seat/mo / Max $200/seat/mo / Enterprise 별도. 시트당 달러 풀, 60+ 모델 연결 | Free는 API·영상모델 제외. 유료 플랜 상업조항 (미확인) | 강연자가 실제 사용 중인 툴. "Style Node"로 스타일 프레임을 모든 생성 블록에 와이어링해 대량 에셋 생성하는 것이 **공식 제품 기능**으로 문서화되어 있음 |
| **Weavy** (2025.10 Figma 인수 → **Figma Weave**로 리브랜딩) | 워크플로우 API 배포 언급되나 공식 확인 어려움 | 워크플로우→API 배포 가능하다는 설명 있으나 공식 문서 URL (미확인) | 3차 소스 기준: Free 150크레딧/월, Team $48/user/mo(4,500크레딧) 등 — 신뢰도 낮음 | (미확인) | 리브랜딩 중이라 공식 URL 자체가 불안정. 재검증 필요 |
| **Krea** | 있음 — 노드 에디터에서 모델 체이닝 + branching logic 배치 가능, 워크플로우를 API 엔드포인트로 배포 가능 | **있음**. 앱 구독과 별도 API 잔액(종량제) 과금 | 앱: Basic $9/mo, Pro $35/mo(Nodes 워크플로우 자동화 오픈), Max $70/mo. API: FLUX $0.04/image, Veo3 $0.20/sec 등 | Basic($9/mo)부터 상업 라이선스 포함(3차 소스). Krea 2 오픈웨이트는 Community(비상업)/Commercial 별도 | 초기 검색에서 "API 없음"으로 나왔으나 공식 재확인 결과 API 존재 확인됨 |
| **ComfyUI**(오픈소스) + **Comfy Cloud** | Cloud: API 프로그래매틱 실행, 동시 실행수 플랜별 제한(1/3/5) | **있음**. "Comfy API"로 워크플로우를 프로덕션 엔드포인트로 export, Comfy MCP 제공 | 로컬 무료. Cloud: Free 400credit/mo, Standard $20/mo(4,200cr), Creator $35/mo(7,400cr), Pro $100/mo(21,100cr) | 코어 **GPL-3.0**(상업 사용 가능), 단 번들 서드파티 노드/모델은 개별 라이선스 확인 필요(일부 지역 제한 모델 존재) | `tools/asset-pipeline` 철학과 가장 근접. 자유도 최고 |
| **Freepik Spaces** (2026.04 **Magnific**로 리브랜딩) | Apps API로 캔버스 워크플로우 HTTP 실행 가능 | 있음이나 **Enterprise 전용** | Premium $20/mo ~ Business $55/seat (3차 소스, 신뢰도 낮음) | (미확인) | 공식 페이지 fetch 실패, 재검증 권장 |
| **Runway** (워크플로우/API) | Workflows로 여러 모델 결합, 대량 생성 지원 언급 | **있음**. `dev.runwayml.com`, REST API + Workflows | 크레딧 $0.01/credit(최소 $10). Gen-4 Turbo $0.05/sec, Gen-4.5 $0.12/sec | SOC2 Type II + **IP 면책(indemnification)** 제공 — 엔터프라이즈 상업 이용에 명시적으로 적합 | 컨슈머 구독과 API 크레딧 풀은 완전 별개 |
| **fal.ai** | 큐+웹훅 콜백으로 고볼륨 프로덕션 지원, 시각적 노드 워크플로우 빌더 존재 | **있음**. REST+WebSocket, 공식 JS/TS SDK, Python SDK | 구독 없음, 순수 종량제. Seedream V4 $0.03/img, FLUX 1.1 Pro Ultra $0.06/img, Veo3 $0.40/sec, Kling 2.5 Turbo Pro $0.07/sec | (미확인, 업계 표준상 통상 허용) | Node.js/TS 스택과 직접 맞음. **게이트웨이 1순위 추천**(하단 참조) |
| **Replicate** | 공식 전용 배치 엔드포인트는 (미확인), 커뮤니티 패키지로 사실상 배치 가능 | **있음**. REST + 공식 Node.js SDK(`replicate` npm, 서버리스 호환) | 종량제. 시간 기반 또는 출력 기반($0.04/image 등) | (미확인) | 커뮤니티 모델 커버리지가 넓어 fal.ai 폴백으로 유용 |

---

## 2. 이미지 모델

| 모델(정확한 버전) | API/가격 | 상업 라이선스 | 캐릭터 일관성 | 멀티뷰 | 투명 배경 | 그리드시트 능력 | 비고 |
|---|---|---|---|---|---|---|---|
| **Nano Banana 2** = **Gemini 3.1 Flash Image**(`gemini-3.1-flash-image`, Lite 버전 별도, 상위 Nano Banana Pro = `gemini-3-pro-image`) | Gemini API/Vertex AI 공식 제공. 정확한 장당가는 공식 pricing 403으로 (미확인) | 유료 API 이용약관상 가능(세부조항 미확인) | 공식: "최대 5명 캐릭터+14개 오브젝트 일관성" | 공식 문서엔 명시 없음, 3rd-party 실사용 사례로 그리드/멀티뷰 산출 시연됨 | **네이티브 알파 채널 없음**. 백/흑 두 번 렌더 후 수학적 복원(triangulation matting)으로만 우회 가능 | 커뮤니티에서 그리드 시트 프롬프트가 매우 잘 먹힌다고 보고 | 강연자의 "부드러움" 평가는 공식 벤치마크 근거는 아님(커뮤니티 통념) |
| **GPT Image 2** (`gpt-image-2-2026-04-21`) → **9/8일 GPT Image 2.5 출시로 이미 구버전** | OpenAI API 공식. gpt-image-2: 이미지출력 $30/M토큰 환산 1K $0.03/2K $0.05/4K $0.08. GPT Image 2.5 가격 (미확인) | OpenAI 상업 이용 정책상 가능 | 참조 이미지 기반 편집 지원(세부 미확인) | (미확인) | 전작(GPT Image 1) `background: transparent` 파라미터 있었음(재확인 못함) | "말귀 이해력"(복잡 지시 따르기) 강점 다수 확인 | 2026-06-02 구모델(1/1-mini/1.5) 12/1 종료 발표, 2.5로 통합 중 |
| **Midjourney V8.2** (2026-07-24, V8.1은 2026-04-14) | **공식 API 없음**, ToS가 자동화 명시적 금지. 시중 API는 전부 비공식 래퍼(계정정지 위험) | 유료 플랜 필요, 연매출 $1M 초과 기업은 Corporate $600/년 | V7부터 Omni Reference로 캐릭터 참조 지원 | (미확인) | 미지원 | 자동화는 ToS 위반 소지 | 강연자의 "룩 탐색용 수동 사용" 전략이 유일하게 안전한 방식 |
| **FLUX.2** (BFL, 2025-11-25, [pro]/[flex]/[dev]/[klein]/Max) — FLUX 3는 이미지 얼리액세스 대기중, 실사용 최신은 FLUX.2 | 공식 API(bfl.ai). variant별 정확 가격 계산기 형태(미확인) | [dev]는 별도 라이선스 구매, [klein]은 **Apache 2.0**(자유 상업), [pro]/[flex]는 유료 API 자체가 상업 허용 | 공식: "최대 10개 참조 이미지로 얼굴/체형/의상/조명 일관성" — 업계 최고 수준 자체 홍보 | 멀티레퍼런스로 정면/측면/후면 시트 제작 다수 시연 | (미확인) | 전용 LoRA(`fal/flux-2-klein-4b-spritesheet-lora`)까지 존재 — "2x2 스프라이트 시트" 정형화 | [pro]/[flex] API 유료 이용이 가장 안전 |
| **Seedream 5.0 Pro** (ByteDance, 2026-07-23; 계보 4.0→4.5→5.0Lite→5.0→5.0Pro) | BytePlus ModelArk 공식 API. 4.5 기준 공식가 $0.04/img, 5.0 Pro 공식가 (미확인) | BytePlus 약관상 가능(세부 미확인) | "얼굴/의상/제품 디테일을 무제한 씬·앵글에 걸쳐 잠금" 공식 강조 | 4.5부터 3뷰(정면/측면/후면) 생성 개선 공식 명시 | 5.0 Pro "레이어별 분리 출력(텍스트/캐릭터/오브젝트/배경 각각 투명 배경)" — 원문 대조는 (미확인) | 공식 특징으로 "그리드 레이아웃/여백 설계" 명시 | 강연자가 아직 미고려. 캐릭터 일관성+멀티뷰+레이어분리 투명배경까지 갖춰 검토 가치 높음 |
| **Ideogram 4.0** (2026-06-03, 9.3B 오픈웨이트) + 호스티드 **3.0**(Turbo/Default/Quality) 병행 | 3.0 공식가: Turbo $0.03/Default $0.06/Quality $0.09. Character Ref +$0.10~0.20. 투명배경+업스케일 별도. 4.0 호스티드가 (미확인) | 유료 플랜 상업권 포함(세부 미확인) | "Character Reference" 공식 지원(사진 1장→일관 캐릭터) | (미확인) | **4.0은 네이티브 투명도 지원 공식 명시**(알파채널 내장). 3.0은 별도 Remove BG API | 4.0 "bounding-box 레이아웃 제어, 구조화 JSON 프롬프팅" 공식 지원 — 그리드/UI킷 제어에 유리할 가능성 | 텍스트 렌더링 정확도 90~95% 자체 주장 — UI 킷 버튼 레이블에 강점 |
| **Recraft V4 Styles**(2026-08)/V4.1(2026-05)/V4(2026-02) | 공식 API. 유닛당 과금($1=1000유닛): V4 Pro 래스터 $0.25, V4 벡터 $0.30, 배경제거 $0.01. 구독 Basic $12/mo ~ Pro $160/mo | 유료 플랜부터 상업권 포함 | 캐릭터 일관성 특화 기능 (미확인) — 스타일/브랜드 일관성이 강점 | (미확인) | 공식 "Remove Background" 엔드포인트, 벡터(SVG)는 구조상 투명 자연 지원 | 그리드/시트 전용 기능 (미확인) | **업계 유일급 완전 스케일러블 벡터(SVG) API** — UI 킷 그리드 시트보다는 개별 벡터 아이콘/브랜드 컬러 일관성에 최적화 |

---

## 3. 이미지 → 3D 변환

| 서비스(버전) | API/가격 | 배치 | glTF/GLB | PBR | 폴리수제어 | 리토폴로지 | 리깅 | 상업라이선스 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| **Tripo (v3)** | 공식 API `openapi.tripo3d.ai/v3`. 크레딧제 $1=100cr, Image→Model 20~50cr | 개별 태스크. **멀티뷰는 최대 4장(전/좌/우/후 고정앵글)만 공식 지원** — 강연자의 "16장 동시 업로드"와 스펙 불일치 가능성, 재확인 필요 | 지원 | `enable_pbr`로 metallic/roughness/normal | `target_polycount`(100~300,000 또는 smart-topology 100~15,000), `decimation_mode`, `topology`(quad/triangle) — **Smart Low-poly 명확히 존재** | Smart Topology 모델로 쿼드 클린 토폴로지 | **있음** — `/animations/rig`(biped/quadruped 등, spec=tripo/mixamo), `/animations/retarget`(idle/walk/run/dive/climb/jump 등), glb 애니메이션 bake 가능 | 유료 크레딧=상업 전제. **2026-11-01 API v2 완전 폐지, v3 강제 마이그레이션** | 리깅+프리셋 애니메이션까지 API로 커버되는 유일 서비스. 로우폴리 목표에 가장 부합 |
| **Meshy** | 공식 API, Pro 이상 등급부터 사용 가능(월 1000cr, 동시 10태스크). 생성 20cr | 개별 태스크(동시 10개 병렬 가능) | 지원(GLB 우선) | `should_texture`+`enable_pbr` | `target_polycount`, `decimation_mode`, `topology` | Smart Topology | 리깅 API 존재 언급 있으나 세부 스펙 (미확인) | Pro 이상 API=상업 전제 | 멀티이미지 입력은 별도 엔드포인트 |
| **Hunyuan3D** (Tencent, 2.1 오픈소스 / 3.0~3.1 비공개) | **2.1은 완전 오픈소스**(GitHub, `api_server.py` 자체 호스팅 API). **3.0/3.1은 Tencent Cloud API**(비공개) | 자체 호스팅 시 스크립트 배치 가능 | 지원 | "production-ready PBR" 명시 | (미확인) | (미확인) | (미확인) | 2.1은 Tencent Hunyuan Community License(상업 허용, 조건 있음, 세부 미확인). 로컬 실행 VRAM 최대 29GB | 3.0/3.1은 최대 150만 폴리곤+8K PBR(마케팅 기준). "Hunyuan 3.0 LLM"(295B, Apache 2.0)과 혼동 주의 — 별개 제품 |
| **Rodin** (Hyper3D/Deemos, Gen-2.5) | API 있음(`api.hyper3d.com/v2`). Creator $30/mo, Business $120/mo(API 포함) + 다운로드당 $0.5~1.5 | (미확인, 문서 다수 404) | (미확인) | (미확인) | (미확인) | (미확인) | (미확인) | (미확인) | 공식 API 스펙 문서 다수 접근 실패, 재조사 필요 |
| **Trellis** (Microsoft, TRELLIS.2-4B) | 오픈소스(HuggingFace), 자체 호스팅 필요. 공식 상용 API 없음, NVIDIA NIM/Replicate/PiAPI가 서드파티 래핑 | 자체 파이프라인 배치 가능 | **지원**(`to_glb()`, OBJ/STL/GLTF/USDZ/PLY도) | BaseColor/Roughness/Metallic/Opacity 생성 | `decimation_target`(부분 지원) | (미확인) | 공식 미지원(비공식 커뮤니티 시도만 존재) | **MIT 라이선스 — 완전 상업 이용 가능**(의존 패키지 별도 검토 필요) | 2025-12 출시. 자체 GPU 호스팅 필요해 인프라 비용 발생 |
| **Sparc3D** | 공식 API/서비스 없음 — 연구 논문(NTU) 구현체, GitHub+HF Space 데모만 | 미해당 | (미확인) | (미확인) | 해당없음 | 해당없음 | 해당없음 | LICENSE 존재하나 종류 (미확인) | Hitem3D가 이 알고리즘 기반 상용화 |
| **Hitem3D** (2026 Hi3D 리브랜딩) | 공식 API(`docs.hi3d.ai`), Pro $9.90/mo(1000cr) | (미확인) | **지원 확인**(문서에 glb export 명시) | **지원 확인** | (미확인) | (미확인) | (미확인) | (미확인) | Sparc3D+Ultra3D 기반. 최대 200만 폴리곤(마케팅), 멀티뷰(1~4장) 입력 |

**웹 최적화 도구 체인** (npm 레지스트리 실측, 2026-09):

| 도구 | 패키지명 | 최신 버전 | 역할 |
|---|---|---|---|
| gltfpack | `gltfpack` | 1.2.0 | glTF 원샷 최적화(meshopt+텍스처 리사이즈), MIT, Node 18+ |
| gltf-transform CLI | `@gltf-transform/cli` | 4.5.0 | glTF 변환/최적화 스위스 아미 나이프, Node 20+ |
| meshoptimizer | `meshoptimizer` | 1.2.0 | 메시 압축/버텍스 캐시 최적화 |
| Draco | `draco3d` | 1.5.7 | 지오메트리 압축(Google) |
| KTX-Software | 바이너리 CLI(`ktx`/`toktx`) | v4.4.2(2024-10 릴리스로 표기, 2026-09 시점 최신 여부는 미확인) | KTX2/BasisU 텍스처 압축 |

```bash
# Draco 압축
gltf-transform draco input.glb output.glb
# KTX2 UASTC(고품질, 노멀맵용)
gltf-transform uastc input.glb output.glb --level 4 --rdo 4
# KTX2 ETC1S(소용량, 컬러맵용)
gltf-transform etc1s input.glb output.glb --quality 128
# meshopt 압축
gltf-transform meshopt input.glb output.glb
# 원샷(draco+webp)
gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
```
gltf-transform의 `etc1s`/`uastc` 명령이 외부 `ktx`/`toktx` 바이너리 의존성을 요구하는지는 문서상 명시적으로 확인되지 않아(미확인), 실제 스크립트 작성 시 로컬 실행으로 직접 검증 권장. gltfpack은 `-c`(meshopt), `-tc`(KTX2), `-si`(simplify ratio) 플래그로 원샷 최적화 가능해 세밀한 파이프라인 조립(gltf-transform)과 역할이 나뉨.

---

## 4. 영상 모델

| 모델(버전) | 스타트/엔드프레임 | 레퍼런스참조 | v2v | API가격 | 최대길이/해상도 | 저작권정책 | 비고 |
|---|---|---|---|---|---|---|---|
| **Kling 2.6** (Pro/Std) | `image`(시작)+`image_tail`(끝, Pro모드) 지원한다는 설명과, 2.5/2.6은 시작 프레임만이라는 상반된 설명 존재 — **(미확인, 소스 상충)** | 있음(2.6에서 오디오·립싱크 동시생성 추가) | (미확인) | 3rd-party 기준 무음 ~$0.07/s, 음성포함 ~$0.14/s(공식 kling.ai/dev/pricing 본문 확인 실패) | 5s/10s, 1080p(공식 스펙 페이지 미확인) | 유료 플랜(Standard 이상) 워터마크 제거+상업 라이선스 부여하나, ToS 원문에 "상업목적 별도승인 필요" 문구도 동시 존재 — **재검증 권장**. Kling(콰이쇼우)에 콘텐츠 광범위 무상 라이선스 부여됨 | 강연자의 "체이닝+저작권 유연" 평가와 대체로 부합하나 상업조항 재검토 필요 |
| **Seedance 1.0/1.5 Pro** (ByteDance/BytePlus) | **공식 문서 확인**: 첫+끝 프레임 / 첫 프레임만 / 텍스트 전용 3가지 모두 공식 지원 | 강함 — "Consistent Subject"로 얼굴/피사체 일관성, 멀티샷 내러티브에서도 유지 공식 명시 | (미확인) | 공식 1.0 Pro: $2.5/M토큰. 3rd-party $0.012~$0.247/s. "2.0/2.5" 버전명은 BytePlus 공식문서 미확인(버전 넘버링 상충) | 480p/720p/1080p, 최대 12초, 24fps(1.0 Pro) | 상업 사용 시 로열티 없음, 저작자표시 불요. 실존인물 무동의 합성·프랜차이즈 캐릭터 복제는 금지 | 강연자의 "레퍼런스 참조 우수" 평가가 공식 문서와 일치 |
| **Veo 3.1** (Google DeepMind) | 공식: "First and Last Frame" 기능(전환 연출용) | 공식: 캐릭터 레퍼런스 이미지로 외형 일관성 | (미확인) | 공식(Gemini API): Standard $0.40/s(720p·1080p)·$0.60/s(4K), Fast $0.10~0.30/s, Lite $0.05~0.08/s | 단일생성 8초 고정(4K는 8초만), 체이닝 확장시 최대 ~148초(추정) | Google 표준 생성형 AI 약관(세부 미확인) | **가격표·스펙이 모두 공식 확인된 유일한 모델** — API 자동화 신뢰도 최고. 보조 엔진으로 추천 |
| **Sora 2 / Sora 2 Pro** (OpenAI) | (미확인, 403) | (미확인) | (미확인) | 3rd-party: Sora 2 $0.10/s, Pro $0.30~0.70/s | 10/15/25s, 최대 1792px | (미확인) | ⚠️ **API가 2026-09-24 전면 종료**(2026-03-24 공식 발표, 앱은 이미 4/26 종료) — **양산 파이프라인 편입 불가** |
| **Runway Gen-4/Gen-4 Turbo/Gen-4.5** | 시작/엔드 프레임 언급 없음, 단일 레퍼런스 이미지 기반 "월드 일관성"이 핵심 방식(미확인) | 공식: 단일 레퍼런스 이미지로 일관성(최대 3장이라는 설명도 있음) | Act-Two(퍼포먼스 전이), Aleph(v2v 편집) 제품 존재하나 세부스펙 (미확인) | 공식: Gen-4.5 12credit/s, Gen-4 Turbo ~6credit/s. Standard $12/mo=625credit | (미확인) | (미확인) | 레퍼런스는 강하나 시작/엔드 프레임 체이닝 방식이 아니라 Kling/Seedance와 파이프라인 결이 다름 |
| **Hailuo 2.3/2.3 Fast** (MiniMax) | (미확인) | (미확인) | (미확인) | 공식(platform.minimax.io) video point 과금: 2.3-Fast 1080p/6s=1.3pt, 2.3 1080p/6s=2pt | 최대 1080p, 6/10s | (미확인) | 스펙은 공식 확인되나 분기형 체이닝 필요 기능(프레임 지정·레퍼런스)은 미검증 |
| **Wan 2.2**(오픈소스 확정) / "Wan 2.5·2.6"(미확인) | (미확인) | (미확인) | 오픈소스라 자체 파생 v2v 자유(미확인, 일반적 특성) | GPU 비용만. **Apache 2.0** | 2.2: 720p, T2V/I2V | Apache 2.0 — 상업사용·광고·스톡 재판매 모두 허용 명시 | "2.5/2.6"은 다수 3차 소스에 존재하나 공식 GitHub엔 2.2까지만 확인 — 클로즈드 API 전용일 가능성, 재검증 필요 |
| **LTX-2/2.3/2.5** (Lightricks) | (미확인) | (미확인) | 2.5는 "월드모델"(로보틱스용)로 방향 전환 — 일반 v2v 여부 (미확인) | 자체 호스팅(오픈웨이트), 연매출 $1000만 미만 기업 무료 | 네이티브 4K, 최대 50fps, 14B(영상)+5B(오디오) | 연매출 1000만불 미만 무료, 이상은 별도 라이선스 | 2026-01-06 오픈소스 공개, 저사양 GPU 로컬 구동 가능 — 대량 자동화 비용 이점 큼 |

**분기형 비디오 최적 조합 추천**:
1. **주력: Kling 2.6 Pro + Seedance 1.0/1.5 Pro(현 워크플로우 유지)** — Seedance는 공식 문서상 체이닝 3방식 모두 지원+레퍼런스 강점 확인됨. Kling은 엔드프레임 지원 여부 실 API 응답으로 재검증 필요, 상업 ToS도 재확인 권장.
2. **보조: Veo 3.1 추가 검토 가치** — 유일하게 스펙·가격표가 완전 공식 확인됨. 4K, 8초 고정 클립이라 브랜칭 컷(3~8초) 단위에 적합, API 안정성 신뢰도 높음.
3. **일관성 붕괴 시 v2v 재생성: Wan 2.2(오픈소스, Apache 2.0) 또는 LTX-2.3(로컬 구동)** — API 과금 없이 GPU 비용만 발생해 대량 재생성에 비용 유리.
4. **제외: Sora 2/Sora 2 Pro** — API 종료 임박.

---

## 5. 3D 씬/월드 생성

| 도구 | 기능 | 가격 | 웹 배포 포맷 | 비고 |
|---|---|---|---|---|
| **Postshot** (Jawset) | 사진/영상→3DGS 학습 데스크톱 SW | Free(비상업,워터마크)/Indie €17/mo/Studio €39/mo | PLY, SPZ(Indie+), 1.1.43부터 HTML export | 상업 이용은 Indie 이상 필요 |
| **Luma AI** | 클라우드 스마트폰 사진/영상→3DGS(무료), Genie(텍스트→3D모델) | Free/Pro(금액 미확인) | PLY(스플랫), GLB/OBJ/FBX/USDZ(Genie) | 소비자급 스플랫 품질 최상위 평가 |
| **Polycam** | 모바일 스캔+클라우드 3DGS 재구성 | Free(GLTF만)/Pro $12.99~26.99/mo | PLY,OBJ,FBX,DAE,STL,LAS 등 15종+(Pro필요) | 무료 티어는 PLY 미지원 |
| **Apple SHARP** | **제품 아닌 연구 논문**("Sharp Monocular View Synthesis in Less Than a Second", 2025-12). 단일 이미지→3DGS를 1초 미만 피드포워드 생성 | 오픈소스 코드(ml-sharp) 공개 | 3DGS 파라미터 직접 출력(포맷 미확인) | 메트릭 스케일(절대거리) 지원 특징. 제품화/상업 API 미확인 |
| **World Labs Marble**(Fei-Fei Li) | 텍스트/이미지/영상→탐색가능 3D 월드, 2026-01-21 World API 공개 | Free(4회)/Standard $20/mo(12회)/Pro $35/mo(25회,상업라이선스 포함)/Max $95/mo(75회). API ~$0.12/draft world | (미확인, Spark 스플랫 렌더러 연동은 확인) | 2026-02-18 $10억 투자, 기업가치 약 $50억 |
| **Google Genie 3** | 실시간 인터랙티브 월드 모델(정적 3D 에셋 아님) | Google AI Ultra $200/mo 내 "Project Genie" 웹UI로만. **공식 API 없음** | 내보내기 없음(실시간 스트리밍) | 720p·24fps, 수분간 일관성. 정적 스플랫 생성엔 부적합 |
| **Tencent Hunyuan World / HY-World 2.0** | 텍스트/이미지→360°파노라마→탐색가능 3DGS 월드 | 오픈소스(1.0 전체공개, HY-World 2.0은 핵심모듈만 즉시공개) | 3DGS 월드(포맷 미확인) | 2026-04 HY-World 2.0 출시, 부분 오픈소스 |

웹 배포용 3DGS 파일형식은 `.ply`(원본, 수백MB~수GB), `.splat`(압축, 수십~수백MB), `.ksplat`(추가압축, KIRI Engine 등)이 일반적이나 정확한 평균 용량 수치는 공식 소스로 검증 못함(미확인).

---

## 6. 오디오

| 도구 | 기능 | 최신 상태 | API 가격(공식) | 상업 라이선스 |
|---|---|---|---|---|
| **ElevenLabs** | TTS, 더빙, SFX, 음악, 화자 클로닝 | v3(TTS 최신), Dubbing v1/v2 | TTS $0.10/1K자(v2/v3), $0.05/1K자(Flash/Turbo/v3 Conv); 더빙 $0.33/분(워터마크 v1)~$2.20/분(v2 고품질 워터마크제거); SFX $0.12/분; 음악 $0.15/분 | 음악은 Starter 이상부터 상업 라이선스 명시 |
| **Suno** | AI 음악 | v5.x 현재. Warner Music 라이선스 계약(2025-11), 2026년중 신모델 출시 예정 | **공식 공개 API 없음**, 2026-07 파트너 전용 API 인테이크폼만 존재 | Pro/Premier 유료 구독 생성곡에 한해 상업 사용·유통·판매 권리 |
| **Udio** | AI 음악 | (미확인) | **공식 공개 API 없음** | (미확인) |
| **ElevenLabs Dubbing API** | 영상 1개+언어별 mp3 분리 구조에 최적 | 위와 동일 | $0.33~$2.20/분 | 워터마크 제거·프리미엄(v2)은 비용 4배 이상 — 원가 설계 반영 필요 |

강연자 구조("영상 1개 + 언어별 mp3 분리")에는 **ElevenLabs Dubbing API**가 가장 직접적으로 맞습니다.

---

## 7. 캐릭터 애니메이션

| 도구 | 기능 | 3D 클립 출력 | API | 웹 파이프라인 적합성 |
|---|---|---|---|---|
| **Tripo Auto-Rig + Retarget** | GLB/FBX/OBJ/STL 메시에 자동 스켈레톤, 90+ 프리셋(biped v1) 또는 idle/walk/run/dive/climb/jump(범용 v2.5) | **GLB(애니메이션 bake) 또는 FBX** | **있음**(`/animations/rig`, `/animations/retarget`) | **가장 직접적인 Mixamo 대체재.** Tripo→리깅→걷기 애니메이션 bake까지 API 체인 하나로 완결. `spec=mixamo` 옵션으로 Mixamo 호환 스켈레톤도 가능 |
| **Meshy 리깅** | "mesh, texture, rigging 자동화" 언급되나 API 엔드포인트 존재 여부 (미확인) | (미확인) | 애니메이션은 있음, 리깅 API (미확인) | 확인 우선순위 낮음 |
| **Viggle(PINOC)** | 폰 비디오→모션캡처, 게임엔진 export 가능, 캐릭터스왑/모션캡처/게임제작 | 게임엔진 호환 export 언급(포맷 미확인), 메인 데모는 **비디오(mp4) 출력** | **있음**(`portal.viggle.ai`, `POST /v1/renders`) | 산출물이 기본 비디오라 3D GLB 파이프라인엔 추가 변환 단계 필요 |
| **Kling 모션 기능** | Motion Control 등 존재 알려짐 | (미확인) | (미확인, dev-center SPA라 콘텐츠 추출 실패) | 직접 재조사 필요 |
| **Runway Act-Two** | 얼굴/신체 퍼포먼스 전이(비디오 기반) | (미확인) | dev.runwayml.com 존재, Act-Two API 노출 여부 (미확인) | 인물 영상 합성 특화 — 3D 프랍 걷기 애니메이션엔 적합성 낮을 가능성 |
| **Plask** | 단일 비디오→AI 모션캡처, MMD/VRM 지원, Unreal/Unity/Maya/Blender export | 지원(포맷 미확인, FBX 추정) | (미확인) | 커스텀 캐릭터에 모캡 입히는 용도로 유효, "라이브러리에서 클립 선택" 방식은 아님 |
| **Mixamo**(Adobe) | 자동 리깅+사전제작 애니메이션 라이브러리 | FBX | 공식 API 없음(항상 없었음) | 2026년 서비스 지속 여부 공식 확인 실패(403), 종료 공지는 없어 운영 중일 가능성 높음(정황상) |

**결론**: "프랍이 걷게 만들기" 요구에는 **Tripo Auto-Rig + Animation Retarget API**가 가장 실전적입니다. 이미 파이프라인에 Tripo를 쓰고 있고, GLB에 애니메이션을 bake해 바로 `tools/asset-pipeline`으로 넘길 수 있습니다.

---

## 8. 자동화 SDK/API 게이트웨이

| API | 모델 커버리지 | 가격 체계 | Node.js/TS SDK | 비고 |
|---|---|---|---|---|
| **fal.ai** | FLUX, SDXL, Nano Banana, Seedream, Kling, Wan, Veo 등 수백 개(3D 모델 커버리지는 미확인) | 순수 종량제(구독 없음) | **공식 지원**(JS/TS/Python) | WebSocket 스트리밍, 큐+웹훅 배치, 노드 워크플로우 빌더 보유 |
| **Replicate** | 공식+커뮤니티 수만 개(정확한 3D 모델 목록 미확인) | 순수 종량제 | **공식 지원**(`replicate` npm, 서버리스 호환) | 배치는 전용 엔드포인트 없이 루프/커뮤니티 패키지 |
| **Google Vertex AI/Gemini API**(이미지) | Gemini 3.1 Flash Image(Nano Banana 2), Gemini 3 Pro Image(Pro), Imagen 4 계열 | Gemini 2.5 Flash Image $0.039/img(표준), **배치 API 50% 할인** $0.0195/img. 3.1: $0.045~0.151/img(해상도별) | 공식 Node.js SDK(`@google/genai`) 존재(일반 지식 기준, 이번 세션 재검증은 못함) | 배치 API 50% 할인이 여러 모델 공통 적용되는 강점 |
| **OpenAI Images API** | GPT Image 2(현 플래그십), 1.5, 1 Mini, 1(2026-10-23 종료 예정) | 공식 pricing 페이지 403으로 직접 확인 실패, 3차 소스 집계: 1K $0.03/2K $0.05/4K $0.08 또는 품질기준 $0.006~0.211. **Batch API 약 50% 할인** | 공식 SDK(`openai` npm) 존재(일반 지식 기준) | 실제 연동 전 재검증 강력 권장 |
| **Kling 공식 API** | Kling V3, O3(t2v/i2v/reference-to-video/편집) | V3 6~8credit/s, O3 12~20credit/s. **API는 크레딧과 별개로 "API 플랜 구독" 별도 필요** | (미확인) | 공식 가격 페이지 두 차례 fetch 실패 — 신뢰도 낮음, 연동 전 콘솔 직접 확인 필수 |
| **Tripo 공식 API** | Text/Image/Multiview-to-3D, 리토폴로지, 리깅, 세그멘테이션 | 크레딧제, 1credit=$0.01. 생성 10~30cr, 리깅 25cr, 세그멘테이션 40~85cr | (미확인) | 대량 배치 전용 엔드포인트 여부 불명확, 대량계약은 문의 안내 |
| **Meshy 공식 API** | Text/Image/Multi-image-to-3D, 리텍스처, 리메시, 오토리깅, 텍스트→모션 | Pay-before-you-go 크레딧제. 5~35credit | (미확인) | **API는 Pro 플랜 이상에서만 접근 가능**(Free 불가) |

### 게이트웨이 추천: **fal.ai(1순위) + Replicate(2순위 보완)**

근거:
1. 둘 다 구독 없는 순수 종량제로 REST API 뒤에 수백 개 서드파티 모델(이미지·영상)을 통합 제공 — "노드에서 생성 호출 + 크레딧 표시" 요구사항과 정확히 맞음(사용자 정산을 게이트웨이 단일 청구서로 단순화).
2. fal.ai가 근소 우위: 공식 JS/TS SDK가 Next.js/Node 스택과 직접 맞고, WebSocket+큐/웹훅 구조가 이미 배치 실행에 최적화되어 있음(Replicate는 공식 배치 엔드포인트 불명확). fal.ai 자체 노드 워크플로우 빌더는 `tools/asset-pipeline` 참고 구현체로도 활용 가능.
3. Replicate는 최신 오픈소스 3D/영상 모델이 fal.ai보다 먼저 올라오는 경우가 있어 폴백으로 유용, SDK도 공식 지원.
4. Kling/Tripo/Meshy 등 전문 API는 직접 붙이지 않는 것을 권장 — Kling 공식 가격 페이지 접근 실패(신뢰도 낮음), Tripo/Meshy는 API 배치 지원 불명확+플랜 등급별 API 제한(Meshy는 Pro 이상만)으로 계약/플랜 관리 부담이 큼. fal.ai의 Kling 리셀 엔드포인트($0.084~0.112/sec 확인됨) 경유가 더 단순.
5. Vertex/Gemini, OpenAI Images API는 이미지 품질·가격(특히 Gemini 배치 50% 할인) 매력적이라 이미지 노드 하나로는 직접 붙일 가치 있으나, 영상·3D까지 아우르는 단일 게이트웨이로는 fal.ai/Replicate가 더 적합.

---

## 9. 프롬프트 노하우 검증

### (1) 그리드/스프라이트 시트 프롬프트 — 정형화 수준: **높음**
- [Nano Banana Lab: "5 Essential Game Asset Prompt Strategies for Developers"](https://nanoprompts.org/lab/2025/game-asset-design-guide) — "isolated on solid black background for easy cropping", "6-frame walking animation in horizontal row" 등 구체적 패턴
- [LayrKits(X): "How to create a game-ready 2D sprite sheet for ANY animation"](https://x.com/LayrKits/article/2050277473116619240)
- [HuggingFace: fal/flux-2-klein-4b-spritesheet-lora](https://huggingface.co/fal/flux-2-klein-4b-spritesheet-lora) — 단일 오브젝트→2x2 스프라이트 시트 전용 LoRA까지 학습될 만큼 정형화
- [selfielab.me "Flux 2 Pro Multi-Reference Character Sheets Guide"](https://selfielab.me/blog/flux-2-pro-multi-reference-character-sheets-guide-20260307)

강연자의 "사람 제외 오브젝트를 4×4 그리드에" 프롬프트는 이 정형화된 패턴과 정확히 일치.

### (2) UI 킷 한 장 생성 후 슬라이스 — 정형화 수준: **중간**
SaaS 제품 기능으로 굳어진 형태, 순수 커뮤니티 밈은 아님.
- [SpriteCook "Unity UI Kit Generator: AI Sprites with 9-Slice Borders"](https://www.spritecook.ai/unity-ui-kit-generator) — "버튼 상태를 행(row)으로 배치, 9-slice 경계 자동 설정" 명시(강연자의 "기본/강조/비활성 3행"과 개념 일치)
- [Nano Banana Lab game-asset-design-guide](https://nanoprompts.org/lab/2025/game-asset-design-guide)
- 9-slice 자체는 오래된 게임개발 관행이고 AI가 이를 흉내내는 방향으로 수렴 중
- Reddit에서 정확히 이 패턴을 다루는 정형화된 스레드는 찾지 못함(미확인)

### (3) 캐릭터 먼저→배경 합성→캐릭터 제거해 배경만 추출 — 정형화 수준: **낮음, 대부분 미확인**
이 정확한 "역순" 기법은 명확한 레퍼런스를 찾지 못함(미확인). 발견된 것은 대부분 **반대 순서**(캐릭터를 먼저 락하고 배경을 별도 생성 후 합성)입니다.
- [Medium: "Maintaining Character Consistency in AI-Generated Images"](https://medium.com/@staniszewski/maintaining-character-consistency-in-ai-generated-images-7a12dfbc67bb) — "캐릭터를 참조/투명 컷아웃으로 고정 후 배경만 재생성, 또는 새 배경을 만들고 캐릭터를 합성"이라 설명 — 강연자가 말한 순서와 **다름**
- Inpainting으로 인물을 지우고 배경을 재구성하는 기법 자체는 일반적이나, "조명/원근 일치 트릭"으로 의도적으로 쓰인다는 커뮤니티 레퍼런스는 찾지 못함
- **결론**: 검증되지 않았거나 강연자가 직접 발견한 비주류 기법일 가능성. 실사용 전 소규모 테스트 권장.

### (4) 스타일 프레임 분해로 여러 에셋 추출 — 정형화 수준: **높음(Flora 공식 기능)**
- [Flora 공식 "Techniques" 페이지](https://flora.ai/techniques)
- [Flora "AI Image Generator" 공식 capabilities 페이지](https://flora.ai/capabilities/ai-image-generator) — "Style Node"에 레퍼런스 이미지를 업로드해 모든 생성 블록에 와이어링하면 일관 스타일로 대량 에셋 생성
- [Flora Blog "Make your FLORA workflows scale with Batch Nodes"](https://flora.ai/blog/make-your-flora-workflows-scale-with-batch-nodes)
- [Chase Jarvis 리뷰(3자 검증)](https://chasejarvis.com/blog/flora-ai/)

이는 강연자가 실제 사용 중인 정확한 워크플로우와 일치하는, 가장 신뢰도 높은 항목입니다.

---

## 에셋 종류 × 툴 × 자동화 수준 종합표

| 에셋 종류 | 최선 툴 | 대안 | 자동화 수준 |
|---|---|---|---|
| 스타일 프레임 생성 | Flora(Style Node) | Krea, ComfyUI | 반자동(수동 프롬프트+API 배치) |
| 프랍 그리드 시트(4×4) | Nano Banana 2 + GPT Image 2.5 병행, Nano Banana로 후처리 | FLUX.2[pro], Seedream 5.0 Pro | 반자동(그리드 자르기는 API 자동화 가능) |
| UI 킷 3행 시트 | Ideogram 4.0(텍스트 렌더링+네이티브 투명도) | Recraft(벡터), Nano Banana 2 | 반자동 |
| 룩 탐색(비양산) | Midjourney | - | 완전 수동(API 없음, ToS 금지) |
| 그리드 슬라이스 | `tools/asset-pipeline`(자체 스크립트) | - | **완전 API/스크립트 자동화** |
| 이미지→3D 변환 | Tripo(v3, 리깅 포함) | Meshy, Hunyuan3D 2.1(자체호스팅) | API 자동화(멀티뷰 4장 제약 재확인 필요) |
| 3D 웹 최적화(glTF/Draco/KTX2) | gltf-transform + gltfpack | - | **완전 스크립트 자동화** |
| 캐릭터 리깅+걷기 애니메이션 | Tripo Auto-Rig+Retarget | Viggle(비디오 경유) | API 자동화 |
| 분기형 비디오 컷(시작/끝 체이닝) | Kling 2.6 Pro + Seedance 1.0/1.5 Pro | Veo 3.1(가격 투명) | API 자동화(Kling 엔드프레임 재검증 필요) |
| 캐릭터 붕괴 시 v2v 재생성 | Wan 2.2(오픈소스) 또는 LTX-2.3(로컬) | - | 자체 호스팅 배치 자동화 |
| 가우시안 스플랫(드론뷰→스플랫) | Postshot | Luma AI, Polycam | 반자동(영상 촬영/생성은 별도 단계) |
| BGM | Suno(API 없음, 수동) | ElevenLabs Music | 대부분 수동(Suno는 공식 API 부재) |
| 다국어 더빙(영상1+언어별mp3) | ElevenLabs Dubbing API | - | **API 자동화** |
| 게이트웨이(전체 통합) | fal.ai | Replicate(폴백) | **API 자동화의 중심축** |

---

## 패밀리별 권장 파이프라인

### 3D 공간(가우시안 스플랫 씬)
AI 이미지(Nano Banana 2/Seedream) → "드론처럼 한 바퀴" 영상(Kling/Seedance, 레퍼런스=원본 이미지) → 프레임 분해 → Postshot으로 스플랫 학습(Indie 이상 상업 라이선스) → PLY/SPZ export → 웹 배포는 3DGS 웹 뷰어(Spark 등) 필요. World Labs Marble(Pro $35/mo, 상업 라이선스 포함)을 텍스트/이미지 직행 대안으로 병행 검토. Apple SHARP는 연구 단계로 상용화 전이라 관찰만 지속.

### 게임(3D 프랍/캐릭터)
Flora 스타일 프레임 → 4×4 그리드 프랍 시트(Nano Banana 2 + GPT Image 2.5, GPT 결과 Nano Banana로 재통과) → `tools/asset-pipeline` 그리드 슬라이스(16장) → Tripo(v3) 이미지→3D(로우폴리, Smart Topology, PBR) → Tripo Auto-Rig+Retarget(걷기 등 프리셋 애니메이션 bake) → gltf-transform으로 Draco/KTX2/meshopt 압축 → GLB 웹 배포. Meshy를 병행 검증용 2안으로 유지.

### 분기형 비디오
스타일 프레임 → 컷 1 스타트프레임 지정 → Kling 2.6 Pro(엔드프레임 시도, 실API 응답으로 지원여부 재확인) + Seedance 1.0/1.5 Pro(레퍼런스 캐릭터 고정) 각 2개 생성 → 엔드프레임을 다음 컷 스타트프레임으로 체이닝 → 캐릭터 일관성 붕괴 감지 시 스플랫/턴테이블 영상을 Wan 2.2 v2v로 재생성 → 다국어 트랙은 ElevenLabs Dubbing API로 영상 1개+언어별 mp3 분리. Veo 3.1을 가격·SLA가 중요한 상업 라인의 보조 엔진으로 검토.

### 플랫폼(노드 오케스트레이션)
Flora(수동 크리에이티브 탐색)로 스타일/프롬프트를 정착시킨 뒤, 앱 내 flow-editor에서는 **fal.ai를 1차 게이트웨이**로 붙여 이미지(Nano Banana 2, GPT Image 2.5, FLUX.2)·영상(Kling, Seedance, Veo 리셀 엔드포인트)·3D 관련 서드파티 모델을 단일 SDK로 호출. Tripo/Meshy/ElevenLabs처럼 fal.ai 커버리지 밖의 전문 API는 개별 연동. Replicate는 fal.ai에 없는 최신 오픈소스 모델의 폴백으로 유지.

### 루틴(대량 배치/베리에이션)
음성 입력 프롬프트 → Flora 배치 노드(텍스트 10 × 이미지 10 = 100 베리에이션) → 결과를 fal.ai/Replicate 배치 큐로 후처리(업스케일, 배경제거, 포맷 변환) → `tools/asset-pipeline`이 그리드 슬라이스/GLB 압축/영상 트랜스코드를 스크립트로 완전 자동화. Gemini 배치 API(50% 할인), OpenAI Batch API(약 50% 할인)를 대량 이미지 생성 시 비용 절감 경로로 활용.

---

## 비용 추정 (작품 1편당, 대략치 — 다수 항목이 "미확인" 가격을 포함하므로 근사치)

가정: 프랍 16종, 분기 비디오 컷 10개(각 Kling+Seedance 2개씩=40클립), 3D 변환 16개, BGM/더빙 3개 언어.

| 항목 | 단가(근사) | 수량 | 소계(근사) |
|---|---|---|---|
| 스타일 프레임 + 그리드 시트(Nano Banana2+GPT Image2.5, 각 4장) | 이미지당 ~$0.03~0.15 | 약 20장 | ~$1~3 |
| UI 킷 시트(Ideogram 4.0) | ~$0.06~0.09/장 | 3~5장 | ~$0.3~0.5 |
| 이미지→3D 변환(Tripo, 리깅 포함) | 20~50cr($0.2~0.5) + 리깅 25cr($0.25) | 16개 | ~$7~12 |
| 3D 웹 최적화 | 로컬 스크립트(무료, GPU/CPU 시간만) | 16개 | $0 (인프라 비용 제외) |
| 분기 비디오 컷(Kling 2.6, 5~10초) | ~$0.35~1.4/클립($0.07~0.14/s) | 20클립 | ~$7~28 |
| 분기 비디오 컷(Seedance 1.0/1.5 Pro) | ~$0.06~2.5/클립(추정 범위 넓음, 미확인 부분 있음) | 20클립 | ~$1.2~50(불확실성 큼) |
| 가우시안 스플랫(Postshot Indie 월구독 배분) | €17/mo ÷ 다수 작품 | 1편 | ~$1~3(구독 배분 추정) |
| BGM(Suno Pro 구독 배분) | 구독제, 곡당 환산 어려움 | 1~2곡 | (미확인, 구독 배분 추정 필요) |
| 다국어 더빙(ElevenLabs Dubbing) | $0.33~2.20/분 | 3언어 × 2분 | ~$2~13 |
| 게이트웨이 수수료(fal.ai 등) | 모델가에 포함, 별도 수수료 명시 안됨 | - | $0(추가수수료 미확인) |
| **합계(근사, 매우 넓은 범위)** | | | **약 $20~110/편** |

**주의**: 이 추정은 다수의 "(미확인)" 가격 항목(특히 Kling 공식 API, Seedance 최신 버전 가격, Suno 곡당 환산)을 포함하므로 신뢰 구간이 넓습니다. 실제 예산 계획 전 fal.ai/Replicate 콘솔에서 실측 견적을 잡는 것을 권장합니다. 플랫폼 구독료(Flora Pro $50/seat/mo, Tripo/Meshy Pro 플랜 등)는 작품당이 아닌 월 고정비로 별도 집계해야 합니다.

---

## 출처 URL 목록

### 노드 플랫폼 / 게이트웨이
- [FLORA Pricing](https://flora.ai/pricing) / [FLORA FAQ](https://docs.flora.ai/plans-and-billing/faq) / [Flora Techniques](https://flora.ai/techniques) / [Flora AI Image Generator](https://flora.ai/capabilities/ai-image-generator) / [Flora Batch Nodes Blog](https://flora.ai/blog/make-your-flora-workflows-scale-with-batch-nodes) / [Chase Jarvis Flora 리뷰](https://chasejarvis.com/blog/flora-ai/)
- [Weavy AI API(3차)](https://flux-1.ai/weavy-api/) / [Figma Weave vs Astorie(3차)](https://astorie.ai/en/vs/figma-weave)
- [Krea API](https://www.krea.ai/features/api) / [Krea Open Source Licensing](https://www.krea.ai/open-source-pricing) / [Krea Pricing](https://www.krea.ai/pricing)
- [Comfy Cloud Pricing](https://comfy.org/pricing/) / [ComfyUI Partner Node Pricing](https://docs.comfy.org/tutorials/partner-nodes/pricing) / [ComfyUI LICENSE](https://github.com/comfyanonymous/ComfyUI/blob/master/LICENSE)
- [Freepik Spaces→Magnific(3차)](https://www.wireflow.ai/blog/freepik-spaces-is-now-magnific)
- [Runway Dev 문서](https://docs.dev.runwayml.com/) / [Runway API](https://runwayml.com/api) / [Runway Pricing](https://runway.com/pricing) / [Runway Gen-4 발표](https://runway.com/research/introducing-runway-gen-4)
- [fal.ai Pricing](https://fal.ai/pricing)
- [Replicate Pricing](https://replicate.com/pricing) / [replicate-javascript](https://github.com/replicate/replicate-javascript)

### 이미지 모델
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Nano Banana Lab: 게임 에셋 가이드](https://nanoprompts.org/lab/2025/game-asset-design-guide)
- GPT Image 가격: [WaveSpeed(3차)](https://wavespeed.ai/blog/posts/gpt-image-2-pricing-2026/), [AI Free API(3차)](https://www.aifreeapi.com/en/posts/openai-image-generation-api-pricing)
- [FLUX.2 spritesheet LoRA](https://huggingface.co/fal/flux-2-klein-4b-spritesheet-lora)
- [selfielab.me Flux2 캐릭터시트 가이드](https://selfielab.me/blog/flux-2-pro-multi-reference-character-sheets-guide-20260307)
- [SpriteCook Unity UI Kit Generator](https://www.spritecook.ai/unity-ui-kit-generator)
- [Medium: Character Consistency](https://medium.com/@staniszewski/maintaining-character-consistency-in-ai-generated-images-7a12dfbc67bb)

### 이미지→3D
- [Tripo Pricing](https://docs.tripo3d.ai/get-started/pricing.html) / [Tripo Auto Rig API](https://developers.tripo3d.ai/en/docs/animations-rig) / [Tripo Retarget API](https://developers.tripo3d.ai/en/docs/animations-retarget) / [Tripo Developers](https://developers.tripo3d.ai/en)
- [Meshy Image-to-3D API](https://docs.meshy.ai/en/api/image-to-3d) / [Meshy Pricing](https://www.meshy.ai/pricing)
- [Hunyuan3D-2.1 GitHub](https://github.com/tencent-hunyuan/hunyuan3d-2.1) / [Tencent 3D Engine 글로벌 런칭](https://www.tencent.com/tencent-announces-global-launch-of-hunyuan-3d-engine-to-empower-creators-with-advanced-creation-tools/) / [Tencent Cloud Hunyuan3D 3.0](https://www.tencentcloud.com/techpedia/148305?lang=en)
- [Microsoft TRELLIS.2 GitHub](https://github.com/microsoft/TRELLIS.2) / [TRELLIS.2-4B HuggingFace](https://huggingface.co/microsoft/TRELLIS.2-4B)
- [Sparc3D GitHub](https://github.com/lizhihao6/Sparc3D)
- [Hi3D API 문서](https://docs.hi3d.ai/en/api/api-reference/overview) / [Hi3D Quickstart](https://docs.hi3d.ai/en/api/getting-started/quickstart)
- [Rodin/Hyper3D 문서](https://docs.hyper3d.ai/)
- [gltf-transform CLI 문서](https://gltf-transform.dev/cli.html)
- [KTX-Software Releases](https://github.com/KhronosGroup/KTX-Software/releases)

### 영상/3D씬/오디오
- [Google DeepMind Veo](https://deepmind.google/models/veo/)
- [MiniMax 가격 문서](https://platform.minimax.io/docs/guides/pricing-video)
- [BytePlus ModelArk Seedance 1.0 Pro](https://docs.byteplus.com/en/docs/ModelArk/1587798)
- [OpenAI Sora 종료 안내](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation) / [The Decoder: Sora 2단계 종료](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/)
- [Kling AI 이용정책](https://kling.ai/docs/user-policy) / [Kling Dev Pricing](https://kling.ai/dev/pricing)
- [Lightricks LTX-2 오픈소스 발표](https://www.globenewswire.com/news-release/2026/01/06/3213304/0/en/Lightricks-Open-Sources-LTX-2-the-First-Production-Ready-Audio-and-Video-Generation-Model-With-Truly-Open-Weights.html) / [LTX-2 Wikipedia](https://en.wikipedia.org/wiki/LTX-2)
- [Apple SHARP 연구 페이지](https://machinelearning.apple.com/research/sharp-monocular-view)
- [Postshot 가격(3차)](https://radiancefields.com/platforms/postshot)
- [World Labs Marble(3차)](https://radiancefields.com/platforms/world-labs) / [World Labs X 발표](https://x.com/drfeifei/status/2014048203063124272)
- [Google DeepMind Genie 3 블로그](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)
- [Tencent HY-World 2.0 GitHub](https://github.com/Tencent-Hunyuan/HY-World-2.0) / [HunyuanWorld-1.0 GitHub](https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0)
- [ElevenLabs API Pricing](https://elevenlabs.io/pricing/api)
- [Suno API/라이선스 가이드(3차)](https://pract.is/blog/ai-music-2026-suno-udio-copyright-licensing-guide)

---

## 미확인 항목 총정리 (재검증 우선순위)

1. **OpenAI 공식 가격 페이지**(403 실패) — GPT Image 2.5 정확한 가격, 투명 배경 파라미터 지속 여부
2. **Kling 공식 API 가격/ToS**(공식 페이지 두 차례 fetch 실패) — `app.klingai.com` 콘솔에서 직접 확인 필요, 엔드프레임 지원 여부도 실 API 응답으로 재검증
3. **Tripo 멀티뷰 실제 제한(4장)**과 강연자의 "16장 동시 업로드" 간 정합성 — 그리드 1장 업로드인지 재확인
4. **Seedance "2.0/2.5" 버전명**의 실존 여부(BytePlus 공식 문서는 1.0/1.5까지만 확인)
5. **fal.ai/Replicate의 3D 모델(Hunyuan3D, Trellis 등) 커버리지** — 이번 조사에서 미확인
6. **Rodin/Hyper3D API 세부 스펙**(문서 다수 404) — 재조사 필요
7. **Wan 2.5/2.6 오픈소스 여부**(GitHub엔 2.2까지만 확인) — 클로즈드 API 가능성
8. **World Labs Marble, TRELLIS 등의 정확한 웹 배포 포맷/용량**
9. **UI 킷/캐릭터-배경 역순 기법**의 커뮤니티 정형화 수준(사실상 미확인)
10. **Weavy/Freepik Spaces(Magnific)**는 리브랜딩 중이라 URL 자체 불안정 — 전면 재검증 권장
