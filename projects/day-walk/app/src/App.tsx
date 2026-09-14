import { useEffect, useRef, useState, type CSSProperties } from "react";
import { playCelebration, primeAudio } from "./audio/sfx.js";
import { Board } from "./board/Board.js";
import { dueNotifications } from "./domain/notifications.js";
import { dateKey, xOf } from "./domain/time.js";
import { Scene } from "./scene/Scene.js";
import { AppStore, useAppStore } from "./store/AppStore.js";
import { Timeline } from "./timeline/Timeline.js";
import { BoundaryHandle } from "./timeline/BoundaryHandle.js";
import { Celebration } from "./ui/Celebration.js";
import { Header } from "./ui/Header.js";
import { RoutineDialog } from "./ui/RoutineDialog.js";
import { SettingsDialog } from "./ui/SettingsDialog.js";
import { ToastProvider, useToast } from "./ui/Toast.js";
import { useReducedMotion } from "./ui/useReducedMotion.js";

function Content() {
  const { data, dispatch, logicalDate, persistent, recovered, selectedDate, tasks, minute } = useAppStore();
  const toast = useToast();
  const reducedMotion = useReducedMotion(data.settings.motion);
  const [routinesOpen, setRoutinesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [celebratingDate, setCelebratingDate] = useState<string | null>(null);
  const routineOpener = useRef<HTMLElement | null>(null);
  const settingsOpener = useRef<HTMLElement | null>(null);
  const bounds = data.settings.bounds;
  const morning = xOf(bounds.morningEnd, bounds) * 100;
  const sunset = xOf(bounds.afternoonEnd, bounds) * 100;
  useEffect(() => {
    if (recovered) toast("저장된 데이터를 읽지 못해 새로 시작했어요");
  }, [recovered, toast]);
  useEffect(() => {
    if (celebratingDate !== null && (selectedDate !== celebratingDate || tasks.some((task) => !task.done))) setCelebratingDate(null);
  }, [celebratingDate, selectedDate, tasks]);
  useEffect(() => {
    if (selectedDate !== logicalDate || !tasks.length || tasks.some((task) => !task.done) || data.celebrated.includes(selectedDate)) return;
    dispatch({ type: "celebrate", date: selectedDate });
    setCelebratingDate(selectedDate);
    if (data.settings.sound) playCelebration();
  }, [data.celebrated, data.settings.sound, dispatch, logicalDate, selectedDate, tasks]);
  useEffect(() => {
    if (!data.settings.notifications || selectedDate !== logicalDate) return;
    const key = `day-walk:notified:${logicalDate}`;
    const seen = new Set<string>(JSON.parse(sessionStorage.getItem(key) ?? "[]") as string[]);
    const notices = dueNotifications(tasks, data.settings.bounds, minute, seen);
    if (!notices.length) return;
    notices.forEach((notice) => {
      seen.add(notice.id);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Day Walk", { body: notice.text });
      } else {
        toast(notice.text);
      }
    });
    sessionStorage.setItem(key, JSON.stringify([...seen]));
  }, [data.settings.bounds, data.settings.notifications, logicalDate, minute, selectedDate, tasks, toast]);
  const shift = (amount: number) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + amount);
    dispatch({ type: "select", date: dateKey(date) });
  };
  return <main aria-label="Day Walk" data-motion={reducedMotion ? "reduce" : "full"} onKeyDown={primeAudio} onPointerDown={primeAudio}>
    {!persistent && <p className="storage-banner">이 브라우저에서는 저장되지 않아요</p>}
    <Header date={selectedDate} done={tasks.filter((task) => task.done).length} onNext={() => shift(1)} onOpenRoutines={(element) => { routineOpener.current = element; setRoutinesOpen(true); }} onOpenSettings={(element) => { settingsOpener.current = element; setSettingsOpen(true); }} onPrevious={() => shift(-1)} onSelectDate={(date) => dispatch({ type: "select", date })} onToday={() => dispatch({ type: "select", date: logicalDate })} today={logicalDate} total={tasks.length} />
    <div className="day-layout" style={{ "--morning-width": `${morning}%`, "--afternoon-width": `${sunset - morning}%`, "--evening-width": `${100 - sunset}%`, "--sunset-x": `${sunset}%` } as CSSProperties}>
      <Scene key={`scene-${selectedDate}`} onOpenRoutines={() => { routineOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setRoutinesOpen(true); }} />
      <Timeline />
      <Board celebration={celebratingDate === selectedDate ? <Celebration onClose={() => setCelebratingDate(null)} reduced={reducedMotion} /> : undefined} key={`board-${selectedDate}`} />
      <div className="day-boundaries">
        {(["morningEnd", "afternoonEnd"] as const).map((name) => <BoundaryHandle bounds={bounds} key={name} name={name} onChange={(next) => dispatch({ type: "settings", settings: { ...data.settings, bounds: next } })} />)}
      </div>
    </div>
    <RoutineDialog onClose={() => setRoutinesOpen(false)} open={routinesOpen} opener={routineOpener.current} />
    <SettingsDialog onClose={() => setSettingsOpen(false)} open={settingsOpen} opener={settingsOpener.current} />
  </main>;
}

export function App() {
  return <AppStore><ToastProvider><Content /></ToastProvider></AppStore>;
}
