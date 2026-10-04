# 새벽 세 시 · Blender 렌더 시험

2026-10-02 · 같은 공간의 계산대 전경과 커피 근접 정지 렌더. 영상은 아니다.

- `counter.png`, `coffee.png`: 1920×1080 원본. `counter.webp`, `coffee.webp`: 68,596B / 40,614B 웹 확인용.
- `night-store.blend`: 공간·두 카메라·조명·재질. 외부 이미지 3개 pack.
- `render-settings.json`: 계산대 256/커피 128샘플 · Cycles CPU · AgX · denoise · f/2.8 · 반사 12/굴절 8.
- 이번 PC 렌더 시간: 계산대 약 14분38초, 커피 약 7분24초. 동시 작업 영향을 포함한 값이다.

전체 생성: 저장소 루트에서 `blender -b --python projects/dawn-store/scripts/render-store.py`(기본 두 컷 256샘플). 이번 커피는 `blender -b projects/dawn-store/art/blender-study/night-store.blend --threads 8 --python projects/dawn-store/scripts/render-study-camera.py -- coffee 128`로 렌더했다.

## 실제 검수 판단
유리·형광등의 실제 반사, 컵/뚜껑, 금속 모서리, 작은 광원, 심도를 확인했다. 진열 상품과 소품이 규칙적이고 종이의 사용 흔적이 부족하다. **기존 생성 컷보다 사진처럼 보인다는 합격 판단은 하지 않았고 기본 미디어는 교체하지 않았다.** 다음 차이는 실물 스캔/사진 기반 상품·컵·영수증, 불규칙한 배치·사용 흔적에서 만들어야 한다. 샘플 수만 올려서는 해결되지 않는다.
현 v2의 물방울과 따뜻한 실내등을 참고해 초기 비 없음/단일 광원 방향과 차이가 있다. 사람은 만들지 않았다.

[공유 촬영 재질](../../../../art/materials/README.md) · [제작 요청/소스 기록](../../../../prompts/dawn-store.md).
