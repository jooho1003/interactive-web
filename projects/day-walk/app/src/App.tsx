import { AppStore, useAppStore } from "./store/AppStore.js";
import { Header } from "./ui/Header.js";
import { ToastProvider, useToast } from "./ui/Toast.js";
import { Board } from "./board/Board.js";
import { dateKey } from "./domain/time.js";
import { useEffect } from "react";
function ScenePlaceholders() { return <><section className="scene" data-testid="scene"><span data-testid="house" data-done="false">⌂</span><span data-testid="bird">●</span><span data-testid="speech-bubble">오늘 산책을 준비해 봐.</span></section><section className="timeline" data-testid="timeline"><span data-testid="flag" data-done="false">⚑</span><span data-testid="boundary-morningEnd">◆</span><span data-testid="boundary-afternoonEnd">◆</span></section></>; }
function Content() { const { selectedDate, tasks, dispatch, recovered, persistent } = useAppStore(); const toast = useToast(); const today = dateKey(new Date()); useEffect(() => { if (recovered) toast("저장된 데이터를 읽지 못해 새로 시작했어요"); }, [recovered, toast]); const shift = (amount: number) => { const date = new Date(`${selectedDate}T00:00:00`); date.setDate(date.getDate() + amount); dispatch({ type: "select", date: dateKey(date) }); }; return <main aria-label="Day Walk">{!persistent && <p className="storage-banner">이 브라우저에서는 저장되지 않아요</p>}<Header date={selectedDate} today={today} done={tasks.filter((t) => t.done).length} total={tasks.length} onPrevious={() => shift(-1)} onNext={() => shift(1)} onToday={() => dispatch({ type: "select", date: today })} /><ScenePlaceholders /><Board /></main>; }
export function App() { return <AppStore><ToastProvider><Content /></ToastProvider></AppStore>; }
