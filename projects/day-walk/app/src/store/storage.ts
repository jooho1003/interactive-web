import { AppData, type AppData as AppDataType } from "../schema/index.js";
import { DEFAULT_BOUNDS, dateKey } from "../domain/time.js";

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export const STORAGE_KEY = "day-walk:v1";
export function defaultAppData(): AppDataType {
  return { schemaVersion: 1, settings: { bounds: { ...DEFAULT_BOUNDS }, showCharacter: true, showAdvisor: true, sound: false, motion: "system", notifications: false }, days: {}, routines: [{ id: "default", name: "기본 루틴", tasks: [
    { title: "Workout", slot: { kind: "time", minute: 450 }, starred: false }, { title: "Email 정리", slot: { kind: "segment", segment: "morning" }, starred: true },
    { title: "Meeting", slot: { kind: "time", minute: 840 }, starred: false }, { title: "산책", slot: { kind: "segment", segment: "afternoon" }, starred: false }, { title: "하루 기록", slot: { kind: "time", minute: 1290 }, starred: false },
  ] }], celebrated: [] };
}
export interface LoadResult { data: AppDataType; persistent: boolean; recovered: boolean }
export function loadAppData(storage: StorageLike, logicalToday: string, now = Date.now()): LoadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: defaultAppData(), persistent: true, recovered: false };
    let value: unknown;
    try { value = JSON.parse(raw); } catch {
      storage.setItem(`${STORAGE_KEY}:corrupt-${now}`, raw); storage.removeItem(STORAGE_KEY);
      return { data: defaultAppData(), persistent: true, recovered: true };
    }
    const parsed = AppData.safeParse(value);
    if (!parsed.success) { storage.setItem(`${STORAGE_KEY}:corrupt-${now}`, raw); storage.removeItem(STORAGE_KEY); return { data: defaultAppData(), persistent: true, recovered: true }; }
    const cutoff = new Date(`${logicalToday}T00:00:00`); cutoff.setDate(cutoff.getDate() - 90);
    const data = parsed.data; data.days = Object.fromEntries(Object.entries(data.days).filter(([date]) => date >= dateKey(cutoff)));
    return { data, persistent: true, recovered: false };
  } catch { return { data: defaultAppData(), persistent: false, recovered: false }; }
}
export function createStorage(storage: StorageLike, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined; let pending: AppDataType | undefined; let persistent = true;
  const flush = () => {
    if (!pending) return persistent;
    const value = pending; pending = undefined;
    if (timer) clearTimeout(timer); timer = undefined;
    try { storage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { persistent = false; }
    return persistent;
  };
  return {
    save(data: AppDataType) { pending = data; if (timer) clearTimeout(timer); timer = setTimeout(flush, delay); },
    flush,
    get persistent() { return persistent; },
    bindPagehide(target: Pick<EventTarget, "addEventListener" | "removeEventListener">) {
      target.addEventListener("pagehide", flush);
      return () => target.removeEventListener("pagehide", flush);
    },
    dispose() { if (timer) clearTimeout(timer); timer = undefined; },
  };
}
