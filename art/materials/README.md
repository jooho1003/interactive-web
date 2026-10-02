# 촬영 재질 · HDRI 소스

2026-10-02 · Dawn Blender 스터디와 JOOHO LAB이 공유하는 원본.
[Poly Haven CC0](https://polyhaven.com/license). `sources.json`에 각 URL·MD5·크기·지도 종류를 기록했고 16파일 무결성을 확인했다. AI 생성이 아니다.

- [Stone Floor](https://polyhaven.com/a/stone_floor): 두 앱 바닥·계산대. 석회암/트래버틴 스캔이라고 주장하지 않는다.
- [White Oak Veneer](https://polyhaven.com/a/white_oak_veneer): 천장·가구·계산대 패널.
- [White Plaster 02](https://polyhaven.com/a/white_plaster_02): 벽·미세 입자.
- [Gravel Floor](https://polyhaven.com/a/gravel_floor): LAB 마당.
- [Overcast Industrial Courtyard](https://polyhaven.com/a/overcast_industrial_courtyard): LAB HDRI 간접광/PMREM. 보이는 풍경은 기존 이미지.

원본은 1K. LAB 웹 파생본은 `projects/jooho-lab/art/photo-web`(해상도 그대로, JPEG 색 82/노멀 88). BOX 투영 tangent normal을 object normal로 연결하지 않는다. 소스 bake에는 촬영 displacement를 작은 bump로 사용하고 웹에서는 별도 UV1 tangent normal을 사용한다.
