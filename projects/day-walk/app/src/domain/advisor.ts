import type { DayBounds, Task } from "../schema/index.js";
import { sortTasks, taskSegment } from "./tasks.js";
import { formatMinute, segmentOf } from "./time.js";

export interface Advice { id: string; text: string; action?: { label: string; kind: "move-overdue" | "open-routines" } }
export interface Advisor { advise(input: AdvisorInput): Advice[] }
export interface AdvisorInput { tasks: Task[]; bounds: DayBounds; minute: number; phase: "before" | "during" | "after" }

const names = { morning: "아침", afternoon: "점심", evening: "저녁" } as const;
const ends = (bounds: DayBounds) => ({ morning: bounds.morningEnd, afternoon: bounds.afternoonEnd, evening: bounds.dayEnd });

export const ruleAdvisor: Advisor = {
  advise({ tasks, bounds, minute, phase }) {
    const advice: Advice[] = [];
    const unfinished = tasks.filter((task) => !task.done);
    const current = segmentOf(minute, bounds);
    const order = ["morning", "afternoon", "evening"] as const;
    const prior = order.slice(0, order.indexOf(current));
    if (phase === "before") advice.push({ id: "before", text: `아직 하루 시작 전이야. 첫 마감은 ${formatMinute(bounds.morningEnd)}.` });
    if (phase === "after") advice.push({ id: "after", text: "오늘 산책은 여기까지. 푹 쉬어." });
    if (tasks.length === 0) advice.push({ id: "empty", text: "오늘은 비어 있어. 루틴을 불러오거나 타임라인을 눌러 깃발을 꽂아 봐.", action: { label: "루틴 열기", kind: "open-routines" } });
    if (tasks.length > 0 && unfinished.length === 0) advice.push({ id: "all-done", text: "오늘 할 일 끝! 멋지다." });
    const overdue = unfinished.filter((task) => prior.includes(taskSegment(task, bounds)));
    if (overdue.length) {
      const shown = overdue.slice(0, 2).map((task) => task.title).join(", ");
      const extra = overdue.length > 2 ? ` 외 ${overdue.length - 2}개` : "";
      const hasMovable = overdue.some((task) => task.slot.kind === "segment");
      advice.push({ id: "overdue", text: `${names[taskSegment(overdue[0], bounds)]} 마감이 지났는데 ${overdue.length}개 남았어: ${shown}${extra}.`, ...(hasMovable ? { action: { label: "지금 칸으로 옮기기", kind: "move-overdue" as const } } : {}) });
    }
    const soon = unfinished.filter((task) => task.slot.kind === "time" && task.slot.minute > minute && task.slot.minute - minute <= 30).sort((a, b) => (a.slot as { minute: number }).minute - (b.slot as { minute: number }).minute)[0];
    if (soon?.slot.kind === "time") advice.push({ id: "soon", text: `${formatMinute(soon.slot.minute)} ${soon.title}까지 ${soon.slot.minute - minute}분.` });
    const currentTasks = sortTasks(unfinished.filter((task) => taskSegment(task, bounds) === current));
    const remaining = ends(bounds)[current] - minute;
    if (phase === "during" && currentTasks.length && remaining <= 60) {
      const first = currentTasks.find((task) => task.starred) ?? currentTasks[0];
      advice.push({ id: "deadline", text: `${names[current]} 마감까지 ${remaining}분, 남은 일 ${currentTasks.length}개. ${first.starred ? "★" : ""}${first.title}부터.` });
    }
    if (phase === "during" && currentTasks.length) advice.push({ id: "focus", text: `${names[current]}까지 ${currentTasks.length}개. 먼저 ${currentTasks[0].title}.` });
    const later = unfinished.filter((task) => order.indexOf(taskSegment(task, bounds)) > order.indexOf(current));
    if (phase === "during" && currentTasks.length === 0 && later.length) {
      const next = taskSegment(later[0], bounds);
      advice.push({ id: "next", text: `이 칸은 끝! 다음 ${names[next]} 칸엔 ${later.length}개.` });
    }
    return advice;
  },
};
