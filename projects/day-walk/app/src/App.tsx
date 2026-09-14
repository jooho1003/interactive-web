import { useEffect } from "react";
import { Board } from "./board/Board.js";
import { dateKey } from "./domain/time.js";
import { Scene } from "./scene/Scene.js";
import { AppStore, useAppStore } from "./store/AppStore.js";
import { Timeline } from "./timeline/Timeline.js";
import { Header } from "./ui/Header.js";
import { ToastProvider, useToast } from "./ui/Toast.js";
import { useReducedMotion } from "./ui/useReducedMotion.js";

function Content() {
  const { data, dispatch, logicalDate, persistent, recovered, selectedDate, tasks } = useAppStore();
  const toast = useToast();
  const reducedMotion = useReducedMotion(data.settings.motion);
  useEffect(() => {
    if (recovered) toast("저장된 데이터를 읽지 못해 새로 시작했어요");
  }, [recovered, toast]);
  const shift = (amount: number) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + amount);
    dispatch({ type: "select", date: dateKey(date) });
  };
  return <main aria-label="Day Walk" data-motion={reducedMotion ? "reduce" : "full"}>
    {!persistent && <p className="storage-banner">이 브라우저에서는 저장되지 않아요</p>}
    <Header
      date={selectedDate}
      done={tasks.filter((task) => task.done).length}
      onNext={() => shift(1)}
      onPrevious={() => shift(-1)}
      onToday={() => dispatch({ type: "select", date: logicalDate })}
      today={logicalDate}
      total={tasks.length}
    />
    <Scene onOpenRoutines={() => undefined} />
    <Timeline />
    <Board />
  </main>;
}

export function App() {
  return <AppStore>
    <ToastProvider>
      <Content />
    </ToastProvider>
  </AppStore>;
}
