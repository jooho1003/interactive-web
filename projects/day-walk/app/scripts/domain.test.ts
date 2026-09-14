import assert from "node:assert/strict";
import test from "node:test";
import { AppData, Task, type DayBounds, type Task as TaskType } from "../src/schema/index.js";
import { ruleAdvisor } from "../src/domain/advisor.js";
import { dueNotifications } from "../src/domain/notifications.js";
import { applyRoutine, sortTasks, tasksReducer } from "../src/domain/tasks.js";
import { DEFAULT_BOUNDS, clampBounds, formatMinute, formatMinuteWithDay, logicalNow, phaseOf, segmentOf, snap, xOf } from "../src/domain/time.js";
import { STORAGE_KEY, loadAppData } from "../src/store/storage.js";

const bounds: DayBounds = { ...DEFAULT_BOUNDS };
const task = (id: string, title: string, minute = 800, extra: Partial<TaskType> = {}): TaskType => ({ id, title, slot: { kind: "time", minute }, starred: false, done: false, createdAt: Number(id.replace(/\D/g, "")) || 1, doneAt: null, ...extra });

test("time model handles boundaries, formatting, position, and logical midnight", () => {
  assert.equal(segmentOf(720, bounds), "morning"); assert.equal(segmentOf(721, bounds), "afternoon");
  assert.equal(segmentOf(1080, bounds), "afternoon"); assert.equal(segmentOf(1081, bounds), "evening");
  assert.equal(xOf(420, bounds), 0); assert.equal(xOf(1380, bounds), 1); assert.equal(xOf(0, bounds), 0);
  assert.equal(snap(443), 450); assert.equal(formatMinute(1470), "00:30"); assert.equal(formatMinuteWithDay(1470), "00:30 +1");
  const long = { ...bounds, dayEnd: 1500 };
  assert.deepEqual(logicalNow(new Date(2026, 8, 15, 0, 30), long), { date: "2026-09-14", minute: 1470 });
  assert.equal(phaseOf(419, bounds), "before"); assert.equal(phaseOf(420, bounds), "during"); assert.equal(phaseOf(1381, bounds), "after");
});

test("clampBounds snaps and preserves the required gaps", () => {
  const result = clampBounds({ dayStart: 231, morningEnd: 240, afternoonEnd: 250, dayEnd: 1701 });
  assert.deepEqual(result, { dayStart: 240, morningEnd: 300, afternoonEnd: 360, dayEnd: 1680 });
});

test("task sorting follows done, star, time, and creation order", () => {
  const sorted = sortTasks([
    task("4", "done", 500, { done: true }), task("3", "segment", 500, { slot: { kind: "segment", segment: "morning" } }),
    task("2", "later", 600), task("1", "star", 700, { starred: true }), task("5", "earlier", 500),
  ]);
  assert.deepEqual(sorted.map((item) => item.id), ["1", "5", "2", "3", "4"]);
});

test("routine application skips matching title and slot", () => {
  const routine = { id: "r", name: "r", tasks: [{ title: "same", slot: { kind: "time" as const, minute: 500 }, starred: false }, { title: "new", slot: { kind: "segment" as const, segment: "evening" as const }, starred: true }] };
  const result = applyRoutine([task("old", "same", 500)], routine, () => "new-id", 9);
  assert.equal(result.added, 1); assert.equal(result.skipped, 1); assert.equal(result.tasks[1].done, false);
});

test("advisor exposes each rule in its priority set", () => {
  assert.ok(ruleAdvisor.advise({ tasks: [], bounds, minute: 300, phase: "before" }).some((x) => x.id === "before"));
  assert.ok(ruleAdvisor.advise({ tasks: [], bounds, minute: 1400, phase: "after" }).some((x) => x.id === "after"));
  assert.ok(ruleAdvisor.advise({ tasks: [], bounds, minute: 800, phase: "during" }).some((x) => x.id === "empty"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "done", 800, { done: true })], bounds, minute: 800, phase: "during" }).some((x) => x.id === "all-done"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "late", 600, { slot: { kind: "segment", segment: "morning" } })], bounds, minute: 800, phase: "during" }).some((x) => x.id === "overdue"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "soon", 820)], bounds, minute: 800, phase: "during" }).some((x) => x.id === "soon"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "deadline", 600)], bounds, minute: 690, phase: "during" }).some((x) => x.id === "deadline"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "focus", 800)], bounds, minute: 800, phase: "during" }).some((x) => x.id === "focus"));
  assert.ok(ruleAdvisor.advise({ tasks: [task("1", "next", 1200)], bounds, minute: 800, phase: "during" }).some((x) => x.id === "next"));
});

test("notifications respect trigger windows and de-duplicate IDs", () => {
  const items = [task("1", "Meeting", 840), task("2", "Segment", 850, { slot: { kind: "segment", segment: "afternoon" } })];
  const due = dueNotifications(items, bounds, 840, new Set());
  assert.deepEqual(due.map((notice) => notice.id), ["task:1"]);
  assert.equal(dueNotifications(items, bounds, 840, new Set(["task:1"])).length, 0);
  assert.ok(dueNotifications(items, bounds, 1050, new Set()).some((notice) => notice.id === "deadline:afternoon"));
  assert.ok(dueNotifications(items, bounds, 1060, new Set()).some((notice) => notice.id === "deadline:afternoon"));
  assert.equal(dueNotifications(items, bounds, 1080, new Set()).some((notice) => notice.id === "deadline:afternoon"), false);
});

test("task reducer supports editing, moving, restoring, and overdue migration", () => {
  const base = task("1", "old", 800);
  assert.equal(tasksReducer([base], { type: "rename", id: "1", title: "new" })[0].title, "new");
  assert.deepEqual(tasksReducer([base], { type: "set-time", id: "1", minute: 900 })[0].slot, { kind: "time", minute: 900 });
  assert.deepEqual(tasksReducer([base], { type: "clear-time", id: "1", bounds })[0].slot, { kind: "segment", segment: "afternoon" });
  const segment = { ...base, slot: { kind: "segment" as const, segment: "morning" as const } };
  assert.equal((tasksReducer([segment], { type: "move-segment", id: "1", segment: "evening" })[0].slot as { segment: string }).segment, "evening");
  assert.equal(tasksReducer([base], { type: "move-segment", id: "1", segment: "evening" })[0].slot.kind, "time");
  assert.equal(tasksReducer([], { type: "restore", task: base }).length, 1);
  assert.equal((tasksReducer([segment], { type: "move-overdue", bounds, minute: 800 })[0].slot as { segment: string }).segment, "afternoon");
});

test("schema rejects invalid task titles and date keys", () => {
  assert.equal(Task.safeParse(task("x", " ")).success, false);
  assert.equal(Task.safeParse(task("x", "a".repeat(81))).success, false);
  const base = { schemaVersion: 1 as const, settings: { bounds, showCharacter: true, showAdvisor: true, sound: false, motion: "system" as const, notifications: false }, days: { "September-14": [] }, routines: [], celebrated: [] };
  assert.equal(AppData.safeParse(base).success, false);
});

test("invalid stored JSON is backed up under a corrupt key", () => {
  const values = new Map([[STORAGE_KEY, "not-json"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
  const loaded = loadAppData(storage, "2026-09-14", 123);
  assert.equal(loaded.recovered, true); assert.equal(values.get(`${STORAGE_KEY}:corrupt-123`), "not-json"); assert.equal(loaded.data.schemaVersion, 1);
});
