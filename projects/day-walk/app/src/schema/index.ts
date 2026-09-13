import { z } from "zod";

export const Segment = z.enum(["morning", "afternoon", "evening"]);
export const Slot = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("time"), minute: z.number().int() }),
  z.object({ kind: z.literal("segment"), segment: Segment }),
]);
export const Task = z.object({
  id: z.string().min(1), title: z.string().trim().min(1).max(80), slot: Slot,
  starred: z.boolean(), done: z.boolean(), createdAt: z.number().int(), doneAt: z.number().int().nullable(),
});
export const DayBounds = z.object({
  dayStart: z.number().int(), morningEnd: z.number().int(), afternoonEnd: z.number().int(), dayEnd: z.number().int(),
});
export const Settings = z.object({
  bounds: DayBounds, showCharacter: z.boolean(), showAdvisor: z.boolean(), sound: z.boolean(),
  motion: z.enum(["system", "reduce", "full"]), notifications: z.boolean(),
});
export const RoutineTask = Task.pick({ title: true, slot: true, starred: true });
export const Routine = z.object({
  id: z.string().min(1), name: z.string().trim().min(1).max(40), tasks: z.array(RoutineTask).max(50),
});
export const AppData = z.object({
  schemaVersion: z.literal(1), settings: Settings,
  days: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.array(Task).max(100)),
  routines: z.array(Routine).max(20), celebrated: z.array(z.string()),
});

export type Segment = z.infer<typeof Segment>;
export type Slot = z.infer<typeof Slot>;
export type Task = z.infer<typeof Task>;
export type DayBounds = z.infer<typeof DayBounds>;
export type Settings = z.infer<typeof Settings>;
export type RoutineTask = z.infer<typeof RoutineTask>;
export type Routine = z.infer<typeof Routine>;
export type AppData = z.infer<typeof AppData>;
