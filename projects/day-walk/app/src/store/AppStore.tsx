import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from "react";
import type { AppData, Routine, Settings, Task } from "../schema/index.js";
import { clampBounds, logicalNow } from "../domain/time.js";
import { applyRoutine, tasksReducer, type TaskAction } from "../domain/tasks.js";
import { createStorage, defaultAppData, loadAppData } from "./storage.js";
import { clockDate, useClock } from "./useClock.js";

type Action =
  | { type: "select"; date: string }
  | { type: "tasks"; date: string; action: TaskAction }
  | { type: "settings"; settings: Settings }
  | { type: "routine-save"; routine: Routine }
  | { type: "routine-delete"; id: string }
  | { type: "routine-apply"; date: string; routine: Routine; now: number }
  | { type: "celebrate"; date: string }
  | { type: "replace-all"; data: AppData };
type State = { data: AppData; selectedDate: string };

function reduce(state: State, action: Action): State {
  if (action.type === "replace-all") return { ...state, data: action.data };
  if (action.type === "select") return { ...state, selectedDate: action.date };
  if (action.type === "tasks") return { ...state, data: { ...state.data, days: { ...state.data.days, [action.date]: tasksReducer(state.data.days[action.date] ?? [], action.action) } } };
  if (action.type === "settings") return { ...state, data: { ...state.data, settings: { ...action.settings, bounds: clampBounds(action.settings.bounds) } } };
  if (action.type === "routine-save") return { ...state, data: { ...state.data, routines: [...state.data.routines, action.routine] } };
  if (action.type === "routine-delete") return { ...state, data: { ...state.data, routines: state.data.routines.filter((routine) => routine.id !== action.id) } };
  if (action.type === "routine-apply") {
    const result = applyRoutine(state.data.days[action.date] ?? [], action.routine, () => crypto.randomUUID(), action.now);
    return { ...state, data: { ...state.data, days: { ...state.data.days, [action.date]: result.tasks } } };
  }
  return state.data.celebrated.includes(action.date) ? state : { ...state, data: { ...state.data, celebrated: [...state.data.celebrated, action.date] } };
}

type Store = State & { dispatch: Dispatch<Action>; tasks: Task[]; persistent: boolean; recovered: boolean; logicalDate: string; minute: number; phase: "before" | "during" | "after" };
const Context = createContext<Store | null>(null);

export function AppStore({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => {
    try {
      const provisional = loadAppData(localStorage, logicalNow(clockDate(), defaultAppData().settings.bounds).date);
      return loadAppData(localStorage, logicalNow(clockDate(), provisional.data.settings.bounds).date);
    } catch {
      return { data: defaultAppData(), persistent: false, recovered: false };
    }
  });
  const [state, dispatch] = useReducer(reduce, loaded, (value) => ({ data: value.data, selectedDate: logicalNow(clockDate(), value.data.settings.bounds).date }));
  const clock = useClock(state.data.settings.bounds);
  const [persistent, setPersistent] = useState(loaded.persistent);
  const writerRef = useRef<ReturnType<typeof createStorage> | null>(null);
  if (!writerRef.current && persistent) writerRef.current = createStorage(localStorage, 300, setPersistent);
  useEffect(() => { writerRef.current?.save(state.data); }, [state.data]);
  useEffect(() => {
    const writer = writerRef.current;
    if (!writer) return;
    const unbind = writer.bindPagehide(window);
    return () => { writer.flush(); unbind(); writer.dispose(); };
  }, []);
  const value = useMemo(() => ({ ...state, dispatch, tasks: state.data.days[state.selectedDate] ?? [], persistent, recovered: loaded.recovered, logicalDate: clock.date, minute: clock.minute, phase: clock.phase }), [state, persistent, loaded.recovered, clock.date, clock.minute, clock.phase]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAppStore() {
  const value = useContext(Context);
  if (!value) throw new Error("AppStore missing");
  return value;
}
