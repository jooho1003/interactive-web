# Day Walk

`pnpm test`, `pnpm exec tsc -b`, `pnpm exec vite build`로 검증합니다.

## 구현 메모

- `clampBounds`는 각 경계를 15분 단위로 반올림한 뒤, 앞 경계부터 가장 가까운 유효 범위로 제한합니다.
