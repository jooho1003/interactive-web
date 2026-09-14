import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import type { AppData, Routine, Settings, Task } from "../schema/index.js";
import { clampBounds, dateKey } from "../domain/time.js";
import { applyRoutine, tasksReducer, type TaskAction } from "../domain/tasks.js";
import { createStorage, defaultAppData, loadAppData } from "./storage.js";

type Action = { type: "select"; date: string } | { type: "tasks"; date: string; action: TaskAction } | { type: "settings"; settings: Settings }
 | { type: "routine-save"; routine: Routine } | { type: "routine-delete"; id: string } | { type: "routine-apply"; date: string; routine: Routine; now: number } | { type: "celebrate"; date: string };
type State = { data: AppData; selectedDate: string };
function reduce(state: State, action: Action): State {
  if (action.type === "select") return { ...state, selectedDate: action.date };
  if (action.type === "tasks") return { ...state, data: { ...state.data, days: { ...state.data.days, [action.date]: tasksReducer(state.data.days[action.date] ?? [], action.action) } } };
  if (action.type === "settings") return { ...state, data: { ...state.data, settings: { ...action.settings, bounds: clampBounds(action.settings.bounds) } } };
  if (action.type === "routine-save") return { ...state, data: { ...state.data, routines: [...state.data.routines, action.routine] } };
  if (action.type === "routine-delete") return { ...state, data: { ...state.data, routines: state.data.routines.filter((r) => r.id !== action.id) } };
  if (action.type === "routine-apply") { const result = applyRoutine(state.data.days[action.date] ?? [], action.routine, () => crypto.randomUUID(), action.now); return { ...state, data: { ...state.data, days: { ...state.data.days, [action.date]: result.tasks } } }; }
  return state.data.celebrated.includes(action.date) ? state : { ...state, data: { ...state.data, celebrated: [...state.data.celebrated, action.date] } };
}
type Store = State & { dispatch: Dispatch<Action>; tasks: Task[]; persistent: boolean; recovered: boolean };
const Context = createContext<Store | null>(null);
export function AppStore({ children }: { children: ReactNode }) {
  const today = dateKey(new Date());
  const [loaded] = useState(() => { try { return loadAppData(localStorage, today); } catch { return { data: defaultAppData(), persistent: false, recovered: false }; } });
  const [state, dispatch] = useReducer(reduce, { data: loaded.data, selectedDate: today });
  const [persistent, setPersistent] = useState(loaded.persistent);
  useEffect(() => { if (!persistent) return; const writer = createStorage(localStorage); writer.save(state.data); const unbind = writer.bindPagehide(window); setPersistent(writer.persistent); return () => { writer.flush(); unbind(); writer.dispose(); }; }, [state.data, persistent]);
  const value = useMemo(() => ({ ...state, dispatch, tasks: state.data.days[state.selectedDate] ?? [], persistent, recovered: loaded.recovered }), [state, persistent, loaded.recovered]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppStore() { const value = useContext(Context); if (!value) throw new Error("AppStore missing"); return value; }
