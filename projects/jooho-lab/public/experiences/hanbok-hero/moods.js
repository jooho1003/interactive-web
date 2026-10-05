import { resolve } from './vendor/layer-kit/index.js';

// 분야(장면) 고르기의 순수 로직 — DOM 없이 node --test로 검사한다.
export const MOOD_KEY = 'hanbok-hero:mood:v1';
// localStorage에 접근하는 것만으로 예외가 나는 브라우저(저장 차단)가 있다
export function openStorage(get = () => globalThis.localStorage) { try { return get() || null; } catch { return null; } }
// 저장값이 장면 id일 때만 받는다. 막혀 있거나 이상한 값이면 null(→ 첫 장면)
export function readMood(storage, ids) { try { const value = storage?.getItem(MOOD_KEY); return ids.includes(value) ? value : null; } catch { return null; } }
// 저장 성공 여부. 실패해도 화면은 바뀌고 이번 방문 동안만 기억한다
export function writeMood(storage, id) { try { if (!storage) return false; storage.setItem(MOOD_KEY, id); return true; } catch { return false; } }
// 장면마다 실제로 보일 배경 주소(지금 화면 크기 값 포함), 중복 없이 — 미리 불러오기용
export function moodImages(manifest, values, screens = []) {
  return [...new Set(Object.keys(manifest.scenes).map(id => resolve(manifest, values, id, screens).paper.image))];
}
