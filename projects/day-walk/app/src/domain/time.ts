import type { DayBounds, Segment } from "../schema/index.js";

export const DEFAULT_BOUNDS: DayBounds = { dayStart: 420, morningEnd: 720, afternoonEnd: 1080, dayEnd: 1380 };

export function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
export function snap(value: number) { return Math.round(value / 15) * 15; }
export function magneticMinute(value: number) {
  const halfHour = Math.round(value / 30) * 30;
  return Math.abs(value - halfHour) <= 5 ? halfHour : Math.round(value);
}
export function parseTimeInput(value: string, min: number, max: number): number | null {
  const clean = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(clean) ?? /^(\d{1,2})(\d{2})$/.exec(clean);
  if (!match) return null;
  const hours = Number(match[1]), minutes = Number(match[2]);
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) return null;
  let result = hours * 60 + minutes;
  if (result < min && result + 1440 <= max) result += 1440;
  return result >= min && result <= max ? result : null;
}
export function segmentOf(minute: number, bounds: DayBounds): Segment {
  return minute <= bounds.morningEnd ? "morning" : minute <= bounds.afternoonEnd ? "afternoon" : "evening";
}
export function xOf(minute: number, bounds: DayBounds) {
  return clamp((minute - bounds.dayStart) / (bounds.dayEnd - bounds.dayStart), 0, 1);
}
export function clampBounds(input: DayBounds): DayBounds {
  const dayStart = clamp(Math.round(input.dayStart), 240, 720);
  const dayEnd = clamp(Math.round(input.dayEnd), Math.max(1260, dayStart + 180), 1680);
  const morningEnd = clamp(Math.round(input.morningEnd), dayStart + 60, dayEnd - 120);
  const afternoonEnd = clamp(Math.round(input.afternoonEnd), morningEnd + 60, dayEnd - 60);
  return { dayStart, morningEnd, afternoonEnd, dayEnd };
}
export function formatMinute(minute: number) {
  const normalized = ((minute % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}
export function formatMinuteWithDay(minute: number) { return `${formatMinute(minute)}${minute >= 1440 ? " +1" : ""}`; }
export function dateKey(date: Date) {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function logicalNow(now: Date, bounds: DayBounds) {
  const minute = now.getHours() * 60 + now.getMinutes();
  if (minute < bounds.dayStart && minute + 1440 <= bounds.dayEnd) {
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    return { date: dateKey(yesterday), minute: minute + 1440 };
  }
  return { date: dateKey(now), minute };
}
export function phaseOf(minute: number, bounds: DayBounds): "before" | "during" | "after" {
  return minute < bounds.dayStart ? "before" : minute > bounds.dayEnd ? "after" : "during";
}
